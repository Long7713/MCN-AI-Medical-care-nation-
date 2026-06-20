import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { getMyAppointments } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

interface Appointment {
  id: number;
  slotDate: string;
  startTime: string;
  departmentName: string;
  status: string;
  note?: string;
}

const STATUS_MAP: Record<string, { label: string; stripe: string; badgeBg: string; badgeText: string }> = {
  CONFIRMED: { label: "Xác nhận", stripe: "#1976D2", badgeBg: "#E3F2FD", badgeText: "#1976D2" },
  COMPLETED: { label: "Hoàn thành", stripe: "#00C853", badgeBg: "#E8F5E9", badgeText: "#2E7D32" },
  CANCELLED: { label: "Đã hủy", stripe: "#FF6D00", badgeBg: "#FFF3E0", badgeText: "#FF6D00" },
};

function getStatusColors(status: string) {
  return STATUS_MAP[status] ?? { label: status, stripe: "#607D8B", badgeBg: "#ECEFF1", badgeText: "#607D8B" };
}

function formatDate(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

function AppointmentCard({ item }: { item: Appointment }) {
  const colors = getStatusColors(item.status);
  return (
    <View style={styles.card}>
      <View style={[styles.cardStripe, { backgroundColor: colors.stripe }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.dateTime, { color: colors.stripe }]}>
            🕐 {item.startTime}  •  {formatDate(item.slotDate)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[styles.statusBadgeText, { color: colors.badgeText }]}>
              {colors.label}
            </Text>
          </View>
        </View>
        <Text style={styles.specialty}>⚕️  {item.departmentName}</Text>
        {item.note ? <Text style={styles.note}>📝 {item.note}</Text> : null}
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
      <Text style={styles.emptyDesc}>Bấm "Đặt lịch khám" để đặt lịch với bác sĩ</Text>
    </View>
  );
}

export default function AppointmentsScreen() {
  const { token } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async (showLoading = true) => {
    if (!token) { setLoading(false); return; }
    if (showLoading) setLoading(true);
    try {
      const res = await getMyAppointments(token);
      if (res?.data) setAppointments(res.data);
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4FF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
        <Text style={styles.headerSubtitle}>
          {appointments.length} lịch hẹn
        </Text>
      </View>

      <View style={styles.summaryRow}>
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <View key={key} style={[styles.summaryChip, { backgroundColor: val.badgeBg }]}>
            <View style={[styles.summaryDot, { backgroundColor: val.stripe }]} />
            <Text style={styles.summaryChipText}>{val.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <AppointmentCard item={item} />}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1976D2"]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F4FF" },

  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#1976D2" },
  headerSubtitle: { fontSize: 13, color: "#607D8B", marginTop: 2 },

  summaryRow: { flexDirection: "row", gap: 10, paddingHorizontal: 24, marginTop: 12, marginBottom: 16 },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryChipText: { fontSize: 12, fontWeight: "600", color: "#607D8B" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },

  listContent: { paddingHorizontal: 20, paddingBottom: 32 },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#1976D2",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
  },
  cardStripe: { width: 4, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  cardContent: { flex: 1, padding: 16 },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateTime: { fontSize: 13, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  specialty: { fontSize: 14, color: "#0D1B3E", fontWeight: "600", marginBottom: 3 },
  note: { fontSize: 12, color: "#90A4AE", marginTop: 2 },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0D1B3E", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#607D8B", textAlign: "center", lineHeight: 20 },
});
