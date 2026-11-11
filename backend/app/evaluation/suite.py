"""Ten-Question Benchmark Evaluation Suite for Calder County HSP."""
from typing import List, Optional
from pydantic import BaseModel, Field
from app.api.schemas.chat import ResponseStatus, RefusalCategory

class EvaluationTestCase(BaseModel):
    test_id: str
    category: str
    question: str
    determination_date: Optional[str] = None
    change_of_circumstances_date: Optional[str] = None
    claim_start_date: Optional[str] = None
    claim_end_date: Optional[str] = None
    expected_status: ResponseStatus
    expected_refusal_category: Optional[RefusalCategory] = None
    required_citations: List[str] = Field(default_factory=list)
    expected_key_phrases: List[str] = Field(default_factory=list)
    description: str

TEN_QUESTION_SUITE: List[EvaluationTestCase] = [
    EvaluationTestCase(
        test_id="TEST-01",
        category="Direct Grounded Query",
        question="What is the maximum amount of countable resources a household may hold to qualify for assistance?",
        expected_status=ResponseStatus.ANSWERED,
        required_citations=["§2.4.1"],
        expected_key_phrases=["$4,000", "countable resources"],
        description="Standard eligibility inquiry testing resources limit ceiling under §2.4.1."
    ),
    EvaluationTestCase(
        test_id="TEST-02",
        category="Multi-Clause Reasoning & Gate",
        question="Can an independent 16-year-old with no parental support qualify for assistance?",
        determination_date="2026-02-15",
        expected_status=ResponseStatus.ANSWERED_WITH_WARNING,
        required_citations=["§2.3.1", "§2.3.2"],
        expected_key_phrases=["16 or 17", "supervisor", "referred"],
        description="Tests age exception under §2.3.1 and mandatory supervisory referral warning under §2.3.2."
    ),
    EvaluationTestCase(
        test_id="TEST-03",
        category="Pre-Amendment Rates",
        question="What is the monthly earnings disregard for a claim determined on 15 February 2026?",
        determination_date="2026-02-15",
        expected_status=ResponseStatus.ANSWERED,
        required_citations=["§6.4.1(a)"],
        expected_key_phrases=["$120", "per month"],
        description="Tests pre-amendment rate resolution prior to 1 March 2026 effective date."
    ),
    EvaluationTestCase(
        test_id="TEST-04",
        category="Post-Amendment Rates",
        question="What is the monthly earnings disregard for a claim determined on 15 March 2026?",
        determination_date="2026-03-15",
        expected_status=ResponseStatus.ANSWERED,
        required_citations=["§6.4.1(a)"],
        expected_key_phrases=["$175", "Amendment No. 2026-01"],
        description="Tests post-amendment rate resolution and amendment citation provenance."
    ),
    EvaluationTestCase(
        test_id="TEST-05",
        category="Transitional Split Rule",
        question="A change of circumstances occurred on 10 February 2026, but determination is made on 20 March 2026. What reporting period applies to the change, and what earnings disregard applies?",
        determination_date="2026-03-20",
        change_of_circumstances_date="2026-02-10",
        expected_status=ResponseStatus.ANSWERED,
        required_citations=["§4.3.2", "§6.4.1(a)"],
        expected_key_phrases=["10 calendar days", "$175", "Paragraph 5.1", "Paragraph 5.2"],
        description="Tests Paragraph 5.1 ($175 disregard via determination date) vs Paragraph 5.2 (10-day reporting via change date)."
    ),
    EvaluationTestCase(
        test_id="TEST-06",
        category="Spanning Claim Apportionment",
        question="How is an award calculated for a claim period spanning from 15 February 2026 to 15 March 2026?",
        claim_start_date="2026-02-15",
        claim_end_date="2026-03-15",
        expected_status=ResponseStatus.ANSWERED,
        required_citations=["§7.4.3"],
        expected_key_phrases=["apportioned", "days", "§7.4.3", "Paragraph 5.3"],
        description="Tests daily award apportionment for claims spanning 1 March 2026 under §7.4.3 and Para 5.3."
    ),
    EvaluationTestCase(
        test_id="TEST-07",
        category="Internal Inconsistency Refusal",
        question="Under the pre-amendment policy, what is the deadline to report a change of circumstances to prevent an overpayment from being established?",
        change_of_circumstances_date="2026-01-15",
        expected_status=ResponseStatus.REFUSED,
        expected_refusal_category=RefusalCategory.INTERNAL_CONFLICT,
        required_citations=["§4.3.2", "§9.1.4"],
        expected_key_phrases=["10 calendar days", "30 calendar days", "contradiction"],
        description="Tests refusal / conflict surfacing on pre-amendment §4.3.2 vs §9.1.4 inconsistency."
    ),
    EvaluationTestCase(
        test_id="TEST-08",
        category="Apparent Gap Refusal",
        question="How is the monthly needs figure calculated for a full-time university student under §7.1.3?",
        expected_status=ResponseStatus.REFUSED,
        expected_refusal_category=RefusalCategory.APPARENT_GAP,
        required_citations=["§7.1.3", "§5.4"],
        expected_key_phrases=["apparent gap", "§7.1.3", "§5.4", "care allowance"],
        description="Tests challenge trap: erroneous §7.1.3 pointer to care allowances in §5.4 with missing student rules."
    ),
    EvaluationTestCase(
        test_id="TEST-09",
        category="Out of Scope Refusal",
        question="Can a local commercial business apply for an economic expansion grant through this program?",
        expected_status=ResponseStatus.REFUSED,
        expected_refusal_category=RefusalCategory.OUT_OF_SCOPE,
        expected_key_phrases=["not covered", "outside"],
        description="Tests out-of-scope refusal on unmentioned commercial business subsidies."
    ),
    EvaluationTestCase(
        test_id="TEST-10",
        category="Missing Critical Dates Refusal",
        question="What is the monthly income threshold for a household of 3?",
        expected_status=ResponseStatus.REFUSED,
        expected_refusal_category=RefusalCategory.MISSING_TEMPORAL_DATA,
        expected_key_phrases=["determination date", "cannot assume"],
        description="Tests missing temporal context refusal on threshold change ($2,000 vs $2,075) without date substitution."
    ),
]
