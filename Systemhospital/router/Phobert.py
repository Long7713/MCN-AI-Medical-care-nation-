from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Khai báo cấu trúc dữ liệu người dùng gửi lên
class SymptomRequest(BaseModel):
    text: str # Ví dụ: "Tôi bị đau bụng"

@router.post("/suggest-department")
def suggest_department(request: SymptomRequest):
    # Trả về dữ liệu giả lập (mock data) đúng theo yêu cầu trong ảnh
    return {"department": "Nội khoa"}
