// src/pages/TransactionsPage.jsx
import { useEffect, useState } from "react";
import { apiGetTransactions, apiDeleteTransaction } from "../api/transactions";
import { apiGetCategories } from "../api/categories";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";

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
      <div style={styles.pageHead}>
        <div>
          <p style={styles.kicker}>Nhật ký giao dịch</p>
          <h1 style={styles.title}>Transactions</h1>
          <p style={styles.lead}>Tìm kiếm, lọc và thao tác nhanh trên tất cả giao dịch.</p>
        </div>
        <Badge tone="info">{transactions.length} kết quả</Badge>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <div style={styles.filterBar}>
          <select
            style={styles.select}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">Tất cả</option>
            <option value="income">Thu nhập</option>
            <option value="expense">Chi tiêu</option>
          </select>

          <select
            style={styles.select}
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <div style={{ flex: 1 }}>
            <InputField
              placeholder="Tìm ngày, danh mục, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              rightSlot={searchTerm ? "⨉" : "🔍"}
              onRightSlotClick={searchTerm ? () => setSearchTerm("") : undefined}
            />
          </div>

          <Button variant="ghost" style={{ padding: "12px 14px" }} onClick={fetchTransactions} title="Tải lại">
            🔄
          </Button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Đang tìm kiếm...</p>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            Không tìm thấy giao dịch nào phù hợp.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingLeft: 18 }}>Ngày</th>
                <th style={{ textAlign: "left" }}>Danh mục</th>
                <th style={{ textAlign: "left" }}>Loại</th>
                <th style={{ textAlign: "left" }}>Ghi chú</th>
                <th style={{ textAlign: "right" }}>Số tiền</th>
                <th style={{ textAlign: "center", paddingRight: 18 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} style={styles.tr}>
                  <td style={{ paddingLeft: 18, color: "var(--text-strong)" }}>
                    {new Date(t.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    {t.category ? (
                      <span style={styles.catBadge}>
                        <span>{t.category.icon || "🏷️"}</span>
                        {t.category.name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>-</span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        ...styles.tag,
                        backgroundColor:
                          t.type === "income" ? "rgba(34,197,94,0.16)" : "rgba(248,113,113,0.16)",
                        color: t.type === "income" ? "#bbf7d0" : "#fecdd3",
                        borderColor: t.type === "income" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
                      }}
                    >
                      {t.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{t.note}</td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                      color: t.type === "income" ? "#4ade80" : "#f87171",
                    }}
                  >
                    {t.type === "expense" ? "-" : "+"}${t.amount.toLocaleString("en-US")}
                  </td>
                  <td style={{ textAlign: "center", paddingRight: 18 }}>
                    <Button variant="danger" style={{ padding: "8px 12px" }} onClick={() => handleDelete(t._id)}>
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

const styles = {
  pageHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  kicker: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid var(--border-soft)",
    color: "var(--text-muted)",
    fontSize: 12,
  },
  title: { margin: "8px 0 4px", color: "var(--text-strong)", fontSize: 26, letterSpacing: -0.3 },
  lead: { margin: 0, color: "var(--text-muted)" },
  filterBar: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, alignItems: "center" },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.05)",
    color: "var(--text-strong)",
    fontSize: 14,
    outline: "none",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14, color: "var(--text-strong)" },
  tr: { borderBottom: "1px solid rgba(148,163,184,0.12)", height: 60 },
  tag: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid transparent",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "capitalize",
  },
  catBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    backgroundColor: "rgba(226,232,240,0.06)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(148,163,184,0.18)",
    fontSize: 13,
    color: "var(--text-strong)",
    fontWeight: 600,
  },
};
