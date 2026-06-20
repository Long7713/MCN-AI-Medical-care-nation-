import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";

const MOCK_APPOINTMENTS = [
  { id: "1", date: "18/06/2026", time: "09:00", doctor: "BS. Nguyễn Văn A", specialty: "Khoa Nội Tổng Quát", status: "Sắp diễn ra" },
  { id: "2", date: "20/06/2026", time: "14:30", doctor: "BS. Trần Thị B", specialty: "Khoa Tai Mũi Họng", status: "Chờ xác nhận" },
];

export default function AppointmentsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
      <FlatList
        data={MOCK_APPOINTMENTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateTime}>{item.time} - {item.date}</Text>
              <Text style={[styles.status, item.status === "Sắp diễn ra" ? styles.statusActive : styles.statusPending]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.doctorName}>{item.doctor}</Text>
            <Text style={styles.specialty}>{item.specialty}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có lịch hẹn nào.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#333" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  dateTime: { fontWeight: "600", color: "#007AFF" },
  status: { fontSize: 12, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: "hidden" },
  statusActive: { backgroundColor: "#e3f2fd", color: "#007AFF" },
  statusPending: { backgroundColor: "#fff3cd", color: "#ffc107" },
  doctorName: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  specialty: { color: "gray", fontSize: 14 },
  emptyText: { textAlign: "center", color: "gray", marginTop: 40 },
});
