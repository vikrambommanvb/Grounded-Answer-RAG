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
    "HSP-AMD-2026-01": "Amendment No. 2026-01.md"
}

@router.get("", response_model=List[DocumentRecord])
def list_documents() -> List[DocumentRecord]:
    """List all registered immutable policy source documents."""
    return get_all_documents()

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document_content(document_id: str) -> DocumentDetailResponse:
    """Retrieve full verbatim text of an immutable source document."""
    docs = get_all_documents()
    matched_doc = next((d for d in docs if d.document_id == document_id), None)
    
    if not matched_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' is not registered."
        )
        
    filename = ALLOWED_DOC_MAP.get(document_id)
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to this document is restricted."
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
