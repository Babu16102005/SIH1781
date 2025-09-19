from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate, UserResponse, LoginRequest
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
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
        db_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            age_range=user_data.age_range,
            current_job_role=user_data.current_job_role,
            industry=user_data.industry,
            educational_background=user_data.educational_background,
            years_of_experience=user_data.years_of_experience
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return UserResponse.from_orm(db_user)
    
    def authenticate_user(self, user_data: LoginRequest) -> dict:
        user = self.db.query(User).filter(User.email == user_data.email).first()
        if not user:
            # Auto-register lightweight user on first login attempt by email (no password)
            # This simplifies demo/dev flow; for production require password.
            temp_user = User(
                email=user_data.email,
                full_name=user_data.email.split('@')[0],
            )
            self.db.add(temp_user)
            self.db.commit()
            self.db.refresh(temp_user)
            user = temp_user
        
        # For simplicity, we'll use email as password in this demo
        # In production, implement proper password hashing
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user)
        }
    
    def create_access_token(self, data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def get_user_by_token(self, token: str) -> User:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                return None
        except JWTError:
            return None
        
        user = self.db.query(User).filter(User.email == email).first()
        return user
