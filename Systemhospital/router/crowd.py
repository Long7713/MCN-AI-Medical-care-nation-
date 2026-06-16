from fastapi import APIRouter

router = APIRouter()

@router.get("/mock-crowd")
def get_crowd():
    return {"crowd_density": "Bình thường (Mock Data)"}