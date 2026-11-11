"""Schemas for retrieval results and diagnostics."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RetrievedClause(BaseModel):
    """Schema representing an individual retrieved clause with strict provenance."""
    clause_id: str = Field(..., description="Canonical clause ID e.g. §4.3.2")
    canonical_id: str = Field(..., description="Canonical ID without symbol e.g. 4.3.2")
    part_number: int = Field(..., description="Part number 1-12")
    part_title: str = Field(..., description="Part title")
    section_number: str = Field(..., description="Section number e.g. 4.3")
    section_title: str = Field(..., description="Section title")
    title: Optional[str] = Field(None, description="Clause title if present")
    exact_text: str = Field(..., description="Verbatim text of the clause")
    document_id: str = Field(..., description="Source document ID e.g. HSP-MANUAL-2025-12")
    source_version: str = Field(..., description="Source version string")
    effective_date: str = Field(..., description="Effective date")
    retrieval_score: float = Field(..., description="Normalized combined retrieval score (0.0 to 1.0)")
    lexical_score: float = Field(..., description="BM25/Lexical score")
    semantic_score: float = Field(..., description="Semantic cosine similarity score")
    source_location: str = Field(..., description="Human-readable citation path e.g. Part 4, Section 4.3, Paragraph 2")
    cross_references: List[str] = Field(default_factory=list, description="Cross-references present in clause")
    is_expanded: bool = Field(False, description="Whether this clause was included via cross-reference expansion")

class RetrievalDiagnostics(BaseModel):
    """Diagnostics and execution statistics for retrieval."""
    query: str
    total_candidates_searched: int
    lexical_matches: int
    semantic_matches: int
    expanded_clauses: int
    execution_time_ms: float
    mode: str = "hybrid"

class RetrievalResult(BaseModel):
    """Container for retrieved clauses and diagnostics."""
    clauses: List[RetrievedClause]
    diagnostics: RetrievalDiagnostics

