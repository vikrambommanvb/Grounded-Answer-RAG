"""Corpus validation and integrity checker."""
import re
from typing import List, Dict, Any, Set
from app.api.schemas.policy import ClauseRecord, AmendmentRecord, CorpusValidationReport

def validate_corpus(
    clauses: List[ClauseRecord],
    amendments: List[AmendmentRecord]
) -> CorpusValidationReport:
    """
    Validate the ingested policy manual and amendment corpus.
    Verifies completeness, absence of duplicates, and valid provenance.
    """
    seen_ids: Set[str] = set()
    duplicate_ids: List[str] = []
    
    for c in clauses:
        if c.clause_id in seen_ids:
            duplicate_ids.append(c.clause_id)
        seen_ids.add(c.clause_id)
        
    parts_found = sorted(list(set(c.part_number for c in clauses)))
    
    # Expected key clauses across all 12 parts
    expected_clauses = [
        "§1.1.1", "§1.4.1", "§1.4.6", "§2.1.2", "§2.3.1", "§2.4.1",
        "§3.1.1", "§3.2.1", "§4.1.1", "§4.3.2", "§5.1.1", "§5.4.1",
        "§6.4.1", "§6.6.1", "§7.1.1", "§7.1.3", "§7.4.3", "§8.1.1",
        "§9.1.4", "§9.6.1", "§10.1.1", "§10.5.2", "§11.1.1", "§12.1.1"
    ]
    missing_expected = [ec for ec in expected_clauses if not any(c.clause_id.startswith(ec) for c in clauses)]
    
    # Validate cross-references
    defined_sections = set(f"§{c.section_number}" for c in clauses)
    broken_refs: List[Dict[str, Any]] = []
    total_refs = 0
    
    for c in clauses:
        for ref in c.cross_references:
            total_refs += 1
            # Check if reference is to an exact clause (e.g. §4.3.2) or section (e.g. §4.3)
            exact_match = any(c_inner.clause_id.startswith(ref) for c_inner in clauses)
            section_match = (ref in defined_sections)
            
            if not exact_match and not section_match:
                # Normalize e.g. §6.4.1(a) -> §6.4.1
                base_ref = re.sub(r"\([a-z0-9]+\)", "", ref)
                base_match = any(c_inner.clause_id.startswith(base_ref) for c_inner in clauses)
                if not base_match:
                    broken_refs.append({
                        "source_clause": c.clause_id,
                        "referenced": ref,
                        "issue": "Target clause or section not defined in manual"
                    })
                    
    # Validate amendment targets
    for a in amendments:
        if a.target_clause_id:
            # For insert, target must not already exist in baseline
            if a.action_type == "insert":
                if any(c.clause_id == a.target_clause_id for c in clauses):
                    broken_refs.append({
                        "source_clause": a.item_id,
                        "referenced": a.target_clause_id,
                        "issue": "Inserted amendment clause already exists in baseline"
                    })
            else:
                # For substitute, target must exist
                base_target = re.sub(r"\([a-z0-9]+\)", "", a.target_clause_id)
                if not any(c.clause_id.startswith(base_target) for c in clauses):
                    broken_refs.append({
                        "source_clause": a.item_id,
                        "referenced": a.target_clause_id,
                        "issue": "Amendment target clause not found in baseline manual"
                    })
                    
    is_valid = (
        len(parts_found) == 12
        and len(duplicate_ids) == 0
        and len(missing_expected) == 0
    )
    
    return CorpusValidationReport(
        total_clauses=len(clauses),
        total_parts=len(parts_found),
        parts_found=parts_found,
        total_cross_references=total_refs,
        duplicate_clause_ids=duplicate_ids,
        missing_expected_clauses=missing_expected,
        broken_cross_references=broken_refs,
        amendment_items_count=len(amendments),
        is_valid=is_valid
    )
