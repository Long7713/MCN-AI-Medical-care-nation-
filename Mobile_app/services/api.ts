import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const AI_URL = process.env.EXPO_PUBLIC_AI_URL;

const backendClient = axios.create({ baseURL: API_URL, timeout: 10000 });
const aiClient = axios.create({ baseURL: AI_URL, timeout: 15000 });

// ── Backend (Spring Boot :8080) ──────────────────────────────

export const checkServerHealth = async () => {
  try {
    if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL chưa được cấu hình");
    const res = await backendClient.get("/actuator/health");
    return res.data;
  } catch {
    console.warn("⚠️ Không kết nối được Backend, dùng mock data");
    return { status: "DOWN" };
  }
};

export const register = async (body: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: string;
}) => {
  const res = await backendClient.post("/auth/register", body);
  return res.data;
};

export const login = async (phone: string, password: string) => {
  const res = await backendClient.post("/auth/login", { phone, password });
  return res.data;
};

export const createAppointment = async (body: object) => {
  const res = await backendClient.post("/appointments", body);
  return res.data;
};

// ── Systemhospital AI (FastAPI :8000) ────────────────────────

export const suggestDepartment = async (symptomText: string) => {
  try {
    if (!AI_URL) throw new Error("EXPO_PUBLIC_AI_URL chưa được cấu hình");
    const res = await aiClient.post("/ai/suggest-department", { text: symptomText });
    return res.data;
  } catch {
    console.warn("⚠️ AI service không khả dụng");
    return { department: "Nội Khoa", status: "mock" };
  }
};

export const predictEmotion = async (text: string) => {
  const res = await aiClient.post("/emotion/predict", { text });
  return res.data;
};
