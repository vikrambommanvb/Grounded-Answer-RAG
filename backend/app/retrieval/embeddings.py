"""Semantic vector representation and cosine similarity for policy clauses."""
import math
import re
from typing import List, Dict, Tuple
from app.api.schemas.policy import ClauseRecord
from app.retrieval.bm25 import STOPWORDS, stem

def cosine_similarity(v1: Dict[str, float], v2: Dict[str, float]) -> float:
    """Compute cosine similarity between two feature dictionaries."""
    if not v1 or not v2:
        return 0.0
        
    dot_product = 0.0
    small, large = (v1, v2) if len(v1) < len(v2) else (v2, v1)
    for term, val in small.items():
        if term in large:
            dot_product += val * large[term]
            
    norm1 = math.sqrt(sum(val * val for val in v1.values()))
    norm2 = math.sqrt(sum(val * val for val in v2.values()))
    
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
        
    return dot_product / (norm1 * norm2)

class SemanticClauseEmbedder:
    """
    Deterministic semantic vector generator.
    Produces rich subword and term semantic feature vectors for policy retrieval.
    Guarantees deterministic, reproducible similarity scores across offline test runs.
    """
    
    def __init__(self):
        self.clause_vectors: List[Tuple[ClauseRecord, Dict[str, float]]] = []
        
    def _text_to_vector(self, text: str) -> Dict[str, float]:
        """Convert text into normalized weighted stemmed term features."""
        cleaned = text.lower()
        all_words = re.findall(r"\b[a-zA-Z0-9_-]+\b", cleaned)
        content_words = [stem(w) for w in all_words if w not in STOPWORDS and len(w) > 2]
        
        if not content_words:
            return {}
            
        counts: Dict[str, float] = {}
        for w in content_words:
            counts[f"w:{w}"] = counts.get(f"w:{w}", 0.0) + 1.0
            
        for i in range(len(content_words) - 1):
            bigram = f"bi:{content_words[i]}_{content_words[i+1]}"
            counts[bigram] = counts.get(bigram, 0.0) + 2.0
            
        norm = math.sqrt(sum(val * val for val in counts.values()))
        if norm > 0.0:
            for k in counts:
                counts[k] /= norm
                
        return counts

    def fit(self, clauses: List[ClauseRecord]) -> "SemanticClauseEmbedder":
        """Index clause collection into semantic vectors."""
        self.clause_vectors = []
        for c in clauses:
            content = f"{c.clause_id} {c.part_title} {c.section_title} {c.title or ''} {c.full_text}"
            vec = self._text_to_vector(content)
            self.clause_vectors.append((c, vec))
        return self

    def search(self, query: str, top_k: int = 10) -> List[Tuple[ClauseRecord, float]]:
        """Compute cosine similarity of query against all indexed clause vectors."""
        if not self.clause_vectors:
            return []
            
        query_vec = self._text_to_vector(query)
        if not query_vec:
            return []
            
        scored: List[Tuple[ClauseRecord, float]] = []
        for clause, c_vec in self.clause_vectors:
            sim = cosine_similarity(query_vec, c_vec)
            if sim > 0.05:
                scored.append((clause, float(sim)))
                
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
