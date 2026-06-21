import os
import json
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/ai",
    tags=["AI Department Suggestion"]
)

DEPARTMENTS = [
    "Nội Tiêu Hóa", "Nội Khoa", "Nội Tim Mạch",
    "Tai Mũi Họng", "Xương Khớp", "Ngoại Khoa",
    "Da Liễu", "Mắt",
]

KEYWORD_RULES = {
    "Da Liễu":      ["bỏng", "phỏng", "cháy da", "phát ban", "mề đay", "ngứa da", "mẩn đỏ",
                     "vảy nến", "eczema", "chàm", "nấm", "hắc lào", "lang beng", "mụn trứng cá",
                     "rụng tóc", "sẹo", "u nang da", "viêm da"],
    "Mắt":          ["mờ mắt", "đau mắt", "đỏ mắt", "ngứa mắt", "chảy nước mắt", "cận thị",
                     "viễn thị", "loạn thị", "nhìn mờ", "nhìn đôi", "lẹo"],
    "Tai Mũi Họng": ["đau họng", "nghẹt mũi", "chảy mũi", "ù tai", "đau tai", "viêm họng",
                     "viêm xoang", "khàn tiếng", "mất giọng", "chảy máu mũi", "viêm amidan"],
    "Xương Khớp":   ["đau khớp", "cứng khớp", "sưng khớp", "đau lưng", "đau cổ", "đau vai",
                     "gout", "gút", "thoát vị", "thoái hóa", "loãng xương", "đau thần kinh tọa",
                     "bong gân", "trật khớp", "đau xương"],
    "Nội Tim Mạch": ["đau ngực", "tim đập nhanh", "hồi hộp", "khó thở", "tức ngực",
                     "nhịp tim", "suy tim", "nhồi máu", "cao huyết áp", "huyết áp cao",
                     "đánh trống ngực", "ngất", "phù chân"],
    "Nội Tiêu Hóa": ["đau bụng", "buồn nôn", "tiêu chảy", "nôn", "đầy hơi", "ợ chua",
                     "táo bón", "đau dạ dày", "loét dạ dày", "trào ngược", "đi ngoài",
                     "xuất huyết tiêu hóa", "viêm đại tràng"],
    "Ngoại Khoa":   ["gãy xương", "chấn thương", "vết thương", "u bướu", "khối u",
                     "viêm ruột thừa", "áp xe", "nhọt", "cần mổ", "phẫu thuật",
                     "sỏi thận", "sỏi mật", "tai nạn"],
    "Nội Khoa":     ["sốt cao", "cảm cúm", "mệt mỏi", "thiếu máu", "tiểu đường",
                     "sốt xuất huyết", "sốt rét", "nhiễm trùng", "viêm phổi", "mất ngủ"],
}

def keyword_match(text: str) -> str | None:
    text_lower = text.lower()
    for dept, keywords in KEYWORD_RULES.items():
        for kw in keywords:
            if kw in text_lower:
                return dept
    return None

class SymptomRequest(BaseModel):
    text: str

def _suggest_with_groq(text: str) -> list[dict]:
    from groq import Groq
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    dept_list = "\n".join(f"- {d}" for d in DEPARTMENTS)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    f"Bạn là AI hỗ trợ y tế tại Việt Nam. Dựa trên triệu chứng người dùng mô tả,"
                    f" hãy gợi ý top 3 khoa khám phù hợp nhất từ danh sách:\n{dept_list}\n\n"
                    "Trả về JSON:\n"
                    '{"suggested_departments": ['
                    '{"rank": 1, "department": "...", "confidence": 0.95},'
                    '{"rank": 2, "department": "...", "confidence": 0.80},'
                    '{"rank": 3, "department": "...", "confidence": 0.65}'
                    "]}\n"
                    "Confidence từ 0.0 đến 1.0. Chỉ trả về JSON, không giải thích thêm."
                ),
            },
            {"role": "user", "content": f"Triệu chứng: {text}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    result = json.loads(response.choices[0].message.content)
    return result.get("suggested_departments", [])

@router.post("/suggest-department")
def suggest_department(request: SymptomRequest):
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            departments = _suggest_with_groq(request.text)
            return {
                "text_input": request.text,
                "suggested_departments": departments,
                "status": "AI processed successfully",
                "engine": "groq",
            }
        except Exception as e:
            print(f"[Groq] Error: {e}, falling back to keyword match")

    # Keyword fallback (no API key or Groq error)
    kw_dept = keyword_match(request.text)
    primary = kw_dept or "Nội Khoa"
    fallback_list = [d for d in DEPARTMENTS if d != primary]
    return {
        "text_input": request.text,
        "suggested_departments": [
            {"rank": 1, "department": primary,          "confidence": 0.70},
            {"rank": 2, "department": fallback_list[0], "confidence": 0.45},
            {"rank": 3, "department": fallback_list[1], "confidence": 0.30},
        ],
        "status": "keyword fallback",
        "engine": "keyword",
    }
