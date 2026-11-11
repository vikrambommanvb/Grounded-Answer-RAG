#!/usr/bin/env python3
"""CLI script to ingest Calder County HSP Policy Manual and Amendment No. 2026-01."""
import sys
import os
from pathlib import Path

# Ensure backend package is in python path
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root / "backend"))

from app.ingestion.service import run_ingestion
from app.database.models import get_all_clauses, get_all_amendments, get_all_documents

def main():
    print("=" * 70)
    print("THE GROUNDED ANSWER — POLICY CORPUS INGESTION PIPELINE")
    print("=" * 70)
    
    manual_path = repo_root / "docs" / "policy" / "policy-manual.md"
    amd_path = repo_root / "docs" / "policy" / "Amendment No. 2026-01.md"
    
    print(f"[*] Ingesting Policy Manual: {manual_path}")
    print(f"[*] Ingesting Amendment Overlay: {amd_path}")
    
    try:
        report, stats = run_ingestion(manual_path, amd_path)
    except Exception as e:
        print(f"\n[!] INGESTION FAILED: {e}")
        sys.exit(1)
        
    print("\n" + "-" * 70)
    print("INGESTION & VALIDATION SUMMARY")
    print("-" * 70)
    print(f"Status:                      {'VALIDATED' if report.is_valid else 'FAILED'}")
    print(f"Total Policy Parts Ingested: {report.total_parts} (Parts: {report.parts_found})")
    print(f"Total Baseline Clauses:      {stats['manual_clauses_stored']}")
    print(f"Total Amendment Actions:     {stats['amendment_actions_stored']}")
    print(f"Cross-References Traced:     {report.total_cross_references}")
    print(f"Duplicate Identifiers:       {len(report.duplicate_clause_ids)}")
    print(f"Missing Expected Clauses:    {len(report.missing_expected_clauses)}")
    print(f"Database Target:             data/sqlite.db")
    print("-" * 70)
    
    # Query database to confirm persistence
    db_clauses = get_all_clauses()
    db_amendments = get_all_amendments()
    db_docs = get_all_documents()
    
    print(f"[✓] Verification: SQLite contains {len(db_docs)} documents, {len(db_clauses)} clauses, {len(db_amendments)} amendments.")
    print("=" * 70)
    print("Corpus ingestion complete and ready for retrieval.\n")

if __name__ == "__main__":
    main()

