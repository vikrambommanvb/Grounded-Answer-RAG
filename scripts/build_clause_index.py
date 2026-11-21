#!/usr/bin/env python3
"""
Build-time script to pre-ingest and pre-index the entire policy corpus into static JSON.
Eliminates all runtime database dependency, cold-start re-ingestion, and in-memory fitting.
"""
import json
import os
import sys
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root / "backend"))

from app.ingestion.parser import parse_policy_manual
from app.ingestion.amendment_parser import parse_amendment
from app.ingestion.validator import validate_corpus
from app.retrieval.bm25 import BM25Index
from app.retrieval.embeddings import SemanticClauseEmbedder
from app.database.session import init_db
from app.database.models import save_document, save_clauses, save_amendments

def build_index():
    print("[*] Building static clause index from official policy documents...")
    manual_path = repo_root / "docs" / "policy" / "policy-manual.md"
    amd_path = repo_root / "docs" / "policy" / "Amendment No. 2026-01.md"
    
    # 1. Parse baseline manual and amendment
    doc_record, clauses = parse_policy_manual(manual_path)
    amd_doc_record, amendments = parse_amendment(amd_path)
    
    # 2. Validate corpus
    report = validate_corpus(clauses, amendments)
    if not report.is_valid:
        raise ValueError(f"Corpus validation failed: {report}")
    print(f"[✓] Corpus validated: {len(clauses)} clauses, {len(amendments)} amendments across 12 parts.")
    
    # 3. Fit BM25 and Semantic Embedder
    bm25 = BM25Index()
    bm25.fit(clauses)
    
    embedder = SemanticClauseEmbedder()
    embedder.fit(clauses)
    
    # 4. Extract parts structure
    parts_map = {}
    for c in clauses:
        pnum = c.part_number
        if pnum not in parts_map:
            parts_map[pnum] = {
                "part_number": pnum,
                "title": c.part_title,
                "sections": set(),
                "clause_count": 0
            }
        parts_map[pnum]["sections"].add(c.section_number)
        parts_map[pnum]["clause_count"] += 1
        
    parts_list = []
    for pnum in sorted(parts_map.keys()):
        pinfo = parts_map[pnum]
        parts_list.append({
            "part_number": pnum,
            "title": pinfo["title"],
            "section_count": len(pinfo["sections"]),
            "clause_count": pinfo["clause_count"]
        })
        
    # 5. Extract BM25 serializable data
    bm25_data = {
        "k1": bm25.k1,
        "b": bm25.b,
        "avgdl": bm25.avgdl,
        "n_docs": bm25.n_docs,
        "doc_lens": bm25.doc_lens,
        "doc_tokens": bm25.doc_tokens,
        "doc_freqs": dict(bm25.doc_freqs),
        "idf": bm25.idf
    }
    
    # 6. Extract Semantic embeddings serializable data
    embeddings_data = {
        c.clause_id: vec for c, vec in embedder.clause_vectors
    }
    
    # 7. Build bundle
    bundle = {
        "metadata": {
            "version": "1.0.0",
            "built_at": "2026-11-21T00:00:00Z",
            "total_clauses": len(clauses),
            "total_amendments": len(amendments),
            "total_parts": 12,
            "total_sections": 54,
            "baseline_effective_date": "2025-12-31",
            "amendment_number": "Amendment No. 2026-01",
            "amendment_effective_date": "2026-03-01",
        },
        "documents": [
            doc_record.model_dump(),
            amd_doc_record.model_dump()
        ],
        "parts": parts_list,
        "clauses": [c.model_dump() for c in clauses],
        "amendments": [a.model_dump() for a in amendments],
        "bm25": bm25_data,
        "embeddings": embeddings_data
    }
    
    # 8. Save to data/clause_index.json
    out_dir = repo_root / "data"
    out_dir.mkdir(exist_ok=True)
    out_file = out_dir / "clause_index.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(bundle, f, indent=2)
    print(f"[✓] Saved static clause index to {out_file} ({out_file.stat().st_size} bytes)")
    
    # 9. Also save to frontend public/data/
    frontend_data_dir = repo_root / "frontend" / "public" / "data"
    frontend_data_dir.mkdir(parents=True, exist_ok=True)
    frontend_out_file = frontend_data_dir / "clause_index.json"
    with open(frontend_out_file, "w", encoding="utf-8") as f:
        json.dump(bundle, f, indent=2)
    print(f"[✓] Saved static bundle to frontend: {frontend_out_file}")
    
    # 10. Also initialize local SQLite for backward compatibility
    try:
        init_db()
        save_document(doc_record)
        save_document(amd_doc_record)
        save_clauses(clauses)
        save_amendments(amendments)
        print("[✓] Synchronized SQLite database data/sqlite.db")
    except Exception as e:
        print(f"[!] Warning syncing sqlite: {e}")

if __name__ == "__main__":
    build_index()
