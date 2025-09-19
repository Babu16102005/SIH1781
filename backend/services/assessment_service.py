from sqlalchemy.orm import Session
from models import Assessment
from schemas import AssessmentCreate, AssessmentResponse
from typing import Dict, Any
import json

class AssessmentService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_assessment(self, assessment_data: AssessmentCreate, user_id: int) -> AssessmentResponse:
        # Calculate scores based on assessment type
        scores = self.calculate_scores(assessment_data.assessment_type, assessment_data.answers)
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
        
        return AssessmentResponse.from_orm(db_assessment)
    
    def get_assessment(self, assessment_id: int, user_id: int) -> AssessmentResponse:
        assessment = self.db.query(Assessment).filter(
            Assessment.id == assessment_id,
            Assessment.user_id == user_id
        ).first()
        
        if not assessment:
            raise ValueError("Assessment not found")
        
        return AssessmentResponse.from_orm(assessment)
    
    def calculate_scores(self, assessment_type: str, answers: Dict[str, Any]) -> Dict[str, float]:
        """Calculate scores based on assessment type and answers"""
        scores = {}
        
        if assessment_type == "aptitude":
            scores = self.calculate_aptitude_scores(answers)
        elif assessment_type == "interest":
            scores = self.calculate_interest_scores(answers)
        elif assessment_type == "personality":
            scores = self.calculate_personality_scores(answers)
        
        return scores
    
    def calculate_aptitude_scores(self, answers: Dict[str, Any]) -> Dict[str, float]:
        """Calculate aptitude test scores"""
        categories = {
            "logical_reasoning": 0,
            "verbal_ability": 0,
            "numerical_ability": 0,
            "spatial_reasoning": 0,
            "analytical_thinking": 0
        }
        
        # Sample scoring logic - replace with actual aptitude test scoring
        for question_id, answer in answers.items():
            if "logical" in question_id.lower():
                categories["logical_reasoning"] += float(answer) if isinstance(answer, (int, float)) else 0
            elif "verbal" in question_id.lower():
                categories["verbal_ability"] += float(answer) if isinstance(answer, (int, float)) else 0
            elif "numerical" in question_id.lower():
                categories["numerical_ability"] += float(answer) if isinstance(answer, (int, float)) else 0
            elif "spatial" in question_id.lower():
                categories["spatial_reasoning"] += float(answer) if isinstance(answer, (int, float)) else 0
            elif "analytical" in question_id.lower():
                categories["analytical_thinking"] += float(answer) if isinstance(answer, (int, float)) else 0
        
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
        
        # Sample scoring logic
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
        
        # Sample scoring logic
        for question_id, answer in answers.items():
            if isinstance(answer, dict):
                for trait, score in answer.items():
                    if trait in personality_traits:
                        personality_traits[trait] += float(score)
        
        return personality_traits
