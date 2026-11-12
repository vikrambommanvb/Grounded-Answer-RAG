"""Documents API routes for inspecting source policy documents."""
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.api.schemas.policy import DocumentRecord
from app.database.models import get_all_documents
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

class DocumentDetailResponse(BaseModel):
    document: DocumentRecord
    raw_content: str

ALLOWED_DOC_MAP = {
    "HSP-MANUAL-2025-12": "policy-manual.md",
    "HSP-AMD-2026-01": "Amendment No. 2026-01.md",
    "policy-manual": "policy-manual.md",
    "policy-manual.md": "policy-manual.md",
    "Amendment No. 2026-01": "Amendment No. 2026-01.md",
    "Amendment No. 2026-01.md": "Amendment No. 2026-01.md",
    "amendment": "Amendment No. 2026-01.md",
    "hsp-amd-2026-01": "Amendment No. 2026-01.md",
    "hsp-manual-2025-12": "policy-manual.md",
}

@router.get("", response_model=List[DocumentRecord])
def list_documents() -> List[DocumentRecord]:
    """List all registered immutable policy source documents."""
    return get_all_documents()

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document_content(document_id: str) -> DocumentDetailResponse:
    """Retrieve full verbatim text of an immutable source document."""
    docs = get_all_documents()
    filename = ALLOWED_DOC_MAP.get(document_id) or ALLOWED_DOC_MAP.get(document_id.lower())

    matched_doc = next(
        (d for d in docs if d.document_id == document_id or (filename and d.file_path.endswith(filename))),
        None
    )
    
    if not matched_doc:
        if "manual" in document_id.lower():
            matched_doc = next((d for d in docs if "manual" in d.document_id.lower()), docs[0] if docs else None)
            filename = "policy-manual.md"
        elif "amd" in document_id.lower() or "amendment" in document_id.lower():
            matched_doc = next((d for d in docs if "amd" in d.document_id.lower()), docs[-1] if docs else None)
            filename = "Amendment No. 2026-01.md"

    if not matched_doc or not filename:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' is not registered."
        )
        
    file_path = Path(settings.POLICY_DOCS_DIR) / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document file not found on disk at {file_path}."
        )
        
    content = file_path.read_text(encoding="utf-8")
    return DocumentDetailResponse(
        document=matched_doc,
        raw_content=content
    )
