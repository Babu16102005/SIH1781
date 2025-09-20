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


    prompt = f"""
    You are a career assessment test generator.
    Generate 5 {assessment_type} test questions in JSON format.
    
    Rules:
    - Each question must have: id, question, options (list of 4 strings), correct (index of correct option, or null if subjective), category.
    - Categories must be meaningful for {assessment_type}.
    - Respond with **only valid JSON** (no explanations).
    """

    response = gemini.chat(prompt)

    try:
        questions = json.loads(response)
    except Exception:
        raise HTTPException(status_code=500, detail="AI failed to return valid questions")

    return {"questions": questions}
