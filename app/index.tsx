// app/index.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export default function Index() {
  const { token, loadFromStorage } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Chờ hệ thống đọc dữ liệu token cũ từ AsyncStorage lên bộ nhớ tạm
    loadFromStorage().finally(() => {
      setIsReady(true);
    });
  }, []);

  // Nếu chưa quét dữ liệu xong, hiển thị màn hình chờ thay vì Redirect sai luồng
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Phân luồng chính xác sau khi đã có trạng thái token thực tế
  return token ? (
    <Redirect href="/(main)/home" />
  ) : (
    <Redirect href="/auth/login" />
  );
}
