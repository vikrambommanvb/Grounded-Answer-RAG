"""Policy schemas for clauses, documents, and amendments."""
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class Modality(str, Enum):
    MUST = "must"
    MAY = "may"
    SHOULD = "should"

class AmendmentActionType(str, Enum):
    SUBSTITUTE = "substitute"
    INSERT = "insert"
    TRANSITIONAL = "transitional"

class ClauseRecord(BaseModel):
    """Schema representing an individual policy clause."""
    clause_id: str = Field(..., description="Canonical clause identifier with section symbol e.g. §4.3.2")
    canonical_id: str = Field(..., description="Canonical ID without section symbol e.g. 4.3.2")
    part_number: int = Field(..., description="Part number 1-12")
    part_title: str = Field(..., description="Title of the Part")
    section_number: str = Field(..., description="Section number e.g. 4.3")
    section_title: str = Field(..., description="Title of the section")
    title: Optional[str] = Field(None, description="Clause title if defined (e.g. for definitions)")
    full_text: str = Field(..., description="Complete verbatim text of the clause")
    document_id: str = Field("HSP-MANUAL-2025-12", description="Document identifier")
    version: str = Field("consolidated-2025-12", description="Corpus version")
    effective_date: str = Field("2025-12-31", description="Effective date")
    cross_references: List[str] = Field(default_factory=list, description="List of referenced clause IDs")
    modality: List[str] = Field(default_factory=list, description="Modal verbs present: must, may, should")
    is_definition: bool = Field(False, description="Whether this clause is a definition")
    table_data: Optional[List[Dict[str, Any]]] = Field(None, description="Parsed tabular data if present")

class AmendmentRecord(BaseModel):
    """Schema representing an individual amendment action."""
    item_id: str = Field(..., description="Unique item ID e.g. AMD-2026-01:1.1")
    amendment_id: str = Field("AMD-2026-01", description="Amendment identifier")
    item_number: str = Field(..., description="Item number e.g. 1.1")
    section_title: str = Field(..., description="Section title within amendment")
    target_clause_id: Optional[str] = Field(None, description="Clause modified or inserted e.g. §6.4.1(a)")
    action_type: AmendmentActionType = Field(..., description="Action: substitute, insert, transitional")
    old_text: Optional[str] = Field(None, description="Pre-amendment text snippet replaced")
    new_text: str = Field(..., description="New replacement or inserted text")
    issued_date: str = Field("2026-02-12", description="Date amendment was issued")
    effective_date: str = Field("2026-03-01", description="Date amendment takes effect")
    transitional_rule_ref: Optional[str] = Field(None, description="Transitional rule reference (e.g. Para 5.1)")
    staff_note: Optional[str] = Field(None, description="Guidance note for staff if provided")

class DocumentRecord(BaseModel):
    """Schema representing a registered policy source document."""
    document_id: str
    title: str
    version: str
    issued_date: Optional[str] = None
    effective_date: str
    file_path: str
    content_hash: str
    clause_count: int

class CorpusValidationReport(BaseModel):
    """Validation diagnostics report for policy corpus."""
    total_clauses: int
    total_parts: int
    parts_found: List[int]
    total_cross_references: int
    duplicate_clause_ids: List[str] = Field(default_factory=list)
    missing_expected_clauses: List[str] = Field(default_factory=list)
    broken_cross_references: List[Dict[str, Any]] = Field(default_factory=list)
    amendment_items_count: int
    is_valid: bool = True
