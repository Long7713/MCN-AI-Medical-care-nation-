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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getDepartments } from "../../../services/api";

interface Department {
  id: number;
  name: string;
  description: string;
  location: string;
}

const DEPT_ICONS: Record<string, string> = {
  "Nội": "🫀",
  "Ngoại": "🔪",
  "Tai": "👂",
  "Mắt": "👁️",
  "Nhi": "👶",
  "Da": "🧴",
  "Thần": "🧠",
  "Tim": "❤️",
};

function deptIcon(name: string) {
  for (const [key, icon] of Object.entries(DEPT_ICONS)) {
    if (name.includes(key)) return icon;
  }
  return "⚕️";
}

export default function SpecialtyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ suggested: string; confidence: string; symptomText: string }>();
  const suggested = params.suggested || "Nội Khoa";
  const confidence = parseFloat(params.confidence || "0");
  const symptomText = params.symptomText || "";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    getDepartments()
      .then((res) => {
        if (res?.data) setDepartments(res.data);
      })
      .catch(() => {
        setDepartments([
          { id: 1, name: "Khoa Nội Tổng Quát", description: "Khám và điều trị bệnh nội khoa", location: "Tầng 2, Tòa A" },
          { id: 2, name: "Khoa Ngoại Tổng Hợp", description: "Phẫu thuật và điều trị ngoại khoa", location: "Tầng 3, Tòa B" },
          { id: 3, name: "Khoa Tai Mũi Họng", description: "Khám và điều trị bệnh tai mũi họng", location: "Tầng 2, Tòa C" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = () => {
    const dept = departments.find((d) => d.id === selected);
    if (!dept) return;
    router.push({
      pathname: "/(main)/book/schedule",
      params: { deptId: String(dept.id), deptName: dept.name },
    });
  };

  const renderItem = ({ item }: { item: Department }) => {
    const isAiSuggested = item.name.toLowerCase() === suggested.toLowerCase();
    const isSelected = selected === item.id;

    return (
      <TouchableOpacity
        style={[styles.deptCard, isSelected && styles.deptCardSelected]}
        onPress={() => setSelected(item.id)}
        activeOpacity={0.85}
      >
        {isAiSuggested && (
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>🤖 AI gợi ý</Text>
          </View>
        )}
        <View style={styles.deptRow}>
          <View style={[styles.deptIconBox, isSelected && styles.deptIconBoxSelected]}>
            <Text style={styles.deptIconText}>{deptIcon(item.name)}</Text>
          </View>
          <View style={styles.deptInfo}>
            <Text style={[styles.deptName, isSelected && styles.deptNameSelected]}>
              {item.name}
            </Text>
            <Text style={styles.deptDesc}>{item.description}</Text>
            <Text style={styles.deptLocation}>📍 {item.location}</Text>
          </View>
          <View style={[styles.radio, isSelected && styles.radioSelected]}>
            {isSelected && <View style={styles.radioDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn chuyên khoa</Text>
        <View style={styles.headerStep}>
          <Text style={styles.headerStepText}>2/3</Text>
        </View>
      </View>

      <View style={styles.aiBanner}>
        <View style={styles.aiBannerLeft}>
          <Text style={styles.aiBannerIcon}>🤖</Text>
        </View>
        <View style={styles.aiBannerContent}>
          <Text style={styles.aiBannerTitle}>AI gợi ý: {suggested}</Text>
          <Text style={styles.aiBannerSub} numberOfLines={1}>
            {confidence > 0 ? `Độ tin cậy: ${(confidence * 100).toFixed(1)}%  •  ` : ""}Dựa trên: "{symptomText}"
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải danh sách khoa...</Text>
        </View>
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeader}>Tất cả chuyên khoa</Text>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!selected}
        >
          <Text style={styles.confirmBtnText}>Chọn lịch khám  →</Text>
        </TouchableOpacity>
      </View>
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

  aiBanner: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderBottomWidth: 1,
    borderBottomColor: "#C8E6C9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  aiBannerLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A5D6A7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  aiBannerIcon: { fontSize: 20 },
  aiBannerContent: { flex: 1 },
  aiBannerTitle: { fontSize: 14, fontWeight: "700", color: "#1B5E20" },
  aiBannerSub: { fontSize: 12, color: "#388E3C", marginTop: 1 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#607D8B" },

  listContent: { padding: 16, paddingBottom: 16 },
  listHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#607D8B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  deptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#1976D2",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  deptCardSelected: { borderColor: "#1976D2", backgroundColor: "#F0F7FF" },

  aiTag: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  aiTagText: { fontSize: 11, color: "#2E7D32", fontWeight: "700" },

  deptRow: { flexDirection: "row", alignItems: "center" },
  deptIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  deptIconBoxSelected: { backgroundColor: "#BBDEFB" },
  deptIconText: { fontSize: 24 },

  deptInfo: { flex: 1 },
  deptName: { fontSize: 15, fontWeight: "700", color: "#0D1B3E", marginBottom: 3 },
  deptNameSelected: { color: "#1976D2" },
  deptDesc: { fontSize: 12, color: "#90A4AE", marginBottom: 4 },
  deptLocation: { fontSize: 12, color: "#607D8B", fontWeight: "500" },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#B0BEC5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  radioSelected: { borderColor: "#1976D2" },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#1976D2" },

  footer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E8EDF5",
  },
  confirmBtn: {
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#1976D2",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  confirmBtnDisabled: { backgroundColor: "#B0BEC5", shadowOpacity: 0 },
  confirmBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
