import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";

const MOCK_APPOINTMENTS = [
  {
    id: "1",
    date: "18/06/2026",
    time: "09:00",
    doctor: "BS. Nguyễn Văn A",
    specialty: "Khoa Nội Tổng Quát",
    status: "Sắp diễn ra",
  },
  {
    id: "2",
    date: "20/06/2026",
    time: "14:30",
    doctor: "BS. Trần Thị B",
    specialty: "Khoa Tai Mũi Họng",
    status: "Chờ xác nhận",
  },
];

type Appointment = (typeof MOCK_APPOINTMENTS)[number];

function getStatusStyle(status: string) {
  if (status === "Sắp diễn ra") {
    return {
      stripe: "#1976D2",
      badgeBg: "#E3F2FD",
      badgeText: "#1976D2",
    };
  }
  return {
    stripe: "#FF6D00",
    badgeBg: "#FFF3E0",
    badgeText: "#FF6D00",
  };
}

function AppointmentCard({ item }: { item: Appointment }) {
  const colors = getStatusStyle(item.status);

  return (
    <View style={styles.card}>
      {/* Left colored stripe */}
      <View style={[styles.cardStripe, { backgroundColor: colors.stripe }]} />

      {/* Card content */}
      <View style={styles.cardContent}>
        {/* Top row: date+time | status badge */}
        <View style={styles.cardTopRow}>
          <Text style={[styles.dateTime, { color: colors.stripe }]}>
            🕐 {item.time}  •  {item.date}
          </Text>
          <View
            style={[styles.statusBadge, { backgroundColor: colors.badgeBg }]}
          >
            <Text style={[styles.statusBadgeText, { color: colors.badgeText }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Doctor */}
        <Text style={styles.doctorName}>{item.doctor}</Text>

        {/* Specialty */}
        <Text style={styles.specialty}>⚕️  {item.specialty}</Text>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
      <Text style={styles.emptyDesc}>
        Bấm "Đặt lịch khám" để đặt lịch với bác sĩ
      </Text>
    </View>
  );
}

export default function AppointmentsScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4FF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
        <Text style={styles.headerSubtitle}>
          {MOCK_APPOINTMENTS.length} lịch hẹn sắp tới
        </Text>
      </View>

      {/* Summary chips */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryChip, styles.summaryChipBlue]}>
          <View
            style={[styles.summaryDot, { backgroundColor: "#1976D2" }]}
          />
          <Text style={styles.summaryChipText}>Sắp diễn ra</Text>
        </View>
        <View style={[styles.summaryChip, styles.summaryChipOrange]}>
          <View
            style={[styles.summaryDot, { backgroundColor: "#FF6D00" }]}
          />
          <Text style={styles.summaryChipText}>Chờ xác nhận</Text>
        </View>
      </View>

      <FlatList
        data={MOCK_APPOINTMENTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard item={item} />}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },

  /* Header */
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1976D2",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#607D8B",
    marginTop: 2,
  },

  /* Summary chips */
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 16,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  summaryChipBlue: {
    backgroundColor: "#E3F2FD",
  },
  summaryChipOrange: {
    backgroundColor: "#FFF3E0",
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#607D8B",
  },

  /* List */
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  /* Card */
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
  cardStripe: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 13,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D1B3E",
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: "#607D8B",
    fontWeight: "500",
  },

  /* Empty State */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B3E",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#607D8B",
    textAlign: "center",
    lineHeight: 20,
  },
});
