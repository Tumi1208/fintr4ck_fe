// src/pages/TransactionsPage.jsx
import { useEffect, useState } from "react";
import { apiGetTransactions, apiDeleteTransaction } from "../api/transactions";
import { apiGetCategories } from "../api/categories";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Bộ lọc
  const [filters, setFilters] = useState({
    type: "all",
    categoryId: "",
    search: "",
    // from: "", to: "" (Có thể thêm sau)
  });

  const [loading, setLoading] = useState(true);

  // Lấy danh mục để hiện trong dropdown filter
  useEffect(() => {
    apiGetCategories().then((res) => {
      setCategories(Array.isArray(res) ? res : (res.categories || []));
    });
  }, []);

  // Mỗi khi bộ lọc thay đổi thì tải lại transaction
  useEffect(() => {
    fetchTransactions();
  }, [filters]); // Dependency là filters

  async function fetchTransactions() {
    try {
      setLoading(true);
      // Gọi API với tham số lọc (Bỏ qua các param rỗng)
      const cleanFilters = {};
      if (filters.type !== "all") cleanFilters.type = filters.type;
      if (filters.categoryId) cleanFilters.categoryId = filters.categoryId;
      if (filters.search) cleanFilters.search = filters.search;

      const data = await apiGetTransactions(cleanFilters);

      // FIX QUAN TRỌNG: Kiểm tra xem data là Mảng hay Object
      const list = Array.isArray(data) ? data : (data.transactions || []);
      setTransactions(list);
    } catch (err) {
      console.error("Lỗi tải transaction:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa giao dịch này?")) return;
    try {
      await apiDeleteTransaction(id);
      await fetchTransactions(); // Tải lại sau khi xóa
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>Transaction History</h1>

      {/* --- BỘ LỌC (FILTER BAR) --- */}
      <div style={styles.filterBar}>
        {/* Lọc theo Type */}
        <select
          style={styles.select}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Lọc theo Category */}
        <select
          style={styles.select}
          value={filters.categoryId}
          onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Tìm kiếm */}
        <input
          style={styles.input}
          placeholder="Search note..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <button style={styles.primaryBtn} onClick={fetchTransactions}>
          Refresh
        </button>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div style={styles.card}>
        {loading ? (
          <p style={{ padding: 20 }}>Đang tải...</p>
        ) : transactions.length === 0 ? (
          <p style={{ padding: 20, color: "#64748B" }}>Không tìm thấy giao dịch nào.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Date</th>
                <th style={{ textAlign: "left" }}>Category</th>
                <th style={{ textAlign: "left" }}>Type</th>
                <th style={{ textAlign: "left" }}>Note</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString("vi-VN")}</td>
                  <td>
                    {t.category ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{t.category.icon || "🏷️"}</span>
                        {t.category.name}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        ...styles.tag,
                        backgroundColor: t.type === "income" ? "#DCFCE7" : "#FEE2E2",
                        color: t.type === "income" ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td>{t.note}</td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 600,
                      color: t.type === "income" ? "#10B981" : "#EF4444",
                    }}
                  >
                    {t.type === "expense" ? "-" : "+"}${t.amount.toLocaleString("en-US")}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(t._id)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: 24, marginBottom: 24, color: "#1E293B" },
  filterBar: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  select: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    minWidth: 140,
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
  },
  primaryBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    fontWeight: 600,
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden", // Để bo góc bảng đẹp hơn
    boxShadow: "0 10px 15px -3px rgb(15 23 42 / 0.12)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  tag: {
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "capitalize",
  },
  deleteBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
    opacity: 0.6,
    transition: "opacity 0.2s",
  },
};