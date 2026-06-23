from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import random
import math
from datetime import datetime

router = APIRouter(prefix="/crowd", tags=["Crowd Intelligence"])

@router.get("/density/{dept_id}")
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

class CrowdRequest(BaseModel):
    departmentId: str
    hour: int = None   # Nếu None thì dùng giờ hiện tại

@router.post("/predict")
def predict_crowd(req: CrowdRequest):
    hour = req.hour or datetime.now().hour
    # Mock model — ngày 3+ thay bằng sklearn trained model
    base = {"morning": 0.8, "noon": 0.5, "afternoon": 0.6}
    if 7 <= hour <= 10: density = base["morning"] + random.uniform(-0.1, 0.1)
    elif 11 <= hour <= 13: density = base["noon"] + random.uniform(-0.1, 0.1)
    else: density = base["afternoon"] + random.uniform(-0.1, 0.1)
    density = min(max(density, 0.1), 1.0)
    wait_minutes = int(density * 45)
    color = "red" if density > 0.7 else "yellow" if density > 0.4 else "green"
    return {
        "departmentId": req.departmentId,
        "density": round(density, 2),
        "waitMinutes": wait_minutes,
        "color": color,
        "message": f"Ước tính chờ {wait_minutes} phút"
    }

@router.get("/heatmap")
def get_heatmap():
    departments = ["NOI_KHOA","NOI_TIEU_HOA","TIM_MACH","XUONG_KHOP","TAI_MUI_HONG"]
    return [{"departmentId": d, **predict_crowd(CrowdRequest(departmentId=d))} for d in departments]
