"""Pydantic schemas for the Grounded Answer query and response contract."""
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from app.temporal.models import DateContext, TemporalResolutionType, SpanningApportionmentDetail

class ResponseStatus(str, Enum):
    ANSWERED = "ANSWERED"
    ANSWERED_WITH_WARNING = "ANSWERED_WITH_WARNING"
    REFUSED = "REFUSED"

class RefusalCategory(str, Enum):
    OUT_OF_SCOPE = "OUT_OF_SCOPE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    APPARENT_GAP = "APPARENT_GAP"
    INTERNAL_CONFLICT = "INTERNAL_CONFLICT"
    MISSING_TEMPORAL_DATA = "MISSING_TEMPORAL_DATA"
    CITATION_VALIDATION_FAILED = "CITATION_VALIDATION_FAILED"

class RefusalDetails(BaseModel):
    """Structured details when the assistant declines to answer."""
    category: RefusalCategory = Field(..., description="Refusal category enum")
    reason: str = Field(..., description="Clear explanation of why an answer cannot be provided")
    missing_information: List[str] = Field(default_factory=list, description="Missing case facts or policy provisions needed")
    partial_relevant_clauses: List[str] = Field(default_factory=list, description="Related clauses that touch upon the topic")
    recommended_next_step: str = Field(..., description="Sensible human referral advice (e.g. Supervisor, Appeals Panel)")

class CitationBadge(BaseModel):
    """Verifiable citation referencing exact statutory provisions."""
    clause_id: str = Field(..., json_schema_extra={"example": "§6.4.1(a)"})
    canonical_id: str = Field(..., json_schema_extra={"example": "6.4.1(a)"})
    part_number: int = Field(..., json_schema_extra={"example": 6})
    section_number: str = Field(..., json_schema_extra={"example": "6.4"})
    clause_title: Optional[str] = None
    exact_quote: str = Field(..., description="Verbatim supporting quote from the policy text")
    effective_date: str = Field(..., json_schema_extra={"example": "2026-03-01"})
    is_amended: bool = False
    amendment_provenance: Optional[str] = Field(None, json_schema_extra={"example": "Amendment No. 2026-01 §1.1"})
    transitional_rule: Optional[str] = Field(None, json_schema_extra={"example": "Paragraph 5.1"})

class QueryRequest(BaseModel):
    """Incoming caseworker query payload."""
    question: str = Field(..., description="Natural language policy question")
    determination_date: Optional[str] = Field(None, description="Optional explicit determination date YYYY-MM-DD")
    change_of_circumstances_date: Optional[str] = Field(None, description="Optional explicit change date YYYY-MM-DD")
    claim_start_date: Optional[str] = Field(None, description="Optional claim start date YYYY-MM-DD")
    claim_end_date: Optional[str] = Field(None, description="Optional claim end date YYYY-MM-DD")
    top_k: Optional[int] = Field(5, description="Number of clauses to retrieve")
    provider: Optional[str] = Field(None, description="LLM provider: mock, groq, etc.")

class QueryResponse(BaseModel):
    """Master response contract conforming to Core Answer Contract."""
    status: ResponseStatus = Field(..., description="ANSWERED, ANSWERED_WITH_WARNING, or REFUSED")
    question: str
    direct_answer: Optional[str] = Field(None, description="Clear, definitive direct policy answer")
    policy_explanation: Optional[str] = Field(None, description="Step-by-step reasoning citing specific rules")
    supporting_citations: List[CitationBadge] = Field(default_factory=list, description="Verifiable clause citations")
    temporal_resolution: Optional[TemporalResolutionType] = None
    date_context: Optional[DateContext] = None
    is_amendment_active: bool = False
    transitional_rules_applied: List[str] = Field(default_factory=list)
    apportionment: Optional[SpanningApportionmentDetail] = None
    refusal_details: Optional[RefusalDetails] = None
    warnings: List[str] = Field(default_factory=list)
    execution_time_ms: float = 0.0
