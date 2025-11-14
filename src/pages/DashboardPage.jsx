// src/pages/DashboardPage.jsx
// Trang dashboard Day 3: xem + thêm giao dịch cơ bản

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export default function DashboardPage() {
  const navigate = useNavigate();

  // state lưu danh sách giao dịch
  const [transactions, setTransactions] = useState([]);
  // state lưu thống kê
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  // state form thêm giao dịch mới
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    type: "income", // income | expense
    category: "",
    amount: "",
    note: ""
  });
  // state cho loading + lỗi
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Lấy token từ localStorage (token đã lưu sau khi login Day 2)
  const token = localStorage.getItem("fintr4ck_token");

  // Nếu không có token thì đưa về trang login
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Hàm tiện ích: header kèm Bearer token
  function getAuthHeaders() {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }

  // Gọi API lấy danh sách giao dịch
  async function fetchTransactions() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/transactions`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Không lấy được danh sách giao dịch (status ${res.status})`);
      }

      const data = await res.json();
      // Giả sử backend trả về mảng giao dịch
      setTransactions(data);
    } catch (err) {
      console.error("fetchTransactions error", err);
      setError(err.message || "Đã có lỗi khi tải giao dịch");
    } finally {
      setLoading(false);
    }
  }

  // Gọi API lấy thống kê (tổng thu, tổng chi, số dư)
  async function fetchSummary() {
    try {
      const res = await fetch(`${API_URL}/transactions/summary`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Không lấy được thống kê (status ${res.status})`);
      }

      const data = await res.json();
      // Giả sử backend trả về { totalIncome, totalExpense, balance }
      setSummary({
        totalIncome: data.totalIncome || 0,
        totalExpense: data.totalExpense || 0,
        balance: data.balance || 0
      });
    } catch (err) {
      console.error("fetchSummary error", err);
      // Không cần setError lớn, chỉ log, vì dashboard vẫn dùng được
    }
  }

  // Khi component mount -> gọi API lần đầu
  useEffect(() => {
    if (!token) return;
    fetchTransactions();
    fetchSummary();
  }, [token]);

  // Xử lý thay đổi input form
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  // Submit form tạo giao dịch mới
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Chuyển amount sang số
    const amountNumber = Number(form.amount);
    if (!amountNumber || amountNumber <= 0) {
      setError("Số tiền phải lớn hơn 0");
      return;
    }

    const payload = {
      date: form.date,
      type: form.type,
      category: form.category || (form.type === "income" ? "Thu khác" : "Chi khác"),
      amount: amountNumber,
      note: form.note
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || `Tạo giao dịch thất bại (status ${res.status})`;
        throw new Error(msg);
      }

      // Nếu tạo thành công: load lại danh sách + thống kê
      await fetchTransactions();
      await fetchSummary();

      // Reset nhẹ form (giữ lại ngày và loại, để nhập nhanh)
      setForm((prev) => ({
        ...prev,
        category: "",
        amount: "",
        note: ""
      }));
    } catch (err) {
      console.error("handleSubmit error", err);
      setError(err.message || "Đã có lỗi khi tạo giao dịch");
    } finally {
      setSubmitting(false);
    }
  }

  // Hàm format tiền cho dễ nhìn
  function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN").format(value);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={{ margin: 0 }}>Fintr4ck Dashboard</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7a90" }}>
            Theo dõi thu chi cá nhân đơn giản (Day 3)
          </p>
        </header>

        {/* Khối thống kê nhanh */}
        <section style={styles.summarySection}>
          <div style={{ ...styles.summaryCard, borderTopColor: "#2e7d32" }}>
            <p style={styles.summaryLabel}>Tổng thu</p>
            <p style={styles.summaryValue}>{formatMoney(summary.totalIncome)} đ</p>
          </div>
          <div style={{ ...styles.summaryCard, borderTopColor: "#c62828" }}>
            <p style={styles.summaryLabel}>Tổng chi</p>
            <p style={styles.summaryValue}>{formatMoney(summary.totalExpense)} đ</p>
          </div>
          <div style={{ ...styles.summaryCard, borderTopColor: "#1565c0" }}>
            <p style={styles.summaryLabel}>Số dư</p>
            <p style={styles.summaryValue}>{formatMoney(summary.balance)} đ</p>
          </div>
        </section>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* Khối form + danh sách */}
        <div style={styles.mainGrid}>
          {/* Form nhập giao dịch */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Thêm giao dịch mới</h2>
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
                  placeholder={form.type === "income" ? "Lương, thưởng,..." : "Ăn uống, di chuyển,..."}
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
                disabled={submitting}
                style={styles.submitButton}
              >
                {submitting ? "Đang lưu..." : "Lưu giao dịch"}
              </button>
            </form>
          </section>

          {/* Danh sách giao dịch */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Lịch sử giao dịch</h2>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : transactions.length === 0 ? (
              <p>Chưa có giao dịch nào. Hãy thử thêm một giao dịch mới.</p>
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
                          {tx.date ? new Date(tx.date).toLocaleDateString("vi-VN") : ""}
                        </td>
                        <td style={styles.td}>
                          {tx.type === "income" ? "Thu" : "Chi"}
                        </td>
                        <td style={styles.td}>{tx.category}</td>
                        <td
                          style={{
                            ...styles.td,
                            color: tx.type === "income" ? "#2e7d32" : "#c62828",
                            fontWeight: 600
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
    padding: "24px 0"
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px"
  },
  header: {
    marginBottom: 20
  },
  summarySection: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 24
  },
  summaryCard: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 4,
    borderTopStyle: "solid",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
  },
  summaryLabel: {
    margin: 0,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6b7a90"
  },
  summaryValue: {
    margin: "6px 0 0",
    fontSize: 20,
    fontWeight: 700
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.4fr",
    gap: 20,
    alignItems: "flex-start"
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 6px 24px rgba(15,23,42,0.06)"
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 16
  },
  formRow: {
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  label: {
    fontSize: 13,
    fontWeight: 500
  },
  input: {
    borderRadius: 8,
    border: "1px solid #d0d7e2",
    padding: "8px 10px",
    fontSize: 14,
    outline: "none"
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
    cursor: "pointer"
  },
  tableWrapper: {
    maxHeight: 380,
    overflow: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14
  },
  th: {
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    padding: "8px 6px",
    position: "sticky",
    top: 0,
    background: "#f8fafc"
  },
  td: {
    borderBottom: "1px solid #edf2f7",
    padding: "6px 6px",
    verticalAlign: "top"
  },
  errorBox: {
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    background: "#ffebee",
    color: "#c62828",
    fontSize: 14
  }
};
