// src/pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line
import { motion } from "framer-motion";
import { apiGetSummary, apiCreateTransaction } from "../api/transactions";
import { apiGetCategories } from "../api/categories";
import { apiGetExpenseBreakdown } from "../api/reports";
import { apiGetMe } from "../api/auth";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Badge from "../components/ui/Badge";
import { pageVariants, cardVariants, globalStyles } from "../utils/animations";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickForm, setQuickForm] = useState({ type: "expense", categoryId: "", note: "", amount: "" });
  const [quickError, setQuickError] = useState("");

  async function fetchAllData() {
    try {
      const [me, sum, cats, bre] = await Promise.all([
        apiGetMe(), apiGetSummary(), apiGetCategories(), apiGetExpenseBreakdown()
      ]);
      setUser(me.user);
      setSummary(sum);
      setCategories(Array.isArray(cats) ? cats : (cats.categories || []));
      setBreakdown(Array.isArray(bre) ? bre : (bre.breakdown || []));
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    setLoading(true);
    fetchAllData().finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!breakdown || breakdown.length === 0) return null;
    return {
      labels: breakdown.map((b) => b.name),
      datasets: [{
        data: breakdown.map((b) => b.total || b.amount),
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
        borderWidth: 0, hoverOffset: 10,
      }],
    };
  }, [breakdown]);

  async function handleQuickAdd(e) {
    e.preventDefault();
    try {
      setQuickError("");
      if (!quickForm.amount) return setQuickError("Vui lòng nhập số tiền!");
      await apiCreateTransaction({
        ...quickForm, 
        amount: Number(quickForm.amount), 
        categoryId: quickForm.categoryId || undefined,
        date: new Date().toISOString().slice(0, 10)
      });
      setQuickForm((prev) => ({ ...prev, note: "", amount: "" }));
      await fetchAllData();
    } catch (err) { setQuickError(err.message); }
  }

  const balance = summary?.currentBalance ?? 0;
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const recent = summary?.recentTransactions || [];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={styles.pageHead}>
        <div>
          <p style={styles.kicker}>Tổng quan tài chính</p>
          <h1 style={styles.heading}>
            Bảng điều khiển
            {user && <span style={styles.subHeading}>Xin chào, {user.name} 👋</span>}
          </h1>
          <p style={styles.lead}>
            Dòng tiền, danh mục và hoạt động mới nhất được cập nhật theo thời gian thực.
          </p>
        </div>
        <Badge tone="success">Tài khoản hoạt động</Badge>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Đang tải dữ liệu...</p>
      ) : (
        <>
          <div style={styles.row}>
            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" style={{ flex: 1 }}>
              <Card title="Tổng số dư" style={styles.card}>
                <div style={styles.balanceRow}>
                  <div>
                    <div style={styles.balanceValue}>${balance.toLocaleString("en-US")}</div>
                    <div style={styles.balanceHint}>Tổng cộng sau mọi giao dịch</div>
                  </div>
                  <div style={styles.badgeStack}>
                    <Badge tone="success">Thu nhập +${totalIncome.toLocaleString("en-US")}</Badge>
                    <Badge tone="danger">Chi tiêu -${totalExpense.toLocaleString("en-US")}</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" style={{ flex: 1.4 }}>
              <Card title="Cơ cấu chi tiêu" style={styles.card}>
                {chartData ? (
                  <div style={styles.chartWrap}>
                    <div style={{ width: 180 }}>
                      <Doughnut data={chartData} options={{ cutout: "70%", plugins: { legend: { display: false } } }} />
                    </div>
                    <div style={styles.legendCol}>
                      {breakdown.slice(0, 4).map((b, i) => (
                        <div key={b.name} style={styles.legendItem}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 10,
                              background: chartData.datasets[0].backgroundColor[i],
                              display: "inline-block",
                            }}
                          />
                          <span style={{ flex: 1 }}>{b.name}</span>
                          <strong>${(b.total || b.amount).toLocaleString()}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)" }}>Chưa có dữ liệu.</p>
                )}
              </Card>
            </motion.div>
          </div>

          <div style={styles.row}>
            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" style={{ flex: 1 }}>
              <Card title="⚡ Ghi nhanh giao dịch" style={styles.card}>
                <form onSubmit={handleQuickAdd} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <select
                      style={styles.select}
                      value={quickForm.type}
                      onChange={(e) => setQuickForm({ ...quickForm, type: e.target.value })}
                    >
                      <option value="expense">Chi tiêu</option>
                      <option value="income">Thu nhập</option>
                    </select>
                    <select
                      style={styles.select}
                      value={quickForm.categoryId}
                      onChange={(e) => setQuickForm({ ...quickForm, categoryId: e.target.value })}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <InputField
                    placeholder="Ghi chú"
                    value={quickForm.note}
                    onChange={(e) => setQuickForm({ ...quickForm, note: e.target.value })}
                  />
                  <InputField
                    type="number"
                    placeholder="Số tiền"
                    value={quickForm.amount}
                    onChange={(e) => setQuickForm({ ...quickForm, amount: e.target.value })}
                  />
                  {quickError && <p style={{ color: "#fca5a5", fontSize: 13 }}>{quickError}</p>}
                  <Button type="submit" fullWidth>
                    Thêm ngay
                  </Button>
                </form>
              </Card>
            </motion.div>

            <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" style={{ flex: 1.5 }}>
              <Card title="Hoạt động gần đây" style={styles.card}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
                  {recent.map((t) => (
                    <div key={t._id} style={styles.transactionRow}>
                      <div style={styles.iconBox}>{t.category?.icon || "📄"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>
                          {t.category?.name || "Uncategorized"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {new Date(t.date).toLocaleDateString()} • {t.note}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: t.type === "income" ? "#4ade80" : "#f87171",
                        }}
                      >
                        {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {recent.length === 0 && <p style={{ color: "var(--text-muted)" }}>Chưa có giao dịch gần đây</p>}
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}

const styles = {
  pageHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(226,232,240,0.05)",
    border: "1px solid var(--border-soft)",
    color: "var(--text-muted)",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  heading: { margin: "8px 0 6px", color: "var(--text-strong)", fontSize: 28, letterSpacing: -0.4 },
  subHeading: { display: "inline-block", marginLeft: 10, color: "var(--text-muted)", fontSize: 16, fontWeight: 500 },
  lead: { margin: 0, color: "var(--text-muted)", fontSize: 14 },
  row: { display: "flex", gap: 16, marginBottom: 18, alignItems: "stretch" },
  card: { height: "100%" },
  balanceRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  balanceValue: { fontSize: 38, fontWeight: 800, background: globalStyles.gradientBg, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 },
  balanceHint: { color: "var(--text-muted)", fontSize: 13 },
  badgeStack: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" },
  chartWrap: { display: "flex", alignItems: "center", gap: 24 },
  legendCol: { display: "flex", flexDirection: "column", gap: 8, width: "100%" },
  legendItem: { display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center", color: "var(--text-strong)", fontSize: 13 },
  select: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.05)",
    color: "var(--text-strong)",
    fontSize: 14,
    outline: "none",
  },
  transactionRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(148,163,184,0.15)",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "rgba(226,232,240,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
};
