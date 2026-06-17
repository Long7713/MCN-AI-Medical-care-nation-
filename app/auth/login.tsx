import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { checkServerHealth } from "../../services/api";
import { useAuthStore } from "../../stores/authStore"; // 1. Thêm import store
import axios from "axios";
import { useRouter } from "expo-router"; // 2. Thêm import router

export default function LoginScreen() {
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<string>("");

  // 3. Thêm state để lưu thông tin người dùng nhập vào
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuth } = useAuthStore(); // Hook lấy hàm lưu token
  const router = useRouter(); // Hook để chuyển trang

  useEffect(() => {
    checkServerHealth().then((data) => {
      setServerStatus(data.status);
      setLoading(false);
    });
  }, []);

  // 4. Viết hàm xử lý logic Đăng nhập
const handleLogin = async () => {
  if (!username.trim() || !password.trim()) {
    Alert.alert("Thông báo", "Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
    return;
  }

  setIsSubmitting(true);
  try {
    // 1. Gọi API đăng nhập thực tế đến backend (Sử dụng cấu hình axios từ Ngày 1)
    // Giả định endpoint backend của dự án là /auth/login theo tài liệu tài liệu MH_AI_KH_Ngay2
    const response = await axios.post("http://10.0.2.2:8080/auth/login", {
      username: username.trim(),
      password: password,
    });

    // 2. Kiểm tra cấu trúc phản hồi từ Backend
    if (response.data && response.data.token) {
      const { token, user } = response.data;

      // 3. Lưu thông tin đăng nhập vào Zustand Store (Zustand sẽ tự đẩy vào AsyncStorage)
      await setAuth(token, user);

      Alert.alert("Thành công", "Đăng nhập ứng dụng thành công!", [
        {
          text: "OK",
          onPress: () => {
            // 4. Chuyển hướng ngay lập tức sang phân hệ chính (Main Dashboard)
            router.replace("/(main)/home");
          },
        },
      ]);
    } else {
      Alert.alert("Lỗi đăng nhập", "Cấu trúc phản hồi từ server không hợp lệ.");
    }
  } catch (error: any) {
    console.error("❌ Login Error:", error);

    // Xử lý thông báo lỗi thân thiện dựa trên HTTP Status Code
    const errorMessage =
      error.response?.data?.message ||
      "Tài khoản hoặc mật khẩu không chính xác, vui lòng thử lại!";

    Alert.alert("Đăng nhập thất bại", errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={{
          uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        }}
        style={styles.logo}
      />

      <Text style={styles.title}>Chào mừng MH AI</Text>

      <Text
        style={[
          styles.status,
          { color: serverStatus === "UP" ? "#28a745" : "#dc3545" },
        ]}
      >
        {serverStatus === "UP"
          ? "● Hệ thống sẵn sàng"
          : "● Hệ thống đang bảo trì"}
      </Text>

      {/* 5. Gắn value và onChangeText vào các ô Input */}
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />

      {/* 6. Cập nhật nút bấm: Hiển thị hiệu ứng loading và gọi hàm handleLogin */}
      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        activeOpacity={0.7}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 20, alignSelf: "center" }}
        onPress={() => router.push("/auth/register")}
        activeOpacity={0.6}
      >
        <Text style={{ color: "#007AFF", fontSize: 15, fontWeight: "600" }}>
          Chưa có tài khoản? Đăng ký ngay
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  logo: { width: 100, height: 100, alignSelf: "center", marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  status: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f0f2f5",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    height: 56, // Cố định chiều cao để không bị giật khi hiện Loading
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#a0cfff",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
