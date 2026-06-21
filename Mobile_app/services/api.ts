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

export const getDepartments = async () => {
  const res = await backendClient.get("/departments");
  return res.data;
};

export const getDepartmentSlots = async (deptId: number) => {
  const res = await backendClient.get(`/departments/${deptId}/slots`);
  return res.data;
};

export const createAppointment = async (
  token: string,
  body: { departmentId: number; slotId: number; note?: string }
) => {
  const res = await backendClient.post("/appointments", body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMyAppointments = async (token: string) => {
  const res = await backendClient.get("/appointments/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ── Systemhospital AI (FastAPI :8000) ────────────────────────

export const suggestDepartment = async (symptomText: string): Promise<{ department: string; confidence: number; all: any[] }> => {
  try {
    if (!AI_URL) throw new Error("EXPO_PUBLIC_AI_URL chưa được cấu hình");
    const res = await aiClient.post("/ai/suggest-department", { text: symptomText });
    const top = res.data?.suggested_departments?.[0];
    return {
      department: top?.department ?? "Nội Khoa",
      confidence: top?.confidence ?? 0,
      all: res.data?.suggested_departments ?? [],
    };
  } catch {
    console.warn("⚠️ AI service không khả dụng");
    return { department: "Nội Khoa", confidence: 0, all: [] };
  }
};

export const transcribeAudio = async (audioBase64: string) => {
  const res = await aiClient.post("/voice/transcribe", { audioBase64 });
  return res.data as { transcript: string; status: string };
};

export const predictEmotion = async (text: string) => {
  const res = await aiClient.post("/emotion/predict", { text });
  return res.data;
};

// ── Face Biometric ────────────────────────────────────────────

export const embedFace = async (imageBase64: string) => {
  const res = await aiClient.post("/face/embed", { imageBase64 });
  return res.data as { vector: number[]; dims: number; status: string };
};

export const enrollFace = async (token: string, faceVector: number[]) => {
  const res = await backendClient.post(
    "/auth/face-enroll",
    { faceVector },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data as { success: boolean; message: string };
};
