import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# تحميل المتغيرات من ملف الـ .env
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# بناء الـ Engine اللي بيشغل الاتصال بـ PostgreSQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "5")),
    pool_timeout=int(os.getenv("DB_POOL_TIMEOUT", "10")),
    pool_recycle=1800,
    pool_pre_ping=True,
)

# تجهيز الـ Session اللي هنستخدمها لإدارة العمليات مع كل Request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# الـ Base اللي كل جداول الداتا بيز (Models) هتورث منه
Base = declarative_base()

# Dependency function عشان ندي لكل مسار (Route) اتصال بالداتا بيز ونقفله أوتوماتيك
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()