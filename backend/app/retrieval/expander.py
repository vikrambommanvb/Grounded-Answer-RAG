"""Cross-reference graph expansion for retrieved policy clauses."""
import re
from typing import List, Dict, Set, Optional
from app.api.schemas.policy import ClauseRecord
from app.api.schemas.retrieval import RetrievedClause

def expand_cross_references(
    primary_clauses: List[RetrievedClause],
    all_clauses_map: Dict[str, ClauseRecord],
    lex_map: Optional[Dict[str, float]] = None,
    sem_map: Optional[Dict[str, float]] = None,
    max_expansions: int = 3,
    damping_factor: float = 0.70
) -> List[RetrievedClause]:
    """
    Expand candidate clauses through internal policy cross-references.
    Ensures complete legal context is available for reasoning (e.g. §2.1.2 -> §2.3, §2.4).
    """
    lex_scores = lex_map or {}
    sem_scores = sem_map or {}
    already_included: Set[str] = set(c.clause_id for c in primary_clauses)
    expanded_results: List[RetrievedClause] = list(primary_clauses)
    added_count = 0
    
    for p_clause in primary_clauses:
        if added_count >= max_expansions:
            break
            
        for ref in p_clause.cross_references:
            if added_count >= max_expansions:
                break
                
            base_ref = re.sub(r"\([a-z0-9]+\)", "", ref)
            norm_id = base_ref if base_ref.startswith("§") else f"§{base_ref}"
            
            target_clause = all_clauses_map.get(norm_id)
            if not target_clause:
                for cid, c_cand in all_clauses_map.items():
                    if cid.startswith(norm_id) or f"§{c_cand.section_number}" == norm_id:
                        target_clause = c_cand
                        break
                        
            if target_clause and target_clause.clause_id not in already_included:
                already_included.add(target_clause.clause_id)
                
                # Check if target already had natural retrieval scores
                existing_lex = lex_scores.get(target_clause.clause_id, 0.0)
                existing_sem = sem_scores.get(target_clause.clause_id, 0.0)
                
                if existing_lex > 0 or existing_sem > 0:
                    expanded_score = round(max((existing_lex + existing_sem) / 2.0, p_clause.retrieval_score * damping_factor), 4)
                else:
                    expanded_score = round(p_clause.retrieval_score * damping_factor, 4)
                
                exp_retrieved = RetrievedClause(
                    clause_id=target_clause.clause_id,
                    canonical_id=target_clause.canonical_id,
                    part_number=target_clause.part_number,
                    part_title=target_clause.part_title,
                    section_number=target_clause.section_number,
                    section_title=target_clause.section_title,
                    title=target_clause.title,
                    exact_text=target_clause.full_text,
                    document_id=target_clause.document_id,
                    source_version=target_clause.version,
                    effective_date=target_clause.effective_date,
                    retrieval_score=expanded_score,
                    lexical_score=round(existing_lex, 4),
                    semantic_score=round(existing_sem if existing_sem > 0 else expanded_score, 4),
                    source_location=f"Part {target_clause.part_number}, Section {target_clause.section_number}",
                    cross_references=target_clause.cross_references,
                    is_expanded=True
                )
                expanded_results.append(exp_retrieved)
                added_count += 1
                
    return expanded_results
