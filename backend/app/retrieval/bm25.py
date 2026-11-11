"""BM25 lexical retrieval engine with exact clause citation boosting and stemming."""
import math
import re
from typing import List, Dict, Tuple, Set
from collections import Counter
from app.api.schemas.policy import ClauseRecord

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
    "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me",
    "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only",
    "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
    "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
    "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until",
    "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
    "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}

def stem(w: str) -> str:
    """Lightweight suffix stemmer for English policy terms."""
    w = w.lower()
    for suffix in ["ing", "tion", "ment", "ed", "es", "ly", "able", "ible", "s"]:
        if w.endswith(suffix) and len(w) - len(suffix) >= 3:
            w = w[:-len(suffix)]
            break
    if w.endswith("e") and len(w) >= 4:
        w = w[:-1]
    return w

def tokenize(text: str, remove_stopwords: bool = False, use_stemming: bool = True) -> List[str]:
    """Tokenize text preserving clause numbers, currency, and stemmed keywords."""
    raw_tokens = re.findall(r"§?\d+(?:\.\d+)+(?:[A-Z]|\([a-z0-9]+\))?|\$\d+(?:,\d+)?|\b[a-zA-Z0-9_-]+\b", text.lower())
    result = []
    for t in raw_tokens:
        if remove_stopwords and t in STOPWORDS:
            continue
        if use_stemming and not t.startswith("§") and not re.match(r"^\$?\d", t):
            result.append(stem(t))
        else:
            result.append(t)
    return result

class BM25Index:
    """Okapi BM25 implementation with calibrated non-saturating scoring."""
    
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.clauses: List[ClauseRecord] = []
        self.doc_tokens: List[List[str]] = []
        self.doc_lens: List[int] = []
        self.avgdl: float = 0.0
        self.doc_freqs: Dict[str, int] = Counter()
        self.idf: Dict[str, float] = {}
        self.n_docs: int = 0
        
    def fit(self, clauses: List[ClauseRecord]) -> "BM25Index":
        """Index a collection of policy clauses."""
        self.clauses = clauses
        self.n_docs = len(clauses)
        self.doc_tokens = []
        self.doc_lens = []
        self.doc_freqs = Counter()
        
        for c in clauses:
            searchable_text = f"{c.clause_id} {c.canonical_id} {c.part_title} {c.section_title} {c.title or ''} {c.full_text} {' '.join(c.cross_references)}"
            tokens = tokenize(searchable_text, remove_stopwords=False, use_stemming=True)
            self.doc_tokens.append(tokens)
            self.doc_lens.append(len(tokens))
            
            unique_terms: Set[str] = set(tokens)
            for t in unique_terms:
                self.doc_freqs[t] += 1
                
        self.avgdl = sum(self.doc_lens) / self.n_docs if self.n_docs > 0 else 0.0
        
        self.idf = {}
        for term, freq in self.doc_freqs.items():
            self.idf[term] = math.log(1.0 + (self.n_docs - freq + 0.5) / (freq + 0.5))
            
        return self
        
    def search(self, query: str, top_k: int = 10) -> List[Tuple[ClauseRecord, float]]:
        """Score all clauses against query tokens using BM25 with exact-citation boosting."""
        if not self.clauses:
            return []
            
        query_tokens = tokenize(query, remove_stopwords=True, use_stemming=True)
        if not query_tokens:
            return []
            
        # Detect exact clause IDs cited in query
        exact_clause_refs = re.findall(r"§?(\d+(?:\.\d+)+(?:[A-Z]|\([a-z0-9]+\))?)", query)
        exact_refs_set = set(exact_clause_refs)
        
        raw_scores: List[float] = [0.0] * self.n_docs
        
        for q_term in query_tokens:
            if q_term not in self.idf:
                continue
            term_idf = self.idf[q_term]
            
            for idx, doc_toks in enumerate(self.doc_tokens):
                tf = doc_toks.count(q_term)
                if tf == 0:
                    continue
                doc_len = self.doc_lens[idx]
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avgdl))
                raw_scores[idx] += term_idf * (numerator / denominator)
                
        for idx, clause in enumerate(self.clauses):
            if clause.canonical_id in exact_refs_set or clause.clause_id.lstrip("§") in exact_refs_set:
                raw_scores[idx] += 40.0  # Dominant boost for exact section citation
                
        scored_results: List[Tuple[ClauseRecord, float]] = []
        for idx, s in enumerate(raw_scores):
            if s > 0.1:
                norm_score = round(s / (s + 10.0), 4)
                scored_results.append((self.clauses[idx], norm_score))
                
        scored_results.sort(key=lambda x: x[1], reverse=True)
        return scored_results[:top_k]
