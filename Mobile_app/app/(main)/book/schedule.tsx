import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getDepartmentSlots, createAppointment } from "../../../services/api";
import { useAuthStore } from "../../../stores/authStore";

interface TimeSlot {
  id: number;
  slotDate: string;
  startTime: string;
  isAvailable: boolean;
}

function formatDate(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ deptId: string; deptName: string }>();
  const deptId = Number(params.deptId);
  const deptName = params.deptName || "Chuyên khoa";

  const { token } = useAuthStore();

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getDepartmentSlots(deptId)
      .then((res) => {
        if (res?.data) setSlots(res.data);
      })
      .catch(() => {
        const today = new Date();
        const mock: TimeSlot[] = [];
        for (let i = 0; i < 6; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const dateStr = d.toISOString().split("T")[0];
          mock.push(
            { id: i * 2 + 1, slotDate: dateStr, startTime: "08:00", isAvailable: true },
            { id: i * 2 + 2, slotDate: dateStr, startTime: "14:00", isAvailable: i !== 1 }
          );
        }
        setSlots(mock);
      })
      .finally(() => setLoading(false));
  }, [deptId]);

  const handleBook = async () => {
    if (!selected || !token) return;
    setBooking(true);
    try {
      await createAppointment(token, { departmentId: deptId, slotId: selected });
      setSuccess(true);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || "Không thể đặt lịch. Vui lòng thử lại.");
    } finally {
      setBooking(false);
    }
  };

  const handleDone = () => {
    setSuccess(false);
    router.replace("/(main)/appointments");
  };

  const grouped = slots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
    if (!acc[slot.slotDate]) acc[slot.slotDate] = [];
    acc[slot.slotDate].push(slot);
    return acc;
  }, {});

  const groupedData = Object.entries(grouped).map(([date, items]) => ({ date, items }));

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn lịch khám</Text>
        <View style={styles.headerStep}>
          <Text style={styles.headerStepText}>3/3</Text>
        </View>
      </View>

      <View style={styles.deptBanner}>
        <Text style={styles.deptBannerIcon}>⚕️</Text>
        <Text style={styles.deptBannerName}>{deptName}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải lịch khả dụng...</Text>
        </View>
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.date}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.dateGroup}>
              <Text style={styles.dateLabel}>📅 {formatDate(item.date)}</Text>
              <View style={styles.slotsRow}>
                {item.items.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotChip,
                      !slot.isAvailable && styles.slotChipDisabled,
                      selected === slot.id && styles.slotChipSelected,
                    ]}
                    onPress={() => slot.isAvailable && setSelected(slot.id)}
                    activeOpacity={slot.isAvailable ? 0.8 : 1}
                  >
                    <Text
                      style={[
                        styles.slotTime,
                        !slot.isAvailable && styles.slotTimeDisabled,
                        selected === slot.id && styles.slotTimeSelected,
                      ]}
                    >
                      🕐 {slot.startTime}
                    </Text>
                    {!slot.isAvailable && (
                      <Text style={styles.slotFull}>Hết chỗ</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookBtn, (!selected || booking) && styles.bookBtnDisabled]}
          onPress={handleBook}
          activeOpacity={0.85}
          disabled={!selected || booking}
        >
          {booking ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.bookBtnText}>Đang đặt lịch...</Text>
            </>
          ) : (
            <Text style={styles.bookBtnText}>✅  Xác nhận đặt lịch</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={success} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successRing}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
            <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
            <Text style={styles.successDesc}>
              Lịch khám tại {deptName} đã được xác nhận.{"\n"}Chúng tôi sẽ nhắc bạn trước giờ khám.
            </Text>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>Xem lịch hẹn của tôi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F4FF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1976D2",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { padding: 4 },
  backText: { color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  headerStep: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerStepText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  deptBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#BBDEFB",
    gap: 8,
  },
  deptBannerIcon: { fontSize: 18 },
  deptBannerName: { fontSize: 14, fontWeight: "700", color: "#1565C0" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#607D8B" },

  listContent: { padding: 16, paddingBottom: 16 },

  dateGroup: { marginBottom: 20 },
  dateLabel: { fontSize: 13, fontWeight: "700", color: "#0D1B3E", marginBottom: 10 },
  slotsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  slotChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#E3EAF5",
    alignItems: "center",
    minWidth: 110,
    shadowColor: "#1976D2",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  slotChipDisabled: { backgroundColor: "#F5F5F5", borderColor: "#EEEEEE" },
  slotChipSelected: { backgroundColor: "#1976D2", borderColor: "#1976D2" },
  slotTime: { fontSize: 14, fontWeight: "700", color: "#0D1B3E" },
  slotTimeDisabled: { color: "#BDBDBD" },
  slotTimeSelected: { color: "#FFFFFF" },
  slotFull: { fontSize: 10, color: "#BDBDBD", marginTop: 2 },

  footer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E8EDF5",
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00C853",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#00C853",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  bookBtnDisabled: { backgroundColor: "#B0BEC5", shadowOpacity: 0 },
  bookBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  successRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#A5D6A7",
  },
  successIcon: { fontSize: 36 },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#0D1B3E", marginBottom: 10 },
  successDesc: {
    fontSize: 14,
    color: "#607D8B",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  doneBtn: {
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  doneBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
