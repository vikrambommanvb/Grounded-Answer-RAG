"""Detector for internal policy inconsistencies (e.g. §4.3.2 vs §9.1.4)."""
import re
from typing import Optional, Tuple
from app.api.schemas.chat import RefusalCategory, RefusalDetails
from app.temporal.models import TemporalResolutionResult, TemporalResolutionType
from app.refusal.reasons import STANDARD_NEXT_STEPS

def detect_internal_conflict(
    query: str,
    temporal_result: Optional[TemporalResolutionResult] = None
) -> Tuple[bool, Optional[RefusalDetails]]:
    """
    Detect queries encountering the internal draftsmanship conflict between
    §4.3.2 (10 calendar days reporting) and §9.1.4 (30 calendar days safe harbor).
    """
    # If explicitly resolved under post-amendment rules (both aligned to 14 days), no conflict exists
    if temporal_result and temporal_result.resolution_type == TemporalResolutionType.POST_AMENDMENT:
        return False, None
        
    q_lower = query.lower()
    
    reporting_tokens = ["report", "reporting", "change of circumstances", "overpayment", "safe harbor", "deadline", "timeline", "notice", "4.3.2", "9.1.4"]
    matches = [tok for tok in reporting_tokens if tok in q_lower]
    
    conflict_words = ["conflict", "contradiction", "inconsistency", "differ", "discrepancy", "both", "10 days", "30 days"]
    explicit_conflict_query = any(cw in q_lower for cw in conflict_words)
    
    # Trigger if explicitly asking about the contradiction or querying reporting deadline for pre-amendment
    is_pre_amendment = (temporal_result is None or temporal_result.resolution_type in (
        TemporalResolutionType.PRE_AMENDMENT,
        TemporalResolutionType.TRANSITIONAL_SPLIT,
        TemporalResolutionType.MISSING_TEMPORAL_DATA
    ))
    
    if (len(matches) >= 2 and is_pre_amendment) or (explicit_conflict_query and len(matches) >= 1):
        reason = (
            "The pre-amendment policy manual contains a direct internal contradiction regarding change reporting deadlines. "
            "Under §4.3.2, recipients must report changes 'within 10 calendar days of the change occurring'. However, "
            "under §9.1.4, no overpayment shall be established if reported 'within the 30 calendar days required under §4.3'. "
            "Amendment No. 2026-01 officially recognized this conflict and aligned both to 14 calendar days effective 1 March 2026, "
            "but for changes occurring prior to 1 March 2026, Paragraph 5.2 retains the conflicting pre-amendment rules."
        )
        missing_info = [
            "Resolution by Department policy management of the conflicting 10-day vs 30-day standards for pre-March 2026 changes",
            "Supervisor direction on whether §4.3.2 or §9.1.4 safe harbor prevails in individual casework"
        ]
        relevant_clauses = ["§4.3.2", "§9.1.4", "Amendment No. 2026-01 §2.1", "Amendment No. 2026-01 §2.2"]
        
        return True, RefusalDetails(
            category=RefusalCategory.INTERNAL_CONFLICT,
            reason=reason,
            missing_information=missing_info,
            partial_relevant_clauses=relevant_clauses,
            recommended_next_step=STANDARD_NEXT_STEPS[RefusalCategory.INTERNAL_CONFLICT]
        )
        
    return False, None
