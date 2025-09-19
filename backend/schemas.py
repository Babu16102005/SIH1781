from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    age_range: Optional[str] = None
    current_job_role: Optional[str] = None
    industry: Optional[str] = None
    educational_background: Optional[str] = None
    years_of_experience: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    age_range: Optional[str]
    current_job_role: Optional[str]
    industry: Optional[str]
    educational_background: Optional[str]
    years_of_experience: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Assessment schemas
class AssessmentCreate(BaseModel):
    assessment_type: str
    questions: Dict[str, Any]
    answers: Dict[str, Any]

class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    assessment_type: str
    questions: Dict[str, Any]
    scores: Dict[str, Any]
    total_score: float
    completed_at: datetime
    
    class Config:
        from_attributes = True

# Skill evaluation schemas
class SkillEvaluationCreate(BaseModel):
    technical_skills: Dict[str, Any]
    soft_skills: Dict[str, Any]
    industry_skills: Dict[str, Any]

class SkillEvaluationResponse(BaseModel):
    id: int
    user_id: int
    technical_skills: Dict[str, Any]
    soft_skills: Dict[str, Any]
    industry_skills: Dict[str, Any]
    skill_gaps: Dict[str, Any]
    overall_score: float
    evaluated_at: datetime
    
    class Config:
        from_attributes = True

# Career recommendation schemas
class CareerRecommendationResponse(BaseModel):
    id: int
    user_id: int
    recommended_careers: List[Dict[str, Any]]
    skill_match_score: float
    interest_alignment_score: float
    overall_recommendation_score: float
    career_progression_path: Dict[str, Any]
    skill_development_plan: Dict[str, Any]
    market_trend_analysis: Dict[str, Any]
    rationale: str
    generated_at: datetime
    
    class Config:
        from_attributes = True

# Login schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
