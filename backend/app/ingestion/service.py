"""Ingestion service coordinating parser, validator, and database storage."""
from pathlib import Path
from typing import Tuple, Dict, Any
from app.core.config import settings
from app.core.logging import logger
from app.database.session import init_db
from app.database.models import save_document, save_clauses, save_amendments
from app.ingestion.parser import parse_policy_manual
from app.ingestion.amendment_parser import parse_amendment
from app.ingestion.validator import validate_corpus
from app.api.schemas.policy import CorpusValidationReport

def run_ingestion(
    manual_path: Path = None,
    amendment_path: Path = None
) -> Tuple[CorpusValidationReport, Dict[str, Any]]:
    """
    Execute complete end-to-end policy corpus ingestion.
    Repeatable, deterministic, and preserves original document provenance.
    """
    if manual_path is None:
        manual_path = Path(settings.POLICY_DOCS_DIR) / "policy-manual.md"
    if amendment_path is None:
        amendment_path = Path(settings.POLICY_DOCS_DIR) / "Amendment No. 2026-01.md"
        
    logger.info(f"Starting ingestion: manual={manual_path}, amendment={amendment_path}")
    
    # 1. Initialize SQLite Database tables
    init_db()
    
    # 2. Parse Baseline Policy Manual
    doc_record, clauses = parse_policy_manual(manual_path)
    logger.info(f"Parsed {len(clauses)} clauses from baseline manual.")
    
    # 3. Parse Amendment No. 2026-01
    amd_doc_record, amendments = parse_amendment(amendment_path)
    logger.info(f"Parsed {len(amendments)} amendment actions from Amendment No. 2026-01.")
    
    # 4. Validate Corpus Integrity & Cross-References
    validation_report = validate_corpus(clauses, amendments)
    logger.info(
        f"Validation: is_valid={validation_report.is_valid}, "
        f"parts={validation_report.total_parts}/12, "
        f"clauses={validation_report.total_clauses}, "
        f"duplicates={len(validation_report.duplicate_clause_ids)}"
    )
    
    if not validation_report.is_valid:
        raise ValueError(f"Corpus validation failed: {validation_report}")
        
    # 5. Persist to SQLite
    save_document(doc_record)
    save_document(amd_doc_record)
    save_clauses(clauses)
    save_amendments(amendments)
    logger.info("Successfully persisted documents, clauses, and amendments to database.")
    
    stats = {
        "manual_clauses_stored": len(clauses),
        "amendment_actions_stored": len(amendments),
        "documents_registered": 2,
        "parts_mapped": validation_report.total_parts,
        "cross_references_extracted": validation_report.total_cross_references
    }
    
    return validation_report, stats

