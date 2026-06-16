import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { checkServerHealth, login } from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<string>("");

  useEffect(() => {
    checkServerHealth().then((data) => setServerStatus(data.status));
  }, []);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
      Alert.alert("Thành công", "Đăng nhập thành công!");
    } catch {
      Alert.alert("Lỗi", "Số điện thoại hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
        style={styles.logo}
      />
      <Text style={styles.title}>MCN AI Medical</Text>

      <Text style={[styles.status, { color: serverStatus === "UP" ? "#28a745" : "#dc3545" }]}>
        {serverStatus === "UP" ? "● Hệ thống sẵn sàng" : "● Đang kết nối..."}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/register")} style={styles.linkWrap}>
        <Text style={styles.link}>Chưa có tài khoản? <Text style={styles.linkBold}>Đăng ký ngay</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  logo: { width: 100, height: 100, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 8, color: "#007AFF" },
  status: { textAlign: "center", marginBottom: 30, fontSize: 14, fontWeight: "500" },
  input: { backgroundColor: "#f0f2f5", padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: "#007AFF", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkWrap: { marginTop: 20, alignItems: "center" },
  link: { color: "#666", fontSize: 15 },
  linkBold: { color: "#007AFF", fontWeight: "bold" },
});
