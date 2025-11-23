// src/api/auth.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api/v1";
console.log("API_BASE =", API_BASE);

function getAuthHeaders() {
  const token = localStorage.getItem("fintr4ck_token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function handleJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Đã có lỗi xảy ra");
  }
  return data;
}

export async function apiRegister({ name, email, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  return handleJsonResponse(res);
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleJsonResponse(res);
}

export async function apiGetMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleJsonResponse(res);
}

// helper dùng chung
export const authApiHelpers = { getAuthHeaders, API_BASE };
