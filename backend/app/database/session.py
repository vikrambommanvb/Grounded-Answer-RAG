"""SQLite database session management."""
import sqlite3
import os
from pathlib import Path
from typing import Generator
from app.core.config import settings
from app.core.logging import logger

def get_db_path() -> Path:
    """Extract filesystem path from sqlite DATABASE_URL."""
    url = settings.DATABASE_URL
    if url.startswith("sqlite:///"):
        path_str = url.replace("sqlite:///", "")
    else:
        path_str = url
    db_path = Path(path_str).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return db_path

def get_connection() -> sqlite3.Connection:
    """Create a SQLite connection with row factory enabled."""
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initialize database tables for documents, clauses, and amendments."""
    db_path = get_db_path()
    logger.info(f"Initializing SQLite database at: {db_path}")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Documents metadata table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        document_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        version TEXT NOT NULL,
        issued_date TEXT,
        effective_date TEXT NOT NULL,
        file_path TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        clause_count INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Policy clauses table (baseline 2025 corpus)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clauses (
        clause_id TEXT PRIMARY KEY,
        canonical_id TEXT NOT NULL,
        part_number INTEGER NOT NULL,
        part_title TEXT NOT NULL,
        section_number TEXT NOT NULL,
        section_title TEXT NOT NULL,
        title TEXT,
        full_text TEXT NOT NULL,
        document_id TEXT NOT NULL,
        version TEXT NOT NULL,
        effective_date TEXT NOT NULL,
        cross_references TEXT NOT NULL,  -- JSON list
        modality TEXT NOT NULL,          -- JSON list
        is_definition INTEGER NOT NULL DEFAULT 0,
        table_data TEXT,                 -- JSON list/dict
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(document_id)
    );
    """)
    
    # Amendments table (Amendment 2026-01 overlay actions)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS amendments (
        item_id TEXT PRIMARY KEY,
        amendment_id TEXT NOT NULL,
        item_number TEXT NOT NULL,
        section_title TEXT NOT NULL,
        target_clause_id TEXT,
        action_type TEXT NOT NULL,
        old_text TEXT,
        new_text TEXT NOT NULL,
        issued_date TEXT NOT NULL,
        effective_date TEXT NOT NULL,
        transitional_rule_ref TEXT,
        staff_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully.")
