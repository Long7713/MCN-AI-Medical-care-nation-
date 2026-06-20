import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Blue Hero Header */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>
                Xin chào,
              </Text>
              <Text style={styles.heroName}>
                {user?.fullName || "Người dùng"} 👋
              </Text>
              <Text style={styles.heroSubtitle}>
                Bạn cần hỗ trợ gì hôm nay?
              </Text>
            </View>

            {/* AI Pulse Indicator */}
            <View style={styles.pulseContainer}>
              {/* Outer ring */}
              <View style={styles.pulseOuter}>
                {/* Inner ring */}
                <View style={styles.pulseInner}>
                  <Text style={styles.pulseIcon}>🤖</Text>
                </View>
              </View>
              <Text style={styles.pulseLabel}>AI đang{"\n"}hoạt động</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>24/7</Text>
              <Text style={styles.heroStatLabel}>Hỗ trợ</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>AI</Text>
              <Text style={styles.heroStatLabel}>Phân tích</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>⚕️</Text>
              <Text style={styles.heroStatLabel}>Y tế</Text>
            </View>
          </View>
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>Dịch vụ</Text>

        {/* Card: Đặt lịch khám */}
        <TouchableOpacity
          style={styles.featureCard}
          activeOpacity={0.85}
          onPress={() => router.push("/(main)/book")}
        >
          <View style={styles.cardLeftStripe} />
          <View style={styles.cardBody}>
            <View style={styles.cardRow}>
              <Text style={styles.cardIcon}>🩺</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Đặt lịch khám</Text>
                <Text style={styles.cardDesc}>
                  Mô tả triệu chứng — AI gợi ý khoa phù hợp
                </Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>🤖 AI powered</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card: Lịch hẹn của tôi */}
        <TouchableOpacity
          style={[styles.featureCard, styles.featureCardTeal]}
          activeOpacity={0.85}
          onPress={() => router.push("/(main)/appointments")}
        >
          <View style={[styles.cardLeftStripe, styles.cardLeftStripeTeal]} />
          <View style={styles.cardBody}>
            <View style={styles.cardRow}>
              <Text style={styles.cardIcon}>📋</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Lịch hẹn của tôi</Text>
                <Text style={styles.cardDesc}>
                  Xem và quản lý lịch khám sắp tới
                </Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </View>
            <View style={[styles.cardBadge, styles.cardBadgeTeal]}>
              <Text style={[styles.cardBadgeText, styles.cardBadgeTextTeal]}>
                📅 Quản lý lịch hẹn
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>⚕️ Lưu ý sức khỏe</Text>
          <Text style={styles.infoCardText}>
            Hệ thống AI y tế đang phân tích các triệu chứng và đề xuất
            chuyên khoa phù hợp nhất cho bạn.
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },

  /* Hero */
  hero: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    shadowColor: "#1976D2",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  heroGreeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  heroName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },

  /* Pulse Indicator */
  pulseContainer: {
    alignItems: "center",
  },
  pulseOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,188,212,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,188,212,0.4)",
  },
  pulseInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,188,212,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseIcon: {
    fontSize: 20,
  },
  pulseLabel: {
    fontSize: 10,
    color: "#00BCD4",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "600",
    lineHeight: 13,
  },

  /* Hero Stats */
  heroStatsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
  },
  heroStatNum: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroStatLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },

  /* Section */
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#607D8B",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 24,
  },

  /* Feature Cards */
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    shadowColor: "#1976D2",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
  },
  featureCardTeal: {},
  cardLeftStripe: {
    width: 4,
    backgroundColor: "#1976D2",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardLeftStripeTeal: {
    backgroundColor: "#00BCD4",
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D1B3E",
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 13,
    color: "#607D8B",
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 22,
    color: "#B0BEC5",
    fontWeight: "300",
    marginLeft: 8,
  },
  cardBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardBadgeTeal: {
    backgroundColor: "#E0F7FA",
  },
  cardBadgeText: {
    fontSize: 11,
    color: "#1976D2",
    fontWeight: "600",
  },
  cardBadgeTextTeal: {
    color: "#00838F",
  },

  /* Info Card */
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#00C853",
    shadowColor: "#1976D2",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D1B3E",
    marginBottom: 6,
  },
  infoCardText: {
    fontSize: 13,
    color: "#607D8B",
    lineHeight: 19,
  },

  /* Logout */
  logoutBtn: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 15,
    color: "#FF6D00",
    fontWeight: "600",
  },
});
