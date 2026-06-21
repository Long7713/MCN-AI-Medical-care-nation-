import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { embedFace, enrollFace } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

export default function FaceEnrollScreen() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [captured, setCaptured] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator size="large" color="#1976D2" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.permBox}>
          <Text style={styles.permIcon}>📷</Text>
          <Text style={styles.permTitle}>Cần quyền camera</Text>
          <Text style={styles.permDesc}>
            Ứng dụng cần truy cập camera để đăng ký sinh trắc học khuôn mặt
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Cấp quyền camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || processing) return;
    setProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
      });

      if (!photo?.base64) throw new Error("Không chụp được ảnh");

      const embedResult = await embedFace(photo.base64);
      if (embedResult.status !== "ok" || embedResult.vector.length === 0) {
        throw new Error("Không nhận diện được khuôn mặt. Vui lòng thử lại.");
      }

      await enrollFace(token!, embedResult.vector);
      setCaptured(true);
      setTimeout(() => router.replace("/(main)/home"), 1500);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || err?.message || "Lỗi đăng ký sinh trắc học"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đăng ký khuôn mặt</Text>
        <Text style={styles.headerSub}>Nhìn thẳng vào camera và bấm chụp</Text>
      </View>

      <View style={styles.cameraWrapper}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front">
          <View style={styles.overlay}>
            <View style={styles.faceGuide}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.footer}>
        {captured ? (
          <View style={styles.successRow}>
            <Text style={styles.successText}>✅ Đăng ký thành công! Đang chuyển hướng...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.hint}>
              Giữ khuôn mặt trong khung và đảm bảo ánh sáng đủ
            </Text>
            <TouchableOpacity
              style={[styles.captureBtn, processing && styles.captureBtnDisabled]}
              onPress={handleCapture}
              disabled={processing}
              activeOpacity={0.85}
            >
              {processing ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.captureBtnText}>Đang xử lý...</Text>
                </>
              ) : (
                <Text style={styles.captureBtnText}>📸  Chụp khuôn mặt</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const CORNER_THICKNESS = 3;
const CORNER_SIZE = 28;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D1B3E" },

  header: { alignItems: "center", paddingTop: 20, paddingBottom: 16, paddingHorizontal: 24 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 6 },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.65)", textAlign: "center" },

  cameraWrapper: { flex: 1, marginHorizontal: 24, borderRadius: 24, overflow: "hidden" },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center" },

  faceGuide: { width: 220, height: 280, position: "relative" },
  corner: { position: "absolute", width: CORNER_SIZE, height: CORNER_SIZE, borderColor: "#00BCD4" },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },

  footer: { padding: 24, paddingBottom: 32, alignItems: "center", gap: 14 },
  hint: { fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center" },
  captureBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    gap: 8,
    width: "100%",
  },
  captureBtnDisabled: { backgroundColor: "#455A64" },
  captureBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  successRow: { alignItems: "center", paddingVertical: 12 },
  successText: { fontSize: 15, color: "#69F0AE", fontWeight: "700", textAlign: "center" },

  permBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  permIcon: { fontSize: 56 },
  permTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  permDesc: { fontSize: 14, color: "rgba(255,255,255,0.65)", textAlign: "center", lineHeight: 21 },
  permBtn: {
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 8,
  },
  permBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
