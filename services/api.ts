import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080";
const AI_URL = process.env.EXPO_PUBLIC_AI_URL || "http://10.0.2.2:8000";

const backendClient = axios.create({ baseURL: API_URL, timeout: 10000 });
const aiClient = axios.create({ baseURL: AI_URL, timeout: 15000 });

export const checkServerHealth = async () => {
  try {
    const res = await backendClient.get("/actuator/health");
    return res.data;
  } catch {
    return { status: "DOWN" };
  }
};

export const register = async (body: {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  dateOfBirth?: string | null;
  gender?: string;
}) => {
  const res = await backendClient.post("/auth/register", body);
  return res.data;
};

export const login = async (phone: string, password: string) => {
  const res = await backendClient.post("/auth/login", { phone, password });
  return res.data;
};

export const suggestDepartment = async (symptomText: string) => {
  try {
    const res = await aiClient.post("/ai/suggest-department", { text: symptomText });
    return res.data;
  } catch {
    return { suggested_departments: [], status: "unavailable" };
  }
};
