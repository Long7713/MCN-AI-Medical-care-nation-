# MCN AI — Medical Care Nation

Hệ thống hỗ trợ y tế thông minh: bệnh nhân mô tả triệu chứng bằng giọng nói hoặc văn bản, AI (PhoBERT) gợi ý khoa khám phù hợp, đặt lịch hẹn trực tiếp từ điện thoại.

---

## Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│  Mobile App (Expo React Native — SDK 54)                │
│  app/auth/login.tsx · app/auth/register.tsx             │
│  services/api.ts → gọi Backend + AI Service             │
└──────────────┬──────────────────┬───────────────────────┘
               │ :8080            │ :8000
               ▼                  ▼
┌──────────────────────┐ ┌────────────────────────────────┐
│  Spring Boot 3.4.1   │ │  FastAPI AI (Python 3.14)      │
│  Java 21 · port 8080 │ │  PhoBERT v2 · port 8000        │
│  /auth/register      │ │  /ai/suggest-department        │
│  /auth/login         │ │  /emotion/predict              │
│  /voice/transcribe   │ │  /health                       │
│  /booking/suggest-   │ └────────────────────────────────┘
│  /appointments       │
└──────────┬───────────┘
           │
┌──────────▼───────────────────────────────────────────────┐
│  Docker Infrastructure                                   │
│  PostgreSQL :5433 · Redis :6379 · RabbitMQ :5672        │
│  pgAdmin :5050 · RabbitMQ UI :15672                     │
└──────────────────────────────────────────────────────────┘
```

---

## Cấu trúc project

```
MCN-AI-Medical-care-nation-/
├── README.md
├── API_CONTRACT.md              # Contract 5 endpoint chính
├── .gitignore
├── phobert_v2/                  # Model AI (tự download, không commit)
├── Systemhospital/              # Python AI Service
│   ├── docker-compose.yml       # PostgreSQL, Redis, RabbitMQ, pgAdmin
│   ├── main.py                  # FastAPI entrypoint
│   ├── download-AI.py           # Script download model PhoBERT
│   ├── requirements.txt         # Python dependencies
│   ├── .venv/                   # Virtual environment (không commit)
│   └── router/
│       ├── Phobert.py           # POST /ai/suggest-department
│       ├── emotion.py           # POST /emotion/predict
│       └── crowd.py             # Crowd detection
├── backend/                     # Spring Boot
│   └── src/main/java/com/mcn/backend/
│       ├── BackendApplication.java
│       ├── config/
│       │   └── SecurityConfig.java    # CORS + Security rules
│       └── controller/
│           ├── AuthController.java    # /auth/register, /auth/login
│           ├── VoiceController.java   # /voice/transcribe
│           ├── BookingController.java # /booking/suggest-dept
│           └── AppointmentController.java # /appointments
├── Mobile_app/                  # Expo React Native
│   ├── app/
│   │   ├── index.tsx            # Redirect → /auth/login
│   │   ├── _layout.tsx
│   │   └── auth/
│   │       ├── login.tsx        # Màn hình đăng nhập
│   │       └── register.tsx     # Màn hình đăng ký
│   ├── services/api.ts          # HTTP client (axios)
│   ├── .env                     # Cấu hình IP (không commit)
│   └── package.json
└── Docker_Data/
    └── postgres_data/           # Dữ liệu Postgres (không commit)
```

---

## Yêu cầu cài đặt

| Công cụ | Phiên bản | Kiểm tra            |
| ------- | --------- | ------------------- |
| Docker  | 20+       | `docker --version`  |
| JDK     | 21        | `java -version`     |
| Python  | 3.10+     | `python3 --version` |
| Node.js | 18+       | `node --version`    |
| npm     | 9+        | `npm --version`     |

### Cài JDK 21 (nếu chưa có)

```bash
sudo apt-get install -y openjdk-21-jdk
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
java -version  # → openjdk 21.x.x
```

---

## SETUP LẦN ĐẦU (chỉ làm 1 lần)

### Setup Python AI Service

```bash
cd Systemhospital
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu
python download-AI.py
```

**Kết quả download model:**

```
--- HỆ THỐNG: Đang đọc mô hình từ cache... ---
--- HỆ THỐNG: Đang xuất mô hình về thư mục dự án... ---
--- HỆ THỐNG: ĐÃ ĐƯA AI VỀ THƯ MỤC DỰ ÁN THÀNH CÔNG! ---
```

### Setup Mobile App

```bash
cd Mobile_app
npm install --legacy-peer-deps
npx expo install react-native-safe-area-context react-native-screens \
  react-native-gesture-handler react-native-reanimated
```

Lấy IP WiFi máy tính:

```bash
hostname -I | awk '{print $1}'
```

Window
Ipconfig

Mở file `Mobile_app/.env` và điền IP:

```env
EXPO_PUBLIC_API_URL=http://<IP_WIFI_MAY_TINH>:8080
EXPO_PUBLIC_AI_URL=http://<IP_WIFI_MAY_TINH>:8000
```

> ⚠️ Điện thoại phải cùng mạng WiFi với máy tính.

---

## CHẠY HỆ THỐNG

Mở **4 terminal**, chạy đồng thời:

### Terminal 1 — Infrastructure

```bash
cd Systemhospital
docker compose up -d
```

**Kết quả mong đợi:**

```
✔ Container systemhospital-postgres-1   Started
✔ Container systemhospital-redis-1      Started
✔ Container systemhospital-rabbitmq-1   Started
✔ Container systemhospital-pgadmin-1    Started
```

### Terminal 2 — AI Service

```bash
cd Systemhospital
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Kết quả mong đợi:**

```
Loading weights: 100%|████████| 199/199
✅ AI routers loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 3 — Spring Boot Backend

```bash
cd backend
export JAVA_HOME=D:\Enviroment\jdks21\bin
export PATH=$JAVA_HOME/bin:$PATH
./mvnw spring-boot:run
```

**Kết quả mong đợi (chờ ~30-60 giây):**

```
HikariPool-1 - Start completed.
Tomcat started on port 8080 (http) with context path '/'
Started BackendApplication in X.XXX seconds
```

### Terminal 4 — Mobile App

```bash
cd Mobile_app
npx expo start --lan
```

**Kết quả mong đợi:**

```
env: load .env
env: export EXPO_PUBLIC_API_URL EXPO_PUBLIC_AI_URL
Starting Metro Bundler
› Metro waiting on exp://192.168.0.xxx:8081
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)
```

**Kết nối điện thoại:**

1. Tải **Expo Go** từ Play Store / App Store
2. Mở Expo Go → nhấn **"Scan QR code"**
3. Scan QR hiện trong terminal
4. App load lên điện thoại — thấy màn hình Login với badge `● Hệ thống sẵn sàng`

---

## VERIFY TOÀN BỘ HỆ THỐNG

```bash
# 1. Health check toàn bộ Spring Boot (DB + Redis + RabbitMQ)
curl http://localhost:8080/actuator/health

# 2. Stub endpoints Spring Boot (tất cả trả {} HTTP 200)
curl -s -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" -d '{"phone":"0901234567"}'

curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" -d '{"phone":"0901234567","password":"Test@1234"}'

curl -s -X POST http://localhost:8080/booking/suggest-dept \
  -H "Content-Type: application/json" -d '{"symptomText":"Tôi bị đau bụng"}'

curl -s -X POST http://localhost:8080/appointments \
  -H "Content-Type: application/json" -d '{"departmentCode":"NOI_KHOA"}'

# 3. AI Service thật (PhoBERT)
curl -s -X POST http://localhost:8000/ai/suggest-department \
  -H "Content-Type: application/json" -d '{"text":"Tôi bị đau bụng"}'

curl -s -X POST http://localhost:8000/emotion/predict \
  -H "Content-Type: application/json" -d '{"text":"Hôm nay tôi rất mệt mỏi"}'
```

**Kết quả mong đợi:**

```json
// actuator/health
{"status":"UP","components":{"db":{"status":"UP"},"redis":{"status":"UP"},"rabbit":{"status":"UP"}}}

// auth/register, auth/login, booking/suggest-dept, appointments
{}

// ai/suggest-department
{"text_input":"Tôi bị đau bụng","department":"Nội khoa","status":"AI processed successfully"}

// emotion/predict
{"text":"Hôm nay tôi rất mệt mỏi","emotion":"Vui vẻ (Mock Data)","status":"AI analyzed successfully"}
```

---

## DỪNG HỆ THỐNG

```bash
# Terminal 2, 3, 4: Ctrl+C

# Dừng Docker
cd Systemhospital && docker compose down
```

> Dữ liệu PostgreSQL lưu trong `Docker_Data/postgres_data/` — **không mất** sau `docker compose down`.

---

## THÔNG TIN KẾT NỐI

| Service         | URL                        | Thông tin                 |
| --------------- | -------------------------- | ------------------------- |
| Spring Boot API | http://localhost:8080      | —                         |
| FastAPI AI      | http://localhost:8000      | —                         |
| FastAPI Docs    | http://localhost:8000/docs | Swagger UI tự động        |
| pgAdmin         | http://localhost:5050      | admin@mcn.com / mcn12345  |
| RabbitMQ UI     | http://localhost:15672     | guest / guest             |
| PostgreSQL      | localhost:5433             | admin / mcn12345 / mcn_db |
| Redis           | localhost:6379             | —                         |
| RabbitMQ        | localhost:5672             | —                         |

---

## XEM DATABASE

**pgAdmin:**

1. Mở http://localhost:5050
2. Đăng nhập: `admin@mcn.com` / `mcn12345`
3. Add Server: Host = `postgres`, Port = `5432`, DB = `mcn_db`, User = `admin`, Pass = `mcn12345`

**Terminal:**

```bash
docker exec -it systemhospital-postgres-1 psql -U admin -d mcn_db
\dt    # danh sách bảng
\l     # danh sách database
\q     # thoát
```

---

## XỬ LÝ LỖI THƯỜNG GẶP

| Lỗi                                   | Nguyên nhân                | Cách fix                               |
| ------------------------------------- | -------------------------- | -------------------------------------- |
| `db: DOWN` trong health               | Docker chưa chạy           | `docker compose up -d`                 |
| `Address already in use :8000`        | Process cũ chưa tắt        | `kill $(lsof -ti:8000)`                |
| `Address already in use :8080`        | Spring Boot cũ chưa tắt    | `kill $(lsof -ti:8080)`                |
| `⚠️ AI routers skipped`               | Thiếu model hoặc torch     | Chạy lại Setup Python                  |
| `command not found: uvicorn`          | Chưa activate venv         | `source .venv/bin/activate`            |
| `This project requires newer Expo Go` | SDK mismatch               | Project dùng SDK 54 — cập nhật Expo Go |
| Mobile không kết nối                  | Sai IP hoặc khác mạng WiFi | Cập nhật `.env`, điện thoại cùng WiFi  |
| `403` khi gọi API                     | Spring Security            | Đã fix trong `SecurityConfig.java`     |
| `ModuleNotFoundError: transformers`   | Chưa cài pip               | `pip install -r requirements.txt`      |

---

## API CONTRACT (tóm tắt)

Chi tiết đầy đủ trong `API_CONTRACT.md`.

| Method | Endpoint                 | Service     | Auth   | Trạng thái |
| ------ | ------------------------ | ----------- | ------ | ---------- |
| POST   | `/auth/register`         | Spring Boot | Không  | Stub `{}`  |
| POST   | `/auth/login`            | Spring Boot | Không  | Stub `{}`  |
| POST   | `/voice/transcribe`      | Spring Boot | Bearer | Stub `{}`  |
| POST   | `/booking/suggest-dept`  | Spring Boot | Bearer | Stub `{}`  |
| POST   | `/appointments`          | Spring Boot | Bearer | Stub `{}`  |
| GET    | `/actuator/health`       | Spring Boot | Không  | ✅ Live    |
| POST   | `/ai/suggest-department` | FastAPI     | Không  | ✅ AI thật |
| POST   | `/emotion/predict`       | FastAPI     | Không  | ✅ AI thật |
| GET    | `/health`                | FastAPI     | Không  | ✅ Live    |

> Các Spring Boot endpoint đang là **stub** (trả `{}`). Logic thật implement ở sprint tiếp theo.
