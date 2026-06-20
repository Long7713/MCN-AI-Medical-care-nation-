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
model.eval()

DEPARTMENT_PROTOTYPES = {
    "Nội Tiêu Hóa": (
        "đau bụng buồn nôn tiêu chảy đầy hơi khó tiêu ợ chua ợ hơi "
        "đau dạ dày viêm dạ dày loét dạ dày táo bón đi ngoài phân lỏng "
        "đau quặn bụng chướng bụng khó tiêu nôn mửa xuất huyết tiêu hóa "
        "viêm đại tràng hội chứng ruột kích thích trào ngược dạ dày"
    ),
    "Nội Khoa": (
        "mệt mỏi sốt cảm cúm ho đau đầu chóng mặt suy nhược cơ thể "
        "thiếu máu tiểu đường đái tháo đường cao huyết áp hạ huyết áp "
        "mất ngủ căng thẳng stress lo âu sốt cao ớn lạnh rét run "
        "viêm phổi cúm nhiễm trùng nhiễm khuẩn sốt xuất huyết sốt rét "
        "mệt mỏi toàn thân yếu sức giảm cân không rõ nguyên nhân"
    ),
    "Nội Tim Mạch": (
        "đau ngực tim đập nhanh khó thở tức ngực hồi hộp đánh trống ngực "
        "nhịp tim bất thường rối loạn nhịp tim suy tim nhồi máu cơ tim "
        "đau thắt ngực thiếu máu cơ tim cao huyết áp huyết áp cao "
        "phù chân phù nề khó thở khi gắng sức ngất xỉu tim đập chậm "
        "xơ vữa động mạch suy mạch vành tim mạch huyết áp"
    ),
    "Tai Mũi Họng": (
        "đau họng nghẹt mũi chảy mũi ù tai nghe kém viêm họng "
        "viêm amidan viêm xoang viêm tai giữa chảy máu mũi mất giọng "
        "khàn tiếng khó nuốt đau tai nước tai vẹo vách ngăn mũi "
        "viêm mũi dị ứng polyp mũi ho có đờm đờm vướng họng "
        "hắt hơi sổ mũi nghẹt mũi viêm thanh quản"
    ),
    "Xương Khớp": (
        "đau khớp cứng khớp sưng khớp đau lưng đau cổ đau vai gáy "
        "thoái hóa khớp viêm khớp gout gút đau xương thoát vị đĩa đệm "
        "đau thần kinh tọa loãng xương đau đầu gối đau hông "
        "cứng khớp buổi sáng sưng tấy khớp đau nhức xương khớp "
        "viêm gân viêm bao hoạt dịch bong gân trật khớp"
    ),
    "Ngoại Khoa": (
        "vết thương chấn thương gãy xương cần phẫu thuật u bướu khối u "
        "appendicitis viêm ruột thừa thoát vị đau bụng cấp tính "
        "chấn thương đầu chấn thương bụng vết đâm vết cắt vết rách "
        "áp xe nhọt mủ cần mổ sỏi thận sỏi mật cắt amidan "
        "phẫu thuật thẩm mỹ tai nạn chấn thương cơ học"
    ),
    "Da Liễu": (
        "nổi mẩn ngứa da mụn viêm da bỏng phỏng cháy da "
        "bỏng nước sôi bỏng lửa bỏng hóa chất bỏng điện tổn thương da "
        "dị ứng da nổi mề đay phát ban chàm eczema vảy nến "
        "nấm da hắc lào lang beng rôm sảy mụn trứng cá mụn nhọt "
        "viêm da cơ địa da khô da bong tróc vết thương hở trên da "
        "rụng tóc bạch biến sẹo lồi sẹo thâm u nang da"
    ),
    "Mắt": (
        "mờ mắt đau mắt đỏ mắt chảy nước mắt nhìn mờ nhìn đôi "
        "cận thị viễn thị loạn thị tăng nhãn áp glôcôm đục thủy tinh thể "
        "viêm kết mạc đau nhức hố mắt ngứa mắt mắt tiết ghèn "
        "lẹo mắt chắp mắt khô mắt mắt nhạy cảm với ánh sáng "
        "bong võng mạc xuất huyết mắt nhìn thấy chấm đen bay"
    ),
}

def embed(text: str) -> np.ndarray:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=256, padding=True)
    with torch.no_grad():
        out = model(**inputs)
    return out.last_hidden_state[:, 0, :].squeeze().numpy()

PROTO_EMBS = {dept: embed(desc) for dept, desc in DEPARTMENT_PROTOTYPES.items()}

def cosine_sim(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))

class SymptomRequest(BaseModel):
    text: str

@router.post("/suggest-department")
def suggest_department(request: SymptomRequest):
    query_emb = embed(request.text)
    scores = {dept: cosine_sim(query_emb, emb) for dept, emb in PROTO_EMBS.items()}
    # Keyword boost: nếu match keyword thì đưa lên rank 1
    kw_dept = keyword_match(request.text)
    if kw_dept and kw_dept in scores:
        scores[kw_dept] = max(scores[kw_dept], 1.0)

    top3 = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
    return {
        "text_input": request.text,
        "suggested_departments": [
            {"rank": i+1, "department": dept, "confidence": round(min(score, 1.0), 4)}
            for i, (dept, score) in enumerate(top3)
        ],
        "status": "AI processed successfully"
    }

KEYWORD_RULES = {
    "Da Liễu":       ["bỏng", "phỏng", "cháy da", "phát ban", "mề đay", "ngứa da", "mẩn đỏ",
                      "vảy nến", "eczema", "chàm", "nấm", "hắc lào", "lang beng", "mụn trứng cá",
                      "rụng tóc", "sẹo", "u nang da", "viêm da"],
    "Mắt":           ["mờ mắt", "đau mắt", "đỏ mắt", "ngứa mắt", "chảy nước mắt", "cận thị",
                      "viễn thị", "loạn thị", "mắt", "nhìn mờ", "nhìn đôi", "lẹo"],
    "Tai Mũi Họng":  ["đau họng", "nghẹt mũi", "chảy mũi", "ù tai", "đau tai", "viêm họng",
                      "viêm xoang", "khàn tiếng", "mất giọng", "chảy máu mũi", "viêm amidan"],
    "Xương Khớp":    ["đau khớp", "cứng khớp", "sưng khớp", "đau lưng", "đau cổ", "đau vai",
                      "gout", "gút", "thoát vị", "thoái hóa", "loãng xương", "đau thần kinh tọa",
                      "bong gân", "trật khớp", "đau xương"],
    "Nội Tim Mạch":  ["đau ngực", "tim đập nhanh", "hồi hộp", "khó thở", "tức ngực",
                      "nhịp tim", "suy tim", "nhồi máu", "cao huyết áp", "huyết áp cao",
                      "đánh trống ngực", "ngất", "phù chân"],
    "Nội Tiêu Hóa":  ["đau bụng", "buồn nôn", "tiêu chảy", "nôn", "đầy hơi", "ợ chua",
                      "táo bón", "đau dạ dày", "loét dạ dày", "trào ngược", "đi ngoài",
                      "xuất huyết tiêu hóa", "viêm đại tràng"],
    "Ngoại Khoa":    ["gãy xương", "chấn thương", "vết thương", "u bướu", "khối u",
                      "viêm ruột thừa", "áp xe", "nhọt", "cần mổ", "phẫu thuật",
                      "sỏi thận", "sỏi mật", "tai nạn"],
    "Nội Khoa":      ["sốt cao", "cảm cúm", "mệt mỏi", "thiếu máu", "tiểu đường",
                      "sốt xuất huyết", "sốt rét", "nhiễm trùng", "viêm phổi", "mất ngủ"],
}

def keyword_match(text: str) -> str | None:
    text_lower = text.lower()
    for dept, keywords in KEYWORD_RULES.items():
        for kw in keywords:
            if kw in text_lower:
                return dept
    return None
