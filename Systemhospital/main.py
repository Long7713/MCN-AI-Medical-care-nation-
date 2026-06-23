from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import FastAPI
import math
from datetime import datetime

# Import function to load AI models
from router.face import load_face_model
from router.emotion import load_emotion_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load AI models on startup
    print("--- Loading AI models ---")
    load_face_model()
    load_emotion_model()
    print("--- AI models loaded ---")
    yield
    # Clean up the models and release the resources
    print("--- Cleaning up resources ---")

app = FastAPI(
    lifespan=lifespan,
    title="MCN AI(Medical Care Nation)",
    description="Hệ thống API hỗ trợ AI nhận diện cảm xúc và đám đông bệnh viện",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello World từ FastAPI!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Load AI routers — chỉ hoạt động khi đã cài transformers + torch + model files
try:
    from router import Phobert, emotion, crowd, voice, face
    app.include_router(Phobert.router)
    app.include_router(emotion.router)
    app.include_router(crowd.router)
    app.include_router(voice.router)
    app.include_router(face.router)
    print("✅ AI routers loaded successfully")
except ModuleNotFoundError as e:
    print(f"⚠️  AI routers skipped (missing dependency: {e})")
    print("   Chạy: pip install transformers torch")
except Exception as e:
    print(f"⚠️  AI routers skipped ({e})")
