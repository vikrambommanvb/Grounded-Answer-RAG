"""Responsible Refusal Engine orchestrating statutory gap, conflict, and scope checks."""
from typing import Optional, List, Tuple
from app.api.schemas.chat import RefusalCategory, RefusalDetails
from app.api.schemas.retrieval import RetrievedClause
from app.temporal.models import TemporalResolutionResult, TemporalResolutionType
from app.policy.gap_detector import detect_apparent_gap
from app.policy.conflict_detector import detect_internal_conflict
from app.refusal.reasons import STANDARD_NEXT_STEPS

class RefusalEngine:
    """
    Evaluates whether a caseworker query must be declined.
    Implements the non-negotiable principle: 'knows the edge of what it knows'.
    """
    
    def evaluate(
        self,
        query: str,
        retrieved_clauses: List[RetrievedClause],
        temporal_result: Optional[TemporalResolutionResult] = None
    ) -> Tuple[bool, Optional[RefusalDetails]]:
        """
        Check all refusal conditions in prioritized statutory order.
        """
        q_lower = query.lower()
        
        # 1. Check for severely incomplete case facts (e.g. "Am I eligible?")
        words = query.strip().rstrip("?").split()
        if len(words) <= 5 and any(w in q_lower for w in ["eligible", "qualify", "how much", "can i get"]):
            return True, RefusalDetails(
                category=RefusalCategory.INSUFFICIENT_EVIDENCE,
                reason="The question lacks essential household facts required to determine eligibility or calculate awards under Part 2 and Part 7.",
                missing_information=[
                    "Household composition and residence in Calder County (§2.1.2(a))",
                    "Applicant age (§2.1.2(b))",
                    "Countable household monthly income (§2.1.2(c))",
                    "Countable household resources (§2.1.2(d))"
                ],
                partial_relevant_clauses=["§2.1.2", "§2.4.1", "§7.1.1"],
                recommended_next_step=STANDARD_NEXT_STEPS[RefusalCategory.INSUFFICIENT_EVIDENCE]
            )
            
        # 2. Check for intentional statutory gaps (e.g. Full-Time Students §7.1.3)
        is_gap, gap_details = detect_apparent_gap(query)
        if is_gap:
            return True, gap_details
            
        # 3. Check for internal contradictions (e.g. §4.3.2 vs §9.1.4 pre-amendment)
        is_conflict, conflict_details = detect_internal_conflict(query, temporal_result)
        if is_conflict:
            return True, conflict_details
            
        # 4. Check for missing temporal data on date-sensitive provisions
        if temporal_result and temporal_result.resolution_type == TemporalResolutionType.MISSING_TEMPORAL_DATA:
            candidate_ids = [c.clause_id for c in retrieved_clauses[:2]] if retrieved_clauses else ["§6.4.1", "§4.3.2"]
            return True, RefusalDetails(
                category=RefusalCategory.MISSING_TEMPORAL_DATA,
                reason=(
                    "The applicable policy provision was amended by Amendment No. 2026-01 (effective 1 March 2026). "
                    "The correct answer depends on whether the claim was determined or the event occurred before or after 1 March 2026. "
                    "The assistant cannot assume today's date or substitute the current date."
                ),
                missing_information=[
                    "Determination date for rate calculations (earnings disregard, income thresholds, sanctions)",
                    "Date of occurrence for changes of circumstances"
                ],
                partial_relevant_clauses=candidate_ids,
                recommended_next_step=STANDARD_NEXT_STEPS[RefusalCategory.MISSING_TEMPORAL_DATA]
            )
            
        # 5. Check for out-of-scope / zero retrieval
        if not retrieved_clauses:
            return True, RefusalDetails(
                category=RefusalCategory.OUT_OF_SCOPE,
                reason="The requested subject is not covered by the Calder County Household Support Program Policy Manual.",
                missing_information=["Topic is outside the statutory mandate of the Program."],
                partial_relevant_clauses=[],
                recommended_next_step=STANDARD_NEXT_STEPS[RefusalCategory.OUT_OF_SCOPE]
            )
            
        return False, None

# Global refusal engine instance
refusal_engine = RefusalEngine()
