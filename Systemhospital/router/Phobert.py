import os, torch
import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel
from transformers import AutoModel, AutoTokenizer

router = APIRouter(
    prefix="/ai",
    tags=["AI Department Suggestion"]
)

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "phobert_v2"))
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModel.from_pretrained(MODEL_PATH)
model.eval()# Prototype embeddings cho từng khoa (sẽ được thay bằng trained classifier sau)
DEPARTMENT_PROTOTYPES = {
    "Nội Tiêu Hóa":   "đau bụng buồn nôn tiêu chảy đầy hơi khó tiêu",
    "Nội Khoa":        "mệt mỏi sốt cảm cúm ho đau đầu",
    "Nội Tim Mạch":    "đau ngực tim đập nhanh khó thở tức ngực",
    "Xương Khớp":      "đau khớp cứng khớp sưng khớp đau lưng",
    "Tai Mũi Họng":    "đau họng nghẹt mũi chảy mũi ù tai",
    "Ngoại Khoa":      "vết thương chấn thương gãy xương cần phẫu thuật",
    "Da Liễu":         "nổi mẩn ngứa da mụn viêm da",
    "Mắt":             "mờ mắt đau mắt đỏ mắt chảy nước mắt",
}

def embed(text: str) -> np.ndarray:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=256, padding=True)
    with torch.no_grad():
        out = model(**inputs)
    return out.last_hidden_state[:, 0, :].squeeze().numpy()

# Pre-compute prototype embeddings
PROTO_EMBS = {dept: embed(desc) for dept, desc in DEPARTMENT_PROTOTYPES.items()}

def cosine_sim(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))

class SymptomRequest(BaseModel):
    text: str

@router.post("/suggest-department")
def suggest_department(request: SymptomRequest):
    query_emb = embed(request.text)
    scores = {dept: cosine_sim(query_emb, emb) for dept, emb in PROTO_EMBS.items()}
    top3 = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
    return {
        "text_input": request.text,
        "suggested_departments": [
            {"rank": i+1, "department": dept, "confidence": round(score, 4)}
            for i, (dept, score) in enumerate(top3)
        ],
        "status": "AI processed successfully"
    }
