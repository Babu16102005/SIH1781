from sqlalchemy.orm import Session
from models import SkillEvaluation
from schemas import SkillEvaluationCreate, SkillEvaluationResponse
from typing import Dict, Any
import json

class SkillEvaluationService:
    def __init__(self, db: Session):
        self.db = db
    
    def evaluate_skills(self, skill_data: SkillEvaluationCreate, user_id: int) -> SkillEvaluationResponse:
        # Analyze skill gaps
        skill_gaps = self.analyze_skill_gaps(skill_data)
        
        # Calculate overall score
        overall_score = self.calculate_overall_score(skill_data)
        
        db_evaluation = SkillEvaluation(
            user_id=user_id,
            technical_skills=skill_data.technical_skills,
            soft_skills=skill_data.soft_skills,
            industry_skills=skill_data.industry_skills,
            skill_gaps=skill_gaps,
            overall_score=overall_score
        )
        
        self.db.add(db_evaluation)
        self.db.commit()
        self.db.refresh(db_evaluation)
        
        return SkillEvaluationResponse.from_orm(db_evaluation)
    
    def analyze_skill_gaps(self, skill_data: SkillEvaluationCreate) -> Dict[str, Any]:
        """Analyze skill gaps based on current skills"""
        gaps = {
            "technical_gaps": [],
            "soft_skill_gaps": [],
            "industry_gaps": [],
            "priority_skills": [],
            "development_areas": []
        }
        
        # Analyze technical skills
        technical_skills = skill_data.technical_skills
        if isinstance(technical_skills, dict):
            for skill, level in technical_skills.items():
                if isinstance(level, (int, float)) and level < 3:  # Assuming 1-5 scale
                    gaps["technical_gaps"].append({
                        "skill": skill,
                        "current_level": level,
                        "target_level": 4,
                        "gap": 4 - level
                    })
        
        # Analyze soft skills
        soft_skills = skill_data.soft_skills
        if isinstance(soft_skills, dict):
            for skill, level in soft_skills.items():
                if isinstance(level, (int, float)) and level < 3:
                    gaps["soft_skill_gaps"].append({
                        "skill": skill,
                        "current_level": level,
                        "target_level": 4,
                        "gap": 4 - level
                    })
        
        # Analyze industry skills
        industry_skills = skill_data.industry_skills
        if isinstance(industry_skills, dict):
            for skill, level in industry_skills.items():
                if isinstance(level, (int, float)) and level < 3:
                    gaps["industry_gaps"].append({
                        "skill": skill,
                        "current_level": level,
                        "target_level": 4,
                        "gap": 4 - level
                    })
        
        # Prioritize skills based on gap size
        all_gaps = []
        all_gaps.extend(gaps["technical_gaps"])
        all_gaps.extend(gaps["soft_skill_gaps"])
        all_gaps.extend(gaps["industry_gaps"])
        
        # Sort by gap size (largest gaps first)
        all_gaps.sort(key=lambda x: x["gap"], reverse=True)
        gaps["priority_skills"] = all_gaps[:5]  # Top 5 priority skills
        
        return gaps
    
    def calculate_overall_score(self, skill_data: SkillEvaluationCreate) -> float:
        """Calculate overall skill score"""
        total_score = 0
        total_skills = 0
        
        # Calculate technical skills score
        if isinstance(skill_data.technical_skills, dict):
            tech_scores = [v for v in skill_data.technical_skills.values() if isinstance(v, (int, float))]
            if tech_scores:
                total_score += sum(tech_scores)
                total_skills += len(tech_scores)
        
        # Calculate soft skills score
        if isinstance(skill_data.soft_skills, dict):
            soft_scores = [v for v in skill_data.soft_skills.values() if isinstance(v, (int, float))]
            if soft_scores:
                total_score += sum(soft_scores)
                total_skills += len(soft_scores)
        
        # Calculate industry skills score
        if isinstance(skill_data.industry_skills, dict):
            industry_scores = [v for v in skill_data.industry_skills.values() if isinstance(v, (int, float))]
            if industry_scores:
                total_score += sum(industry_scores)
                total_skills += len(industry_scores)
        
        return total_score / total_skills if total_skills > 0 else 0
