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
    // --- ĐÂY LÀ CHỖ QUAN TRỌNG: Dùng motion.div để kích hoạt thư viện ---
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit"
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1E293B", marginBottom: 24 }}>
        Dashboard <span style={{fontWeight: 400, color: "#64748B"}}>Overview</span>
        {user && <span style={{fontSize: 16, float: 'right', marginTop: 10}}>👋 Hi, {user.name}</span>}
      </h1>

      {loading ? <p>Loading magic...</p> : (
        <>
          <div style={styles.row}>
            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" style={globalStyles.glassCard} whileHover={globalStyles.hoverScale}>
              <div style={{padding: 24}}>
                <h2 style={styles.cardTitle}>Total Balance</h2>
                <h1 style={{ fontSize: 42, fontWeight: 800, background: globalStyles.gradientBg, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "10px 0" }}>
                  ${balance.toLocaleString("en-US")}
                </h1>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <span style={styles.incomeLabel}>Income ▲</span>
                    <span style={styles.incomeValue}>+${totalIncome.toLocaleString("en-US")}</span>
                  </div>
                  <div style={{width: 1, background: "#E2E8F0"}}></div>
                  <div style={styles.statItem}>
                    <span style={styles.expenseLabel}>Expense ▼</span>
                    <span style={styles.expenseValue}>-${totalExpense.toLocaleString("en-US")}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" style={{...globalStyles.glassCard, flex: 1.5}}>
              <div style={{padding: 24, height: "100%", display: "flex", flexDirection: "column"}}>
                <h2 style={styles.cardTitle}>Financial Structure</h2>
                {chartData ? (
                   <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 30}}>
                      <div style={{width: 160}}><Doughnut data={chartData} options={{cutout: "70%", plugins:{legend:{display:false}}}} /></div>
                      <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                        {breakdown.slice(0,4).map((b, i) => (
                            <div key={i} style={{display: "flex", alignItems: "center", fontSize: 13, color: "#475569"}}>
                                <div style={{width: 10, height: 10, borderRadius: 5, background: chartData.datasets[0].backgroundColor[i], marginRight: 8}}></div>
                                {b.name}: <b style={{marginLeft: 4}}>${(b.total || b.amount).toLocaleString()}</b>
                            </div>
                        ))}
                      </div>
                   </div>
                ) : <p style={{color: "#94A3B8", marginTop: 20}}>Chưa có dữ liệu.</p>}
              </div>
            </motion.div>
          </div>

          <div style={styles.row}>
            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" style={globalStyles.glassCard}>
               <div style={{padding: 24}}>
                  <h2 style={styles.cardTitle}>⚡ Quick Transaction</h2>
                  <form onSubmit={handleQuickAdd} style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16}}>
                      <div style={{display: 'flex', gap: 12}}>
                          <select style={styles.modernInput} value={quickForm.type} onChange={e=>setQuickForm({...quickForm, type:e.target.value})}>
                              <option value="expense">Expense 💸</option>
                              <option value="income">Income 💰</option>
                          </select>
                          <select style={styles.modernInput} value={quickForm.categoryId} onChange={e=>setQuickForm({...quickForm, categoryId:e.target.value})}>
                              <option value="">Category...</option>
                              {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                          </select>
                      </div>
                      <input style={styles.modernInput} placeholder="Note" value={quickForm.note} onChange={e=>setQuickForm({...quickForm, note:e.target.value})} />
                      <input style={styles.modernInput} type="number" placeholder="Amount" value={quickForm.amount} onChange={e=>setQuickForm({...quickForm, amount:e.target.value})} />
                      {quickError && <p style={{color: 'red', fontSize: 12}}>{quickError}</p>}
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} style={styles.gradientBtn}>Add Now</motion.button>
                  </form>
               </div>
            </motion.div>

            <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" style={{...globalStyles.glassCard, flex: 1.5}}>
               <div style={{padding: 24}}>
                  <h2 style={styles.cardTitle}>Recent Activity</h2>
                  <div style={{marginTop: 16, display: "flex", flexDirection: "column", gap: 12}}>
                      {recent.map(t => (
                          <div key={t._id} style={styles.transactionRow}>
                              <div style={styles.iconBox}>{t.category?.icon || "📄"}</div>
                              <div style={{flex: 1}}>
                                  <div style={{fontWeight: 600, color: "#1E293B"}}>{t.category?.name || "Uncategorized"}</div>
                                  <div style={{fontSize: 12, color: "#94A3B8"}}>{new Date(t.date).toLocaleDateString()} • {t.note}</div>
                              </div>
                              <div style={{fontWeight: 700, color: t.type === 'income' ? '#10B981' : '#EF4444'}}>
                                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                              </div>
                          </div>
                      ))}
                      {recent.length === 0 && <p style={{color: "#94A3B8"}}>No recent transactions</p>}
                  </div>
               </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}

const styles = {
  row: { display: "flex", gap: 24, marginBottom: 24, alignItems: "stretch" },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" },
  statsGrid: { display: "flex", justifyContent: "space-between", marginTop: 16, backgroundColor: "#F8FAFC", padding: 16, borderRadius: 16 },
  statItem: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  incomeLabel: { fontSize: 12, fontWeight: 600, color: "#10B981" },
  incomeValue: { fontSize: 16, fontWeight: 700, color: "#1E293B" },
  expenseLabel: { fontSize: 12, fontWeight: 600, color: "#EF4444" },
  expenseValue: { fontSize: 16, fontWeight: 700, color: "#1E293B" },
  modernInput: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 14, background: "#F8FAFC", outline: "none", transition: "0.2s", color: "#334155" },
  gradientBtn: { width: "100%", padding: "12px", borderRadius: 12, border: "none", background: globalStyles.gradientBg, color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)" },
  transactionRow: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px solid #F1F5F9" },
  iconBox: { width: 40, height: 40, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }
};