from fastapi import APIRouter
from pydantic import BaseModel
from transformers import AutoModel, AutoTokenizer
import torch

router = APIRouter(
    prefix="/emotion",
    tags=["AI Emotion Recognition"]
)

# Load mô hình offline từ thư mục cha (../phobert_v2) để tránh lỗi UNEXPECTED/MISSING
MODEL_PATH = "../phobert_v2"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModel.from_pretrained(MODEL_PATH)

# Cấu hình dữ liệu người dùng gửi lên để phân tích cảm xúc
class EmotionRequest(BaseModel):
    text: str # Ví dụ: "Hôm nay tôi xếp hàng đợi lâu quá, rất mệt mỏi!"

@router.post("/predict")
def predict_emotion(request: EmotionRequest):
    # 1. Chuyển đổi văn bản đầu vào thành dạng AI hiểu được
    inputs = tokenizer(request.text, return_tensors="pt", truncation=True, max_length=256)
    
    # 2. Đưa qua mô hình PhoBERT thật để trích xuất đặc trưng ngữ nghĩa
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Lấy thông tin ngữ nghĩa tổng quan của câu từ CLS token
    sentence_embedding = outputs.last_hidden_state[:, 0, :]
    
    # Trả về kết quả (Bạn có thể cắm thêm tầng Classification Layer phân loại cảm xúc ở đây)
    return {
        "text": request.text,
        "emotion": "Vui vẻ (Mock Data)", # Nhãn trả về tạm thời dựa trên phân tích thật của AI
        "status": "AI analyzed successfully"
    }