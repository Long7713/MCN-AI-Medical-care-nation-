# API Contract — MCN AI Medical Care Nation

Base URL: `http://localhost:8080`  
Content-Type: `application/json`  
Auth: Bearer JWT (trừ `/auth/*`)

---

## 1. POST /auth/register

Đăng ký tài khoản bệnh nhân mới.

### Request Body
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "nguyenvana@gmail.com",
  "password": "Abcd@1234",
  "dateOfBirth": "1990-05-20",
  "gender": "MALE"
}
```

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| fullName | string | ✅ | 2–100 ký tự |
| phone | string | ✅ | 10 số, định dạng VN |
| email | string | ✅ | unique |
| password | string | ✅ | min 8 ký tự, có chữ hoa + số + ký tự đặc biệt |
| dateOfBirth | string | ✅ | ISO 8601: `yyyy-MM-dd` |
| gender | string | ✅ | `MALE` \| `FEMALE` \| `OTHER` |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "userId": "uuid-1234",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "nguyenvana@gmail.com",
    "createdAt": "2026-06-17T10:00:00Z"
  }
}
```

### Response `400 Bad Request`
```json
{
  "success": false,
  "message": "Email đã tồn tại",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "timestamp": "2026-06-17T10:00:00Z"
}
```

---

## 2. POST /auth/login

Đăng nhập, trả về JWT token.

### Request Body
```json
{
  "phone": "0901234567",
  "password": "Abcd@1234"
}
```

| Field | Type | Required |
|---|---|---|
| phone | string | ✅ |
| password | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "userId": "uuid-1234",
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@gmail.com"
    }
  }
}
```

### Response `401 Unauthorized`
```json
{
  "success": false,
  "message": "Số điện thoại hoặc mật khẩu không đúng",
  "errorCode": "INVALID_CREDENTIALS",
  "timestamp": "2026-06-17T10:00:00Z"
}
```

---

## 3. POST /voice/transcribe

Nhận file âm thanh giọng nói, trả về văn bản triệu chứng.  
**Content-Type:** `multipart/form-data`

### Request (multipart)
| Field | Type | Required | Ghi chú |
|---|---|---|---|
| audio | file | ✅ | `.wav` / `.mp3` / `.m4a`, max 10MB |
| language | string | ❌ | mặc định `vi` (tiếng Việt) |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "transcript": "Tôi bị đau bụng và buồn nôn khoảng 2 ngày nay",
    "language": "vi",
    "confidence": 0.94,
    "durationSeconds": 5.2
  }
}
```

### Response `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Không nhận diện được giọng nói, vui lòng thử lại",
  "errorCode": "TRANSCRIPTION_FAILED",
  "timestamp": "2026-06-17T10:00:00Z"
}
```

---

## 4. POST /booking/suggest-dept

Phân tích triệu chứng bằng AI (PhoBERT v2) và gợi ý khoa khám phù hợp.  
Spring Boot gọi nội bộ Python AI service tại `POST /ai/suggest-department`.

### Request Body
```json
{
  "symptomText": "Tôi bị đau bụng và buồn nôn khoảng 2 ngày nay",
  "patientAge": 34
}
```

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| symptomText | string | ✅ | Tối thiểu 5 ký tự |
| patientAge | integer | ❌ | Hỗ trợ gợi ý chính xác hơn |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "symptomText": "Tôi bị đau bụng và buồn nôn khoảng 2 ngày nay",
    "suggestedDepartments": [
      {
        "rank": 1,
        "departmentCode": "NOI_TIEU_HOA",
        "departmentName": "Nội Tiêu Hóa",
        "confidence": 0.87
      },
      {
        "rank": 2,
        "departmentCode": "NOI_KHOA",
        "departmentName": "Nội Khoa",
        "confidence": 0.72
      }
    ],
    "aiModel": "phobert-v2",
    "processingTimeMs": 320
  }
}
```

### Response `503 Service Unavailable`
```json
{
  "success": false,
  "message": "Dịch vụ AI tạm thời không khả dụng",
  "errorCode": "AI_SERVICE_UNAVAILABLE",
  "timestamp": "2026-06-17T10:00:00Z"
}
```

---

## 5. POST /appointments

Đặt lịch khám bệnh.  
**Yêu cầu:** `Authorization: Bearer <accessToken>`

### Request Body
```json
{
  "departmentCode": "NOI_TIEU_HOA",
  "doctorId": "doc-uuid-5678",
  "appointmentDate": "2026-06-20",
  "timeSlot": "09:00",
  "symptomNote": "Đau bụng, buồn nôn 2 ngày",
  "appointmentType": "FIRST_VISIT"
}
```

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| departmentCode | string | ✅ | Lấy từ `/booking/suggest-dept` |
| doctorId | string | ❌ | Nếu không chọn, hệ thống tự phân bổ |
| appointmentDate | string | ✅ | ISO 8601: `yyyy-MM-dd`, ít nhất ngày mai |
| timeSlot | string | ✅ | `HH:mm`, trong giờ làm việc 07:00–17:00 |
| symptomNote | string | ❌ | max 500 ký tự |
| appointmentType | string | ✅ | `FIRST_VISIT` \| `RE_VISIT` |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Đặt lịch thành công",
  "data": {
    "appointmentId": "appt-uuid-9999",
    "appointmentCode": "MCN-20260620-001",
    "status": "CONFIRMED",
    "patient": {
      "userId": "uuid-1234",
      "fullName": "Nguyễn Văn A"
    },
    "department": {
      "code": "NOI_TIEU_HOA",
      "name": "Nội Tiêu Hóa"
    },
    "doctor": {
      "doctorId": "doc-uuid-5678",
      "fullName": "BS. Trần Thị B"
    },
    "appointmentDate": "2026-06-20",
    "timeSlot": "09:00",
    "appointmentType": "FIRST_VISIT",
    "createdAt": "2026-06-17T10:05:00Z"
  }
}
```

### Response `409 Conflict`
```json
{
  "success": false,
  "message": "Khung giờ này đã được đặt, vui lòng chọn khung giờ khác",
  "errorCode": "TIME_SLOT_UNAVAILABLE",
  "timestamp": "2026-06-17T10:05:00Z"
}
```

---

## HTTP Status Codes

| Code | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu đầu vào không hợp lệ |
| 401 | Chưa xác thực / token hết hạn |
| 403 | Không có quyền truy cập |
| 409 | Xung đột dữ liệu |
| 422 | Không thể xử lý (AI/transcribe thất bại) |
| 503 | Service tạm thời không khả dụng |

## Error Response Format (chuẩn chung)

```json
{
  "success": false,
  "message": "Mô tả lỗi bằng tiếng Việt",
  "errorCode": "SNAKE_CASE_ERROR_CODE",
  "timestamp": "2026-06-17T10:00:00Z"
}
```
