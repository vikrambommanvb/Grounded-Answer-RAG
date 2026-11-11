"""Database repository and data access methods."""
import json
import sqlite3
from typing import List, Optional, Dict, Any
from app.database.session import get_connection
from app.api.schemas.policy import ClauseRecord, AmendmentRecord, DocumentRecord

def save_document(doc: DocumentRecord) -> None:
    """Save or update a document metadata record."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO documents (document_id, title, version, issued_date, effective_date, file_path, content_hash, clause_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(document_id) DO UPDATE SET
        title=excluded.title,
        version=excluded.version,
        issued_date=excluded.issued_date,
        effective_date=excluded.effective_date,
        file_path=excluded.file_path,
        content_hash=excluded.content_hash,
        clause_count=excluded.clause_count;
    """, (
        doc.document_id, doc.title, doc.version, doc.issued_date,
        doc.effective_date, doc.file_path, doc.content_hash, doc.clause_count
    ))
    conn.commit()
    conn.close()

def save_clauses(clauses: List[ClauseRecord]) -> None:
    """Batch insert or replace clauses."""
    conn = get_connection()
    cursor = conn.cursor()
    for c in clauses:
        cursor.execute("""
        INSERT INTO clauses (
            clause_id, canonical_id, part_number, part_title,
            section_number, section_title, title, full_text,
            document_id, version, effective_date, cross_references,
            modality, is_definition, table_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(clause_id) DO UPDATE SET
            canonical_id=excluded.canonical_id,
            part_number=excluded.part_number,
            part_title=excluded.part_title,
            section_number=excluded.section_number,
            section_title=excluded.section_title,
            title=excluded.title,
            full_text=excluded.full_text,
            document_id=excluded.document_id,
            version=excluded.version,
            effective_date=excluded.effective_date,
            cross_references=excluded.cross_references,
            modality=excluded.modality,
            is_definition=excluded.is_definition,
            table_data=excluded.table_data;
        """, (
            c.clause_id, c.canonical_id, c.part_number, c.part_title,
            c.section_number, c.section_title, c.title, c.full_text,
            c.document_id, c.version, c.effective_date,
            json.dumps(c.cross_references), json.dumps(c.modality),
            1 if c.is_definition else 0,
            json.dumps(c.table_data) if c.table_data else None
        ))
    conn.commit()
    conn.close()

def save_amendments(amendments: List[AmendmentRecord]) -> None:
    """Batch insert or replace amendment records."""
    conn = get_connection()
    cursor = conn.cursor()
    for a in amendments:
        cursor.execute("""
        INSERT INTO amendments (
            item_id, amendment_id, item_number, section_title,
            target_clause_id, action_type, old_text, new_text,
            issued_date, effective_date, transitional_rule_ref, staff_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(item_id) DO UPDATE SET
            amendment_id=excluded.amendment_id,
            item_number=excluded.item_number,
            section_title=excluded.section_title,
            target_clause_id=excluded.target_clause_id,
            action_type=excluded.action_type,
            old_text=excluded.old_text,
            new_text=excluded.new_text,
            issued_date=excluded.issued_date,
            effective_date=excluded.effective_date,
            transitional_rule_ref=excluded.transitional_rule_ref,
            staff_note=excluded.staff_note;
        """, (
            a.item_id, a.amendment_id, a.item_number, a.section_title,
            a.target_clause_id, a.action_type.value, a.old_text, a.new_text,
            a.issued_date, a.effective_date, a.transitional_rule_ref, a.staff_note
        ))
    conn.commit()
    conn.close()

def get_clause_by_id(clause_id: str) -> Optional[ClauseRecord]:
    """Retrieve a single clause by ID (e.g. §4.3.2 or 4.3.2)."""
    norm_id = clause_id if clause_id.startswith("§") else f"§{clause_id}"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clauses WHERE clause_id = ?", (norm_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return _row_to_clause(row)

def get_all_clauses() -> List[ClauseRecord]:
    """Retrieve all clauses sorted by part and canonical ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clauses ORDER BY part_number, canonical_id")
    rows = cursor.fetchall()
    conn.close()
    return [_row_to_clause(r) for r in rows]

def get_all_amendments() -> List[AmendmentRecord]:
    """Retrieve all amendment items."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM amendments ORDER BY item_number")
    rows = cursor.fetchall()
    conn.close()
    return [_row_to_amendment(r) for r in rows]

def get_all_documents() -> List[DocumentRecord]:
    """Retrieve all registered documents."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents")
    rows = cursor.fetchall()
    conn.close()
    return [
        DocumentRecord(
            document_id=r["document_id"],
            title=r["title"],
            version=r["version"],
            issued_date=r["issued_date"],
            effective_date=r["effective_date"],
            file_path=r["file_path"],
            content_hash=r["content_hash"],
            clause_count=r["clause_count"]
        )
        for r in rows
    ]

def _row_to_clause(r: sqlite3.Row) -> ClauseRecord:
    return ClauseRecord(
        clause_id=r["clause_id"],
        canonical_id=r["canonical_id"],
        part_number=r["part_number"],
        part_title=r["part_title"],
        section_number=r["section_number"],
        section_title=r["section_title"],
        title=r["title"],
        full_text=r["full_text"],
        document_id=r["document_id"],
        version=r["version"],
        effective_date=r["effective_date"],
        cross_references=json.loads(r["cross_references"]),
        modality=json.loads(r["modality"]),
        is_definition=bool(r["is_definition"]),
        table_data=json.loads(r["table_data"]) if r["table_data"] else None
    )

def _row_to_amendment(r: sqlite3.Row) -> AmendmentRecord:
    return AmendmentRecord(
        item_id=r["item_id"],
        amendment_id=r["amendment_id"],
        item_number=r["item_number"],
        section_title=r["section_title"],
        target_clause_id=r["target_clause_id"],
        action_type=r["action_type"],
        old_text=r["old_text"],
        new_text=r["new_text"],
        issued_date=r["issued_date"],
        effective_date=r["effective_date"],
        transitional_rule_ref=r["transitional_rule_ref"],
        staff_note=r["staff_note"]
    )
