from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
from api.routes import router as user_router, functions_router

# بناء الجداول في الداتا بيز بناءً على الـ Models
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinFamily API")

# إعدادات الـ CORS عشان الـ Frontend يقدر يبعت Requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # البورت بتاع Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# تسجيل الـ Routes
app.include_router(user_router)
app.include_router(functions_router)