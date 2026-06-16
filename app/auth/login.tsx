import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { checkServerHealth } from "../../services/api";

export default function LoginScreen() {
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<string>("");

  useEffect(() => {
    checkServerHealth().then((data) => {
      setServerStatus(data.status);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. Thêm Logo (Bạn thay đường dẫn logo của bạn vào đây) */}
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

      <TextInput style={styles.input} placeholder="Tên đăng nhập" />
      <TextInput style={styles.input} placeholder="Mật khẩu" secureTextEntry />

      {/* 2. Hiệu ứng nhấn nút (ActiveOpacity làm nút mờ đi khi ấn) */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>Đăng nhập</Text>
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
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
