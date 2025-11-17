// src/api/users.js
import { authApiHelpers } from "./auth";

const { API_BASE, getAuthHeaders } = authApiHelpers;

async function handleJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Đã có lỗi xảy ra");
  return data;
}

export async function apiUpdateProfile(payload) {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(res);
}

export async function apiChangePassword(payload) {
  const res = await fetch(`${API_BASE}/users/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(res);
}

export async function apiDeleteMe() {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleJsonResponse(res);
}
