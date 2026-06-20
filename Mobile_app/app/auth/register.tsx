import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { register, login } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "MALE",
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.fullName || !form.phone || !form.password) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ họ tên, số điện thoại và mật khẩu"
      );
      return;
    }
    setLoading(true);
    try {
      await register(form);
      const loginResult = await login(form.phone, form.password);
      await setAuth(loginResult.data.accessToken, loginResult.data.user);
      router.replace("/(main)/home");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
    { value: "OTHER", label: "Khác" },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* Blue Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng Ký</Text>
        <Text style={styles.headerSubtitle}>⚕️ MH AI Medical</Text>
      </View>

      {/* Form */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Full Name */}
        <Text style={styles.label}>Họ và tên *</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#B0BEC5"
            value={form.fullName}
            onChangeText={set("fullName")}
          />
        </View>

        {/* Phone */}
        <Text style={styles.label}>Số điện thoại *</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#B0BEC5"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={set("phone")}
          />
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ email"
            placeholderTextColor="#B0BEC5"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={set("email")}
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Mật khẩu *</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#B0BEC5"
            secureTextEntry
            value={form.password}
            onChangeText={set("password")}
          />
        </View>

        {/* Date of Birth */}
        <Text style={styles.label}>Ngày sinh</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="yyyy-MM-dd  (vd: 1990-05-20)"
            placeholderTextColor="#B0BEC5"
            value={form.dateOfBirth}
            onChangeText={set("dateOfBirth")}
          />
        </View>

        {/* Gender Selector */}
        <Text style={styles.label}>Giới tính</Text>
        <View style={styles.genderRow}>
          {genderOptions.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[
                styles.genderBtn,
                form.gender === g.value && styles.genderBtnActive,
              ]}
              onPress={() => set("gender")(g.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.genderText,
                  form.gender === g.value && styles.genderTextActive,
                ]}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tạo tài khoản</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={() => router.back()} style={styles.linkWrap}>
          <Text style={styles.link}>
            Đã có tài khoản?{" "}
            <Text style={styles.linkBold}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>

        {/* AI Badge */}
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>
            🤖 Thông tin được bảo mật bằng AI
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: "#1976D2",
    height: 120,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: "flex-end",
    shadowColor: "#1976D2",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 20,
  },
  backBtnText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },

  /* Form */
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
    paddingBottom: 40,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#607D8B",
    marginBottom: 6,
    marginLeft: 2,
    letterSpacing: 0.3,
  },

  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF6",
    marginBottom: 16,
    shadowColor: "#1976D2",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0D1B3E",
  },

  /* Gender */
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E3EAF6",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  genderBtnActive: {
    borderColor: "#1976D2",
    backgroundColor: "#E3F2FD",
  },
  genderText: {
    color: "#607D8B",
    fontWeight: "600",
    fontSize: 14,
  },
  genderTextActive: {
    color: "#1976D2",
  },

  /* Button */
  button: {
    backgroundColor: "#1976D2",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
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
    backgroundColor: "#FFFFFF",
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
