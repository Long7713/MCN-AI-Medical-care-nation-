// app/(main)/book/index.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        🤖 Tính năng Đặt lịch khám (AI Chatbot) đang được phát triển cho Ngày 3!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
});
