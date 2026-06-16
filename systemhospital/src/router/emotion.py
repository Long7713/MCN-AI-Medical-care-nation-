from fastapi import APIRouter

router = APIRouter()

@router.get("/mock-emotion")
def get_emotion():
    return {"emotion": "Vui vẻ (Mock Data)"}