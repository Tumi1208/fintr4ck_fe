// src/pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line
import { motion } from "framer-motion";
import { apiGetSummary, apiCreateTransaction } from "../api/transactions";
import { apiGetCategories } from "../api/categories";
import { apiGetExpenseBreakdown } from "../api/reports";
import { apiGetMe } from "../api/auth";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import { pageVariants, cardVariants, globalStyles } from "../utils/animations";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardPage() {
  const quotes = [
    { author: "Warren Buffett", text: "Đừng tiết kiệm sau khi tiêu, hãy tiêu sau khi tiết kiệm." },
    { author: "Benjamin Franklin", text: "Những khoản chi nhỏ mới khiến con tàu chìm." },
    { author: "Peter Drucker", text: "Điều không đo lường được, không thể quản lý được." },
    { author: "Charlie Munger", text: "Hãy sống dưới khả năng của bạn và đầu tư phần chênh lệch." },
    { author: "Suze Orman", text: "Mỗi đồng bạn không chi tiêu là một đồng bạn vừa kiếm thêm." },
    { author: "Howard Marks", text: "Rủi ro không nằm ở những gì bạn biết, mà ở những gì bạn nghĩ là chắc chắn." },
    { author: "Morgan Housel", text: "Tài sản thật là khả năng sống tốt hơn người khác mà không cần khoe." },
    { author: "Naval Ravikant", text: "Hãy kiếm tiền khi thức và cả khi ngủ, nếu không bạn sẽ làm việc cho đến chết." },
    { author: "JL Collins", text: "Đơn giản hóa và tự động hóa để tiền của bạn tự làm việc." },
    { author: "John Bogle", text: "Đừng tìm kim cương, hãy sở hữu cả mỏ kim cương." },
    { author: "Vicki Robin", text: "Mỗi khoản chi là thời gian cuộc đời bạn đang bán ra." },
    { author: "Lời nhắc", text: "Đặt cảnh báo khi chi vượt 3.000.000đ/tuần để giữ nhịp chi tiêu." },
    { author: "Lời nhắc", text: "Trước khi mua, hỏi: liệu tôi có thể tìm phiên bản rẻ hơn 20%?" },
    { author: "Lời nhắc", text: "Kiểm tra sao kê 5 phút mỗi ngày để phát hiện chi bất thường." },
    { author: "Lời nhắc", text: "Chốt ngân sách tuần vào chủ nhật, đi chợ theo danh sách." },
    { author: "Lời nhắc", text: "Lập quỹ khẩn cấp ít nhất 3-6 tháng chi phí." },
    { author: "Lời nhắc", text: "Ưu tiên trả nợ lãi cao nhất trước, phần còn lại tối thiểu." },
    { author: "Lời nhắc", text: "Tự động chuyển 10% thu nhập vào quỹ đầu tư ngay khi nhận lương." },
    { author: "Lời nhắc", text: "Tạm ngừng mua sắm 24h trước khi quyết định chi lớn." },
    { author: "Lời nhắc", text: "Đặt giới hạn chi tiêu không thông báo: 500k/ngày." },
    { author: "Lời nhắc", text: "Nhóm các khoản chi cố định và đàm phán lại mỗi 6 tháng." },
    { author: "Lời nhắc", text: "Tắt auto-renew với dịch vụ không dùng hàng tuần." },
    { author: "Lời nhắc", text: "Dành 15 phút mỗi tháng để xếp hạng top 3 khoản chi cần cắt." },
    { author: "Lời nhắc", text: "Thêm quy tắc: mua 1 món mới -> bán/cho đi 1 món cũ." },
    { author: "Lời nhắc", text: "Thu nhập bất chợt: tiết kiệm ít nhất 50%, vui 50%." },
    { author: "Lời nhắc", text: "Kiểm tra bảo hiểm và quỹ dự phòng trách nhiệm gia đình." },
    { author: "Lời nhắc", text: "Theo dõi 3 con số: thu nhập, tiết kiệm, tỷ lệ tiết kiệm (%)." },
    { author: "Lời nhắc", text: "Mỗi tuần thử 1 ngày không mua online." },
    { author: "Danh ngôn", text: "Sự giàu có là khả năng trải nghiệm đầy đủ cuộc sống. - Henry David Thoreau" },
    { author: "Danh ngôn", text: "Đừng đánh giá ngày bằng những gì bạn gặt, hãy đánh giá bằng những gì bạn gieo. - Robert Louis Stevenson" },
    { author: "Danh ngôn", text: "Sự kỷ luật là cầu nối giữa mục tiêu và thành tựu. - Jim Rohn" },
    { author: "Danh ngôn", text: "Bạn không cần giỏi hơn người khác, chỉ cần giỏi hơn chính mình ngày hôm qua. - Unknown" },
    { author: "Danh ngôn", text: "Tự do tài chính bắt đầu từ một thói quen nhỏ. - Unknown" },
    { author: "Danh ngôn", text: "Kẻ chiến thắng là người biết dừng đúng lúc. - Unknown" },
    { author: "Danh ngôn", text: "Thời gian trên thị trường quan trọng hơn thời điểm vào thị trường. - Unknown" },
    { author: "Danh ngôn", text: "Đừng để lạm phát ăn mất giấc mơ của bạn. - Unknown" },
    { author: "Danh ngôn", text: "Ghi chép chi tiêu là bản đồ dẫn đến tự do. - Unknown" },
    { author: "Danh ngôn", text: "Khi bạn ngủ, tiền phải thức. - Unknown" },
    { author: "Danh ngôn", text: "Không có kế hoạch, tiền sẽ có kế hoạch riêng. - Unknown" },
    { author: "Danh ngôn", text: "Mỗi lựa chọn tài chính là một lá phiếu cho tương lai bạn muốn. - Unknown" },
    { author: "Danh ngôn", text: "Tiền là công cụ, không phải mục tiêu. - Unknown" },
    { author: "Danh ngôn", text: "Hãy biến tiết kiệm thành phản xạ, không phải nỗ lực. - Unknown" },
  ];

  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickForm, setQuickForm] = useState({ type: "expense", categoryId: "", note: "", amount: "" });
  const [quickError, setQuickError] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));

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
    const categoryTypeById = new Map(categories.map((c) => [c._id, c.type]));
    const categoryTypeByName = new Map(categories.map((c) => [c.name?.toLowerCase(), c.type]));
    const labels = breakdown.map((b) => b.name);
    const values = breakdown.map((b) => b.total || b.amount);
    const colors = breakdown.map((b) => {
      const type =
        categoryTypeById.get(b._id) ||
        categoryTypeById.get(b.categoryId) ||
        categoryTypeByName.get(b.name?.toLowerCase()) ||
        "expense";
      return type === "income" ? "rgba(34,197,94,0.8)" : "rgba(248,113,113,0.8)";
    });
    return {
      labels,
      datasets: [
        {
          label: "Theo danh mục",
          data: values,
          backgroundColor: colors,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 22,
        },
      ],
    };
  }, [breakdown, categories]);

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

  function shuffleQuote() {
    setQuoteIndex((prev) => {
      const next = Math.floor(Math.random() * quotes.length);
      return next === prev ? (next + 1) % quotes.length : next;
    });
  }

  const balance = summary?.currentBalance ?? 0;
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const recent = summary?.recentTransactions || [];
  const activeQuote = quotes[quoteIndex];

  function renderTxnIcon(t) {
    const iconName = t.category?.icon;
    const tone = t.type === "income" ? "green" : "red";
    if (!iconName) {
      return <Icon name="article" tone={tone} size={18} />;
    }
    if (iconName.length === 1) {
      return <span style={styles.iconText}>{iconName.toUpperCase()}</span>;
    }
    return <Icon name={iconName} tone={tone} size={18} />;
  }

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
                <div style={styles.quoteBox}>
                  <div>
                    <div style={styles.quoteLabel}>{activeQuote.author}</div>
                    <div style={styles.quoteText}>“{activeQuote.text}”</div>
                  </div>
                  <button type="button" style={styles.quoteBtn} onClick={shuffleQuote}>
                    <Icon name="spark" tone="blue" size={16} background={false} /> Quote khác
                  </button>
                </div>
              </Card>
            </motion.div>

            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" style={{ flex: 1.4 }}>
              <Card title="Cơ cấu chi tiêu" style={styles.card}>
                <div style={styles.chartToggle}>
                  <span style={styles.toggleLabel}>Loại biểu đồ:</span>
                  <div style={styles.toggleGroup}>
                    {["bar", "doughnut"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        style={{
                          ...styles.toggleBtn,
                          ...(chartType === type ? styles.toggleBtnActive : {}),
                        }}
                        type="button"
                      >
                        {type === "bar" ? "Cột ngang" : "Doughnut"}
                      </button>
                    ))}
                  </div>
                </div>
                {chartData ? (
                  <div style={chartType === "doughnut" ? styles.doughnutBox : styles.chartWrap}>
                    {chartType === "bar" ? (
                      <Bar
                        data={chartData}
                        options={{
                          indexAxis: "y",
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: {
                            x: {
                              grid: { color: "rgba(148,163,184,0.2)" },
                              ticks: { color: "#e2e8f0" },
                            },
                            y: {
                              grid: { display: false },
                              ticks: { color: "#e2e8f0", font: { weight: "700" } },
                            },
                          },
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              titleColor: "#e2e8f0",
                              bodyColor: "#e2e8f0",
                              backgroundColor: "rgba(15,23,42,0.9)",
                              borderColor: "rgba(148,163,184,0.3)",
                              borderWidth: 1,
                            },
                          },
                        }}
                      />
                    ) : (
                      <Doughnut
                        data={chartData}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              labels: { color: "#e2e8f0", font: { weight: 600 } },
                              position: "bottom",
                            },
                            tooltip: {
                              titleColor: "#e2e8f0",
                              bodyColor: "#e2e8f0",
                              backgroundColor: "rgba(15,23,42,0.9)",
                              borderColor: "rgba(148,163,184,0.3)",
                              borderWidth: 1,
                            },
                          },
                          cutout: "60%",
                        }}
                      />
                    )}
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
              <Card title="Giao dịch gần đây" style={styles.card}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
                  {recent.map((t) => (
                    <div key={t._id} style={styles.transactionRow}>
                      <div style={styles.iconBox}>
                        {renderTxnIcon(t)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>
                          {t.category?.name || "Uncategorized"}
                        </div>
                        <div style={{ fontSize: 12, color: styles.lead.color }}>
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
  lead: { margin: 0, color: "#e2e8f0", fontSize: 14 },
  row: { display: "flex", gap: 16, marginBottom: 18, alignItems: "stretch" },
  card: { height: "100%" },
  balanceRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  balanceValue: { fontSize: 38, fontWeight: 800, background: globalStyles.gradientBg, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 },
  balanceHint: { color: "var(--text-muted)", fontSize: 13 },
  badgeStack: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" },
  quoteBox: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
    border: "1px solid rgba(148,163,184,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  quoteLabel: { color: "var(--text-muted)", fontSize: 12, marginBottom: 4 },
  quoteText: { color: "var(--text-strong)", fontWeight: 700, fontSize: 14, fontStyle: "italic", lineHeight: 1.4 },
  quoteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.06)",
    color: "var(--text-strong)",
    cursor: "pointer",
    fontWeight: 700,
  },
  chartWrap: { display: "flex", alignItems: "center", gap: 12, paddingRight: 8 },
  doughnutBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 0",
    height: 240,
    maxWidth: 260,
    margin: "0 auto",
  },
  chartToggle: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 },
  toggleLabel: { color: "var(--text-muted)", fontSize: 12, fontWeight: 600 },
  toggleGroup: { display: "inline-flex", background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 12, border: "1px solid rgba(148,163,184,0.15)" },
  toggleBtn: {
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontWeight: 700,
  },
  toggleBtnActive: {
    background: "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(34,197,94,0.22))",
    color: "var(--text-strong)",
  },
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
  iconText: { color: "var(--text-strong)", fontWeight: 800, fontSize: 16 },
};
