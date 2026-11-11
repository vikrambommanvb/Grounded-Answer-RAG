"""Natural language date extraction for caseworker queries."""
import re
from datetime import date, datetime
from typing import Optional, List, Tuple
from app.temporal.models import DateContext

MONTH_NAMES = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12
}

def parse_date_string(date_str: str) -> Optional[date]:
    """Parse various date formats into a datetime.date object."""
    date_str = date_str.strip().lower()
    
    # ISO format YYYY-MM-DD
    iso_match = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", date_str)
    if iso_match:
        return date(int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3)))
        
    # Format: 15 February 2026 or 1st March 2026
    d_m_y_match = re.search(r"(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})", date_str)
    if d_m_y_match:
        day = int(d_m_y_match.group(1))
        month_name = d_m_y_match.group(2)
        year = int(d_m_y_match.group(3))
        if month_name in MONTH_NAMES:
            return date(year, MONTH_NAMES[month_name], day)
            
    # Format: February 15, 2026 or Feb 15 2026
    m_d_y_match = re.search(r"([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4})", date_str)
    if m_d_y_match:
        month_name = m_d_y_match.group(1)
        day = int(m_d_y_match.group(2))
        year = int(m_d_y_match.group(3))
        if month_name in MONTH_NAMES:
            return date(year, MONTH_NAMES[month_name], day)
            
    # Month Year: February 2026 -> default to 1st of month
    m_y_match = re.search(r"([a-z]+)\s+(\d{4})", date_str)
    if m_y_match:
        month_name = m_y_match.group(1)
        year = int(m_y_match.group(2))
        if month_name in MONTH_NAMES:
            return date(year, MONTH_NAMES[month_name], 1)
            
    return None

def extract_dates_from_query(
    query: str,
    explicit_context: Optional[DateContext] = None
) -> DateContext:
    """
    Extract date context from query text and merge with explicit parameters.
    Never invents or defaults to current date.
    """
    ctx = DateContext()
    if explicit_context:
        ctx.determination_date = explicit_context.determination_date
        ctx.change_of_circumstances_date = explicit_context.change_of_circumstances_date
        ctx.claim_start_date = explicit_context.claim_start_date
        ctx.claim_end_date = explicit_context.claim_end_date
        
    q_lower = query.lower()
    
    # 1. Look for spanning range: e.g. "from 15 February 2026 to 15 March 2026"
    span_match = re.search(
        r"(?:from|spanning|between)\s+([^,]+?)\s+(?:to|and|through)\s+([^,\.\?]+)",
        q_lower
    )
    if span_match:
        d1 = parse_date_string(span_match.group(1))
        d2 = parse_date_string(span_match.group(2))
        if d1 and d2:
            if not ctx.claim_start_date:
                ctx.claim_start_date = d1
            if not ctx.claim_end_date:
                ctx.claim_end_date = d2
            ctx.raw_query_dates.extend([span_match.group(1).strip(), span_match.group(2).strip()])
            
    # 2. Look for determination date qualifiers
    det_match = re.search(
        r"(?:determined|determination|decision|decided|adjudicated)\s+(?:made\s+)?(?:on|in|at|dated)?\s*([0-9a-z\s,]+?(?=\s+for|\s+regarding|\s+with|\s+and|\.|\?|$))",
        q_lower
    )
    if det_match and not ctx.determination_date:
        parsed = parse_date_string(det_match.group(1))
        if parsed:
            ctx.determination_date = parsed
            ctx.raw_query_dates.append(det_match.group(1).strip())
            
    # 3. Look for change of circumstances date qualifiers
    change_match = re.search(
        r"(?:change(?:\s+of\s+circumstances)?|circumstance|event|reported|occurred|happened)\s+(?:on|in|occurred\s+on)?\s*([0-9a-z\s,]+?(?=\s+determined|\s+and|\s+with|\.|\?|$))",
        q_lower
    )
    if change_match and not ctx.change_of_circumstances_date:
        parsed = parse_date_string(change_match.group(1))
        if parsed:
            ctx.change_of_circumstances_date = parsed
            ctx.raw_query_dates.append(change_match.group(1).strip())
            
    # 4. Fallback: search for any standalone dates in text if none assigned yet
    if not ctx.determination_date and not ctx.change_of_circumstances_date and not ctx.claim_start_date:
        # Find all date-like strings
        pattern = r"\b\d{1,2}(?:st|nd|rd|th)?\s+[a-z]+\s+\d{4}\b|\b[a-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b"
        all_dates = re.findall(pattern, q_lower)
        for ds in all_dates:
            parsed = parse_date_string(ds)
            if parsed:
                ctx.raw_query_dates.append(ds)
                # By default assign to determination date if single date provided
                if not ctx.determination_date:
                    ctx.determination_date = parsed
                    
    return ctx
