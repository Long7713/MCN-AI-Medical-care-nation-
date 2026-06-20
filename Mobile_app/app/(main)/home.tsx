import React from "react";
import { Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Xin chào, {user?.fullName || "Người dùng"} 👋</Text>
      <Text style={styles.subtitle}>Bạn cần hỗ trợ gì hôm nay?</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push("/(main)/book")}>
        <Text style={styles.cardTitle}>🤖 Đặt lịch khám</Text>
        <Text style={styles.cardDesc}>Mô tả triệu chứng — AI gợi ý khoa phù hợp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push("/(main)/appointments")}>
        <Text style={styles.cardTitle}>📅 Lịch hẹn của tôi</Text>
        <Text style={styles.cardDesc}>Xem và quản lý lịch khám sắp tới</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, { backgroundColor: "#fff3cd" }]} onPress={logout}>
        <Text style={styles.cardTitle}>🚪 Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  content: { padding: 24 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 24 },
  card: {
    backgroundColor: "#fff", padding: 20, borderRadius: 16,
    marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6, color: "#333" },
  cardDesc: { fontSize: 14, color: "#666" },
});
