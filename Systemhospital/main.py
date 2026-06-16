from fastapi import FastAPI

app = FastAPI(
    title="System Hospital AI API",
    description="Hệ thống API hỗ trợ AI nhận diện cảm xúc và đám đông bệnh viện",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Hello World từ FastAPI!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Load AI routers — chỉ hoạt động khi đã cài transformers + torch + model files
try:
    from router import Phobert, emotion, crowd
    app.include_router(Phobert.router)
    app.include_router(emotion.router)
    app.include_router(crowd.router)
    print("✅ AI routers loaded successfully")
except ModuleNotFoundError as e:
    print(f"⚠️  AI routers skipped (missing dependency: {e})")
    print("   Chạy: pip install transformers torch")
except Exception as e:
    print(f"⚠️  AI routers skipped ({e})")
