"""Tests for grounded answer generation, citation validation, and supervisory gates."""
import pytest
from app.api.schemas.chat import QueryRequest, ResponseStatus, RefusalCategory
from app.generation.generator import GroundedAnswerGenerator
from app.citations.validator import validate_citations, extract_citations_from_text

@pytest.fixture(scope="module")
def generator():
    return GroundedAnswerGenerator()

def test_grounded_answer_pre_amendment(generator):
    """Test grounded answer generation for pre-amendment determination."""
    req = QueryRequest(
        question="What is the monthly earnings disregard for a claim determined on 15 February 2026?",
        determination_date="2026-02-15"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status in (ResponseStatus.ANSWERED, ResponseStatus.ANSWERED_WITH_WARNING)
    assert "$120" in resp.direct_answer
    assert any(b.clause_id == "§6.4.1(a)" or b.clause_id == "§6.4.1" for b in resp.supporting_citations)
    assert resp.is_amendment_active is False

def test_grounded_answer_post_amendment(generator):
    """Test grounded answer generation for post-amendment determination."""
    req = QueryRequest(
        question="What is the monthly earnings disregard for a claim determined on 15 March 2026?",
        determination_date="2026-03-15"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status in (ResponseStatus.ANSWERED, ResponseStatus.ANSWERED_WITH_WARNING)
    assert "$175" in resp.direct_answer
    assert any(b.clause_id == "§6.4.1(a)" for b in resp.supporting_citations)
    assert resp.is_amendment_active is True
    
    # Check citation badge has amendment provenance
    badge = next(b for b in resp.supporting_citations if b.clause_id == "§6.4.1(a)")
    assert badge.is_amended is True
    assert "Amendment No. 2026-01" in badge.amendment_provenance
    assert "Paragraph 5.1" in badge.transitional_rule

def test_supervisory_referral_gate(generator):
    """Test applicant under 18 question triggers supervisory referral warning."""
    req = QueryRequest(
        question="Can a 16-year-old living independently qualify for the program?",
        determination_date="2026-02-15"
    )
    resp = generator.generate_answer(req)
    
    assert resp.status == ResponseStatus.ANSWERED_WITH_WARNING
    assert any("supervisor" in w.lower() and "§2.3.2" in w for w in resp.warnings)
    assert any(b.clause_id == "§2.3.1" or b.clause_id == "§2.3.2" for b in resp.supporting_citations)

def test_missing_dates_triggers_refusal(generator):
    """Test rate-sensitive question with no dates triggers missing temporal data refusal."""
    req = QueryRequest(question="What is the earnings disregard?")
    resp = generator.generate_answer(req)
    
    assert resp.status == ResponseStatus.REFUSED
    assert resp.refusal_details is not None
    assert resp.refusal_details.category == RefusalCategory.MISSING_TEMPORAL_DATA
    assert "cannot assume today's date" in resp.refusal_details.reason.lower()

def test_out_of_scope_triggers_refusal(generator):
    """Test completely unrelated query triggers out-of-scope refusal."""
    req = QueryRequest(question="Quantum semiconductor photon entanglement coherence")
    resp = generator.generate_answer(req)
    
    assert resp.status == ResponseStatus.REFUSED
    assert resp.refusal_details is not None
    assert resp.refusal_details.category == RefusalCategory.OUT_OF_SCOPE

def test_citation_validator_valid_and_invalid():
    """Test citation validator detects hallucinated citations."""
    valid_text = "According to §2.4.1 and §2.4.2, countable resources cannot exceed $4,000."
    is_valid, badges, invalid = validate_citations(valid_text)
    assert is_valid is True
    assert len(badges) == 2
    assert len(invalid) == 0
    
    hallucinated_text = "Under §99.1.2 and §44.8, commercial businesses receive grants."
    is_valid_h, badges_h, invalid_h = validate_citations(hallucinated_text)
    assert is_valid_h is False
    assert "§99.1.2" in invalid_h
    assert "§44.8" in invalid_h
