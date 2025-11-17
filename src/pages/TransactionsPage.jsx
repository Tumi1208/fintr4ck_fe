// src/pages/TransactionsPage.jsx
import { useEffect, useState } from "react";
import { apiGetTransactions, apiDeleteTransaction } from "../api/transactions";
import { apiGetCategories } from "../api/categories";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State riêng cho ô tìm kiếm để xử lý độ trễ (Debounce)
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [filters, setFilters] = useState({
    type: "all",
    categoryId: "",
  });

  // 1. Lấy danh mục (Chạy 1 lần đầu)
  useEffect(() => {
    apiGetCategories().then((res) => {
      setCategories(Array.isArray(res) ? res : (res.categories || []));
    });
  }, []);

  // 2. Logic tìm kiếm thông minh (Debounce)
  // Khi người dùng gõ, chờ 500ms rồi mới gọi API fetchTransactions
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 500); // Độ trễ 0.5s giúp không gọi API liên tục

    return () => clearTimeout(timer);
  }, [searchTerm, filters]); // Chạy lại khi gõ phím hoặc đổi filter dropdown

  async function fetchTransactions() {
    try {
      setLoading(true);
      const cleanFilters = {};
      
      if (filters.type !== "all") cleanFilters.type = filters.type;
      if (filters.categoryId) cleanFilters.categoryId = filters.categoryId;
      
      // Gửi searchTerm xuống backend để nó tự lo liệu (tìm trong note, amount, date...)
      if (searchTerm) cleanFilters.search = searchTerm;

      const data = await apiGetTransactions(cleanFilters);
      // Đảm bảo luôn nhận về mảng
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
      fetchTransactions(); // Tải lại sau khi xóa
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>Transaction History</h1>

      <div style={styles.filterBar}>
        {/* Dropdown Type */}
        <select
          style={styles.select}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Dropdown Category */}
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

        {/* Ô TÌM KIẾM PRO */}
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Tìm ngày (17/11), danh mục (xăng), ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Nút X để xóa nhanh */}
          {searchTerm && (
            <button 
              style={styles.clearBtn} 
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Nút Refresh */}
        <button style={styles.refreshBtn} onClick={fetchTransactions} title="Reload data">
          🔄
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <p style={{ padding: 20, textAlign: "center", color: "#64748B" }}>Searching...</p>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            Không tìm thấy giao dịch nào phù hợp.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingLeft: 24 }}>Date</th>
                <th style={{ textAlign: "left" }}>Category</th>
                <th style={{ textAlign: "left" }}>Type</th>
                <th style={{ textAlign: "left" }}>Note</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center", paddingRight: 24 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} style={styles.tr}>
                  <td style={{ paddingLeft: 24 }}>
                    {new Date(t.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    {t.category ? (
                      <span style={styles.catBadge}>
                        <span>{t.category.icon || "🏷️"}</span>
                        {t.category.name}
                      </span>
                    ) : (
                      <span style={{ color: "#94A3B8" }}>-</span>
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
                      {t.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td style={{ color: "#334155" }}>{t.note}</td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 600,
                      color: t.type === "income" ? "#10B981" : "#EF4444",
                    }}
                  >
                    {t.type === "expense" ? "-" : "+"}${t.amount.toLocaleString("en-US")}
                  </td>
                  <td style={{ textAlign: "center", paddingRight: 24 }}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(t._id)}
                      title="Delete"
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
  pageTitle: { fontSize: 24, marginBottom: 24, color: "#1E293B", fontWeight: 700 },
  filterBar: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.05)",
    alignItems: "center",
    flexWrap: "wrap",
  },
  select: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    minWidth: 140,
    outline: "none",
    backgroundColor: "#F8FAFC",
    fontSize: 14,
    cursor: "pointer",
    color: "#334155",
  },
  searchWrapper: {
    flex: 2, // Ô tìm kiếm chiếm nhiều chỗ hơn
    position: "relative",
    display: "flex",
    alignItems: "center",
    minWidth: 200,
  },
  searchInput: {
    width: "100%",
    padding: "10px 36px 10px 36px", // Chừa chỗ cho icon trái phải
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    outline: "none",
    backgroundColor: "#F8FAFC",
    fontSize: 14,
    transition: "all 0.2s",
    color: "#334155",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    opacity: 0.5,
    fontSize: 14,
    pointerEvents: "none",
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    border: "none",
    background: "transparent",
    color: "#94A3B8",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: "bold",
    padding: 4,
  },
  refreshBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    fontSize: 16,
    color: "#64748B",
    transition: "all 0.2s",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgb(15 23 42 / 0.05)",
    border: "1px solid #F1F5F9",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  tr: {
    borderBottom: "1px solid #F1F5F9",
    height: 60,
    transition: "background 0.1s",
  },
  tag: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  catBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 10px",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    border: "1px solid #F1F5F9",
    fontSize: 13,
    color: "#475569",
    fontWeight: 500,
  },
  deleteBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
    opacity: 0.4,
    transition: "opacity 0.2s",
  },
};