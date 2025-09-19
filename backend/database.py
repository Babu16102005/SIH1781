from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
# Default to SQLite for local development to avoid Oracle setup friction.
# You can override with Oracle by setting DATABASE_URL in .env
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./career.db")

# For SQLite, need connect_args; for others it's ignored
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
