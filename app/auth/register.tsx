import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  // State quản lý dữ liệu đầu vào
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm xử lý Logic Đăng ký
  const handleRegister = async () => {
    // Validate cơ bản tại client
    if (!fullName.trim() || !username.trim() || !password.trim()) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không trùng khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      // Giả lập gọi API register thành công cho Ngày 2
      // Khi nối API thật, chỗ này sẽ là: const res = await axios.post('/auth/register', {...})
      const mockResponse = {
        data: {
          accessToken: "mock_jwt_token_day_2",
          user: {
            userId: 2,
            fullName: fullName,
          },
        },
      };

      // Tự động đăng nhập luôn sau khi đăng ký thành công
      await setAuth(mockResponse.data.accessToken, mockResponse.data.user);

      Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
        {
          text: "OK",
          onPress: () => {
            // Chuyển thẳng vào khu vực chức năng chính (Màn hình Home)
            router.replace("/(main)/home");
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
      <Text style={styles.subtitle}>
        Điền thông tin để bắt đầu trải nghiệm MH AI
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        activeOpacity={0.7}
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.loginLinkText}>
          Đã có tài khoản? Đăng nhập ngay
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#f0f2f5",
    padding: 16,
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
    height: 56,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#a0cfff",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "500",
  },
});
