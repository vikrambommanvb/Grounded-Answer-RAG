"""Chat API route."""
from fastapi import APIRouter, HTTPException, status
from app.api.schemas.chat import QueryRequest, QueryResponse
from app.generation.generator import answer_generator
from app.core.logging import logger

router = APIRouter(prefix="/chat", tags=["Chat & Policy Q&A"])

@router.post("/ask", response_model=QueryResponse, status_code=status.HTTP_200_OK)
def ask_policy_question(request: QueryRequest) -> QueryResponse:
    """
    Submit a policy question for grounded reasoning, temporal resolution,
    and verified citation synthesis.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The question field cannot be empty."
        )
        
    try:
        response = answer_generator.generate_answer(request)
        return response
    except Exception as e:
        logger.error(f"Error answering policy question: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while evaluating policy: {str(e)}"
        )
