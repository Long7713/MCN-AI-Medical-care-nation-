import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  user: { userId: number; fullName: string } | null;
  setAuth: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: async (token, user) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  logout: async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    set({ token: null, user: null });
  },
  loadFromStorage: async () => {
    const token = await AsyncStorage.getItem("token");
    const userStr = await AsyncStorage.getItem("user");
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) });
    }
  },
}));
