from sqlalchemy.orm import Session
from models import Assessment
from schemas import AssessmentCreate, AssessmentResponse
from typing import Dict, Any
import json

from services.gemini_service import GeminiService


class AssessmentService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_assessment(self, assessment_data: AssessmentCreate, user_id: int) -> AssessmentResponse:
        # Calculate scores based on assessment type
        scores = self.calculate_scores(
            assessment_data.assessment_type,
            assessment_data.answers,
            assessment_data.questions,
        )
        total_score = sum(scores.values()) / len(scores) if scores else 0
        
        db_assessment = Assessment(
            user_id=user_id,
            assessment_type=assessment_data.assessment_type,
            questions=assessment_data.questions,
            scores=scores,
            total_score=total_score
        )
        
        self.db.add(db_assessment)
        self.db.commit()
        self.db.refresh(db_assessment)
        
        return AssessmentResponse.model_validate(db_assessment)
    
    def get_assessment(self, assessment_id: int, user_id: int) -> AssessmentResponse:
        assessment = self.db.query(Assessment).filter(
            Assessment.id == assessment_id,
            Assessment.user_id == user_id
        ).first()
        
        if not assessment:
            raise ValueError("Assessment not found")
        
        return AssessmentResponse.model_validate(assessment)
    
    def calculate_scores(
        self,
        assessment_type: str,
        answers: Dict[str, Any],
        questions: Dict[str, Any] | list | None = None,
    ) -> Dict[str, float]:
        """Calculate scores based on assessment type and answers"""
        scores = {}
        
        if assessment_type == "aptitude":
            scores = self.calculate_aptitude_scores(answers, questions)
        elif assessment_type == "interest":
            scores = self.calculate_interest_scores(answers)
        elif assessment_type == "personality":
            scores = self.calculate_personality_scores(answers)
        
        return scores
    
    def calculate_aptitude_scores(
        self,
        answers: Dict[str, Any],
        questions: Dict[str, Any] | list | None
    ) -> Dict[str, float]:
        """Calculate aptitude test scores using AI (Gemini).
        Fallback to rule-based scoring if AI fails.
        """
        categories = {
            "logical_reasoning": 0.0,
            "verbal_ability": 0.0,
            "numerical_ability": 0.0,
            "spatial_reasoning": 0.0,
            "analytical_thinking": 0.0,
        }

        if not isinstance(questions, list):
            return categories

        # Build AI prompt
        prompt = (
            "You are an aptitude test evaluator. "
            "Given questions, correct answers, and user answers, "
            "evaluate performance in each category. "
            "Return only a JSON object with category names as keys and scores (0-100) as values.\n\n"
        )

        for q in questions:
            qid = str(q.get("id"))
            cat = q.get("category")
            correct = q.get("correct")
            options = q.get("options", [])
            user_answer = answers.get(qid, None)

            prompt += f"Category: {cat}\n"
            prompt += f"Question: {q.get('question')}\n"
            if correct is not None and correct < len(options):
                prompt += f"Correct Answer: {options[correct]}\n"
            if user_answer is not None and user_answer < len(options):
                prompt += f"User Answer: {options[user_answer]}\n\n"
            else:
                prompt += "User Answer: Not answered\n\n"

        gemini = GeminiService()
        try:
            ai_output = gemini.chat(prompt)
            scores = json.loads(ai_output)
        except Exception as e:
            # Fallback to rule-based calculation
            scores = self._fallback_rule_based(answers, questions)

        # Ensure all categories exist
        for cat in categories.keys():
            scores.setdefault(cat, 0.0)

        return scores
    
    def _fallback_rule_based(
        self,
        answers: Dict[str, Any],
        questions: Dict[str, Any] | list | None
    ) -> Dict[str, float]:
        """Fallback rule-based aptitude scoring if AI fails"""
        categories = {
            "logical_reasoning": 0.0,
            "verbal_ability": 0.0,
            "numerical_ability": 0.0,
            "spatial_reasoning": 0.0,
            "analytical_thinking": 0.0,
        }

        if not isinstance(questions, list):
            return categories

        id_to_q = {str(q.get("id")): q for q in questions}
        total_by_cat: Dict[str, int] = {k: 0 for k in categories.keys()}
        correct_by_cat: Dict[str, int] = {k: 0 for k in categories.keys()}

        for qid, selected in answers.items():
            q = id_to_q.get(str(qid))
            if not q:
                continue
            cat = q.get("category")
            if cat not in categories:
                continue
            total_by_cat[cat] += 1
            try:
                selected_index = int(selected)
            except Exception:
                selected_index = -1
            if selected_index == q.get("correct"):
                correct_by_cat[cat] += 1

        for cat in categories.keys():
            total = total_by_cat[cat]
            correct = correct_by_cat[cat]
            categories[cat] = round((correct / total) * 100.0, 2) if total > 0 else 0.0

        return categories
    
    def calculate_interest_scores(self, answers: Dict[str, Any]) -> Dict[str, float]:
        """Calculate interest assessment scores"""
        interest_categories = {
            "technology": 0,
            "business": 0,
            "healthcare": 0,
            "education": 0,
            "arts": 0,
            "science": 0,
            "engineering": 0,
            "social_work": 0
        }
        
        for question_id, answer in answers.items():
            if isinstance(answer, dict):
                for category, score in answer.items():
                    if category in interest_categories:
                        interest_categories[category] += float(score)
        
        return interest_categories
    
    def calculate_personality_scores(self, answers: Dict[str, Any]) -> Dict[str, float]:
        """Calculate personality test scores (Big Five model)"""
        personality_traits = {
            "openness": 0,
            "conscientiousness": 0,
            "extraversion": 0,
            "agreeableness": 0,
            "neuroticism": 0
        }
        
        for question_id, answer in answers.items():
            if isinstance(answer, dict):
                for trait, score in answer.items():
                    if trait in personality_traits:
                        personality_traits[trait] += float(score)
        
        return personality_traits
