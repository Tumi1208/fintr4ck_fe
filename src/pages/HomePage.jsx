import { useState } from "react";
import { Link } from "react-router-dom";

const palette = {
  bg: "#0b1021",
  primary: "#7c3aed",
  primary2: "#0ea5e9",
  accent: "#22c1c3",
  text: "#e2e8f0",
  muted: "rgba(226,232,240,0.72)",
  card: "rgba(15,23,42,0.82)",
  border: "rgba(148,163,184,0.22)",
  shadow: "0 22px 60px rgba(0,0,0,0.45)",
};

const tabs = ["Tài khoản", "Ngân sách", "Danh mục", "Báo cáo", "Mẹo tiết kiệm"];

const popularCities = [
  ["Tiền mặt", "Thẻ tín dụng", "Ví điện tử", "Tài khoản tiết kiệm", "Quỹ khẩn cấp"],
  ["Ngân sách sinh hoạt", "Ngân sách học tập", "Ngân sách đi lại", "Ngân sách mua sắm", "Ngân sách du lịch"],
  ["Danh mục cố định", "Danh mục định kỳ", "Chi tiêu linh hoạt", "Thu nhập thụ động", "Khoản đầu tư"],
  ["Báo cáo tuần", "Báo cáo tháng", "So sánh kế hoạch", "Cảnh báo vượt ngưỡng", "Dòng tiền ròng"],
  ["Tips tiết kiệm", "Checklist tài chính", "Thử thách 30 ngày", "Mẫu quản lý", "Tự động hoá"],
];

const deals = [
  { title: "Gợi ý tối ưu phí cố định", desc: "Đánh giá điện, nước, internet, bảo hiểm để giảm chi phí", cta: "Xem gợi ý" },
  { title: "Thử thách tiết kiệm 7 ngày", desc: "Giữ thói quen tốt với checklist hằng ngày", cta: "Bắt đầu thử thách" },
];

const stays = [
  { title: "Quỹ khẩn cấp", price: "Đã đạt 35.000.000đ", rating: "Tiến độ 70%", tag: "On-track" },
  { title: "Trả nợ thẻ tín dụng", price: "Còn 12.500.000đ", rating: "Tiến độ 40%", tag: "Cần đẩy nhanh" },
  { title: "Tiết kiệm du lịch", price: "Đã đạt 18.000.000đ", rating: "Tiến độ 60%", tag: "Ổn định" },
  { title: "Đầu tư định kỳ", price: "Góp 5.000.000đ/tháng", rating: "Kỷ luật tốt", tag: "Thói quen" },
  { title: "Mua xe máy", price: "Đã đạt 12.000.000đ", rating: "Tiến độ 50%", tag: "Kiên trì" },
  { title: "Quỹ học tập", price: "Đã đạt 20.000.000đ", rating: "Tiến độ 65%", tag: "Ổn định" },
  { title: "Cưới hỏi", price: "Đã đạt 45.000.000đ", rating: "Tiến độ 55%", tag: "Đang tích luỹ" },
  { title: "Quỹ sức khỏe", price: "Đã đạt 25.000.000đ", rating: "Tiến độ 75%", tag: "On-track" },
];
const stayMarquee = [...stays, ...stays];

const footerLinks = [
  { title: "Hỗ trợ", items: ["Trung tâm trợ giúp", "Câu hỏi thường gặp", "Liên hệ đội ngũ Fintr4ck"] },
  { title: "Khám phá thêm", items: ["Gợi ý tiết kiệm", "Mẫu ngân sách", "Thử thách tài chính", "Bài viết hướng dẫn"] },
  { title: "Điều khoản", items: ["Chính sách Bảo mật", "Điều khoản sử dụng", "Quyền và nghĩa vụ"] },
  { title: "Dành cho đối tác", items: ["Tài khoản đối tác", "API tài chính", "Tài liệu tích hợp"] },
  { title: "Về chúng tôi", items: ["Về Fintr4ck", "Tuyển dụng", "Hợp tác truyền thông"] },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const cashflowSeries = [32, 40, 36, 48, 62, 58, 72, 68, 86, 94, 102, 96];
  const budgetSeries = [52, 48, 54, 60, 58, 66, 70, 68, 72, 76, 80, 78];
  const lastCash = cashflowSeries[cashflowSeries.length - 1];
  const lastBudget = budgetSeries[budgetSeries.length - 1];

  return (
    <div style={styles.page}>
      <style>{marqueeStyle}</style>
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <div style={styles.logoMark}>F</div>
          <div>
            <div style={styles.logoName}>Fintr4ck</div>
            <div style={styles.logoTagline}>Personal finance, made confident</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <a href="#popular" style={styles.navItem}>Phổ biến</a>
          <a href="#deals" style={styles.navItem}>Gợi ý</a>
          <a href="#stays" style={styles.navItem}>Mục tiêu</a>
        </nav>
        <div style={styles.actions}>
          <Link to="/login" style={styles.linkGhost}>Đăng nhập</Link>
          <Link to="/register" style={styles.linkPrimary}>Dùng thử miễn phí</Link>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <span style={styles.pill}>Ưu đãi tài chính real-time</span>
            <h1 style={styles.heroTitle}>Kiểm soát dòng tiền, tiết kiệm chi tiêu và đạt mục tiêu rõ ràng.</h1>
            <p style={styles.heroDesc}>Ghi giao dịch, xem báo cáo tức thì và nhận gợi ý hành động thông minh cho ví tiền của bạn.</p>
            <div style={styles.heroButtons}>
              <Link to="/register" style={styles.ctaPrimary}>Khám phá ngay</Link>
              <Link to="/login" style={styles.ctaGhost}>Xem demo</Link>
            </div>
          </div>
          <div style={styles.heroCard}>
            <div style={styles.heroStats}>
              <div>
                <div style={styles.cardLabel}>Dòng tiền ròng</div>
                <div style={styles.cardValue}>+12,4%</div>
                <div style={styles.cardHint}>vs tuần trước</div>
              </div>
              <div>
                <div style={styles.cardLabel}>Tỷ lệ dùng ngân sách</div>
                <div style={styles.cardValue}>62%</div>
                <div style={styles.cardHint}>Cảnh báo ở 80%</div>
              </div>
            </div>
            <div style={styles.chartShell}>
              <svg viewBox="0 0 320 190" preserveAspectRatio="none" style={styles.chartSvg}>
                <defs>
                  <linearGradient id="cfArea" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(124,58,237,0.38)" />
                    <stop offset="100%" stopColor="rgba(14,165,233,0.12)" />
                  </linearGradient>
                  <linearGradient id="cfLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="320" height="190" rx="22" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />
                <g className="cf-grid">
                  {[38, 86, 134, 182].map((y) => (
                    <line key={y} x1="14" x2="306" y1={y} y2={y} strokeDasharray="4 6" />
                  ))}
                </g>
                {renderArea(cashflowSeries, 320, 170, "cfArea")}
                {renderLine(cashflowSeries, 320, 170, "cfLine", 3.5, true)}
                {renderLine(budgetSeries, 320, 170, "rgba(34,193,195,0.85)", 2.4)}
              </svg>
              <div style={styles.chartMeta}>
                <div style={styles.chartMetaRow}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={styles.chartMetaLabel}>Dòng tiền</div>
                    <div style={styles.chartMetaValue}>+{lastCash.toFixed(1)}M</div>
                  </div>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={styles.chartMetaLabel}>Ngân sách</div>
                    <div style={styles.chartMetaValue}>-{lastBudget.toFixed(1)}M</div>
                  </div>
                </div>
                <div style={styles.legend}>
                  <div style={styles.legendEntry}>
                    <span style={{ ...styles.legendDot, background: "linear-gradient(135deg, #7c3aed, #0ea5e9)" }} />
                    <span style={styles.legendText}>Dòng tiền</span>
                  </div>
                  <div style={styles.legendEntry}>
                    <span style={{ ...styles.legendDot, background: "rgba(34,193,195,0.9)" }} />
                    <span style={styles.legendText}>Ngân sách</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="popular" style={styles.section}>
          <h2 style={styles.sectionTitle}>Các danh mục được dùng nhiều</h2>
          <div style={styles.tabs}>
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                style={{ ...styles.tab, ...(activeTab === idx ? styles.tabActive : {}) }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={styles.cityGrid}>
            {popularCities.map((col, i) => (
              <div key={i} style={styles.cityCol}>
                {col.map((city) => (
                  <div key={city} style={styles.cityItem}>{city}</div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section id="deals" style={styles.section}>
          <h2 style={styles.sectionTitle}>Gợi ý tiết kiệm</h2>
          <div style={styles.dealsGrid}>
            {deals.map((deal) => (
              <div key={deal.title} style={styles.dealCard}>
                <div>
                  <div style={styles.dealTitle}>{deal.title}</div>
                  <div style={styles.dealDesc}>{deal.desc}</div>
                </div>
                <button style={styles.dealBtn}>{deal.cta}</button>
              </div>
            ))}
          </div>
        </section>

        <section id="stays" style={styles.section}>
          <h2 style={styles.sectionTitle}>Mục tiêu tài chính nổi bật</h2>
          <div style={styles.stayWrap}>
            <div style={styles.stayTrack}>
              {stayMarquee.map((stay, idx) => (
                <div key={`${stay.title}-${idx}`} style={styles.stayCard}>
                  <div style={styles.stayThumb} />
                  <div style={styles.stayBody}>
                    <div style={styles.stayTitle}>{stay.title}</div>
                    <div style={styles.stayTag}>{stay.tag} • {stay.rating}</div>
                    <div style={styles.stayPrice}>{stay.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          {footerLinks.map((col) => (
            <div key={col.title} style={styles.footerCol}>
              <div style={styles.footerTitle}>{col.title}</div>
              {col.items.map((i) => (
                <div key={i} style={styles.footerItem}>{i}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={styles.footerBottom}>
          <span>© 2025 Fintr4ck. Một sản phẩm quản lý tài chính cá nhân.</span>
          <div style={styles.footerLogos}>Fintr4ck • Priceline • Kayak</div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    background: palette.bg,
    minHeight: "100vh",
    color: palette.text,
    fontFamily: "'Space Grotesk', 'Manrope', system-ui, sans-serif",
  },
  header: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },
  logoGroup: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "linear-gradient(135deg, #1d4ed8, #22c1c3)",
    display: "grid",
    placeItems: "center",
    color: "#0b1021",
    fontWeight: 800,
  },
  logoName: { fontWeight: 800, fontSize: 18 },
  logoTagline: { fontSize: 12, color: palette.muted },
  nav: { display: "flex", gap: 16 },
  navItem: { color: palette.muted, textDecoration: "none", fontWeight: 600 },
  actions: { display: "flex", gap: 10 },
 linkGhost: {
   padding: "10px 14px",
   borderRadius: 12,
   border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.05)",
   color: palette.text,
   textDecoration: "none",
   fontWeight: 700,
 },
 linkPrimary: {
   padding: "10px 16px",
   borderRadius: 12,
   background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    color: "#0b1021",
   textDecoration: "none",
   fontWeight: 800,
   boxShadow: palette.shadow,
 },
  main: { maxWidth: 1280, margin: "0 auto", padding: "0 20px 60px", display: "flex", flexDirection: "column", gap: 36 },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 24,
    padding: 28,
    background: palette.card,
    borderRadius: 28,
    border: `1px solid ${palette.border}`,
    boxShadow: palette.shadow,
  },
  heroLeft: { display: "grid", gap: 14 },
  pill: {
    alignSelf: "flex-start",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(124,58,237,0.15)",
    color: "#c4b5fd",
    fontWeight: 700,
    fontSize: 12,
  },
  heroTitle: { fontSize: 36, margin: 0, lineHeight: 1.2 },
  heroDesc: { margin: 0, color: palette.muted, lineHeight: 1.6 },
  heroButtons: { display: "flex", gap: 10 },
  heroCard: {
    background: "linear-gradient(135deg, rgba(124,58,237,0.22), rgba(14,165,233,0.18))",
    borderRadius: 24,
    border: `1px solid ${palette.border}`,
    padding: 18,
    display: "grid",
    gap: 12,
  },
  heroStats: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  cardLabel: { color: palette.muted, fontSize: 13 },
  cardValue: { fontWeight: 800, fontSize: 24, color: palette.text },
  cardHint: { color: palette.muted, fontSize: 12 },
  chartShell: {
    position: "relative",
    height: 220,
    borderRadius: 24,
    background: "linear-gradient(145deg, rgba(18,16,43,0.92), rgba(17,24,39,0.86) 30%, rgba(14,165,233,0.18))",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    boxShadow: "0 28px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.03)",
  },
  chartSvg: { width: "100%", height: "100%", display: "block" },
  chartMeta: {
    position: "absolute",
    top: 28,
    right: 12,
    display: "grid",
    gap: 8,
    alignItems: "center",
    background: "rgba(11,16,33,0.8)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "10px 12px",
    borderRadius: 14,
    backdropFilter: "blur(10px)",
    color: palette.text,
    fontSize: 12,
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
  },
  chartMetaRow: { display: "flex", gap: 14, alignItems: "center" },
  chartMetaLabel: { color: palette.muted, fontSize: 11 },
  chartMetaValue: { fontWeight: 800, fontSize: 15 },
  legend: { display: "flex", gap: 10, alignItems: "center" },
  legendEntry: { display: "inline-flex", alignItems: "center", gap: 6 },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "rgba(34,193,195,0.75)",
    boxShadow: "0 0 0 8px rgba(34,193,195,0.14)",
  },
  legendText: { color: palette.text, fontWeight: 700, fontSize: 13 },
  section: {
    background: palette.card,
    borderRadius: 24,
    border: `1px solid ${palette.border}`,
    padding: 22,
    boxShadow: palette.shadow,
  },
  sectionTitle: { margin: "0 0 12px", fontSize: 24, fontWeight: 800 },
  sectionDesc: { margin: 0, color: palette.muted },
  tabs: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  tab: {
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.08)",
    color: "rgba(226,232,240,0.7)",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabActive: {
    border: "1px solid rgba(124,58,237,0.55)",
    background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    color: "#ffffff",
    boxShadow: "0 12px 28px rgba(14,165,233,0.25)",
  },
  cityGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 },
  cityCol: { display: "grid", gap: 8, color: palette.muted },
  cityItem: { fontSize: 14 },
  dealsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 },
  dealCard: {
    padding: 14,
    borderRadius: 16,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  dealTitle: { fontWeight: 800, fontSize: 16 },
  dealDesc: { color: palette.muted, marginTop: 4 },
  dealBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    color: "#f8fafc",
    fontWeight: 800,
    cursor: "pointer",
  },
  stayGrid: {
    display: "flex",
    gap: 14,
  },
  stayWrap: {
    position: "relative",
    overflow: "hidden",
    paddingBottom: 4,
  },
  stayTrack: {
    display: "flex",
    gap: 14,
    width: "max-content",
    animation: "marquee 28s linear infinite",
  },
  stayCard: {
    borderRadius: 18,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
    overflow: "hidden",
    minWidth: 240,
  },
  stayThumb: { height: 140, background: "linear-gradient(135deg, #2563eb, #22c1c3)" },
  stayBody: { padding: 12, display: "grid", gap: 6 },
  stayTitle: { fontWeight: 800, fontSize: 15, color: palette.text },
  stayTag: { color: palette.muted, fontSize: 13 },
  stayPrice: { fontWeight: 700, color: palette.text },
  footer: { background: "rgba(15,23,42,0.9)", marginTop: 30, padding: "32px 20px", borderTop: `1px solid ${palette.border}` },
  footerLinks: {
    maxWidth: 1280,
    margin: "0 auto 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16,
  },
  footerCol: { display: "grid", gap: 8 },
  footerTitle: { fontWeight: 800, color: palette.text },
  footerItem: { color: palette.muted, fontSize: 13 },
  footerBottom: {
    maxWidth: 1280,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: palette.muted,
    fontSize: 13,
  },
  footerLogos: { fontWeight: 700 },
  availability: { display: "flex", alignItems: "center", gap: 8, color: palette.muted, fontSize: 13 },
  availabilityDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
    boxShadow: "0 0 0 8px rgba(14,165,233,0.14)",
  },
};

// Keyframes for marquee animation
const marqueeStyle = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Chart grid ticks (subtle) */
.cf-grid line {
  stroke: rgba(148,163,184,0.14);
  stroke-width: 1;
}
`;

function normalizeSeries(series, width, height) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const stepX = width / (series.length - 1 || 1);
  return series.map((value, idx) => {
    const x = idx * stepX;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });
}

function renderLine(series, width, height, stroke, strokeWidth = 2, glow = false) {
  const pts = normalizeSeries(series, width, height - 32); // top padding
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y + 18}`).join(" ");
  const glowPath = glow ? (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth * 2.2}
      strokeOpacity={0.28}
      strokeLinejoin="round"
      strokeLinecap="round"
      filter="drop-shadow(0 0 12px rgba(14,165,233,0.45))"
    />
  ) : null;
  return (
    <>
      {glowPath}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </>
  );
}

function renderArea(series, width, height, fill) {
  const pts = normalizeSeries(series, width, height - 32);
  const d = [
    `M ${0} ${height}`,
    ...pts.map((p) => `L ${p.x} ${p.y + 18}`),
    `L ${width} ${height}`,
    "Z",
  ].join(" ");
  return <path d={d} fill={`url(#${fill})`} stroke="none" />;
}
