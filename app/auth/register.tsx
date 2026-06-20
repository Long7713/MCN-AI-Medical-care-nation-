import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { register, login } from "../../services/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ họ tên, số điện thoại và mật khẩu");
      return;
    }
    if (!/^0[0-9]{9}$/.test(phone.trim())) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ (VD: 0901234567)");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không trùng khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        gender: "OTHER",
      });
      const loginResult = await login(phone.trim(), password);
      await setAuth(loginResult.data.accessToken, loginResult.data.user);
      router.replace("/(main)/home");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      Alert.alert("Lỗi đăng ký", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
      <Text style={styles.subtitle}>Điền thông tin để bắt đầu trải nghiệm MH AI</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên *"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại * (VD: 0901234567)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email (không bắt buộc)"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu * (tối thiểu 8 ký tự)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu *"
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

      <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/auth/login")}>
        <Text style={styles.loginLinkText}>Đã có tài khoản? Đăng nhập ngay</Text>
      </TouchableOpacity>
    </ScrollView>
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
