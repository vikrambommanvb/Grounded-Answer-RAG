"""Policies API routes for exploring clauses, amendments, and timeline."""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from app.api.schemas.policy import ClauseRecord, AmendmentRecord
from app.database.models import get_all_clauses, get_clause_by_id, get_all_amendments, get_all_documents

router = APIRouter(prefix="/policies", tags=["Policies"])

class PolicySummary(BaseModel):
    title: str
    total_parts: int
    total_clauses: int
    baseline_effective_date: str
    amendment_id: str
    amendment_effective_date: str
    amendment_items_count: int

class ClauseDetailResponse(BaseModel):
    clause: ClauseRecord
    is_amended: bool
    amendment_action: Optional[AmendmentRecord] = None

class TimelineEvent(BaseModel):
    event_id: str
    event_date: str
    event_type: str
    title: str
    description: str
    legal_basis: str
    clauses_affected: List[str] = []

@router.get("", response_model=PolicySummary)
def get_policy_summary() -> PolicySummary:
    """Retrieve high-level summary of the active policy corpus."""
    clauses = get_all_clauses()
    amendments = get_all_amendments()
    parts = set(c.part_number for c in clauses)
    
    return PolicySummary(
        title="Calder County Household Support Program Policy Manual",
        total_parts=len(parts),
        total_clauses=len(clauses),
        baseline_effective_date="2025-12-31",
        amendment_id="Amendment No. 2026-01",
        amendment_effective_date="2026-03-01",
        amendment_items_count=len(amendments)
    )

@router.get("/clauses", response_model=List[ClauseRecord])
def list_clauses(
    part: Optional[int] = Query(None, description="Filter by Part number 1-12", ge=1, le=12),
    query: Optional[str] = Query(None, description="Search keyword in clause text or title"),
    is_definition: Optional[bool] = Query(None, description="Filter definitions in Part 1.4")
) -> List[ClauseRecord]:
    """List and search policy clauses with optional filtering."""
    clauses = get_all_clauses()
    
    if part is not None:
        clauses = [c for c in clauses if c.part_number == part]
        
    if is_definition is not None:
        clauses = [c for c in clauses if c.is_definition == is_definition]
        
    if query and query.strip():
        q_clean = query.strip().lower()
        clauses = [
            c for c in clauses
            if q_clean in c.full_text.lower()
            or (c.title and q_clean in c.title.lower())
            or q_clean in c.clause_id.lower()
            or q_clean in c.canonical_id.lower()
        ]
        
    return clauses

@router.get("/clauses/{clause_id}", response_model=ClauseDetailResponse)
def get_clause_detail(clause_id: str) -> ClauseDetailResponse:
    """Retrieve full details of a single clause including amendment history."""
    clause = get_clause_by_id(clause_id)
    if not clause:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clause '{clause_id}' not found in policy corpus."
        )
        
    # Check if this clause was amended by Amendment No. 2026-01
    amendments = get_all_amendments()
    matching_amd = None
    for a in amendments:
        if a.target_clause_id and (
            a.target_clause_id == clause.clause_id
            or a.target_clause_id.startswith(clause.clause_id)
            or clause.clause_id.startswith(a.target_clause_id)
        ):
            matching_amd = a
            break
            
    return ClauseDetailResponse(
        clause=clause,
        is_amended=bool(matching_amd),
        amendment_action=matching_amd
    )

@router.get("/timeline", response_model=List[TimelineEvent])
def get_policy_timeline() -> List[TimelineEvent]:
    """Retrieve chronological policy evolution events and transitional rules."""
    return [
        TimelineEvent(
            event_id="EVT-01",
            event_date="2025-12-31",
            event_type="Consolidated Text",
            title="Consolidated Text Baseline",
            description="Consolidated text of the Policy Manual issued under authority of Calder County Board of Social Services.",
            legal_basis="§1.1.2 & §1.2.1",
            clauses_affected=["All clauses (§1.1.1 through §12.3.3)"]
        ),
        TimelineEvent(
            event_id="EVT-02",
            event_date="2026-02-12",
            event_type="Enactment",
            title="Amendment No. 2026-01 Enacted",
            description="Amendment issued updating earnings disregard, reporting periods, income thresholds, sanctions, and transitional rules.",
            legal_basis="§1.2.3 of Policy Manual",
            clauses_affected=["§6.4.1(a)", "§4.3.2", "§9.1.4", "§6.6.1", "§10.5.2", "§10.5.3A"]
        ),
        TimelineEvent(
            event_id="EVT-03",
            event_date="2026-03-01",
            event_type="Effective Date",
            title="Amendment No. 2026-01 Takes Effect",
            description="Operative effective date for amended disregard ($175), reporting (14 days), thresholds, and 15% sanctions.",
            legal_basis="Amendment No. 2026-01 §5.1, §5.2, §5.3",
            clauses_affected=["§6.4.1(a)", "§4.3.2", "§9.1.4", "§6.6.1", "§10.5.2", "§10.5.3A"]
        )
    ]
