"""Tests for Refusal Engine, Apparent Gap detection, and Internal Inconsistency handling."""
import pytest
from app.api.schemas.chat import QueryRequest, ResponseStatus, RefusalCategory
from app.generation.generator import GroundedAnswerGenerator

@pytest.fixture(scope="module")
def generator():
    return GroundedAnswerGenerator()

def test_apparent_gap_refusal_for_students(generator):
    """
    Test the challenge trap: Full-time student needs calculation.
    §7.1.3 erroneously points to care allowances in §5.4, and no student rules exist.
    The system MUST refuse with APPARENT_GAP and direct the caseworker to policy leadership.
    """
    req = QueryRequest(
        question="How is the monthly needs figure calculated for a full-time student living in the household?"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status == ResponseStatus.REFUSED
    assert resp.refusal_details is not None
    assert resp.refusal_details.category == RefusalCategory.APPARENT_GAP
    assert "§7.1.3" in resp.refusal_details.reason
    assert "§5.4" in resp.refusal_details.reason
    assert "apparent gap" in resp.refusal_details.reason.lower()
    assert len(resp.refusal_details.missing_information) > 0
    assert "policy leadership" in resp.refusal_details.recommended_next_step.lower()

def test_internal_conflict_refusal_pre_amendment(generator):
    """
    Test the challenge trap: Pre-amendment reporting deadline inconsistency.
    §4.3.2 (10 calendar days) vs §9.1.4 (30 calendar days safe harbor).
    """
    req = QueryRequest(
        question="What is the deadline to report a change of circumstances to prevent an overpayment for a change in January 2026?",
        change_of_circumstances_date="2026-01-15"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status == ResponseStatus.REFUSED
    assert resp.refusal_details is not None
    assert resp.refusal_details.category == RefusalCategory.INTERNAL_CONFLICT
    assert "§4.3.2" in resp.refusal_details.reason
    assert "§9.1.4" in resp.refusal_details.reason
    assert "10 calendar days" in resp.refusal_details.reason
    assert "30 calendar days" in resp.refusal_details.reason
    assert "supervisor" in resp.refusal_details.recommended_next_step.lower()

def test_post_amendment_conflict_resolved(generator):
    """
    Verify that for changes on or after 1 March 2026, the conflict is RESOLVED
    and the system returns an answer of 14 calendar days rather than refusing.
    """
    req = QueryRequest(
        question="What is the deadline to report a change of circumstances that occurred on 15 March 2026?",
        change_of_circumstances_date="2026-03-15",
        determination_date="2026-03-20"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status in (ResponseStatus.ANSWERED, ResponseStatus.ANSWERED_WITH_WARNING)
    assert resp.refusal_details is None
    assert "14 calendar days" in resp.direct_answer

def test_out_of_scope_refusal(generator):
    """Test completely unrelated query is refused as OUT_OF_SCOPE."""
    req = QueryRequest(
        question="Can our corporate entity apply for a commercial export technology grant?"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status == ResponseStatus.REFUSED
    assert resp.refusal_details is not None
    assert resp.refusal_details.category == RefusalCategory.OUT_OF_SCOPE

def test_missing_temporal_context_refusal(generator):
    """Test rate question with missing date is refused under MISSING_TEMPORAL_DATA."""
    req = QueryRequest(
        question="What is the monthly earnings disregard?"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status == ResponseStatus.REFUSED
    assert resp.refusal_details is not None
    assert resp.refusal_details.category == RefusalCategory.MISSING_TEMPORAL_DATA

def test_insufficient_case_facts_refusal(generator):
    """Test severely incomplete query is refused under INSUFFICIENT_EVIDENCE."""
    req = QueryRequest(
        question="Am I eligible?"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status == ResponseStatus.REFUSED
    assert resp.refusal_details is not None
    assert resp.refusal_details.category == RefusalCategory.INSUFFICIENT_EVIDENCE
    assert any("§2.1.2" in item for item in resp.refusal_details.missing_information)
