from fastapi import FastAPI
# Nhập (import) các router từ thư mục routers vào
from router import Phobert, emotion, crowd

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

# Khai báo cho FastAPI biết các đường dẫn mới
app.include_router(Phobert.router)
app.include_router(emotion.router)
app.include_router(crowd.router)  # <-- THÊM DÒNG NÀY để kích hoạt chức năng đám đông!
