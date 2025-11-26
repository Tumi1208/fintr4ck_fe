import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const palette = {
  bg: "var(--bg-primary)",
  card: "var(--bg-card)",
  surface: "var(--bg-surface)",
  border: "var(--border-soft)",
  text: "var(--text-strong)",
  muted: "var(--text-muted)",
  accent: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
  glow: "0 18px 40px rgba(14,165,233,0.32)",
};

const demoSummary = {
  balance: 52000000,
  income: 18500000,
  expense: 12600000,
  savingRate: 32,
};

const demoBudgets = [
  { name: "Ăn uống", used: 2800000, limit: 3500000 },
  { name: "Đi lại", used: 1100000, limit: 2000000 },
  { name: "Hóa đơn", used: 1400000, limit: 2200000 },
  { name: "Tiết kiệm", used: 3800000, limit: 5000000 },
];

const demoGoals = [
  { title: "Quỹ khẩn cấp", progress: 72, desc: "Đủ 3 tháng chi phí: 45.000.000đ" },
  { title: "Trả nợ thẻ tín dụng", progress: 48, desc: "Còn 6.200.000đ, ưu tiên thanh toán" },
  { title: "Tiết kiệm du lịch", progress: 58, desc: "Đạt 11.600.000đ / 20.000.000đ" },
];

const demoTransactionsSeed = [
  { id: 1, note: "Cafe với team", amount: 85000, type: "expense", category: "Ăn uống", time: "Hôm nay, 08:35" },
  { id: 2, note: "Lương tháng 5", amount: 18500000, type: "income", category: "Thu nhập", time: "Hôm qua" },
  { id: 3, note: "Đổ xăng", amount: 180000, type: "expense", category: "Đi lại", time: "Hôm qua" },
  { id: 4, note: "Thanh toán Netflix", amount: 260000, type: "expense", category: "Hóa đơn", time: "2 ngày trước" },
  { id: 5, note: "Tích lũy ETF", amount: 1200000, type: "expense", category: "Đầu tư", time: "3 ngày trước" },
];

export default function DemoPage() {
  const [demoTxs, setDemoTxs] = useState(demoTransactionsSeed);
  const [form, setForm] = useState({ type: "expense", amount: "", category: "Ăn uống", note: "" });
  const isLoggedIn = Boolean(localStorage.getItem("fintr4ck_token"));

  const styles = useMemo(() => createStyles(), []);

  if (isLoggedIn) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmitDemo = (e) => {
    e.preventDefault();
    if (!form.amount) return;
    const parsedAmount = Number(form.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    const newTx = {
      id: Date.now(),
      note: form.note || (form.type === "income" ? "Thu nhập mới" : "Chi tiêu mới"),
      amount: parsedAmount,
      type: form.type,
      category: form.category,
      time: "Vừa thêm (demo)",
    };
    setDemoTxs((prev) => [newTx, ...prev].slice(0, 8));
    setForm((prev) => ({ ...prev, amount: "", note: "" }));
  };

  return (
    <PageTransition style={styles.page}>
      <div style={styles.banner}>
        <Badge tone="warning">Demo mode • Dữ liệu minh hoạ</Badge>
        <span style={styles.bannerHint}>Hãy đăng ký để lưu dữ liệu thật và đồng bộ đa thiết bị.</span>
      </div>

      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>F</div>
          <div>
            <div style={styles.brandTitle}>Fintr4ck Demo</div>
            <div style={styles.brandDesc}>Thử cảm giác Dashboard trước khi đăng ký</div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <Link to="/login" style={styles.ghost}>Đăng nhập</Link>
          <Link to="/register" style={styles.primary}>Đăng ký để dùng thật</Link>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={styles.pill}>Không cần tạo tài khoản</div>
            <h1 style={styles.heroTitle}>Quản lý dòng tiền, ngân sách và mục tiêu ngay tại đây.</h1>
            <p style={styles.heroDesc}>
              Bạn đang ở chế độ demo: mọi thao tác chỉ lưu tại trình duyệt, không ghi ra máy chủ. Tạo tài khoản để giữ dữ liệu thật.
            </p>
            <div style={styles.heroCtas}>
              <Link to="/register" style={styles.primary}>Đăng ký để dùng thật</Link>
              <Link to="/login" style={{ ...styles.ghost, borderColor: palette.border }}>Đăng nhập</Link>
            </div>
          </div>
          <div style={styles.heroStats}>
            {[
              { label: "Số dư demo", value: formatCurrency(demoSummary.balance), delta: "+4.2% so với tuần trước" },
              { label: "Thu nhập tháng", value: formatCurrency(demoSummary.income), delta: "+1.5% tăng" },
              { label: "Chi tiêu tháng", value: formatCurrency(demoSummary.expense), delta: "-6.2% so với tháng trước" },
              { label: "Tỷ lệ tiết kiệm", value: `${demoSummary.savingRate}%`, delta: "Ổn định" },
            ].map((item) => (
              <div key={item.label} style={styles.statCard}>
                <div style={styles.statLabel}>{item.label}</div>
                <div style={styles.statValue}>{item.value}</div>
                <div style={styles.statDelta}>{item.delta}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.grid}>
          <Card title="Ghi giao dịch (demo)" actions={<Badge tone="info">Chỉ lưu local</Badge>} style={styles.card}>
            <form style={styles.form} onSubmit={handleSubmitDemo}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Loại</label>
                <div style={styles.segment}>
                  {["expense", "income"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                      style={{
                        ...styles.segmentBtn,
                        ...(form.type === t ? styles.segmentActive : {}),
                      }}
                    >
                      {t === "income" ? "Thu" : "Chi"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Số tiền</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="500000"
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Danh mục</label>
                <select
                  style={styles.select}
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option>Ăn uống</option>
                  <option>Đi lại</option>
                  <option>Hóa đơn</option>
                  <option>Tiết kiệm</option>
                  <option>Đầu tư</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Ghi chú (tuỳ chọn)</label>
                <input
                  style={styles.input}
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Ví dụ: Ăn trưa cùng team"
                />
              </div>
              <Button type="submit" fullWidth>Lưu (demo)</Button>
              <div style={styles.hint}>Hành động này không gọi API, dữ liệu chỉ hiển thị trên trang demo.</div>
            </form>
          </Card>

          <Card title="Ngân sách tháng này" style={styles.card}>
            <div style={styles.budgetList}>
              {demoBudgets.map((b) => {
                const percent = Math.min(100, Math.round((b.used / b.limit) * 100));
                const isNearLimit = percent > 82;
                return (
                  <div key={b.name} style={styles.budgetRow}>
                    <div>
                      <div style={styles.budgetName}>{b.name}</div>
                      <div style={styles.budgetMeta}>{formatCurrency(b.used)} / {formatCurrency(b.limit)}</div>
                    </div>
                    <div style={{ ...styles.progress, borderColor: isNearLimit ? "rgba(251,191,36,0.35)" : palette.border }}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${percent}%`,
                          background: isNearLimit ? "linear-gradient(135deg, #fbbf24, #f97316)" : palette.accent,
                          boxShadow: isNearLimit ? "0 12px 24px rgba(251,191,36,0.35)" : palette.glow,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Giao dịch gần đây" style={styles.card}>
            <div style={styles.txList}>
              {demoTxs.map((tx) => (
                <div key={tx.id} style={styles.txRow}>
                  <div style={styles.txInfo}>
                    <div style={styles.txNote}>{tx.note}</div>
                    <div style={styles.txMeta}>{tx.category} • {tx.time}</div>
                  </div>
                  <div style={{ ...styles.txAmount, color: tx.type === "income" ? "#34d399" : "#fca5a5" }}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Tiến độ mục tiêu" style={styles.card}>
            <div style={styles.goalGrid}>
              {demoGoals.map((goal) => (
                <div key={goal.title} style={styles.goalCard}>
                  <div style={styles.goalHeader}>
                    <div style={styles.goalTitle}>{goal.title}</div>
                    <Badge tone="success">{goal.progress}%</Badge>
                  </div>
                  <div style={styles.goalDesc}>{goal.desc}</div>
                  <div style={styles.progress}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${goal.progress}%`,
                        background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                        boxShadow: palette.glow,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </section>
      </main>
    </PageTransition>
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function createStyles() {
  return {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(circle at 14% 18%, rgba(124,58,237,0.14), transparent 32%), radial-gradient(circle at 82% 6%, rgba(14,165,233,0.14), transparent 30%), radial-gradient(circle at 64% 72%, rgba(34,193,195,0.12), transparent 26%), var(--bg-primary)",
      color: palette.text,
      padding: "22px clamp(14px, 4vw, 32px) 48px",
      fontFamily: "'Space Grotesk', 'Manrope', system-ui, sans-serif",
    },
    banner: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 16,
      marginLeft: "auto",
      maxWidth: 780,
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${palette.border}`,
      borderRadius: 16,
      padding: "10px 14px",
      boxShadow: "0 14px 30px rgba(0,0,0,0.28)",
      position: "sticky",
      top: 12,
      right: 12,
      zIndex: 4,
      backdropFilter: "blur(10px)",
    },
    bannerHint: { color: palette.muted, fontSize: 13 },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 16,
      flexWrap: "wrap",
    },
    brand: { display: "flex", alignItems: "center", gap: 12 },
    logo: {
      width: 44,
      height: 44,
      borderRadius: 14,
      background: palette.accent,
      color: "#0b1021",
      display: "grid",
      placeItems: "center",
      fontWeight: 900,
      boxShadow: palette.glow,
    },
    brandTitle: { fontWeight: 800, fontSize: 18 },
    brandDesc: { color: palette.muted, fontSize: 13 },
    headerActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
    ghost: {
      padding: "10px 14px",
      borderRadius: 12,
      border: `1px solid ${palette.border}`,
      background: "rgba(255,255,255,0.05)",
      color: palette.text,
      fontWeight: 700,
      textDecoration: "none",
    },
    primary: {
      padding: "10px 16px",
      borderRadius: 12,
      background: palette.accent,
      color: "#0b1021",
      fontWeight: 800,
      textDecoration: "none",
      boxShadow: palette.glow,
      border: "1px solid transparent",
    },
    main: { display: "grid", gap: 16 },
    hero: {
      background: palette.card,
      border: `1px solid ${palette.border}`,
      borderRadius: 20,
      padding: 20,
      display: "grid",
      gap: 14,
      boxShadow: palette.glow,
    },
    pill: {
      alignSelf: "flex-start",
      padding: "6px 12px",
      borderRadius: 999,
      background: "rgba(124,58,237,0.18)",
      color: "#c4b5fd",
      fontWeight: 700,
      fontSize: 12,
    },
    heroTitle: { margin: "4px 0", fontSize: 28, fontWeight: 800, lineHeight: 1.25 },
    heroDesc: { margin: 0, color: palette.muted, lineHeight: 1.6 },
    heroCtas: { display: "flex", gap: 10, flexWrap: "wrap" },
    heroStats: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 12,
      marginTop: 8,
    },
    statCard: {
      padding: 14,
      borderRadius: 14,
      border: `1px solid ${palette.border}`,
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.02), rgba(124,58,237,0.06))",
      display: "grid",
      gap: 6,
      boxShadow: "0 14px 32px rgba(0,0,0,0.3)",
    },
    statLabel: { color: palette.muted, fontSize: 13 },
    statValue: { fontWeight: 800, fontSize: 20 },
    statDelta: { color: palette.muted, fontSize: 12 },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 14,
      alignItems: "stretch",
    },
    card: { height: "100%" },
    form: { display: "grid", gap: 10 },
    fieldGroup: { display: "grid", gap: 6 },
    label: { color: palette.muted, fontWeight: 700, fontSize: 13 },
    input: {
      padding: "12px 14px",
      borderRadius: 12,
      border: `1px solid ${palette.border}`,
      background: "rgba(255,255,255,0.05)",
      color: palette.text,
      fontWeight: 700,
      boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
    },
    select: {
      padding: "12px 14px",
      borderRadius: 12,
      border: `1px solid ${palette.border}`,
      background: "rgba(255,255,255,0.05)",
      color: palette.text,
      fontWeight: 700,
      boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
    },
    segment: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 8,
      background: "rgba(255,255,255,0.04)",
      padding: 4,
      borderRadius: 12,
      border: `1px solid ${palette.border}`,
    },
    segmentBtn: {
      padding: "10px 12px",
      borderRadius: 10,
      border: "none",
      background: "transparent",
      color: palette.text,
      fontWeight: 800,
      cursor: "pointer",
    },
    segmentActive: {
      background: palette.accent,
      color: "#0b1021",
      boxShadow: palette.glow,
    },
    hint: { color: palette.muted, fontSize: 12, textAlign: "center" },
    budgetList: { display: "grid", gap: 12 },
    budgetRow: {
      display: "grid",
      gap: 8,
      padding: "10px 12px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${palette.border}`,
    },
    budgetName: { fontWeight: 800, color: palette.text },
    budgetMeta: { color: palette.muted, fontSize: 13 },
    progress: {
      width: "100%",
      height: 10,
      borderRadius: 999,
      border: `1px solid ${palette.border}`,
      background: "rgba(255,255,255,0.06)",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      transition: "width 0.4s ease",
    },
    txList: { display: "grid", gap: 10 },
    txRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${palette.border}`,
    },
    txInfo: { display: "grid", gap: 4 },
    txNote: { fontWeight: 700 },
    txMeta: { color: palette.muted, fontSize: 12 },
    txAmount: { fontWeight: 800, fontSize: 16 },
    goalGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
    goalCard: {
      padding: "12px 14px",
      borderRadius: 14,
      border: `1px solid ${palette.border}`,
      background: "rgba(255,255,255,0.03)",
      display: "grid",
      gap: 8,
      boxShadow: "0 10px 26px rgba(0,0,0,0.28)",
    },
    goalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
    goalTitle: { fontWeight: 800 },
    goalDesc: { color: palette.muted, fontSize: 13 },
  };
}
