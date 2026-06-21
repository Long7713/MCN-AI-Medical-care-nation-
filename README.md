# MCN AI — Medical Care Nation

Hệ thống y tế thông minh: bệnh nhân mô tả triệu chứng bằng **giọng nói hoặc văn bản**, AI gợi ý khoa khám phù hợp, đặt lịch hẹn trực tiếp từ điện thoại. Tích hợp **sinh trắc học khuôn mặt** phục vụ nhận diện bệnh nhân tự động qua camera bệnh viện.

---

## Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────────┐
│  Mobile App  (Expo React Native SDK 54)                          │
│  auth/login · auth/register · auth/face-enroll                   │
│  book/voice · book/specialty · book/schedule · appointments      │
│  services/api.ts  →  gọi Spring Boot :8080 + FastAPI :8000       │
└──────────────────┬──────────────────────┬────────────────────────┘
                   │ :8080                │ :8000
                   ▼                      ▼
┌──────────────────────────┐  ┌───────────────────────────────────┐
│  Spring Boot 3.4.1       │  │  FastAPI AI  (Python 3.14)        │
│  Java 21 · port 8080     │  │  port 8000                        │
│                          │  │                                   │
│  POST /auth/register     │  │  POST /ai/suggest-department      │
│  POST /auth/login        │  │       → Groq llama-3.3-70b        │
│  POST /auth/face-enroll  │  │       → keyword fallback          │
│  GET  /departments       │  │                                   │
│  GET  /departments/{id}/ │  │  POST /voice/transcribe           │
│       slots              │  │       → faster-whisper (small)    │
│  POST /appointments      │  │                                   │
│  GET  /appointments/me   │  │  POST /face/embed                 │
│  GET  /actuator/health   │  │       → insightface ArcFace       │
└──────────┬───────────────┘  │       → vector 512 chiều          │
           │                  │                                   │
           │                  │  POST /emotion/predict            │
           │                  └───────────────────────────────────┘
┌──────────▼────────────────────────────────────────────────────────┐
│  Docker Infrastructure                                            │
│  PostgreSQL :5433 · Redis :6379 · RabbitMQ :5672                 │
│  pgAdmin :5050 · RabbitMQ UI :15672                              │
└───────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Mobile | Expo React Native SDK 54, TypeScript, expo-router, expo-camera, axios, Zustand |
| Backend | Spring Boot 3.4.1, Java 21, Spring Security + JWT, Spring Data JPA, PostgreSQL |
| AI Service | FastAPI, Python 3.14, uvicorn |
| Dept AI | Groq API (`llama-3.3-70b-versatile`) + keyword fallback |
| STT | faster-whisper `small` — Whisper local, tiếng Việt, không cần internet |
| Face AI | insightface `buffalo_sc` — ArcFace 512-dim, onnxruntime |
| Infrastructure | Docker, PostgreSQL 15, Redis, RabbitMQ |

---

## Cấu trúc project

```
MCN-AI-Medical-care-nation-/
├── README.md
├── API_CONTRACT.md
├── phobert_v2/                         # Model PhoBERT (emotion)
│
├── Systemhospital/                     # Python FastAPI AI Service
│   ├── main.py                         # FastAPI entrypoint, mount tất cả routers
│   ├── requirements.txt                # Python dependencies
│   ├── docker-compose.yml              # PostgreSQL, Redis, RabbitMQ, pgAdmin
│   ├── .env                            # GROQ_API_KEY, WHISPER_MODEL_SIZE
│   └── router/
│       ├── Phobert.py                  # POST /ai/suggest-department (Groq + fallback)
│       ├── voice.py                    # POST /voice/transcribe (faster-whisper local)
│       ├── face.py                     # POST /face/embed (insightface ArcFace 512-dim)
│       ├── emotion.py                  # POST /emotion/predict (PhoBERT)
│       └── crowd.py                    # Crowd detection
│
├── backend/                            # Spring Boot
│   └── src/main/java/com/mcn/backend/
│       ├── config/
│       │   ├── AppConfig.java          # RestTemplate bean
│       │   ├── SecurityConfig.java     # CORS, JWT filter, route permissions
│       │   ├── JwtFilter.java          # Extract phone từ Bearer token
│       │   └── JwtUtil.java            # Generate / validate JWT (24h)
│       ├── controller/
│       │   ├── AuthController.java     # /auth/register · /auth/login · /auth/face-enroll
│       │   ├── BookingController.java  # /departments · /departments/{id}/slots
│       │   └── AppointmentController.java  # /appointments · /appointments/me
│       ├── service/
│       │   ├── AuthService.java        # register, login, enrollFace
│       │   ├── DepartmentService.java  # getAllDepartments, getAvailableSlots
│       │   └── AppointmentService.java # createAppointment (@Transactional + SELECT FOR UPDATE)
│       ├── model/
│       │   ├── Patient.java            # id, fullName, phone, email, password, faceVector (TEXT)
│       │   ├── Department.java         # id, name, description, location
│       │   ├── TimeSlot.java           # id, department, slotDate, startTime, isAvailable
│       │   └── Appointment.java        # id, patient, department, timeSlot, status, note, createdAt
│       └── repository/
│           ├── PatientRepository.java
│           ├── TimeSlotRepository.java # findByIdForUpdate — SELECT FOR UPDATE (tránh double-book)
│           └── AppointmentRepository.java
│
└── Mobile_app/                         # Expo React Native
    ├── app/
    │   ├── index.tsx                   # Redirect → /auth/login
    │   ├── auth/
    │   │   ├── login.tsx               # Đăng nhập bằng phone + password
    │   │   ├── register.tsx            # Đăng ký → tự động redirect face-enroll
    │   │   └── face-enroll.tsx         # Camera chụp mặt, embed, lưu vector (BẮT BUỘC)
    │   └── (main)/
    │       ├── home.tsx
    │       ├── appointments.tsx        # Danh sách lịch hẹn của tôi
    │       └── book/
    │           ├── voice.tsx           # Ghi âm / nhập triệu chứng
    │           ├── specialty.tsx       # Chọn chuyên khoa (AI gợi ý highlight)
    │           └── schedule.tsx        # Chọn khung giờ → xác nhận đặt lịch
    ├── services/api.ts                 # HTTP client — backendClient(:8080), aiClient(:8000)
    ├── stores/authStore.ts             # Zustand store: token, user
    └── .env                            # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_AI_URL
```

---

## Yêu cầu cài đặt

| Công cụ | Phiên bản | Kiểm tra |
|---|---|---|
| Docker | 20+ | `docker --version` |
| JDK | 21 | `java -version` |
| Python | 3.10+ | `python3 --version` |
| Node.js | 18+ | `node --version` |

### Cài JDK 21

```bash
sudo apt-get install -y openjdk-21-jdk
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> ~/.zshrc
source ~/.zshrc
java -version  # → openjdk 21.x.x
```

---

## SETUP LẦN ĐẦU (chỉ làm 1 lần)

### 1. Python AI Service

```bash
cd Systemhospital
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Tải model Whisper (STT tiếng Việt, ~244MB — tải 1 lần, cache local):**

```bash
python3 -c "
from faster_whisper import WhisperModel
WhisperModel('small', device='cpu', compute_type='int8')
print('Whisper ready!')
"
```

**Tải model insightface buffalo_sc (Face ArcFace, ~14MB):**

```bash
python3 -c "
import insightface
app = insightface.app.FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640,640))
print('Face model ready!')
"
```

**Cấu hình `.env`:**

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx    # Lấy miễn phí tại console.groq.com
# WHISPER_MODEL_SIZE=small              # tiny | base | small | medium (mặc định: small)
```

### 2. Mobile App

```bash
cd Mobile_app
npm install --legacy-peer-deps
```

Lấy IP WiFi máy tính:

```bash
hostname -I | awk '{print $1}'
```

Mở `Mobile_app/.env` và điền IP:

```env
EXPO_PUBLIC_API_URL=http://<IP_WIFI>:8080
EXPO_PUBLIC_AI_URL=http://<IP_WIFI>:8000
```

> Điện thoại và máy tính phải cùng mạng WiFi.

---

## CHẠY HỆ THỐNG

Mở **4 terminal** chạy đồng thời:

### Terminal 1 — Infrastructure

```bash
cd Systemhospital
docker compose up -d
```

```
✔ Container systemhospital-postgres-1   Started
✔ Container systemhospital-redis-1      Started
✔ Container systemhospital-rabbitmq-1   Started
✔ Container systemhospital-pgadmin-1    Started
```

### Terminal 2 — FastAPI AI Service

```bash
cd Systemhospital
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

```
✅ AI routers loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 3 — Spring Boot Backend

```bash
cd backend
./mvnw spring-boot:run
```

```
HikariPool-1 - Start completed.
Tomcat started on port 8080
Started BackendApplication in X.XXX seconds
```

> `ddl-auto=update` tự tạo/cập nhật bảng DB khi khởi động.

### Terminal 4 — Mobile App

```bash
cd Mobile_app
npx expo start --clear --lan
```

1. Tải **Expo Go** từ Play Store / App Store
2. Scan QR code → app load lên điện thoại

---

## LUỒNG SỬ DỤNG

```
[Đăng ký] → Nhập thông tin (phone, password, ...)
                ↓
[Sinh trắc học] → Chụp khuôn mặt (BẮT BUỘC)
                   FastAPI /face/embed → vector 512 chiều
                   Spring Boot /auth/face-enroll → lưu DB
                ↓
[Trang chủ]
                ↓
[Đặt lịch — Bước 1] → Mô tả triệu chứng
   Ghi âm → /voice/transcribe → text (faster-whisper local)
   Text   → /ai/suggest-department → top 3 khoa (Groq AI)
                ↓
[Đặt lịch — Bước 2] → Chọn chuyên khoa
   Danh sách khoa từ /departments
   AI gợi ý được highlight
                ↓
[Đặt lịch — Bước 3] → Chọn khung giờ
   /departments/{id}/slots → danh sách giờ trống
   /appointments → xác nhận (SELECT FOR UPDATE tránh double-book)
                ↓
[Lịch hẹn] → /appointments/me → danh sách lịch đã đặt
```

---

## API ENDPOINTS

### FastAPI AI Service (`:8000`)

| Method | Endpoint | Mô tả | Engine |
|---|---|---|---|
| GET | `/health` | Health check | — |
| GET | `/docs` | Swagger UI | — |
| POST | `/ai/suggest-department` | Gợi ý top 3 khoa khám | Groq llama-3.3-70b + keyword fallback |
| POST | `/voice/transcribe` | Speech-to-text tiếng Việt | faster-whisper local |
| POST | `/face/embed` | Trích xuất vector khuôn mặt | insightface ArcFace 512-dim |
| POST | `/emotion/predict` | Phân tích cảm xúc | PhoBERT |

**POST `/ai/suggest-department`**
```json
// Request
{ "text": "Tôi bị đau bụng buồn nôn tiêu chảy" }

// Response
{
  "text_input": "Tôi bị đau bụng buồn nôn tiêu chảy",
  "suggested_departments": [
    { "rank": 1, "department": "Nội Tiêu Hóa", "confidence": 0.92 },
    { "rank": 2, "department": "Nội Khoa",     "confidence": 0.05 },
    { "rank": 3, "department": "Ngoại Khoa",   "confidence": 0.03 }
  ],
  "status": "AI processed successfully",
  "engine": "groq"
}
```

**POST `/voice/transcribe`**
```json
// Request
{ "audioBase64": "<base64 encoded m4a audio>" }

// Response
{ "transcript": "đau bụng buồn nôn hai ngày nay", "status": "ok" }
```

**POST `/face/embed`**
```json
// Request
{ "imageBase64": "<base64 encoded JPEG>" }

// Response — có mặt
{ "vector": [0.12, -0.45, ...], "dims": 512, "status": "ok" }

// Response — không phát hiện mặt
{ "vector": [], "status": "no_face", "error": "Không phát hiện khuôn mặt" }
```

---

### Spring Boot Backend (`:8080`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | Không | Đăng ký tài khoản bệnh nhân |
| POST | `/auth/login` | Không | Đăng nhập, nhận JWT 24h |
| POST | `/auth/face-enroll` | Bearer | Lưu vector khuôn mặt vào DB |
| GET | `/departments` | Không | Danh sách tất cả khoa |
| GET | `/departments/{id}/slots` | Không | Khung giờ khả dụng của khoa |
| POST | `/appointments` | Bearer | Đặt lịch (pessimistic lock) |
| GET | `/appointments/me` | Bearer | Lịch hẹn của tôi |
| GET | `/actuator/health` | Không | Health check |

**POST `/auth/register`** — `201 Created`
```json
// Request
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "a@example.com",
  "password": "Abcd@1234",
  "dateOfBirth": "1990-05-20",
  "gender": "MALE"
}
// Response
{ "success": true, "message": "Đăng ký thành công", "data": { "userId": 1, "phone": "0901234567" } }
```

**POST `/auth/login`** — `200 OK`
```json
// Request
{ "phone": "0901234567", "password": "Abcd@1234" }
// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": { "userId": 1, "fullName": "Nguyễn Văn A" }
  }
}
```

**POST `/auth/face-enroll`** — Bearer required
```json
// Request
{ "faceVector": [0.12, -0.45, ...] }   // 512 phần tử từ /face/embed
// Response
{ "success": true, "message": "Đăng ký sinh trắc học thành công" }
```

**GET `/departments/{id}/slots`**
```json
{
  "success": true,
  "data": [
    { "id": 1, "slotDate": "2026-06-23", "startTime": "08:00", "isAvailable": true },
    { "id": 2, "slotDate": "2026-06-23", "startTime": "14:00", "isAvailable": false }
  ]
}
```

**POST `/appointments`** — Bearer required
```json
// Request
{ "departmentId": 1, "slotId": 3, "note": "Đau bụng 2 ngày" }
// Response 200
{ "appointmentId": 5, "department": "Nội Tiêu Hóa", "date": "2026-06-23", "status": "CONFIRMED" }
// Response 400 — slot đã bị đặt
{ "status": 400, "message": "Khung giờ này đã được đặt" }
```

**GET `/appointments/me`** — Bearer required
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "departmentName": "Nội Tiêu Hóa",
      "slotDate": "2026-06-23",
      "startTime": "08:00:00",
      "status": "CONFIRMED",
      "note": "Đau bụng 2 ngày"
    }
  ]
}
```

---

## THÔNG TIN KẾT NỐI

| Service | URL | Thông tin |
|---|---|---|
| Spring Boot API | http://localhost:8080 | — |
| FastAPI AI | http://localhost:8000 | — |
| Swagger UI | http://localhost:8000/docs | Auto-generated |
| pgAdmin | http://localhost:5050 | admin@mcn.com / mcn12345 |
| RabbitMQ UI | http://localhost:15672 | guest / guest |
| PostgreSQL | localhost:5433 | admin / mcn12345 / mcn_db |
| Redis | localhost:6379 | — |

---

## VERIFY TOÀN BỘ HỆ THỐNG

```bash
# 1. Health check Spring Boot (DB + Redis + RabbitMQ)
curl http://localhost:8080/actuator/health

# 2. Danh sách khoa
curl http://localhost:8080/departments

# 3. AI gợi ý khoa
curl -s -X POST http://localhost:8000/ai/suggest-department \
  -H "Content-Type: application/json" \
  -d '{"text":"Tôi bị đau bụng buồn nôn"}'

# 4. Health check FastAPI
curl http://localhost:8000/health
```

---

## XEM DATABASE

```bash
docker exec -it systemhospital-postgres-1 psql -U admin -d mcn_db

\dt                           # danh sách bảng
SELECT * FROM patients;       # bệnh nhân + face_vector
SELECT * FROM time_slots;     # khung giờ
SELECT * FROM appointments;   # lịch hẹn
\q
```

---

## XỬ LÝ LỖI THƯỜNG GẶP

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `db: DOWN` trong health | Docker chưa chạy | `docker compose up -d` |
| `Address already in use :8000` | Process cũ | `kill $(lsof -ti:8000)` |
| `Address already in use :8080` | Spring Boot cũ | `kill $(lsof -ti:8080)` |
| `GROQ_API_KEY not set` | Chưa điền .env | Thêm key vào `Systemhospital/.env` |
| Mobile: Network error | Sai IP hoặc khác WiFi | Cập nhật `Mobile_app/.env`, restart Metro (`npx expo start --clear`) |
| Mobile: Không nhận được text | Whisper trả về rỗng | Nói to hơn, kiểm tra log FastAPI |
| `⚠️ AI routers skipped` | Thiếu thư viện | `pip install -r requirements.txt` |
| `command not found: uvicorn` | Chưa activate venv | `source .venv/bin/activate` |
| Không phát hiện khuôn mặt | Thiếu sáng / góc xấu | Chụp lại, nhìn thẳng, đủ ánh sáng |
| `Expo Go cần cập nhật` | SDK mismatch | Cập nhật Expo Go lên bản mới nhất |

---

## DỪNG HỆ THỐNG

```bash
# Terminal 2, 3, 4: Ctrl+C

# Dừng Docker
cd Systemhospital && docker compose down
```

> Dữ liệu PostgreSQL lưu trong `Docker_Data/postgres_data/` — **không mất** sau khi dừng.

---

## CHI TIẾT AI ENGINES

### Groq LLM — Gợi ý khoa khám
- Model: `llama-3.3-70b-versatile`
- Free tier: **14,400 request/ngày**
- Fallback tự động: keyword matching nếu Groq lỗi hoặc không có key
- Lấy API key: [console.groq.com](https://console.groq.com)

### faster-whisper — Speech-to-Text
- Model: `whisper-small` (~244MB, download 1 lần, cache local)
- Chạy hoàn toàn **offline**, không quota, không internet
- Tốc độ: ~2–5s cho đoạn 10s trên CPU

### insightface — Sinh trắc học khuôn mặt
- Model: `buffalo_sc` — ArcFace 512 chiều (~14MB)
- Backend: **onnxruntime** (không cần TensorFlow)
- Vector lưu dạng TEXT JSON trong `patients.face_vector`
- Tương lai: camera bệnh viện → embed → cosine similarity → nhận diện bệnh nhân tự động
