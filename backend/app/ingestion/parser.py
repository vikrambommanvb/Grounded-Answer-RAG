"""Policy manual Markdown parser."""
import hashlib
import re
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional
from app.api.schemas.policy import ClauseRecord, DocumentRecord

def compute_hash(text: str) -> str:
    """Compute SHA256 hash of document text."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def extract_modality(text: str) -> List[str]:
    """Detect modal verbs (must, may, should) in clause text."""
    modals = []
    text_lower = text.lower()
    for modal in ["must", "may", "should"]:
        if re.search(rf"\b{modal}\b", text_lower):
            modals.append(modal)
    return modals

def extract_cross_references(text: str) -> List[str]:
    """Extract all explicit section cross-references from clause text."""
    # Matches patterns like §4.3.2, §6.4.1(a), §10.5, etc.
    raw_refs = re.findall(r"§(\d+(?:\.\d+)+(?:[A-Z]|\([a-z0-9]+\))?)", text)
    cleaned = []
    for r in raw_refs:
        norm = f"§{r}"
        if norm not in cleaned:
            cleaned.append(norm)
    return cleaned

def parse_markdown_table(lines: List[str]) -> Optional[List[Dict[str, str]]]:
    """Parse Markdown table lines into a list of row dicts."""
    table_lines = [l.strip() for l in lines if l.strip().startswith("|") and l.strip().endswith("|")]
    if len(table_lines) < 3:
        return None
    
    # Header row
    headers = [col.strip() for col in table_lines[0].split("|")[1:-1]]
    rows = []
    # Skip separator row (table_lines[1])
    for line in table_lines[2:]:
        cols = [col.strip() for col in line.split("|")[1:-1]]
        if len(cols) == len(headers):
            row_dict = {headers[i]: cols[i] for i in range(len(headers))}
            rows.append(row_dict)
    return rows if rows else None

def parse_policy_manual(file_path: Path) -> Tuple[DocumentRecord, List[ClauseRecord]]:
    """
    Parse the consolidated Calder County HSP policy manual.
    Preserves exact clause text, part/section hierarchy, and definitions.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"Policy manual not found at {file_path}")
    
    content = file_path.read_text(encoding="utf-8")
    doc_hash = compute_hash(content)
    lines = content.split("\n")
    
    current_part_num = 0
    current_part_title = "Preamble"
    current_sec_num = "0.0"
    current_sec_title = "Preamble"
    
    raw_clauses = []
    current_clause_data = None
    
    for line in lines:
        stripped = line.strip()
        
        # Match Part header: # Part X — Title or # Part X
        part_match = re.match(r"^# Part (\d+)\s*[—–-]?\s*(.*)$", stripped)
        if part_match:
            current_part_num = int(part_match.group(1))
            current_part_title = part_match.group(2).strip() or f"Part {current_part_num}"
            continue
            
        # Match Section header: ## X.Y Title
        sec_match = re.match(r"^## (\d+\.\d+)\s+(.+)$", stripped)
        if sec_match:
            current_sec_num = sec_match.group(1).strip()
            current_sec_title = sec_match.group(2).strip()
            continue
            
        # Match Clause start: **X.Y.Z** or **X.Y.Z Title** — Text
        clause_match = re.match(r"^\*\*(\d+\.\d+\.\d+[A-Z]?)(?:\s+([^*]+?))?\*\*(?:\s*[—–-]\s*|\s*)(.*)$", stripped)
        if clause_match:
            if current_clause_data:
                raw_clauses.append(current_clause_data)
                
            cid = clause_match.group(1).strip()
            ctitle = clause_match.group(2).strip() if clause_match.group(2) else None
            initial_text = clause_match.group(3).strip()
            
            current_clause_data = {
                "canonical_id": cid,
                "clause_id": f"§{cid}",
                "part_number": current_part_num,
                "part_title": current_part_title,
                "section_number": current_sec_num,
                "section_title": current_sec_title,
                "title": ctitle,
                "initial_text": initial_text,
                "lines": []
            }
        elif current_clause_data:
            # Stop clause accumulation if dividing line or end of text is hit
            if stripped.startswith("---") or stripped.startswith("*End of"):
                raw_clauses.append(current_clause_data)
                current_clause_data = None
            else:
                current_clause_data["lines"].append(line)
                
    if current_clause_data:
        raw_clauses.append(current_clause_data)
        
    clauses: List[ClauseRecord] = []
    for rc in raw_clauses:
        # Reconstruct full verbatim text
        all_lines = []
        if rc["initial_text"]:
            all_lines.append(rc["initial_text"])
        all_lines.extend(rc["lines"])
        full_text = "\n".join(all_lines).strip()
        
        # Check for tables
        parsed_table = parse_markdown_table(all_lines)
        
        # Check definitions
        is_def = (rc["part_number"] == 1 and rc["section_number"] == "1.4")
        
        clause = ClauseRecord(
            clause_id=rc["clause_id"],
            canonical_id=rc["canonical_id"],
            part_number=rc["part_number"],
            part_title=rc["part_title"],
            section_number=rc["section_number"],
            section_title=rc["section_title"],
            title=rc["title"],
            full_text=full_text,
            document_id="HSP-MANUAL-2025-12",
            version="consolidated-2025-12",
            effective_date="2025-12-31",
            cross_references=extract_cross_references(full_text),
            modality=extract_modality(full_text),
            is_definition=is_def,
            table_data=parsed_table
        )
        clauses.append(clause)
        
    doc = DocumentRecord(
        document_id="HSP-MANUAL-2025-12",
        title="Calder County Household Support Program Policy Manual",
        version="consolidated-2025-12",
        issued_date="2025-12-31",
        effective_date="2025-12-31",
        file_path=str(file_path),
        content_hash=doc_hash,
        clause_count=len(clauses)
    )
    
    return doc, clauses

