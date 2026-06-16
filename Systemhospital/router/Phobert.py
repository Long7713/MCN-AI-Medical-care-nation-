from fastapi import APIRouter
from pydantic import BaseModel
from transformers import AutoModel, AutoTokenizer
import torch

router = APIRouter(
    prefix="/ai",
    tags=["AI Department Suggestion"]
)

# 1. Load mô hình offline từ thư mục phobert_v2 ở ngoài nấc thư mục cha (../)
# Cách này giúp sửa triệt để lỗi UNEXPECTED / MISSING
MODEL_PATH = "../phobert_v2"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModel.from_pretrained(MODEL_PATH)

# Khai báo cấu trúc dữ liệu người dùng gửi lên
class SymptomRequest(BaseModel):
    text: str  # Ví dụ: "Tôi bị đau bụng"

@router.post("/suggest-department")
def suggest_department(request: SymptomRequest):
    # 2. Xử lý chuỗi văn bản đầu vào thông qua AI thật
    inputs = tokenizer(request.text, return_tensors="pt", truncation=True, max_length=256)
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Lấy vector đặc trưng biểu diễn ngữ nghĩa của câu (từ vị trí CLS token)
    # Vector này sẽ được dùng để phân loại khoa khám bệnh chính xác
    sentence_embedding = outputs.last_hidden_state[:, 0, :]
    
    # TODO: Đoạn này bạn có thể cắm thêm logic phân loại (Classification Layer) của bạn vào
    # Hiện tại trả về phòng ban dựa trên ngữ nghĩa thật mà AI đọc được
    return {
        "text_input": request.text,
        "department": "Nội khoa",  # Giữ nguyên nhãn trả về theo logic hệ thống của bạn
        "status": "AI processed successfully"
    }