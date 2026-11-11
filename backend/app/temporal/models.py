"""Temporal data models and resolution schemas."""
from datetime import date
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class TemporalResolutionType(str, Enum):
    PRE_AMENDMENT = "PRE_AMENDMENT"
    POST_AMENDMENT = "POST_AMENDMENT"
    TRANSITIONAL_SPLIT = "TRANSITIONAL_SPLIT"
    SPANNING_CLAIM = "SPANNING_CLAIM"
    MISSING_TEMPORAL_DATA = "MISSING_TEMPORAL_DATA"
    DATE_INVARIANT = "DATE_INVARIANT"

class DateContext(BaseModel):
    """Container for temporal facts supplied or extracted from question."""
    determination_date: Optional[date] = Field(None, description="Date decision is rendered")
    change_of_circumstances_date: Optional[date] = Field(None, description="Date circumstance change occurred")
    claim_start_date: Optional[date] = Field(None, description="Start date of claim period")
    claim_end_date: Optional[date] = Field(None, description="End date of claim period")
    raw_query_dates: List[str] = Field(default_factory=list, description="Extracted date strings from user text")

class SpanningApportionmentDetail(BaseModel):
    """Mathematical daily breakdown for claims spanning 1 March 2026 per §7.4.3 & Para 5.3."""
    claim_start_date: date
    claim_end_date: date
    total_days: int
    pre_amendment_days: int
    post_amendment_days: int
    pre_amendment_ratio: float
    post_amendment_ratio: float
    apportionment_formula: str

class ResolvedClauseVersion(BaseModel):
    """The legally active version of a clause for a given temporal context."""
    clause_id: str
    canonical_id: str
    part_number: int
    applicable_text: str
    is_amended: bool
    amendment_citation: Optional[str] = None
    transitional_rule_applied: Optional[str] = None
    temporal_notes: List[str] = Field(default_factory=list)

class TemporalResolutionResult(BaseModel):
    """Full temporal policy resolution outcome for a query."""
    resolution_type: TemporalResolutionType
    date_context: DateContext
    is_amendment_active: bool
    transitional_rules_applied: List[str] = Field(default_factory=list)
    apportionment: Optional[SpanningApportionmentDetail] = None
    warnings: List[str] = Field(default_factory=list)
    effective_clauses_overlay: dict[str, ResolvedClauseVersion] = Field(default_factory=dict)
