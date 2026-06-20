import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { checkServerHealth, login } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<string>("");

  useEffect(() => {
    checkServerHealth().then((data) => setServerStatus(data.status));
  }, []);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const result = await login(phone, password);
      await setAuth(result.data.accessToken, result.data.user);
      router.replace("/(main)/home");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Số điện thoại hoặc mật khẩu không đúng";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const isUp = serverStatus === "UP";

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />

      {/* Hero / Header Section */}
      <View style={styles.hero}>
        {/* Server Status Dot */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isUp ? "#00C853" : "#FF6D00" },
            ]}
          />
          <Text style={styles.statusText}>
            {isUp ? "Hệ thống sẵn sàng" : "Đang kết nối..."}
          </Text>
        </View>

        {/* Brand */}
        <Text style={styles.brandIcon}>⚕️</Text>
        <Text style={styles.brandName}>MH AI</Text>
        <Text style={styles.brandSubtitle}>Medical Health AI</Text>
        <Text style={styles.brandTagline}>
          Chăm sóc sức khỏe thông minh cùng trí tuệ nhân tạo
        </Text>
      </View>

      {/* White Card Form */}
      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đăng nhập</Text>
          <Text style={styles.cardSubtitle}>
            Vui lòng nhập thông tin tài khoản
          </Text>

          {/* Phone Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>📱</Text>
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              placeholderTextColor="#B0BEC5"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#B0BEC5"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => router.push("/auth/register")}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>
              Chưa có tài khoản?{" "}
              <Text style={styles.linkBold}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>

          {/* AI Badge */}
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>
              🤖 Được hỗ trợ bởi AI y tế
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D1B3E",
  },

  /* Hero */
  hero: {
    flex: 0.45,
    backgroundColor: "#0D1B3E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  statusRow: {
    position: "absolute",
    top: 52,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#B0C4DE",
    fontSize: 12,
    fontWeight: "500",
  },
  brandIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00BCD4",
    letterSpacing: 1,
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 13,
    color: "#B0C4DE",
    textAlign: "center",
    lineHeight: 18,
  },

  /* Card */
  cardScroll: {
    flex: 0.55,
    backgroundColor: "#F0F4FF",
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 28,
    shadowColor: "#1976D2",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginTop: -2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0D1B3E",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#607D8B",
    marginBottom: 24,
  },

  /* Inputs */
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF6",
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  inputPrefix: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#0D1B3E",
  },

  /* Button */
  button: {
    backgroundColor: "#1976D2",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#1976D2",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* Links */
  linkWrap: {
    marginTop: 20,
    alignItems: "center",
  },
  link: {
    color: "#607D8B",
    fontSize: 14,
  },
  linkBold: {
    color: "#1976D2",
    fontWeight: "700",
  },

  /* AI Badge */
  aiBadge: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F0F4FF",
    borderRadius: 20,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#E3EAF6",
  },
  aiBadgeText: {
    fontSize: 12,
    color: "#607D8B",
    fontWeight: "500",
  },
});
