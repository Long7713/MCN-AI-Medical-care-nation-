import base64
import numpy as np
import cv2
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/face", tags=["Face Biometric"])

_face_app = None # Global variable to hold the model

def load_face_model():
    """Loads the insightface model into the global _face_app variable."""
    global _face_app
    if _face_app is None:
        import insightface
        print("[Face] Loading insightface buffalo_sc model...")
        _face_app = insightface.app.FaceAnalysis(
            name="buffalo_sc",
            providers=["CPUExecutionProvider"] # Use CPU
        )
        _face_app.prepare(ctx_id=0, det_size=(640, 640))
        print("[Face] Model ready.")


class FaceEmbedRequest(BaseModel):
    imageBase64: str


@router.post("/embed")
def embed_face(request: FaceEmbedRequest):
    try:
        try:
            img_bytes = base64.b64decode(request.imageBase64)
        except (base64.binascii.Error, ValueError):
            return {"vector": [], "status": "error", "error": "Định dạng base64 không hợp lệ"}

        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            return {"vector": [], "status": "error", "error": "Không thể giải mã dữ liệu ảnh từ chuỗi base64"}

        if _face_app is None:
            # This should not happen if the model is loaded at startup
            return {"vector": [], "status": "error", "error": "Model khuôn mặt chưa được tải"}
        faces = _face_app.get(img)

        if not faces:
            return {"vector": [], "status": "no_face", "error": "Không phát hiện khuôn mặt"}

        embedding = faces[0].embedding.tolist()
        print(f"[Face] Embedded face, dims={len(embedding)}")
        return {"vector": embedding, "dims": len(embedding), "status": "ok"}

    except Exception as e:
        print(f"[Face] Error: {e}")
        return {"vector": [], "status": "error", "error": str(e)}
