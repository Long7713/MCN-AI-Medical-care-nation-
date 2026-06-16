from fastapi import APIRouter

router = APIRouter(
    prefix="/crowd",
    tags=["Crowd Density"]
)

@router.get("/mock-crowd")
def get_crowd():
    """API test nhanh trả về dữ liệu giả lập cho hệ thống"""
    return {"crowd_density": "Bình thường (Mock Data)"}