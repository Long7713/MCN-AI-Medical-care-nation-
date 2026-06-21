import base64
import numpy as np
import cv2
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/face", tags=["Face Biometric"])

_face_app = None

def get_face_app():
    global _face_app
    if _face_app is None:
        import insightface
        print("[Face] Loading insightface buffalo_sc model...")
        _face_app = insightface.app.FaceAnalysis(
            name="buffalo_sc",
            providers=["CPUExecutionProvider"]
        )
        _face_app.prepare(ctx_id=0, det_size=(640, 640))
        print("[Face] Model ready.")
    return _face_app


class FaceEmbedRequest(BaseModel):
    imageBase64: str


@router.post("/embed")
def embed_face(request: FaceEmbedRequest):
    try:
        img_bytes = base64.b64decode(request.imageBase64)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            return {"vector": [], "status": "error", "error": "Không đọc được ảnh"}

        app = get_face_app()
        faces = app.get(img)

        if not faces:
            return {"vector": [], "status": "no_face", "error": "Không phát hiện khuôn mặt"}

        embedding = faces[0].embedding.tolist()
        print(f"[Face] Embedded face, dims={len(embedding)}")
        return {"vector": embedding, "dims": len(embedding), "status": "ok"}

    except Exception as e:
        print(f"[Face] Error: {e}")
        return {"vector": [], "status": "error", "error": str(e)}
