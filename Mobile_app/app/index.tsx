import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export default function Index() {
  const { token, loadFromStorage } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadFromStorage().finally(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return token ? <Redirect href="/(main)/home" /> : <Redirect href="/auth/login" />;
}
