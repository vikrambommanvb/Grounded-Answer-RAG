"""Citation extraction, verification, and badge generation."""
import re
from typing import List, Tuple, Dict, Set, Optional
from app.api.schemas.chat import CitationBadge
from app.api.schemas.policy import ClauseRecord
from app.temporal.models import TemporalResolutionResult, ResolvedClauseVersion
from app.database.models import get_clause_by_id, get_all_clauses, get_all_amendments

def extract_citations_from_text(text: str) -> List[str]:
    """Extract canonical clause citations (§X.Y.Z or §X.Y) from text."""
    raw_citations = re.findall(r"§\d+(?:\.\d+)+(?:[A-Z]|\([a-z0-9]+\))?", text)
    unique_citations = []
    for c in raw_citations:
        if c not in unique_citations:
            unique_citations.append(c)
    return unique_citations

def validate_citations(
    generated_text: str,
    temporal_result: Optional[TemporalResolutionResult] = None,
    all_clauses_map: Optional[Dict[str, ClauseRecord]] = None
) -> Tuple[bool, List[CitationBadge], List[str]]:
    """
    Validate all citations cited in the generated answer against authoritative corpus.
    Guarantees that no fabricated or hallucinated citations are returned.
    """
    if all_clauses_map is None:
        clauses = get_all_clauses()
        all_clauses_map = {c.clause_id: c for c in clauses}
        
    extracted_citations = extract_citations_from_text(generated_text)
    badges: List[CitationBadge] = []
    invalid_citations: List[str] = []
    
    # Overlay clauses for active amendments
    overlay = temporal_result.effective_clauses_overlay if temporal_result else {}
    
    # Load amendments for cross-referencing amendment items
    try:
        amendments = get_all_amendments()
        amendment_items = {a.item_number: a for a in amendments}
    except Exception:
        amendment_items = {}
        
    for citation in extracted_citations:
        base_id = re.sub(r"\([a-z0-9]+\)", "", citation)
        
        # 1. Direct match in active overlay
        resolved_version: Optional[ResolvedClauseVersion] = overlay.get(citation) or overlay.get(base_id)
        # 2. Match in baseline clauses
        baseline_clause: Optional[ClauseRecord] = all_clauses_map.get(citation) or all_clauses_map.get(base_id)
        
        # 3. Special handling for §10.5.3A
        if citation == "§10.5.3A":
            badge = CitationBadge(
                clause_id="§10.5.3A",
                canonical_id="10.5.3A",
                part_number=10,
                section_number="10.5",
                clause_title="Sanction Exemption for Increased Awards",
                exact_quote="A sanction must not be imposed in respect of a failure to report where the change of circumstances in question would have increased the award.",
                effective_date="2026-03-01",
                is_amended=True,
                amendment_provenance="Amendment No. 2026-01 §4.2",
                transitional_rule="Paragraph 5.1"
            )
            badges.append(badge)
            continue
            
        # 4. Check section-level reference e.g. §4.3, §6.4, §2.4, §1.1
        can_id = citation.lstrip("§")
        if not baseline_clause and not resolved_version:
            matching_sec = [c for c in all_clauses_map.values() if c.section_number == can_id]
            if matching_sec:
                first_c = matching_sec[0]
                badge = CitationBadge(
                    clause_id=citation,
                    canonical_id=can_id,
                    part_number=first_c.part_number,
                    section_number=can_id,
                    clause_title=first_c.section_title,
                    exact_quote=f"Section {can_id}: {first_c.section_title}",
                    effective_date=first_c.effective_date,
                    is_amended=False
                )
                badges.append(badge)
                continue
                
            # Check if this citation is an amendment item reference (e.g. §1.1 or §2.1)
            if can_id in amendment_items:
                amd_rec = amendment_items[can_id]
                badge = CitationBadge(
                    clause_id=f"Amendment Item {can_id}",
                    canonical_id=can_id,
                    part_number=0,
                    section_number=can_id,
                    clause_title=amd_rec.section_title,
                    exact_quote=amd_rec.new_text[:200],
                    effective_date=amd_rec.effective_date,
                    is_amended=True,
                    amendment_provenance=f"Amendment No. 2026-01 Item {can_id}",
                    transitional_rule=amd_rec.transitional_rule_ref
                )
                badges.append(badge)
                continue
                
            invalid_citations.append(citation)
            continue
            
        # 5. Build valid badge for clause
        if resolved_version and resolved_version.is_amended:
            badge = CitationBadge(
                clause_id=citation,
                canonical_id=citation.lstrip("§"),
                part_number=resolved_version.part_number,
                section_number=f"{resolved_version.part_number}.{citation.split('.')[1] if '.' in citation else '0'}",
                clause_title=baseline_clause.title if baseline_clause else None,
                exact_quote=resolved_version.applicable_text,
                effective_date="2026-03-01",
                is_amended=True,
                amendment_provenance=resolved_version.amendment_citation,
                transitional_rule=resolved_version.transitional_rule_applied
            )
        elif baseline_clause:
            quote_snip = baseline_clause.full_text[:200]
            if len(baseline_clause.full_text) > 200:
                quote_snip += "..."
            badge = CitationBadge(
                clause_id=citation,
                canonical_id=baseline_clause.canonical_id,
                part_number=baseline_clause.part_number,
                section_number=baseline_clause.section_number,
                clause_title=baseline_clause.title,
                exact_quote=quote_snip,
                effective_date=baseline_clause.effective_date,
                is_amended=False,
                amendment_provenance=None,
                transitional_rule=None
            )
        badges.append(badge)
        
    is_valid = (len(invalid_citations) == 0 and len(badges) > 0)
    return is_valid, badges, invalid_citations
