import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

export default function BookScreen() {
  const router = useRouter();

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

        <Text style={styles.title}>Đặt lịch thông minh</Text>
        <Text style={styles.subtitle}>
          Mô tả triệu chứng — AI gợi ý chuyên khoa{"\n"}phù hợp và đặt lịch trong 30 giây
        </Text>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <View style={styles.step}>
            <View style={[styles.stepNum, { backgroundColor: "#1976D2" }]}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Mô tả triệu chứng</Text>
              <Text style={styles.stepDesc}>Nhập hoặc nói bằng giọng nói</Text>
            </View>
          </View>
          <View style={styles.stepDivider} />
          <View style={styles.step}>
            <View style={[styles.stepNum, { backgroundColor: "#00BCD4" }]}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>AI phân tích</Text>
              <Text style={styles.stepDesc}>Gợi ý chuyên khoa phù hợp</Text>
            </View>
          </View>
          <View style={styles.stepDivider} />
          <View style={styles.step}>
            <View style={[styles.stepNum, { backgroundColor: "#00C853" }]}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Chọn lịch & xác nhận</Text>
              <Text style={styles.stepDesc}>Chọn khung giờ và đặt ngay</Text>
            </View>
          </View>
        </View>

        {/* Start button */}
        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => router.push("/(main)/book/voice")}
        >
          <Text style={styles.startBtnText}>🎙️  Bắt đầu đặt lịch</Text>
        </TouchableOpacity>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomCardText}>
            ⚕️  Tích hợp AI PhoBERT để phân tích triệu chứng và đề xuất chuyên khoa chính xác nhất
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F4FF" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
  },

  iconRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,188,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(0,188,212,0.25)",
  },
  iconRingInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(25,118,210,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(25,118,210,0.2)",
  },
  mainIcon: { fontSize: 38 },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0D1B3E",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#607D8B",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },

  stepsCard: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#1976D2",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  step: { flexDirection: "row", alignItems: "center" },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  stepNumText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: "700", color: "#0D1B3E" },
  stepDesc: { fontSize: 12, color: "#90A4AE", marginTop: 1 },
  stepDivider: {
    width: 2,
    height: 16,
    backgroundColor: "#EEF2FF",
    marginLeft: 15,
    marginVertical: 6,
  },

  startBtn: {
    alignSelf: "stretch",
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#1976D2",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  startBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  bottomCard: {
    alignSelf: "stretch",
    backgroundColor: "#E3F2FD",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
  },
  bottomCardText: { fontSize: 12, color: "#1565C0", lineHeight: 18, fontWeight: "500" },
});
