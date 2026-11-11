"""Detector for known policy omissions and draftsmanship gaps (e.g. Full-Time Students)."""
import re
from typing import Optional, Tuple
from app.api.schemas.chat import RefusalCategory, RefusalDetails
from app.refusal.reasons import STANDARD_NEXT_STEPS

def detect_apparent_gap(query: str) -> Tuple[bool, Optional[RefusalDetails]]:
    """
    Detect queries probing the intentional draftsmanship gap in the policy manual
    regarding full-time students (§1.4.6, §3.2.3, §5.2.3, §7.1.3 -> §5.4).
    """
    q_lower = query.lower()
    
    # Check for student / education calculation queries
    student_tokens = ["student", "full-time student", "university", "college", "higher education"]
    has_student = any(re.search(rf"\b{tok}\b", q_lower) for tok in student_tokens)
    
    calculation_tokens = ["needs figure", "needs calculation", "award", "how are", "treated", "entitlement", "amount", "calculate", "living cost", "7.1.3", "5.4"]
    has_calc = any(tok in q_lower for tok in calculation_tokens)
    
    if has_student and (has_calc or "eligible" in q_lower or "allowance" in q_lower or "absence" in q_lower):
        reason = (
            "The policy manual contains a recognized apparent gap regarding full-time students. "
            "Although §1.4.6 defines 'full-time student' and §7.1.3 states that the needs figure is calculated "
            "'except in the case of full-time students (see §5.4)', §5.4 exclusively governs care allowances "
            "and contains no provisions or formulas for full-time students. Furthermore, §3.2.3 and §5.2.3 "
            "state that full-time education is 'addressed separately', but no such section exists in the manual."
        )
        missing_info = [
            "Statutory needs calculation formula for full-time students",
            "Operative eligibility criteria for students in higher education",
            "Correction of the erroneous §7.1.3 cross-reference to §5.4"
        ]
        relevant_clauses = ["§7.1.3", "§1.4.6", "§3.2.3", "§5.4.1"]
        
        return True, RefusalDetails(
            category=RefusalCategory.APPARENT_GAP,
            reason=reason,
            missing_information=missing_info,
            partial_relevant_clauses=relevant_clauses,
            recommended_next_step=STANDARD_NEXT_STEPS[RefusalCategory.APPARENT_GAP]
        )
        
    return False, None
