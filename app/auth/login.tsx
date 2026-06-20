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
import { useRouter } from "expo-router";
import { checkServerHealth, login } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverStatus, setServerStatus] = useState<string>("");

  useEffect(() => {
    checkServerHealth().then((data) => setServerStatus(data.status));
  }, []);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ số điện thoại và mật khẩu!");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(phone.trim(), password);
      await setAuth(result.data.accessToken, result.data.user);
      router.replace("/(main)/home");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Số điện thoại hoặc mật khẩu không chính xác!";
      Alert.alert("Đăng nhập thất bại", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
        style={styles.logo}
      />
      <Text style={styles.title}>Chào mừng MH AI</Text>
      <Text style={[styles.status, { color: serverStatus === "UP" ? "#28a745" : "#dc3545" }]}>
        {serverStatus === "UP" ? "● Hệ thống sẵn sàng" : "● Hệ thống đang bảo trì"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
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
