// src/api/transactions.js
// Các hàm gọi API giao dịch để FE dùng

const API_BASE = import.meta.env.VITE_API_BASE;

// Hàm nhỏ để gắn header Authorization nếu có token
function getAuthHeader() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchTransactions() {
  const res = await fetch(`${API_BASE}/transactions`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Không lấy được danh sách giao dịch");
  }

  return res.json();
}

export async function createTransaction(payload) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Không thêm được giao dịch");
  }

  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Không xóa được giao dịch");
  }

  return res.json();
}
