// src/api/reports.js
import { authApiHelpers } from "./auth";

const { API_BASE, getAuthHeaders } = authApiHelpers;

async function handleJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Đã có lỗi xảy ra");
  return data;
}

export async function apiGetExpenseBreakdown() {
  const res = await fetch(`${API_BASE}/reports/expense-breakdown`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleJsonResponse(res);
}
