// src/pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGetSummary, apiCreateTransaction } from "../api/transactions";
import { apiGetCategories } from "../api/categories";
import { apiGetExpenseBreakdown } from "../api/reports";
import { apiGetMe } from "../api/auth";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [quickForm, setQuickForm] = useState({
    type: "expense",
    categoryId: "",
    note: "",
    amount: "",
  });
  const [quickError, setQuickError] = useState("");

  // Hàm tải dữ liệu dùng chung
  async function fetchAllData() {
    try {
      // Không set loading true ở đây để tránh nháy màn hình khi add transaction
      const [me, sum, cats, bre] = await Promise.all([
        apiGetMe(),
        apiGetSummary(),
        apiGetCategories(),
        apiGetExpenseBreakdown(),
      ]);

      setUser(me.user);
      setSummary(sum);
      
      // FIX QUAN TRỌNG: Kiểm tra mảng trực tiếp
      setCategories(Array.isArray(cats) ? cats : (cats.categories || []));
      setBreakdown(Array.isArray(bre) ? bre : (bre.breakdown || []));

    } catch (err) {
      console.error("Lỗi tải Dashboard:", err);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchAllData().finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!breakdown || breakdown.length === 0) return null;

    return {
      labels: breakdown.map((b) => b.name),
      datasets: [
        {
          data: breakdown.map((b) => b.amount || b.total), // Hỗ trợ cả 2 tên field
          backgroundColor: [
            "#2563EB", "#10B981", "#F97316", "#EC4899", "#8B5CF6", "#22C55E"
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [breakdown]);

  async function handleQuickAdd(e) {
    e.preventDefault();
    try {
      setQuickError("");
      if (!quickForm.amount) {
        setQuickError("Vui lòng nhập số tiền");
        return;
      }

      await apiCreateTransaction({
        type: quickForm.type,
        categoryId: quickForm.categoryId || undefined,
        note: quickForm.note,
        amount: Number(quickForm.amount),
        date: new Date().toISOString().slice(0, 10),
      });

      // Reset form và tải lại dữ liệu mới
      setQuickForm((f) => ({ ...f, note: "", amount: "" }));
      await fetchAllData(); // Gọi lại hàm fetch để cập nhật Balance/Chart ngay

    } catch (err) {
      setQuickError(err.message || "Không thể thêm giao dịch");
    }
  }

  // FIX QUAN TRỌNG: Lấy đúng tên biến từ Backend
  const balance = summary?.currentBalance ?? 0; 
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const recent = summary?.recentTransactions || [];

  return (
    <div>
      <h1 style={styles.pageTitle}>
        Dashboard{user ? ` – Xin chào, ${user.name}` : ""}
      </h1>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <>
          <div style={styles.row}>
            {/* Balance Card */}
            <div style={{ ...styles.card, flex: 2 }}>
              <h2 style={styles.cardTitle}>Current Balance</h2>
              <p style={styles.balanceText}>
                ${balance.toLocaleString("en-US")}
              </p>
              <div style={styles.incomeExpenseRow}>
                <div>
                  <div style={styles.incomeLabel}>Total Income</div>
                  <div style={styles.incomeValue}>
                    +${totalIncome.toLocaleString("en-US")}
                  </div>
                </div>
                <div>
                  <div style={styles.expenseLabel}>Total Expenses</div>
                  <div style={styles.expenseValue}>
                    -${totalExpense.toLocaleString("en-US")}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Card */}
            <div style={{ ...styles.card, flex: 2 }}>
              <h2 style={styles.cardTitle}>Expenses by Category</h2>
              {chartData ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ width: 180, height: 180 }}>
                    <Doughnut data={chartData} />
                  </div>
                  <ul style={styles.legendList}>
                    {breakdown.map((b) => (
                      <li key={b.name} style={styles.legendItem}>
                        <span style={styles.legendDot} />
                        <span style={{ flex: 1 }}>{b.name}</span>
                        <span>${(b.amount || b.total).toLocaleString("en-US")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ color: "#64748B", fontSize: 14 }}>
                  Chưa có dữ liệu chi tiêu. Hãy thêm giao dịch mới.
                </p>
              )}
            </div>
          </div>

          <div style={styles.row}>
            {/* Quick Add Form */}
            <div style={{ ...styles.card, flex: 2 }}>
              <h2 style={styles.cardTitle}>Quick Add Transaction</h2>
              <form onSubmit={handleQuickAdd}>
                <div style={styles.quickRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Type</label>
                    <select
                      style={styles.select}
                      value={quickForm.type}
                      onChange={(e) =>
                        setQuickForm((f) => ({ ...f, type: e.target.value }))
                      }
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Category</label>
                    <select
                      style={styles.select}
                      value={quickForm.categoryId}
                      onChange={(e) =>
                        setQuickForm((f) => ({
                          ...f,
                          categoryId: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- None --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.quickRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Note</label>
                    <input
                      style={styles.input}
                      value={quickForm.note}
                      onChange={(e) =>
                        setQuickForm((f) => ({ ...f, note: e.target.value }))
                      }
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Amount</label>
                    <input
                      style={styles.input}
                      type="number"
                      value={quickForm.amount}
                      onChange={(e) =>
                        setQuickForm((f) => ({ ...f, amount: e.target.value }))
                      }
                      min="0"
                    />
                  </div>
                </div>

                {quickError && (
                  <div style={styles.errorText}>{quickError}</div>
                )}

                <button type="submit" style={styles.primaryBtn}>
                  Add Transaction
                </button>
              </form>
            </div>

            {/* Recent Transactions Table */}
            <div style={{ ...styles.card, flex: 2 }}>
              <h2 style={styles.cardTitle}>Recent Transactions</h2>
              {recent.length === 0 ? (
                <p style={{ color: "#64748B", fontSize: 14 }}>
                  Chưa có giao dịch.
                </p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{textAlign: 'left'}}>Date</th>
                      <th style={{textAlign: 'left'}}>Category</th>
                      <th style={{textAlign: 'left'}}>Note</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((t) => (
                      <tr key={t._id}>
                        <td>
                          {new Date(t.date).toLocaleDateString("vi-VN")}
                        </td>
                        <td>{t.category?.name || "-"}</td>
                        <td>{t.note || "-"}</td>
                        <td style={{ textAlign: "right", color: t.type === 'income' ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                          {t.type === "expense" ? "-" : "+"}${" "}
                          {t.amount.toLocaleString("en-US")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: 24, marginBottom: 16, color: "#1E293B" },
  row: { display: "flex", gap: 24, marginBottom: 24, alignItems: "stretch" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, boxShadow: "0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.1)" },
  cardTitle: { margin: 0, marginBottom: 16, fontSize: 16, color: "#1E293B" },
  balanceText: { fontSize: 32, fontWeight: 700, margin: 0, color: "#0F172A" },
  incomeExpenseRow: { display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 14 },
  incomeLabel: { color: "#64748B", marginBottom: 4 },
  expenseLabel: { color: "#64748B", marginBottom: 4 },
  incomeValue: { color: "#10B981", fontWeight: 600 },
  expenseValue: { color: "#EF4444", fontWeight: 600 },
  legendList: { listStyle: "none", padding: 0, margin: 0, marginLeft: 16, flex: 1 },
  legendItem: { display: "flex", alignItems: "center", fontSize: 13, color: "#0F172A", marginBottom: 8 },
  legendDot: { width: 8, height: 8, borderRadius: "999px", backgroundColor: "#2563EB", marginRight: 8 },
  quickRow: { display: "flex", gap: 16 },
  field: { flex: 1, marginBottom: 12 },
  label: { display: "block", fontSize: 13, color: "#64748B", marginBottom: 4 },
  input: { width: "100%", padding: "8px 10px", borderRadius: 12, border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", fontSize: 14 },
  select: { width: "100%", padding: "8px 10px", borderRadius: 12, border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", fontSize: 14 },
  primaryBtn: { marginTop: 4, padding: "10px 16px", borderRadius: 999, border: "none", backgroundColor: "#2563EB", color: "#FFFFFF", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  errorText: { fontSize: 13, color: "#EF4444", marginBottom: 4 },
};