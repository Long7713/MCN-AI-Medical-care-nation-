import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

export default function BookScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4FF" />

      <View style={styles.container}>
        {/* Top decorative ring */}
        <View style={styles.iconRingOuter}>
          <View style={styles.iconRingInner}>
            <Text style={styles.mainIcon}>🤖</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Đặt lịch thông minh</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Mô tả triệu chứng bằng giọng nói{"\n"}AI sẽ gợi ý chuyên khoa phù hợp
        </Text>

        {/* Feature list */}
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: "#1976D2" }]} />
            <Text style={styles.featureText}>
              Nhận diện triệu chứng bằng AI
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: "#00BCD4" }]} />
            <Text style={styles.featureText}>
              Gợi ý chuyên khoa phù hợp
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: "#00C853" }]} />
            <Text style={styles.featureText}>
              Đặt lịch nhanh trong 30 giây
            </Text>
          </View>
        </View>

        {/* Coming soon button (disabled) */}
        <TouchableOpacity
          style={styles.comingSoonBtn}
          activeOpacity={1}
          disabled={true}
        >
          <Text style={styles.comingSoonBtnText}>
            Sắp ra mắt — Ngày 3
          </Text>
        </TouchableOpacity>

        {/* Muted label */}
        <Text style={styles.mutedLabel}>Tính năng đang phát triển</Text>

        {/* Bottom decorative card */}
        <View style={styles.bottomCard}>
          <Text style={styles.bottomCardText}>
            ⚕️  Tích hợp AI y tế tiên tiến để hỗ trợ chẩn đoán và tư vấn sức khỏe chính xác nhất
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
  },

  /* Icon */
  iconRingOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,188,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 2,
    borderColor: "rgba(0,188,212,0.25)",
  },
  iconRingInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(25,118,210,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(25,118,210,0.2)",
  },
  mainIcon: {
    fontSize: 44,
  },

  /* Title */
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0D1B3E",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  /* Subtitle */
  subtitle: {
    fontSize: 15,
    color: "#607D8B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },

  /* Feature list */
  featureList: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    shadowColor: "#1976D2",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#0D1B3E",
    fontWeight: "500",
  },

  /* Coming soon button */
  comingSoonBtn: {
    backgroundColor: "#CFD8DC",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "stretch",
  },
  comingSoonBtnText: {
    color: "#78909C",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  /* Muted label */
  mutedLabel: {
    fontSize: 13,
    color: "#B0BEC5",
    fontWeight: "500",
    marginBottom: 32,
  },

  /* Bottom card */
  bottomCard: {
    alignSelf: "stretch",
    backgroundColor: "#E3F2FD",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
  },
  bottomCardText: {
    fontSize: 13,
    color: "#1565C0",
    lineHeight: 19,
    fontWeight: "500",
  },
});
