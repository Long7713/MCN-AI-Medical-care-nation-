import { Tabs } from "expo-router";

export default function MainLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#007AFF" }}>
      <Tabs.Screen name="home" options={{ title: "Trang chủ", tabBarIcon: () => null }} />
      <Tabs.Screen name="book/index" options={{ title: "Đặt lịch", tabBarIcon: () => null }} />
      <Tabs.Screen name="appointments" options={{ title: "Lịch hẹn", tabBarIcon: () => null }} />
    </Tabs>
  );
}
