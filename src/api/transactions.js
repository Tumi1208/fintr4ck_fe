// src/api/transactions.js
import { authApiHelpers } from "./auth";

const { API_BASE, getAuthHeaders } = authApiHelpers;

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      query.append(key, value);
    }
  });
  const s = query.toString();
  return s ? `?${s}` : "";
}

async function handleJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Đã có lỗi xảy ra");
  return data;
}

export async function apiGetTransactions(params = {}) {
  // Thêm chống cache cho danh sách
  const res = await fetch(
    `${API_BASE}/transactions${buildQuery({ ...params, _t: Date.now() })}`,
    {
      headers: { ...getAuthHeaders() },
    }
  );
  return handleJsonResponse(res);
}

export async function apiCreateTransaction(payload) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(res);
}

export async function apiUpdateTransaction(id, payload) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(res);
}

export async function apiDeleteTransaction(id) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return handleJsonResponse(res);
}

export async function apiGetSummary() {
  // QUAN TRỌNG: Thêm timestamp để luôn lấy dữ liệu mới nhất
  const res = await fetch(`${API_BASE}/transactions/summary?_t=${Date.now()}`, {
    headers: {
      "Cache-Control": "no-cache",
      ...getAuthHeaders(),
    },
  });
  return handleJsonResponse(res);
}