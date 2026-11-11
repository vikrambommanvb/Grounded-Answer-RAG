"""Refusal taxonomy, categories, and standardized next-step recommendations."""
from typing import Dict, List, Optional
from pydantic import BaseModel
from app.api.schemas.chat import RefusalCategory, RefusalDetails

STANDARD_NEXT_STEPS: Dict[RefusalCategory, str] = {
    RefusalCategory.OUT_OF_SCOPE: (
        "The requested topic is not governed by the Calder County Household Support Program. "
        "Advise the applicant to consult general county social services or relevant municipal assistance programs."
    ),
    RefusalCategory.INSUFFICIENT_EVIDENCE: (
        "The policy manual does not contain sufficient factual or statutory criteria to answer this question. "
        "Request clarifying case documentation from the applicant or refer to the District Office Supervisor under §1.1.3."
    ),
    RefusalCategory.APPARENT_GAP: (
        "The policy manual contains a recognized draftsmanship gap regarding this topic (e.g. §7.1.3 mistakenly cross-references "
        "care allowance provisions in §5.4 for full-time students). Refer this issue directly to Department policy leadership or legal counsel."
    ),
    RefusalCategory.INTERNAL_CONFLICT: (
        "The pre-amendment policy contains an unresolved statutory inconsistency between §4.3.2 (10 calendar days reporting) "
        "and §9.1.4 (30 calendar days safe harbor). Escalate the file to the District Office Supervisor for an administrative determination."
    ),
    RefusalCategory.MISSING_TEMPORAL_DATA: (
        "The governing policy provision was substantively modified by Amendment No. 2026-01 (effective 1 March 2026). "
        "Obtain the claim determination date and the date the change of circumstances occurred to determine whether pre-amendment "
        "or post-amendment rules apply."
    ),
    RefusalCategory.CITATION_VALIDATION_FAILED: (
        "The assistant refused to return an answer because one or more proposed clause citations could not be verified in the authoritative text. "
        "Inspect the consolidated policy manual directly."
    )
}
