import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { register } from "../../services/api";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    password: "", dateOfBirth: "", gender: "MALE",
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.fullName || !form.phone || !form.password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ họ tên, số điện thoại và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.", [
        { text: "OK", onPress: () => router.replace("/auth/login") },
      ]);
    } catch {
      Alert.alert("Lỗi", "Đăng ký thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo tài khoản</Text>

      <TextInput style={styles.input} placeholder="Họ và tên *" value={form.fullName} onChangeText={set("fullName")} />
      <TextInput style={styles.input} placeholder="Số điện thoại *" keyboardType="phone-pad" value={form.phone} onChangeText={set("phone")} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={form.email} onChangeText={set("email")} />
      <TextInput style={styles.input} placeholder="Mật khẩu *" secureTextEntry value={form.password} onChangeText={set("password")} />
      <TextInput style={styles.input} placeholder="Ngày sinh (yyyy-MM-dd)" value={form.dateOfBirth} onChangeText={set("dateOfBirth")} />

      <View style={styles.genderRow}>
        {["MALE", "FEMALE", "OTHER"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
            onPress={() => set("gender")(g)}
          >
            <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>
              {g === "MALE" ? "Nam" : g === "FEMALE" ? "Nữ" : "Khác"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.linkWrap}>
        <Text style={styles.link}>Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 24, color: "#007AFF" },
  input: { backgroundColor: "#f0f2f5", padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  genderBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: "#ddd", alignItems: "center" },
  genderBtnActive: { borderColor: "#007AFF", backgroundColor: "#e8f2ff" },
  genderText: { color: "#666", fontWeight: "600" },
  genderTextActive: { color: "#007AFF" },
  button: { backgroundColor: "#007AFF", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkWrap: { marginTop: 20, alignItems: "center" },
  link: { color: "#666", fontSize: 15 },
  linkBold: { color: "#007AFF", fontWeight: "bold" },
});
