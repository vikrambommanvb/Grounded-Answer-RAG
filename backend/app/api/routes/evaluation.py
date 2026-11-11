"""Evaluation API routes for benchmark metrics and test suite execution."""
from typing import Optional
from fastapi import APIRouter, Query, status
from pydantic import BaseModel
from app.evaluation.runner import run_evaluation_suite, EvaluationRunSummary
from app.database.session import get_connection

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

class EvaluationRunRequest(BaseModel):
    provider: Optional[str] = "mock"

@router.get("/summary", response_model=EvaluationRunSummary)
def get_evaluation_summary() -> EvaluationRunSummary:
    """Retrieve the latest benchmark evaluation results."""
    # Run evaluation suite to generate real verified baseline
    summary = run_evaluation_suite(provider="mock")
    return summary

@router.post("/run", response_model=EvaluationRunSummary, status_code=status.HTTP_200_OK)
def trigger_evaluation_run(request: Optional[EvaluationRunRequest] = None) -> EvaluationRunSummary:
    """Execute the full 10-Question benchmark evaluation suite."""
    provider = request.provider if request and request.provider else "mock"
    summary = run_evaluation_suite(provider=provider)
    return summary
