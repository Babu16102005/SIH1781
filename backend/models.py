from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for demo users
    age_range = Column(String(50))
    current_job_role = Column(String(255))
    industry = Column(String(255))
    educational_background = Column(String(255))
    years_of_experience = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assessments = relationship("Assessment", back_populates="user")
    skill_evaluations = relationship("SkillEvaluation", back_populates="user")
    career_recommendations = relationship("CareerRecommendation", back_populates="user")

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_type = Column(String(100), nullable=False)  # aptitude, interest, personality
    questions = Column(JSON)  # Store questions and answers
    scores = Column(JSON)  # Store calculated scores
    total_score = Column(Float)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="assessments")

class SkillEvaluation(Base):
    __tablename__ = "skill_evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    technical_skills = Column(JSON)  # Technical skills and proficiency levels
    soft_skills = Column(JSON)  # Soft skills and proficiency levels
    industry_skills = Column(JSON)  # Industry-specific skills
    skill_gaps = Column(JSON)  # Identified skill gaps
    overall_score = Column(Float)
    evaluated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="skill_evaluations")

class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommended_careers = Column(JSON)  # List of recommended career paths
    skill_match_score = Column(Float)  # 60% weight
    interest_alignment_score = Column(Float)  # 40% weight
    overall_recommendation_score = Column(Float)
    career_progression_path = Column(JSON)  # Short and long-term progression
    skill_development_plan = Column(JSON)  # Recommended learning paths
    market_trend_analysis = Column(JSON)  # Industry trends and demand
    rationale = Column(Text)  # Explanation for recommendations
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="career_recommendations")
