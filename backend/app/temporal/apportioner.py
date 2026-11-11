"""Daily award apportionment calculation for spanning claims per §7.4.3 & Para 5.3."""
from datetime import date
from typing import Optional
from app.temporal.models import SpanningApportionmentDetail

AMENDMENT_EFFECTIVE_DATE = date(2026, 3, 1)

def calculate_spanning_apportionment(
    claim_start: date,
    claim_end: date
) -> Optional[SpanningApportionmentDetail]:
    """
    Calculate exact daily apportionment for a claim period spanning 1 March 2026.
    Follows Paragraph 5.3 of Amendment No. 2026-01 and §7.4.3 of the Policy Manual.
    Never invents an apportionment formula.
    """
    if claim_start >= claim_end:
        return None
        
    # Check if period spans 1 March 2026
    if not (claim_start < AMENDMENT_EFFECTIVE_DATE <= claim_end):
        return None
        
    # Inclusive count of days
    total_days = (claim_end - claim_start).days + 1
    
    # Days before 1 March 2026 (up to 28 Feb 2026)
    last_pre_date = date(2026, 2, 28)
    pre_days = (last_pre_date - claim_start).days + 1
    
    # Days on or after 1 March 2026
    post_days = (claim_end - AMENDMENT_EFFECTIVE_DATE).days + 1
    
    pre_ratio = round(pre_days / total_days, 4)
    post_ratio = round(post_days / total_days, 4)
    
    formula = (
        f"Award = ({pre_days}/{total_days} × Award_pre) + ({post_days}/{total_days} × Award_post), "
        f"apportioned by reference to the number of days under §7.4.3 as required by Amendment No. 2026-01 Paragraph 5.3."
    )
    
    return SpanningApportionmentDetail(
        claim_start_date=claim_start,
        claim_end_date=claim_end,
        total_days=total_days,
        pre_amendment_days=pre_days,
        post_amendment_days=post_days,
        pre_amendment_ratio=pre_ratio,
        post_amendment_ratio=post_ratio,
        apportionment_formula=formula
    )
