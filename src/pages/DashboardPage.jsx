// src/pages/DashboardPage.jsx
// Trang dashboard: lấy danh sách giao dịch, hiển thị và thêm giao dịch mới

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000/api/v1";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]); // luôn cố gắng giữ là array
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "expense",
    category: "",
    amount: "",
    note: "",
  });

  // Lấy token từ localStorage (trong code login có thể dùng token hoặc fintr4ck_token)
  const token =
    localStorage.getItem("fintr4ck_token") || localStorage.getItem("token");

  // Nếu chưa có token thì đá về /login
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  function getAuthHeaders() {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Lấy danh sách giao dịch từ API
  async function fetchTransactions() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/transactions`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Không lấy được danh sách giao dịch (status ${res.status})`);
      }

      const data = await res.json();

      // Backend trả về { data: [...] }, nên ta lấy data.data
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      setTransactions(list);
    } catch (err) {
      console.error("fetchTransactions error:", err);
      setError(err.message || "Đã có lỗi khi tải giao dịch");
    } finally {
      setLoading(false);
    }
  }

  // Lần đầu vào trang thì tải dữ liệu
  useEffect(() => {
    if (!token) return;
    fetchTransactions();
  }, [token]);

  // Tính tổng thu / chi / số dư ngay trên FE
  function calcSummary() {
    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
      if (!tx) continue;
      if (tx.type === "income") income += tx.amount || 0;
      if (tx.type === "expense") expense += tx.amount || 0;
    }

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }

  const summary = calcSummary();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Thêm giao dịch mới
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const amountNumber = Number(form.amount);
    if (!amountNumber || amountNumber <= 0) {
      setError("Số tiền phải lớn hơn 0");
      return;
    }

    const payload = {
      type: form.type,
      category:
        form.category || (form.type === "income" ? "Thu khác" : "Chi khác"),
      amount: amountNumber,
      date: form.date,
      note: form.note,
    };

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.message || `Không tạo được giao dịch (status ${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();
      const created = data.data || data;

      // Thêm giao dịch mới vào đầu danh sách
      setTransactions((prev) => [created, ...prev]);

      // Reset form (trừ date + type)
      setForm((prev) => ({
        ...prev,
        category: "",
        amount: "",
        note: "",
      }));
    } catch (err) {
      console.error("handleSubmit error:", err);
      setError(err.message || "Đã có lỗi khi tạo giao dịch");
    } finally {
      setSaving(false);
    }
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN").format(value || 0);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={{ margin: 0 }}>Fintr4ck Dashboard</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7a90" }}>
            Quản lý thu chi cá nhân đơn giản
          </p>
        </header>

        {/* Summary */}
        <section style={styles.summaryRow}>
          <div style={{ ...styles.summaryCard, borderTopColor: "#2e7d32" }}>
            <p style={styles.summaryLabel}>Tổng thu</p>
            <p style={styles.summaryValue}>
              {formatMoney(summary.totalIncome)} đ
            </p>
          </div>
          <div style={{ ...styles.summaryCard, borderTopColor: "#c62828" }}>
            <p style={styles.summaryLabel}>Tổng chi</p>
            <p style={styles.summaryValue}>
              {formatMoney(summary.totalExpense)} đ
            </p>
          </div>
          <div style={{ ...styles.summaryCard, borderTopColor: "#1565c0" }}>
            <p style={styles.summaryLabel}>Số dư</p>
            <p style={styles.summaryValue}>{formatMoney(summary.balance)} đ</p>
          </div>
        </section>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.mainGrid}>
          {/* Form */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Thêm giao dịch</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <label style={styles.label}>Ngày</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Loại</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="income">Thu</option>
                  <option value="expense">Chi</option>
                </select>
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Danh mục</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder={
                    form.type === "income"
                      ? "Lương, thưởng..."
                      : "Ăn uống, di chuyển..."
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Số tiền</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Ví dụ: 150000"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Ghi chú</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={2}
                  style={{ ...styles.input, resize: "vertical" }}
                  placeholder="Ví dụ: ăn trưa với bạn"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={styles.submitButton}
              >
                {saving ? "Đang lưu..." : "Lưu giao dịch"}
              </button>
            </form>
          </section>

          {/* Danh sách */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Lịch sử giao dịch</h2>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : !Array.isArray(transactions) || transactions.length === 0 ? (
              <p>Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên.</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Ngày</th>
                      <th style={styles.th}>Loại</th>
                      <th style={styles.th}>Danh mục</th>
                      <th style={styles.th}>Số tiền</th>
                      <th style={styles.th}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td style={styles.td}>
                          {tx.date
                            ? new Date(tx.date).toLocaleDateString("vi-VN")
                            : ""}
                        </td>
                        <td style={styles.td}>
                          {tx.type === "income" ? "Thu" : "Chi"}
                        </td>
                        <td style={styles.td}>{tx.category}</td>
                        <td
                          style={{
                            ...styles.td,
                            color:
                              tx.type === "income" ? "#2e7d32" : "#c62828",
                            fontWeight: 600,
                          }}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatMoney(tx.amount)} đ
                        </td>
                        <td style={styles.td}>{tx.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#eef5ff",
    padding: "24px 0",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px",
  },
  header: {
    marginBottom: 20,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 4,
    borderTopStyle: "solid",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
  },
  summaryLabel: {
    margin: 0,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6b7a90",
  },
  summaryValue: {
    margin: "6px 0 0",
    fontSize: 20,
    fontWeight: 700,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.4fr",
    gap: 20,
    alignItems: "flex-start",
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 6px 24px rgba(15,23,42,0.06)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 16,
  },
  formRow: {
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
  },
  input: {
    borderRadius: 8,
    border: "1px solid #d0d7e2",
    padding: "8px 10px",
    fontSize: 14,
    outline: "none",
  },
  submitButton: {
    marginTop: 8,
    width: "100%",
    padding: "10px 0",
    borderRadius: 8,
    border: "none",
    background: "#1e88e5",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  tableWrapper: {
    maxHeight: 380,
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    padding: "8px 6px",
    position: "sticky",
    top: 0,
    background: "#f8fafc",
  },
  td: {
    borderBottom: "1px solid #edf2f7",
    padding: "6px 6px",
    verticalAlign: "top",
  },
  errorBox: {
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    background: "#ffebee",
    color: "#c62828",
    fontSize: 14,
  },
};
