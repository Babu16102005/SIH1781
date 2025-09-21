from fastapi import APIRouter, HTTPException
from services.gemini_service import GeminiService
from services.question_service import get_ai_generated_questions
import json

from pydantic import BaseModel
router = APIRouter()
class QuestionRequest(BaseModel):
    assessment_type: str


@router.post("/assessments/questions")
def get_ai_questions(request: QuestionRequest):
    questions = get_ai_generated_questions(request.assessment_type)
    if not questions:
        raise HTTPException(status_code=500, detail="Failed to load questions. Please try again.")
    return {"questions": questions}
