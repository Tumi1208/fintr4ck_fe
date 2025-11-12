// Gọi API auth qua axios, tự động gắn token nếu có

// Debug lỗi không chuyển trang
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api/v1";
console.log("API_BASE =", API_BASE); // debug: xem FE đang gọi về đâu

const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("fintr4ck_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function apiRegister({ name, email, password }) {
  console.log("apiRegister() được gọi với", { name, email }); // debug
  const res = await http.post("/auth/register", { name, email, password });
  return res.data;
}

export async function apiLogin({ email, password }) {
  console.log("apiLogin() được gọi với", { email }); // debug
  const res = await http.post("/auth/login", { email, password });
  return res.data;
}

export async function apiMe() {
  const res = await http.get("/auth/me");
  return res.data.user;
}
console.log("API_BASE =", import.meta.env.VITE_API_BASE || "http://localhost:4000/api/v1");

