from typing import List, Dict
import google.generativeai as genai
import os

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY"))
def get_ai_generated_questions(assessment_type: str) -> List[Dict]:
    """
    Generate dynamic questions from AI based on assessment type.
    """
    prompt = f"""
    Generate 5 multiple-choice {assessment_type} test questions in JSON format.
    Each question should have:
    - id (unique number)
    - question (string)
    - options (list of 4 strings)
    - correct (index of correct option, int)
    - category (string: logical_reasoning, numerical_ability, etc.)
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    try:
        questions = response.text.strip()
        import json
        return json.loads(questions)
    except Exception:
        return []
