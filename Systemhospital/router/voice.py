import os                                                                                                                                                                                                                                                                                                         
import base64                                                                                                                                                                                                                                                                                                     
from fastapi import APIRouter                                                                                                                                                                                                                                                                                     
from pydantic import BaseModel
from groq import Groq                                                                                                                                                                                                                                                                                             
                                              
router = APIRouter(prefix="/voice", tags=["Voice STT"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")                                                                                                                                                                                                                                                                          
                                          
class TranscribeRequest(BaseModel):                                                                                                                                                                                                                                                                               
      audioBase64: str                                                                                                                                                                                                                                                                                              
   
@router.post("/transcribe")                                                                                                                                                                                                                                                                                       
def transcribe(req: TranscribeRequest):
      try:
          audio_bytes = base64.b64decode(req.audioBase64)
          print(f"[Voice] Audio size: {len(audio_bytes)} bytes")
                                          
          client = Groq(api_key=GROQ_API_KEY)
          transcription = client.audio.transcriptions.create(                                                                                                                                                                                                                                                       
              file=("audio.m4a", audio_bytes),
              model="whisper-large-v3-turbo",                                                                                                                                                                                                                                                                       
              language="vi",
              response_format="text"                                                                                                                                                                                                                                                                                
          )
                                                                                                                                                                                                                                                                                                                    
          transcript = transcription.strip() if transcription else ""
          print(f"[Voice] Transcript: '{transcript}'")
          return {"transcript": transcript, "status": "ok"}
                                                                                                                                                                                                                                                                                                                    
      except Exception as e:              
          print(f"[Voice] Error: {e}")                                                                                                                                                                                                                                                                              
          return {"transcript": "", "status": "error", "error": str(e)}