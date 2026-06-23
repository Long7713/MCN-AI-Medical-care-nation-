from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
import math
from datetime import datetime

app = FastAPI(
    title="MCN AI(Medical Care Nation)",
    description="Hệ thống API hỗ trợ AI nhận diện cảm xúc và đám đông bệnh viện",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Hello World từ FastAPI!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/density/{dept_id}")
def get_density(dept_id: int):
    hour = datetime.now().hour
    # Giờ cao điểm: 8-10h và 14-16h
    base = 0.5 + 0.4 * math.sin((hour - 9) * math.pi / 4)
    offset = (dept_id % 3) * 0.1
    density = max(0.1, min(0.95, base + offset))
    if density > 0.7:
        level = "HIGH"
    elif density > 0.4:
        level = "MEDIUM"
    else:
        level = "LOW"
    return {
        "dept_id": dept_id,
        "density": round(density, 2),
        "level": level
    }


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
