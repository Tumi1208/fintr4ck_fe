// src/api/categories.js
import { authApiHelpers } from "./auth";

const { API_BASE, getAuthHeaders } = authApiHelpers;

async function handleJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  
  // LOG DATA TRẢ VỀ ĐỂ KIỂM TRA
  console.log(`[API Response] ${res.url}:`, data);

  if (!res.ok) throw new Error(data.message || "Đã có lỗi xảy ra");
  return data;
}

export async function apiGetCategories() {
  // Thêm timestamp để tránh browser cache
  const res = await fetch(`${API_BASE}/categories?_t=${new Date().getTime()}`, {
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      ...getAuthHeaders(),
    },
  });
  return handleJsonResponse(res);
}

export async function apiCreateCategory(payload) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(res);
}

export async function apiUpdateCategory(id, payload) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(res);
}

export async function apiDeleteCategory(id) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleJsonResponse(res);
}