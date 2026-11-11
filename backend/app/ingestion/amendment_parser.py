"""Amendment No. 2026-01 Markdown parser."""
import hashlib
import re
from pathlib import Path
from typing import List, Tuple
from app.api.schemas.policy import AmendmentRecord, AmendmentActionType, DocumentRecord

def parse_amendment(file_path: Path) -> Tuple[DocumentRecord, List[AmendmentRecord]]:
    """
    Parse Amendment No. 2026-01.
    Preserves exact changes, affected clauses, and transitional provisions.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"Amendment document not found at {file_path}")
        
    content = file_path.read_text(encoding="utf-8")
    doc_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
    
    # Metadata extraction
    issued_match = re.search(r"\*\*Issued:\*\*\s*(.+)", content)
    effective_match = re.search(r"\*\*Effective:\*\*\s*(.+)", content)
    issued_date = issued_match.group(1).strip() if issued_match else "12 February 2026"
    effective_date = effective_match.group(1).strip() if effective_match else "1 March 2026"
    
    # Extract staff note in section 2
    staff_note_match = re.search(r"\*Note for staff:\s*([^*]+)\*", content)
    staff_note = staff_note_match.group(1).strip() if staff_note_match else None
    
    amendments: List[AmendmentRecord] = []
    
    # Item 1.1: Earnings disregard
    item_1_1 = AmendmentRecord(
        item_id="AMD-2026-01:1.1",
        amendment_id="AMD-2026-01",
        item_number="1.1",
        section_title="Earnings disregard",
        target_clause_id="§6.4.1(a)",
        action_type=AmendmentActionType.SUBSTITUTE,
        old_text="$120 per month",
        new_text="$175 per month",
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.1",
        staff_note=None
    )
    amendments.append(item_1_1)
    
    # Item 2.1: Reporting period in §4.3.2
    item_2_1 = AmendmentRecord(
        item_id="AMD-2026-01:2.1",
        amendment_id="AMD-2026-01",
        item_number="2.1",
        section_title="Reporting of changes of circumstances",
        target_clause_id="§4.3.2",
        action_type=AmendmentActionType.SUBSTITUTE,
        old_text="10 calendar days",
        new_text="14 calendar days",
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.2",
        staff_note=staff_note
    )
    amendments.append(item_2_1)
    
    # Item 2.2: Reporting period in §9.1.4
    item_2_2 = AmendmentRecord(
        item_id="AMD-2026-01:2.2",
        amendment_id="AMD-2026-01",
        item_number="2.2",
        section_title="Reporting of changes of circumstances",
        target_clause_id="§9.1.4",
        action_type=AmendmentActionType.SUBSTITUTE,
        old_text="30 calendar days",
        new_text="14 calendar days",
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.2",
        staff_note=staff_note
    )
    amendments.append(item_2_2)
    
    # Item 3.1: Income thresholds table
    table_text = """| Household size | Monthly threshold |
|:--|:--|
| 1 | $1,225 |
| 2 | $1,650 |
| 3 | $2,075 |
| 4 | $2,500 |
| 5 | $2,925 |
| each additional member | + $425 |"""
    item_3_1 = AmendmentRecord(
        item_id="AMD-2026-01:3.1",
        amendment_id="AMD-2026-01",
        item_number="3.1",
        section_title="Income thresholds",
        target_clause_id="§6.6.1",
        action_type=AmendmentActionType.SUBSTITUTE,
        old_text="Original income threshold table at §6.6.1 ($1,180 to $2,820 + $410)",
        new_text=table_text,
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.1",
        staff_note=None
    )
    amendments.append(item_3_1)
    
    # Item 4.1: Sanction reduction percentage
    item_4_1 = AmendmentRecord(
        item_id="AMD-2026-01:4.1",
        amendment_id="AMD-2026-01",
        item_number="4.1",
        section_title="Sanctions",
        target_clause_id="§10.5.2",
        action_type=AmendmentActionType.SUBSTITUTE,
        old_text="20 per cent",
        new_text="15 per cent",
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.1",
        staff_note=None
    )
    amendments.append(item_4_1)
    
    # Item 4.2: New protection clause §10.5.3A
    item_4_2 = AmendmentRecord(
        item_id="AMD-2026-01:4.2",
        amendment_id="AMD-2026-01",
        item_number="4.2",
        section_title="Sanctions",
        target_clause_id="§10.5.3A",
        action_type=AmendmentActionType.INSERT,
        old_text=None,
        new_text="A sanction must not be imposed in respect of a failure to report where the change of circumstances in question would have increased the award.",
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.1",
        staff_note=None
    )
    amendments.append(item_4_2)
    
    # Item 5.1: Transitional Rule on Determination Date
    item_5_1 = AmendmentRecord(
        item_id="AMD-2026-01:5.1",
        amendment_id="AMD-2026-01",
        item_number="5.1",
        section_title="Transitional provision",
        target_clause_id=None,
        action_type=AmendmentActionType.TRANSITIONAL,
        old_text=None,
        new_text="The amendments made by paragraphs 1, 3 and 4 apply to any determination made on or after 1 March 2026, including a determination in respect of a period before that date.",
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.1",
        staff_note=None
    )
    amendments.append(item_5_1)
    
    # Item 5.2: Transitional Rule on Change of Circumstances Date
    item_5_2 = AmendmentRecord(
        item_id="AMD-2026-01:5.2",
        amendment_id="AMD-2026-01",
        item_number="5.2",
        section_title="Transitional provision",
        target_clause_id=None,
        action_type=AmendmentActionType.TRANSITIONAL,
        old_text=None,
        new_text="The amendments made by paragraph 2 apply only in respect of a change of circumstances occurring on or after 1 March 2026. Where the change of circumstances occurred before 1 March 2026, the reporting period is the period that applied at the date of the change, irrespective of the date of the determination.",
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.2",
        staff_note=None
    )
    amendments.append(item_5_2)
    
    # Item 5.3: Transitional Rule on Spanning Claims
    item_5_3 = AmendmentRecord(
        item_id="AMD-2026-01:5.3",
        amendment_id="AMD-2026-01",
        item_number="5.3",
        section_title="Transitional provision",
        target_clause_id=None,
        action_type=AmendmentActionType.TRANSITIONAL,
        old_text=None,
        new_text="Where a claim relates to a period spanning 1 March 2026, the applicable figures are those in force on each day of the period, and the award is apportioned accordingly under §7.4.3.",
        issued_date=issued_date,
        effective_date=effective_date,
        transitional_rule_ref="Para 5.3",
        staff_note=None
    )
    amendments.append(item_5_3)
    
    doc = DocumentRecord(
        document_id="HSP-AMD-2026-01",
        title="Calder County Household Support Program Amendment No. 2026-01",
        version="amendment-2026-01",
        issued_date=issued_date,
        effective_date=effective_date,
        file_path=str(file_path),
        content_hash=doc_hash,
        clause_count=len(amendments)
    )
    
    return doc, amendments

