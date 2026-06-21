import os
import base64
import tempfile
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/voice", tags=["Voice STT"])

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        print(f"[Voice] Loading Whisper model '{WHISPER_MODEL_SIZE}'...")
        _whisper_model = WhisperModel(WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")
        print("[Voice] Whisper model ready.")
    return _whisper_model

class TranscribeRequest(BaseModel):
    audioBase64: str

@router.post("/transcribe")
def transcribe(req: TranscribeRequest):
    try:
        audio_bytes = base64.b64decode(req.audioBase64)

        with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            print(f"[Voice] Audio size: {len(audio_bytes)} bytes")
            model = get_whisper_model()
            segments, info = model.transcribe(
                tmp_path,
                language="vi",
                beam_size=5,
            )
            transcript = " ".join(seg.text.strip() for seg in segments).strip()
            print(f"[Voice] Detected language: {info.language} ({info.language_probability:.2f})")
        finally:
            os.unlink(tmp_path)

        print(f"[Voice] Transcript: '{transcript}'")
        return {"transcript": transcript, "status": "ok"}

    except Exception as e:
        print(f"[Voice] Error: {e}")
        return {"transcript": "", "status": "error", "error": str(e)}
