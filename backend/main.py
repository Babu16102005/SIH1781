from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn
from dotenv import load_dotenv
import os

from database import get_db, engine, Base
from models import User, Assessment, CareerRecommendation, SkillEvaluation
from schemas import (
    UserCreate, UserResponse, AssessmentCreate, AssessmentResponse,
    CareerRecommendationResponse, SkillEvaluationCreate, SkillEvaluationResponse,
    LoginRequest
)
# Import services from their modules
from services.user_service import UserService
from services.assessment_service import AssessmentService
from services.recommendation_service import RecommendationService
from services.skill_evaluation_service import SkillEvaluationService
from services.gemini_service import GeminiService

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Career Guidance System",
    description="Comprehensive AI-driven career guidance and recommendation system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    user = user_service.get_user_by_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user

# User endpoints
@app.post("/api/users/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.create_user(user_data)

@app.post("/api/users/login")
async def login_user(user_data: LoginRequest, db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.authenticate_user(user_data)

@app.get("/api/users/profile", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

# Assessment endpoints
@app.post("/api/assessments", response_model=AssessmentResponse)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment_service = AssessmentService(db)
    return assessment_service.create_assessment(assessment_data, current_user.id)

@app.get("/api/assessments/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment_service = AssessmentService(db)
    return assessment_service.get_assessment(assessment_id, current_user.id)

# List assessments for current user (used by dashboard)
@app.get("/api/assessments", response_model=list[AssessmentResponse])
async def list_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.completed_at.desc())
        .all()
    )
    return [AssessmentResponse.from_orm(a) for a in assessments]

# Skill evaluation endpoints
@app.post("/api/skills/evaluate", response_model=SkillEvaluationResponse)
async def evaluate_skills(
    skill_data: SkillEvaluationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill_service = SkillEvaluationService(db)
    return skill_service.evaluate_skills(skill_data, current_user.id)

# Career recommendation endpoints
@app.post("/api/recommendations/generate", response_model=CareerRecommendationResponse)
async def generate_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recommendation_service = RecommendationService(db)
    return recommendation_service.generate_recommendations(current_user.id)

@app.get("/api/recommendations", response_model=list[CareerRecommendationResponse])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recommendation_service = RecommendationService(db)
    return recommendation_service.get_user_recommendations(current_user.id)

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "AI Career Guidance System is running"}

@app.post("/api/chat/stream")
async def chat_stream(
    body: dict,
    current_user: User = Depends(get_current_user),
):
    """Stream AI chat responses token-by-token to the client."""
    prompt = body.get("message", "")
    if not prompt:
        raise HTTPException(status_code=400, detail="message is required")

    gemini = GeminiService()

    def token_generator():
        for chunk in gemini.stream_chat(prompt):
            # Send Server-Sent Events style or raw text chunks; here we send raw text
            yield chunk

    return StreamingResponse(token_generator(), media_type="text/plain")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
