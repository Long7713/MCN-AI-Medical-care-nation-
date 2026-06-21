import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { suggestDepartment, transcribeAudio } from "../../../services/api";

export default function VoiceScreen() {
  const router = useRouter();
  const [symptomText, setSymptomText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập", "Cần cấp quyền microphone để ghi âm.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordSecs(0);
      timerRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể khởi động microphone.");
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    clearInterval(timerRef.current!);
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error("no uri");

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const result = await transcribeAudio(base64);
      console.log("[Voice] API result:", JSON.stringify(result));
      if (result?.transcript) {
        setSymptomText(result.transcript);
      } else {
        Alert.alert("Thông báo", `Không nhận được text. Status: ${result?.status ?? "unknown"}`);
      }
    } catch (err: any) {
      const msg = err?.message || err?.toString() || "unknown";
      console.error("stopRecording error:", msg);
      Alert.alert("Lỗi ghi âm", msg);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMicPress = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleAnalyze = async () => {
    if (!symptomText.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập hoặc ghi âm triệu chứng.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await suggestDepartment(symptomText);
      router.push({
        pathname: "/(main)/book/specialty",
        params: { suggested: result.department, confidence: String(result.confidence), symptomText },
      });
    } catch {
      router.push({
        pathname: "/(main)/book/specialty",
        params: { suggested: "Nội Khoa", confidence: "0", symptomText },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatSecs = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mô tả triệu chứng</Text>
        <View style={styles.headerStep}>
          <Text style={styles.headerStepText}>1/3</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.instructionCard}>
          <Text style={styles.instructionIcon}>💬</Text>
          <Text style={styles.instructionText}>
            Nhập tay hoặc bấm mic để ghi âm — AI PhoBERT sẽ gợi ý chuyên khoa phù hợp
          </Text>
        </View>

        {/* Mic button */}
        <TouchableOpacity
          style={[styles.micBtn, isRecording && styles.micBtnRecording]}
          onPress={handleMicPress}
          activeOpacity={0.85}
          disabled={isTranscribing || isAnalyzing}
        >
          {isTranscribing ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Text style={styles.micBtnText}>Đang chuyển giọng nói...</Text>
            </>
          ) : isRecording ? (
            <>
              <Text style={styles.micIcon}>⏹️</Text>
              <Text style={styles.micBtnText}>Bấm để dừng</Text>
              <Text style={styles.micTimer}>{formatSecs(recordSecs)}</Text>
            </>
          ) : (
            <>
              <Text style={styles.micIcon}>🎙️</Text>
              <Text style={styles.micBtnText}>Nhấn để ghi âm</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Text input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Hoặc nhập triệu chứng</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Ví dụ: đau bụng buồn nôn tiêu chảy..."
            placeholderTextColor="#B0BEC5"
            value={symptomText}
            onChangeText={setSymptomText}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{symptomText.length} ký tự</Text>
        </View>

        {/* Quick symptoms */}
        <Text style={styles.quickLabel}>Triệu chứng thường gặp</Text>
        <View style={styles.quickRow}>
          {["Đau đầu, sốt", "Đau bụng", "Ho, khó thở", "Đau lưng", "Mất ngủ"].map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.quickChip}
              onPress={() => setSymptomText((prev) => (prev ? prev + ", " + s : s))}
            >
              <Text style={styles.quickChipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analyze button */}
        <TouchableOpacity
          style={[styles.analyzeBtn, (!symptomText.trim() || isAnalyzing || isRecording) && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          activeOpacity={0.85}
          disabled={!symptomText.trim() || isAnalyzing || isRecording}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.analyzeBtnText}>AI đang phân tích...</Text>
            </>
          ) : (
            <Text style={styles.analyzeBtnText}>🤖  Phân tích với AI  →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F4FF" },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

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

  instructionCard: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
  },
  instructionIcon: { fontSize: 20, marginRight: 10 },
  instructionText: { flex: 1, fontSize: 13, color: "#1565C0", lineHeight: 19, fontWeight: "500" },

  micBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00BCD4",
    borderRadius: 20,
    paddingVertical: 28,
    marginBottom: 20,
    gap: 8,
    shadowColor: "#00BCD4",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  micBtnRecording: { backgroundColor: "#E53935" },
  micIcon: { fontSize: 42 },
  micBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  micTimer: { color: "rgba(255,255,255,0.9)", fontSize: 24, fontWeight: "800", letterSpacing: 2 },

  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#1976D2",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  inputLabel: { fontSize: 13, fontWeight: "700", color: "#0D1B3E", marginBottom: 10 },
  textInput: {
    fontSize: 14,
    color: "#0D1B3E",
    lineHeight: 22,
    minHeight: 90,
    backgroundColor: "#F8FAFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E3EAF5",
  },
  charCount: { fontSize: 11, color: "#B0BEC5", textAlign: "right", marginTop: 6 },

  quickLabel: { fontSize: 12, fontWeight: "700", color: "#607D8B", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  quickChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  quickChipText: { fontSize: 13, color: "#1976D2", fontWeight: "600" },

  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#1976D2",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  analyzeBtnDisabled: { backgroundColor: "#B0BEC5", shadowOpacity: 0 },
  analyzeBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
