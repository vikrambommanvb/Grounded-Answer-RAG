"""Tests for the Temporal Policy Engine, date extraction, and transitional rules."""
import pytest
from datetime import date
from app.temporal.models import DateContext, TemporalResolutionType
from app.temporal.extractor import extract_dates_from_query, parse_date_string
from app.temporal.resolver import TemporalPolicyResolver
from app.temporal.apportioner import calculate_spanning_apportionment

@pytest.fixture
def resolver():
    return TemporalPolicyResolver()

def test_parse_date_string():
    """Verify parsing of diverse date string formats."""
    assert parse_date_string("2026-03-01") == date(2026, 3, 1)
    assert parse_date_string("15 February 2026") == date(2026, 2, 15)
    assert parse_date_string("1st March 2026") == date(2026, 3, 1)
    assert parse_date_string("March 15, 2026") == date(2026, 3, 15)
    assert parse_date_string("February 2026") == date(2026, 2, 1)

def test_extract_dates_from_natural_language():
    """Test extracting structured dates from natural language questions."""
    q1 = "A claim determined on March 15, 2026 for a change of circumstances on 10 February 2026"
    ctx1 = extract_dates_from_query(q1)
    assert ctx1.determination_date == date(2026, 3, 15)
    assert ctx1.change_of_circumstances_date == date(2026, 2, 10)
    
    q2 = "What award is payable for a claim spanning from 15 February 2026 to 15 March 2026?"
    ctx2 = extract_dates_from_query(q2)
    assert ctx2.claim_start_date == date(2026, 2, 15)
    assert ctx2.claim_end_date == date(2026, 3, 15)

def test_pre_amendment_determination(resolver):
    """Test determination rendered prior to 1 March 2026."""
    ctx = DateContext(determination_date=date(2026, 2, 15))
    res = resolver.resolve(ctx, relevant_clause_ids=["§6.4.1(a)", "§4.3.2"])
    
    assert res.resolution_type == TemporalResolutionType.PRE_AMENDMENT
    assert res.is_amendment_active is False
    assert "$120 per month" in res.effective_clauses_overlay["§6.4.1(a)"].applicable_text
    assert "10 calendar days" in res.effective_clauses_overlay["§4.3.2"].applicable_text
    assert res.effective_clauses_overlay["§10.5.2"].is_amended is False

def test_post_amendment_determination(resolver):
    """Test determination rendered on or after 1 March 2026."""
    ctx = DateContext(determination_date=date(2026, 3, 15), change_of_circumstances_date=date(2026, 3, 5))
    res = resolver.resolve(ctx, relevant_clause_ids=["§6.4.1(a)", "§4.3.2", "§10.5.3A"])
    
    assert res.resolution_type == TemporalResolutionType.POST_AMENDMENT
    assert res.is_amendment_active is True
    assert "$175 per month" in res.effective_clauses_overlay["§6.4.1(a)"].applicable_text
    assert "14 calendar days" in res.effective_clauses_overlay["§4.3.2"].applicable_text
    assert "§10.5.3A" in res.effective_clauses_overlay
    assert "would have increased the award" in res.effective_clauses_overlay["§10.5.3A"].applicable_text

def test_boundary_dates(resolver):
    """Test exact boundary transitions between 28 Feb and 1 Mar 2026."""
    # Day before: 28 February 2026
    ctx_pre = DateContext(determination_date=date(2026, 2, 28))
    res_pre = resolver.resolve(ctx_pre)
    assert res_pre.resolution_type == TemporalResolutionType.PRE_AMENDMENT
    assert "$120 per month" in res_pre.effective_clauses_overlay["§6.4.1(a)"].applicable_text
    
    # Exact milestone day: 1 March 2026
    ctx_post = DateContext(determination_date=date(2026, 3, 1))
    res_post = resolver.resolve(ctx_post)
    assert res_post.resolution_type == TemporalResolutionType.POST_AMENDMENT
    assert "$175 per month" in res_post.effective_clauses_overlay["§6.4.1(a)"].applicable_text

def test_transitional_split_rule(resolver):
    """
    Test Paragraph 5.1 vs 5.2 divergence:
    Change occurred in February 2026, but determination made in March 2026.
    """
    ctx = DateContext(
        determination_date=date(2026, 3, 15),
        change_of_circumstances_date=date(2026, 2, 10)
    )
    res = resolver.resolve(ctx, relevant_clause_ids=["§6.4.1(a)", "§4.3.2"])
    
    assert res.resolution_type == TemporalResolutionType.TRANSITIONAL_SPLIT
    assert res.is_amendment_active is True
    assert "Paragraph 5.1" in res.transitional_rules_applied
    assert "Paragraph 5.2" in res.transitional_rules_applied
    
    # Rates governed by determination date (Para 5.1) -> $175
    c_disregard = res.effective_clauses_overlay["§6.4.1(a)"]
    assert "$175 per month" in c_disregard.applicable_text
    assert c_disregard.is_amended is True
    
    # Reporting timeline governed by date change occurred (Para 5.2) -> 10 days
    c_reporting = res.effective_clauses_overlay["§4.3.2"]
    assert "10 calendar days" in c_reporting.applicable_text
    assert c_reporting.is_amended is False

def test_spanning_claim_apportionment(resolver):
    """Test daily apportionment for a claim spanning 1 March 2026."""
    start = date(2026, 2, 15)
    end = date(2026, 3, 15)
    ctx = DateContext(claim_start_date=start, claim_end_date=end)
    res = resolver.resolve(ctx)
    
    assert res.resolution_type == TemporalResolutionType.SPANNING_CLAIM
    assert res.apportionment is not None
    
    app = res.apportionment
    # Feb 15 to Feb 28 inclusive = 14 days
    assert app.pre_amendment_days == 14
    # Mar 1 to Mar 15 inclusive = 15 days
    assert app.post_amendment_days == 15
    assert app.total_days == 29
    assert app.pre_amendment_ratio == round(14 / 29, 4)
    assert app.post_amendment_ratio == round(15 / 29, 4)
    assert "§7.4.3" in app.apportionment_formula
    assert "Paragraph 5.3" in app.apportionment_formula

def test_missing_temporal_context_detection(resolver):
    """Test that rate-sensitive questions with no dates trigger missing temporal data resolution."""
    ctx = DateContext()  # No dates provided
    res = resolver.resolve(ctx, relevant_clause_ids=["§6.4.1(a)"])
    
    assert res.resolution_type == TemporalResolutionType.MISSING_TEMPORAL_DATA
    assert len(res.warnings) > 0
    assert "cannot assume today's date" in res.warnings[0].lower()

def test_date_invariant_query(resolver):
    """Test that queries regarding unchanged clauses pass as date-invariant."""
    ctx = DateContext()
    res = resolver.resolve(ctx, relevant_clause_ids=["§2.4.1"])
    assert res.resolution_type == TemporalResolutionType.DATE_INVARIANT
