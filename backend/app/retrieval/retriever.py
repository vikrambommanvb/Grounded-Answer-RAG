"""Hybrid Clause-Aware Policy Retriever with full diagnostics."""
import time
from typing import List, Dict, Optional
from app.api.schemas.policy import ClauseRecord
from app.api.schemas.retrieval import RetrievedClause, RetrievalDiagnostics, RetrievalResult
from app.database.models import get_all_clauses
from app.retrieval.bm25 import BM25Index
from app.retrieval.embeddings import SemanticClauseEmbedder
from app.retrieval.expander import expand_cross_references
from app.core.config import settings
from app.core.logging import logger

class ClauseRetriever:
    """
    Clause-Aware Hybrid Retriever combining BM25 lexical precision
    and dense semantic vector matching with cross-reference graph expansion.
    """
    
    def __init__(self, clauses: Optional[List[ClauseRecord]] = None):
        self.clauses: List[ClauseRecord] = clauses or []
        self.clauses_map: Dict[str, ClauseRecord] = {}
        self.bm25 = BM25Index()
        self.embedder = SemanticClauseEmbedder()
        self.is_indexed: bool = False
        
        if self.clauses:
            self.index(self.clauses)
            
    def ensure_indexed(self) -> None:
        """Load from database and index if not already initialized."""
        if not self.is_indexed:
            db_clauses = get_all_clauses()
            if not db_clauses:
                raise ValueError("No clauses found in database. Ingestion must run first.")
            self.index(db_clauses)
            
    def index(self, clauses: List[ClauseRecord]) -> "ClauseRetriever":
        """Index clauses across both lexical and semantic engines."""
        self.clauses = clauses
        self.clauses_map = {c.clause_id: c for c in clauses}
        self.bm25.fit(clauses)
        self.embedder.fit(clauses)
        self.is_indexed = True
        logger.info(f"Retriever successfully indexed {len(clauses)} policy clauses.")
        return self

    def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        mode: str = "hybrid",
        expand_references: bool = True,
        threshold: Optional[float] = None,
        lexical_weight: float = 0.50
    ) -> RetrievalResult:
        """
        Execute clause-level retrieval for a query.
        Preserves Clause ID, exact text, document ID, version, effective date, and scores.
        """
        start_time = time.perf_counter()
        self.ensure_indexed()
        
        k = top_k or settings.RETRIEVAL_TOP_K
        min_threshold = threshold if threshold is not None else settings.SIMILARITY_THRESHOLD
        
        # 1. Lexical retrieval
        lex_results = self.bm25.search(query, top_k=k * 3) if mode in ("lexical", "hybrid") else []
        lex_map = {c.clause_id: score for c, score in lex_results}
        
        # 2. Semantic retrieval
        sem_results = self.embedder.search(query, top_k=k * 3) if mode in ("semantic", "hybrid") else []
        sem_map = {c.clause_id: score for c, score in sem_results}
        
        # 3. Combine scores
        candidate_ids = set(lex_map.keys()) | set(sem_map.keys())
        scored_candidates: List[RetrievedClause] = []
        
        for cid in candidate_ids:
            clause = self.clauses_map[cid]
            l_score = lex_map.get(cid, 0.0)
            s_score = sem_map.get(cid, 0.0)
            
            if mode == "lexical":
                final_score = l_score
            elif mode == "semantic":
                final_score = s_score
            else:  # hybrid
                # Harmonic/balanced blend that rewards either strong exact lexical or high semantic match
                final_score = (lexical_weight * l_score) + ((1.0 - lexical_weight) * s_score)
                # Boost if exact citation match occurs in lexical
                if l_score > 0.70:
                    final_score = max(final_score, l_score * 0.85)
                
            if final_score >= min_threshold:
                retrieved = RetrievedClause(
                    clause_id=clause.clause_id,
                    canonical_id=clause.canonical_id,
                    part_number=clause.part_number,
                    part_title=clause.part_title,
                    section_number=clause.section_number,
                    section_title=clause.section_title,
                    title=clause.title,
                    exact_text=clause.full_text,
                    document_id=clause.document_id,
                    source_version=clause.version,
                    effective_date=clause.effective_date,
                    retrieval_score=round(final_score, 4),
                    lexical_score=round(l_score, 4),
                    semantic_score=round(s_score, 4),
                    source_location=f"Part {clause.part_number}, Section {clause.section_number}",
                    cross_references=clause.cross_references,
                    is_expanded=False
                )
                scored_candidates.append(retrieved)
                
        scored_candidates.sort(key=lambda x: x.retrieval_score, reverse=True)
        primary_results = scored_candidates[:k]
        
        # 4. Cross-reference expansion
        final_results = primary_results
        expanded_count = 0
        if expand_references and primary_results:
            expanded = expand_cross_references(
                primary_clauses=primary_results,
                all_clauses_map=self.clauses_map,
                lex_map=lex_map,
                sem_map=sem_map,
                max_expansions=2
            )
            expanded_count = len(expanded) - len(primary_results)
            final_results = expanded
            
        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        
        diagnostics = RetrievalDiagnostics(
            query=query,
            total_candidates_searched=len(self.clauses),
            lexical_matches=len(lex_results),
            semantic_matches=len(sem_results),
            expanded_clauses=expanded_count,
            execution_time_ms=elapsed_ms,
            mode=mode
        )
        
        return RetrievalResult(clauses=final_results, diagnostics=diagnostics)

# Global singleton instance for app reuse
retriever = ClauseRetriever()
