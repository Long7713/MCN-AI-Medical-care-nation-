# MCN AI - Medical Care Nation

Hệ thống hỗ trợ y tế thông minh sử dụng AI.

---

## Yêu cầu cài đặt

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| Docker | 20+ | Để chạy Postgres, Redis, RabbitMQ |
| JDK | 21 | Bắt buộc dùng JDK (không phải JRE) |
| Maven | 3.9+ | Đã có sẵn qua `./mvnw` |

---

## Cấu trúc project

```
MCN-AI-Medical-care-nation-/
├── Systemhospital/
│   ├── docker-compose.yml   # Postgres, Redis, RabbitMQ, pgAdmin
│   ├── main.py              # AI service (Python)
│   └── router/              # Các route AI (emotion, crowd, Phobert)
├── backend/
│   ├── src/                 # Spring Boot source code
│   ├── pom.xml
│   └── mvnw
└── Docker_Data/
    └── postgres_data/       # Dữ liệu Postgres được giữ lại sau restart
```

---

## Bước 1 — Cài đặt JDK 21

> Bỏ qua nếu đã cài.

```bash
sudo apt-get install -y openjdk-21-jdk
```

Thêm vào `~/.zshrc` (hoặc `~/.bashrc`):

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

Áp dụng ngay:

```bash
source ~/.zshrc
```

Kiểm tra:

```bash
javac -version
# javac 21.x.x
```

---

## Bước 2 — Khởi động Docker (Postgres + Redis + RabbitMQ + pgAdmin)

```bash
cd Systemhospital
docker compose up -d
```

Kiểm tra các container đang chạy:

```bash
docker compose ps
```

### Thông tin các service

| Service | Port | Mô tả |
|---|---|---|
| PostgreSQL | `5433` | Database chính |
| Redis | `6379` | Cache |
| RabbitMQ | `5672` | Message queue |
| RabbitMQ UI | `15672` | Giao diện quản lý RabbitMQ |
| pgAdmin | `5050` | Giao diện quản lý PostgreSQL |

> **Lưu ý:** PostgreSQL dùng port `5433` (không phải 5432) để tránh xung đột với PostgreSQL cài local.

---

## Bước 3 — Chạy Spring Boot

```bash
cd backend

# Lần đầu hoặc sau khi mở terminal mới — cần set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

./mvnw spring-boot:run
```

Khởi động thành công khi thấy log:

```
HikariPool-1 - Start completed.
Tomcat started on port 8080 (http)
Started BackendApplication in X.XXX seconds
```

API chạy tại: **http://localhost:8080**

---

## Xem database bằng giao diện (pgAdmin)

1. Mở trình duyệt: **http://localhost:5050**
2. Đăng nhập:
   - Email: `admin@mcn.com`
   - Password: `mcn12345`
3. Thêm server mới (Add New Server):
   - **Host:** `postgres`
   - **Port:** `5432`
   - **Database:** `mcn_db`
   - **Username:** `admin`
   - **Password:** `mcn12345`

---

## Xem database bằng terminal

```bash
docker exec -it systemhospital-postgres-1 psql -U admin -d mcn_db
```

Các lệnh hữu ích trong psql:

```sql
\dt          -- xem danh sách bảng
\l           -- xem danh sách database
\q           -- thoát
```

---

## Dừng hệ thống

```bash
# Dừng Spring Boot
Ctrl + C

# Dừng Docker
cd Systemhospital
docker compose down
```

> Dữ liệu Postgres được lưu trong `Docker_Data/postgres_data/` — không mất khi `docker compose down`.

---

## Thông tin kết nối

```
DB URL:      jdbc:postgresql://localhost:5433/mcn_db
DB User:     admin
DB Password: mcn12345
Redis:       localhost:6379
RabbitMQ:    localhost:5672
API Port:    8080
```
