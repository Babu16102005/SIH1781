from sqlalchemy.orm import Session
from models import CareerRecommendation, User, Assessment, SkillEvaluation
from schemas import CareerRecommendationResponse
from services.gemini_service import GeminiService
from typing import List, Dict, Any
import json

class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.gemini_service = GeminiService()
    
    def generate_recommendations(self, user_id: int) -> CareerRecommendationResponse:
        # Get user profile
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Get latest assessments
        latest_assessment = self.db.query(Assessment).filter(
            Assessment.user_id == user_id
        ).order_by(Assessment.completed_at.desc()).first()
        
        # Get latest skill evaluation
        latest_skill_eval = self.db.query(SkillEvaluation).filter(
            SkillEvaluation.user_id == user_id
        ).order_by(SkillEvaluation.evaluated_at.desc()).first()
        
        # Prepare data for AI analysis
        user_profile = {
            "age_range": user.age_range,
            "current_job_role": user.current_job_role,
            "industry": user.industry,
            "educational_background": user.educational_background,
            "years_of_experience": user.years_of_experience
        }
        
        aptitude_scores = latest_assessment.scores if latest_assessment else {}
        interest_scores = {}  # This would come from interest assessment
        
        skill_evaluation = {
            "technical_skills": latest_skill_eval.technical_skills if latest_skill_eval else {},
            "soft_skills": latest_skill_eval.soft_skills if latest_skill_eval else {},
            "industry_skills": latest_skill_eval.industry_skills if latest_skill_eval else {}
        }
        
        # Generate recommendations using Gemini AI
        ai_recommendations = self.gemini_service.generate_career_recommendations(
            user_profile, aptitude_scores, interest_scores, skill_evaluation
        )
        
        # Calculate weighted scores
        skill_match_score = 0.6  # 60% weight
        interest_alignment_score = 0.4  # 40% weight
        overall_score = (skill_match_score * 0.6) + (interest_alignment_score * 0.4)
        
        # Create database record
        db_recommendation = CareerRecommendation(
            user_id=user_id,
            recommended_careers=ai_recommendations.get("recommended_careers", []),
            skill_match_score=skill_match_score,
            interest_alignment_score=interest_alignment_score,
            overall_recommendation_score=overall_score,
            career_progression_path=ai_recommendations.get("career_progression_path", {}),
            skill_development_plan=ai_recommendations.get("skill_development_plan", {}),
            market_trend_analysis=ai_recommendations.get("market_trend_analysis", {}),
            rationale=ai_recommendations.get("rationale", "")
        )
        
        self.db.add(db_recommendation)
        self.db.commit()
        self.db.refresh(db_recommendation)
        
        return CareerRecommendationResponse.model_validate(db_recommendation)
    
    def get_user_recommendations(self, user_id: int) -> List[CareerRecommendationResponse]:
        """Get all recommendations for a user"""
        recommendations = self.db.query(CareerRecommendation).filter(
            CareerRecommendation.user_id == user_id
        ).order_by(CareerRecommendation.generated_at.desc()).all()
        
        return [CareerRecommendationResponse.model_validate(rec) for rec in recommendations]
    
    def calculate_career_match_score(
        self, 
        user_skills: Dict[str, Any], 
        career_requirements: Dict[str, Any]
    ) -> float:
        """Calculate how well user skills match career requirements"""
        if not user_skills or not career_requirements:
            return 0.0
        
        total_match = 0
        total_requirements = 0
        
        for skill, required_level in career_requirements.items():
            if skill in user_skills:
                user_level = user_skills[skill]
                if isinstance(user_level, (int, float)) and isinstance(required_level, (int, float)):
                    match_ratio = min(user_level / required_level, 1.0)
                    total_match += match_ratio
                total_requirements += 1
        
        return total_match / total_requirements if total_requirements > 0 else 0.0
