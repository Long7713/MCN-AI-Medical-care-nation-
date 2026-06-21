import base64
import tempfile
import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/face", tags=["Face Biometric"])


class FaceEmbedRequest(BaseModel):
    imageBase64: str


@router.post("/embed")
def embed_face(request: FaceEmbedRequest):
    tmp_path = None
    try:
        # Lazy-load deepface to avoid slow startup
        from deepface import DeepFace

        # Decode base64 image and write to a temp file
        image_bytes = base64.b64decode(request.imageBase64)
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        # Run face embedding with Facenet (128-dim)
        result = DeepFace.represent(
            img_path=tmp_path,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=False,
        )

        # DeepFace.represent returns a list; take the first face
        embedding = result[0]["embedding"] if result else []

        return {
            "vector": embedding,
            "dims": len(embedding),
            "status": "ok",
        }

    except Exception as e:
        return {
            "vector": [],
            "status": "error",
            "error": str(e),
        }

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
