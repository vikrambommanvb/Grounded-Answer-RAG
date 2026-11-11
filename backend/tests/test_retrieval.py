"""Comprehensive test suite for the Clause-Aware Hybrid Retrieval Engine."""
import pytest
from pathlib import Path
from app.ingestion.service import run_ingestion
from app.retrieval.retriever import ClauseRetriever
from app.retrieval.bm25 import BM25Index
from app.retrieval.embeddings import SemanticClauseEmbedder
from app.database.models import get_all_clauses

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MANUAL_PATH = REPO_ROOT / "docs" / "policy" / "policy-manual.md"
AMENDMENT_PATH = REPO_ROOT / "docs" / "policy" / "Amendment No. 2026-01.md"

@pytest.fixture(scope="module")
def indexed_retriever():
    """Ensure database is ingested and return an indexed retriever instance."""
    run_ingestion(MANUAL_PATH, AMENDMENT_PATH)
    clauses = get_all_clauses()
    retriever = ClauseRetriever(clauses)
    return retriever

def test_exact_clause_id_retrieval(indexed_retriever):
    """Test that queries citing a specific clause return that exact clause as top rank."""
    result = indexed_retriever.retrieve("What does clause §4.3.2 require regarding reporting changes?")
    assert len(result.clauses) > 0
    top_clause = result.clauses[0]
    assert top_clause.clause_id == "§4.3.2"
    assert "10 calendar days" in top_clause.exact_text
    assert top_clause.part_number == 4
    assert top_clause.section_number == "4.3"
    assert top_clause.retrieval_score > 0.5

def test_semantic_natural_language_retrieval(indexed_retriever):
    """Test natural language semantic query without explicit clause numbers."""
    query = "What is the maximum countable resources or bank savings a family can have to qualify?"
    result = indexed_retriever.retrieve(query, mode="semantic", threshold=0.10)
    assert len(result.clauses) > 0
    clause_ids = [c.clause_id for c in result.clauses]
    # §2.4.1 specifies $4,000 resources limit
    assert "§2.4.1" in clause_ids
    c_2_4_1 = next(c for c in result.clauses if c.clause_id == "§2.4.1")
    assert "$4,000" in c_2_4_1.exact_text

def test_hybrid_retrieval_ranking(indexed_retriever):
    """Test hybrid retrieval combines lexical and semantic signals."""
    query = "How much of monthly employment earnings is disregarded from countable income?"
    result = indexed_retriever.retrieve(query, mode="hybrid")
    assert len(result.clauses) > 0
    clause_ids = [c.clause_id for c in result.clauses]
    # §6.4.1 specifies earnings disregard
    assert "§6.4.1" in clause_ids
    c_6_4_1 = next(c for c in result.clauses if c.clause_id == "§6.4.1")
    assert "$120 per month" in c_6_4_1.exact_text
    assert c_6_4_1.lexical_score > 0.0
    assert c_6_4_1.semantic_score > 0.0

def test_cross_reference_graph_expansion(indexed_retriever):
    """Test that retrieving a clause with cross-references expands to include targets."""
    # §2.1.2 references §2.3 and §2.4
    result = indexed_retriever.retrieve("§2.1.2 basic conditions of eligibility", expand_references=True)
    assert len(result.clauses) > 1
    top_clause = result.clauses[0]
    assert top_clause.clause_id == "§2.1.2"
    
    # Check if expanded clauses are present
    expanded_clauses = [c for c in result.clauses if c.is_expanded]
    assert len(expanded_clauses) > 0
    expanded_ids = [c.clause_id for c in expanded_clauses]
    # At least §2.3 or §2.4 should be pulled in
    assert any("§2.3" in eid or "§2.4" in eid for eid in expanded_ids)

def test_off_topic_refusal_threshold(indexed_retriever):
    """Test that completely unrelated off-topic queries fail threshold or return low score."""
    off_topic_query = "Quantum computing entanglement qubit coherence in silicon semiconductors"
    result = indexed_retriever.retrieve(off_topic_query, threshold=0.35)
    # Off-topic should return 0 clauses when strictly thresholded
    assert len(result.clauses) == 0

def test_retrieval_diagnostics_and_provenance(indexed_retriever):
    """Test that all required metadata and diagnostics fields are properly populated."""
    result = indexed_retriever.retrieve("What is the temporary absence limit for medical care?")
    assert result.diagnostics is not None
    assert result.diagnostics.total_candidates_searched == 148
    assert result.diagnostics.execution_time_ms >= 0.0
    assert result.diagnostics.mode == "hybrid"
    
    for c in result.clauses:
        # Check all required provenance fields
        assert c.clause_id.startswith("§")
        assert c.exact_text is not None and len(c.exact_text) > 0
        assert c.document_id == "HSP-MANUAL-2025-12"
        assert c.source_version == "consolidated-2025-12"
        assert c.effective_date == "2025-12-31"
        assert 0.0 <= c.retrieval_score <= 1.0
        assert c.source_location.startswith("Part ")
