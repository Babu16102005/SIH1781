from sqlalchemy.orm import Session
from typing import Optional
from models import User
from schemas import UserCreate, UserResponse, LoginRequest
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable not set. Please set it in your .env file.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> UserResponse:
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create new user
        hashed_password = pwd_context.hash(user_data.password)
        db_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            age_range=user_data.age_range,
            current_job_role=user_data.current_job_role,
            industry=user_data.industry,
            educational_background=user_data.educational_background,
            years_of_experience=user_data.years_of_experience
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return UserResponse.model_validate(db_user)
    
    def authenticate_user(self, user_data: LoginRequest) -> dict:
        user = self.db.query(User).filter(User.email == user_data.email).first()

        if not user or not pwd_context.verify(user_data.password, user.hashed_password):
            raise ValueError("Incorrect email or password")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user)
        }
    
    def create_access_token(self, data: dict, expires_delta: timedelta | None = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def get_user_by_firebase_uid(self, uid: str) -> Optional[User]:
        return self.db.query(User).filter(User.firebase_uid == uid).first()

    def create_user_from_firebase(self, uid: str, user_data: UserCreate) -> User:
        db_user = User(
            firebase_uid=uid,
            email=user_data.email,
            full_name=user_data.full_name
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
