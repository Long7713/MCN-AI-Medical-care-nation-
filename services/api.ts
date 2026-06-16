import axios from "axios";

// Lấy URL từ file .env (Đảm bảo file .env của bạn có dòng: EXPO_PUBLIC_API_URL=http://192.168.1.18:8080)
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Dữ liệu giả (Mock data) dùng để làm giao diện khi Backend chưa chạy
const mockHealth = { status: "UP", message: "Server giả lập đang chạy!" };

export const checkServerHealth = async () => {
  try {
    // Thử gọi API thật tới Backend của TV2
    if (!API_URL) throw new Error("API_URL chưa được cấu hình");

    const response = await axios.get(`${API_URL}/actuator/health`);
    return response.data;
  } catch (error) {
    // Nếu kết nối lỗi, trả về dữ liệu giả để giao diện không bị treo
    console.warn("⚠️ Không kết nối được Backend, đang sử dụng Mock data!");
    return mockHealth;
  }
};
