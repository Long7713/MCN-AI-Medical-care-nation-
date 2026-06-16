from fastapi import FastAPI
# Nhập (import) các router từ thư mục routers vào
from router import Phobert, emotion, crowd

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World từ FastAPI!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Khai báo cho FastAPI biết các đường dẫn mới
app.include_router(Phobert.router)
app.include_router(emotion.router)
app.include_router(crowd.router)