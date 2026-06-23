import requests
import base64
import json
import psycopg2
import os
from dotenv import load_dotenv

# Tải biến môi trường từ file .env ở thư mục gốc của dự án
load_dotenv(dotenv_path="../.env")

FASTAPI_URL = "http://localhost:8000"
# Lấy chuỗi kết nối DB từ biến môi trường để bảo mật hơn
DB_CONN = os.getenv("DB_CONN_STRING")

def embed_image(img_path: str) -> list:
    with open(img_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    res = requests.post(
        f"{FASTAPI_URL}/face/embed",
        json={"imageBase64": b64},
        timeout=30
    )
    data = res.json()
    if data.get("status") != "ok":
        print(f"  WARNING: embed failed for {img_path}: {data.get('error')}")
        return []
    return data.get("vector", [])


if __name__ == "__main__":
    if not DB_CONN:
        print("Lỗi: Vui lòng cấu hình DB_CONN_STRING trong file .env ở thư mục gốc")
        exit(1)
    try:
        with psycopg2.connect(DB_CONN) as conn:
            with conn.cursor() as cur:
                for i in range(1, 6):
                    path = f"test_faces/patient_{i}.jpg"
                    try:
                        vec = embed_image(path)
                        if vec:
                            cur.execute(
                                "UPDATE patients SET face_vector = %s WHERE id = %s",
                                (json.dumps(vec), i)
                            )
                            print(f"  Seeded patient {i}: {len(vec)} dims")
                    except FileNotFoundError:
                        print(f"  Skipping patient {i}: file not found at {path}")
        print("Done. Changes committed.")
    except psycopg2.Error as e:
        print(f"Lỗi database: {e}")
    except Exception as e:
        print(f"Đã xảy ra lỗi không mong muốn: {e}")