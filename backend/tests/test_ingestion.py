"""Tests for document ingestion, parsing, validation, and database persistence."""
import pytest
from pathlib import Path
from app.ingestion.parser import parse_policy_manual
from app.ingestion.amendment_parser import parse_amendment
from app.ingestion.validator import validate_corpus
from app.ingestion.service import run_ingestion
from app.database.models import get_clause_by_id, get_all_clauses, get_all_amendments, get_all_documents
from app.core.config import settings

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MANUAL_PATH = REPO_ROOT / "docs" / "policy" / "policy-manual.md"
AMENDMENT_PATH = REPO_ROOT / "docs" / "policy" / "Amendment No. 2026-01.md"

def test_parse_policy_manual():
    """Verify parsing of baseline Calder County policy manual."""
    doc, clauses = parse_policy_manual(MANUAL_PATH)
    
    assert doc.document_id == "HSP-MANUAL-2025-12"
    assert doc.version == "consolidated-2025-12"
    assert len(clauses) == 148
    
    # Check all 12 parts are present
    parts = sorted(list(set(c.part_number for c in clauses)))
    assert parts == list(range(1, 13))
    
    # Check definitions (§1.4.1 - §1.4.11)
    definitions = [c for c in clauses if c.is_definition]
    assert len(definitions) == 11
    def_ids = [c.clause_id for c in definitions]
    assert "§1.4.1" in def_ids
    assert "§1.4.6" in def_ids  # Full-time student
    
    # Check tables in §6.6.1 and §7.2.1
    c_6_6_1 = next(c for c in clauses if c.clause_id == "§6.6.1")
    assert c_6_6_1.table_data is not None
    assert len(c_6_6_1.table_data) >= 5
    assert any("1,180" in str(row) for row in c_6_6_1.table_data)
    
    c_7_2_1 = next(c for c in clauses if c.clause_id == "§7.2.1")
    assert c_7_2_1.table_data is not None
    assert any("Single adult" in str(row) for row in c_7_2_1.table_data)
    
    # Check modal verbs detection
    c_4_3_2 = next(c for c in clauses if c.clause_id == "§4.3.2")
    assert "must" in c_4_3_2.modality
    assert "10 calendar days" in c_4_3_2.full_text

def test_parse_amendment():
    """Verify parsing of Amendment No. 2026-01."""
    doc, amendments = parse_amendment(AMENDMENT_PATH)
    
    assert doc.document_id == "HSP-AMD-2026-01"
    assert doc.effective_date == "1 March 2026"
    assert len(amendments) == 9
    
    # Item 1.1: Earnings disregard
    amd_1_1 = next(a for a in amendments if a.item_number == "1.1")
    assert amd_1_1.target_clause_id == "§6.4.1(a)"
    assert amd_1_1.action_type.value == "substitute"
    assert "$175 per month" in amd_1_1.new_text
    assert amd_1_1.transitional_rule_ref == "Para 5.1"
    
    # Item 2.1 & 2.2: Reporting period alignment to 14 days
    amd_2_1 = next(a for a in amendments if a.item_number == "2.1")
    assert amd_2_1.target_clause_id == "§4.3.2"
    assert "14 calendar days" in amd_2_1.new_text
    assert amd_2_1.transitional_rule_ref == "Para 5.2"
    
    amd_2_2 = next(a for a in amendments if a.item_number == "2.2")
    assert amd_2_2.target_clause_id == "§9.1.4"
    assert "14 calendar days" in amd_2_2.new_text
    assert amd_2_2.transitional_rule_ref == "Para 5.2"
    
    # Item 4.1: Sanction reduction 20% -> 15%
    amd_4_1 = next(a for a in amendments if a.item_number == "4.1")
    assert amd_4_1.target_clause_id == "§10.5.2"
    assert "15 per cent" in amd_4_1.new_text
    
    # Item 4.2: Insert §10.5.3A
    amd_4_2 = next(a for a in amendments if a.item_number == "4.2")
    assert amd_4_2.target_clause_id == "§10.5.3A"
    assert amd_4_2.action_type.value == "insert"
    assert "would have increased the award" in amd_4_2.new_text
    
    # Transitional rules
    trans = [a for a in amendments if a.action_type.value == "transitional"]
    assert len(trans) == 3
    trans_nums = [a.item_number for a in trans]
    assert "5.1" in trans_nums
    assert "5.2" in trans_nums
    assert "5.3" in trans_nums

def test_validate_corpus():
    """Verify validation engine passes clean corpus."""
    _, clauses = parse_policy_manual(MANUAL_PATH)
    _, amendments = parse_amendment(AMENDMENT_PATH)
    
    report = validate_corpus(clauses, amendments)
    assert report.is_valid is True
    assert report.total_clauses == 148
    assert report.total_parts == 12
    assert len(report.duplicate_clause_ids) == 0
    assert len(report.missing_expected_clauses) == 0

def test_ingestion_service_and_db_persistence():
    """Verify end-to-end ingestion and SQLite database querying."""
    report, stats = run_ingestion(MANUAL_PATH, AMENDMENT_PATH)
    assert report.is_valid is True
    assert stats["manual_clauses_stored"] == 148
    assert stats["amendment_actions_stored"] == 9
    
    # Verify clause query
    clause = get_clause_by_id("§4.3.2")
    assert clause is not None
    assert clause.part_number == 4
    assert clause.section_number == "4.3"
    assert "10 calendar days" in clause.full_text
    
    # Verify query without section symbol
    c2 = get_clause_by_id("4.3.2")
    assert c2 is not None
    assert c2.clause_id == "§4.3.2"
    
    # Verify all clauses retrieved
    all_clauses = get_all_clauses()
    assert len(all_clauses) == 148
    
    # Verify all amendments retrieved
    all_amendments = get_all_amendments()
    assert len(all_amendments) == 9
    
    # Verify documents retrieved
    all_docs = get_all_documents()
    assert len(all_docs) == 2

def test_ingestion_idempotence():
    """Verify running ingestion multiple times is idempotent."""
    run_ingestion(MANUAL_PATH, AMENDMENT_PATH)
    run_ingestion(MANUAL_PATH, AMENDMENT_PATH)
    
    all_clauses = get_all_clauses()
    assert len(all_clauses) == 148
    all_amendments = get_all_amendments()
    assert len(all_amendments) == 9

