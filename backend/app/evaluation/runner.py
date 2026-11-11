"""Automated Evaluation Runner executing the 10-Question Benchmark Suite."""
import time
import json
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from app.api.schemas.chat import QueryRequest, QueryResponse, ResponseStatus
from app.evaluation.suite import TEN_QUESTION_SUITE, EvaluationTestCase
from app.generation.generator import answer_generator
from app.database.session import get_connection

class TestCaseEvaluationResult(BaseModel):
    test_id: str
    category: str
    question: str
    passed: bool
    expected_status: str
    actual_status: str
    status_passed: bool
    citation_passed: bool
    phrases_passed: bool
    latency_ms: float
    details: str

class EvaluationRunSummary(BaseModel):
    total_tests: int
    passed_tests: int
    failed_tests: int
    accuracy_percentage: float
    refusal_correctness_percentage: float
    citation_validity_percentage: float
    average_latency_ms: float
    results: List[TestCaseEvaluationResult]

def init_eval_db():
    """Ensure evaluation table exists in SQLite."""
    conn = get_connection()
    conn.execute("""
    CREATE TABLE IF NOT EXISTS evaluation_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id TEXT NOT NULL,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        passed INTEGER NOT NULL,
        expected_status TEXT NOT NULL,
        actual_status TEXT NOT NULL,
        latency_ms REAL NOT NULL,
        details TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    conn.close()

def run_evaluation_suite(provider: str = "mock") -> EvaluationRunSummary:
    """
    Execute all ten benchmark test cases and measure actual system performance.
    Results are genuinely evaluated and persisted to database.
    """
    init_eval_db()
    results: List[TestCaseEvaluationResult] = []
    
    total_latency = 0.0
    refusal_tests = 0
    refusal_passed = 0
    citation_tests = 0
    citation_passed = 0
    
    for tc in TEN_QUESTION_SUITE:
        req = QueryRequest(
            question=tc.question,
            determination_date=tc.determination_date,
            change_of_circumstances_date=tc.change_of_circumstances_date,
            claim_start_date=tc.claim_start_date,
            claim_end_date=tc.claim_end_date,
            provider=provider
        )
        
        start_t = time.perf_counter()
        resp: QueryResponse = answer_generator.generate_answer(req)
        latency = round((time.perf_counter() - start_t) * 1000.0, 2)
        total_latency += latency
        
        # 1. Status Check
        if tc.expected_status in (ResponseStatus.ANSWERED, ResponseStatus.ANSWERED_WITH_WARNING):
            status_ok = resp.status in (ResponseStatus.ANSWERED, ResponseStatus.ANSWERED_WITH_WARNING)
        else:
            status_ok = (resp.status == tc.expected_status)
        
        # 2. Refusal Category Check
        if tc.expected_status == ResponseStatus.REFUSED:
            refusal_tests += 1
            if resp.status == ResponseStatus.REFUSED and resp.refusal_details:
                if tc.expected_refusal_category:
                    cat_ok = (resp.refusal_details.category == tc.expected_refusal_category)
                else:
                    cat_ok = True
                if cat_ok:
                    refusal_passed += 1
            else:
                cat_ok = False
        else:
            cat_ok = True
            
        # 3. Citation Check
        if tc.required_citations:
            citation_tests += 1
            if resp.status in (ResponseStatus.ANSWERED, ResponseStatus.ANSWERED_WITH_WARNING):
                actual_cits = [b.clause_id for b in resp.supporting_citations]
                cit_ok = all(
                    any(ac.startswith(rc) or rc.startswith(ac) for ac in actual_cits)
                    for rc in tc.required_citations
                )
            elif resp.refusal_details:
                text_to_check = f"{resp.refusal_details.reason} {' '.join(resp.refusal_details.partial_relevant_clauses)}"
                cit_ok = all(rc in text_to_check for rc in tc.required_citations)
            else:
                cit_ok = False
                
            if cit_ok:
                citation_passed += 1
        else:
            cit_ok = True
            
        # 4. Key Phrases Check
        full_text_parts = [resp.direct_answer or '', resp.policy_explanation or '']
        if resp.refusal_details:
            full_text_parts.extend([
                resp.refusal_details.reason or '',
                resp.refusal_details.recommended_next_step or '',
                ' '.join(resp.refusal_details.missing_information or []),
                ' '.join(resp.refusal_details.partial_relevant_clauses or [])
            ])
        full_text = ' '.join(full_text_parts)
        phrases_ok = all(kp.lower() in full_text.lower() for kp in tc.expected_key_phrases) if tc.expected_key_phrases else True
        
        # Overall Test Verdict
        test_passed = status_ok and cat_ok and cit_ok and phrases_ok
        
        res_item = TestCaseEvaluationResult(
            test_id=tc.test_id,
            category=tc.category,
            question=tc.question,
            passed=test_passed,
            expected_status=tc.expected_status.value,
            actual_status=resp.status.value,
            status_passed=status_ok,
            citation_passed=cit_ok,
            phrases_passed=phrases_ok,
            latency_ms=latency,
            details=f"Status: {resp.status.value} | Citations: {len(resp.supporting_citations)} | Refusal: {resp.refusal_details.category.value if resp.refusal_details else 'None'}"
        )
        results.append(res_item)
        
    # Store results in SQLite
    conn = get_connection()
    for r in results:
        conn.execute("""
        INSERT INTO evaluation_results (test_id, category, question, passed, expected_status, actual_status, latency_ms, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (r.test_id, r.category, r.question, 1 if r.passed else 0, r.expected_status, r.actual_status, r.latency_ms, r.details))
    conn.commit()
    conn.close()
    
    total = len(results)
    passed = sum(1 for r in results if r.passed)
    avg_lat = round(total_latency / total, 2) if total > 0 else 0.0
    
    accuracy = round((passed / total) * 100.0, 1) if total > 0 else 0.0
    ref_rate = round((refusal_passed / refusal_tests) * 100.0, 1) if refusal_tests > 0 else 100.0
    cit_rate = round((citation_passed / citation_tests) * 100.0, 1) if citation_tests > 0 else 100.0
    
    return EvaluationRunSummary(
        total_tests=total,
        passed_tests=passed,
        failed_tests=total - passed,
        accuracy_percentage=accuracy,
        refusal_correctness_percentage=ref_rate,
        citation_validity_percentage=cit_rate,
        average_latency_ms=avg_lat,
        results=results
    )
