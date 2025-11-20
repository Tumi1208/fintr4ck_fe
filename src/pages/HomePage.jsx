import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Theo dõi chi tiêu tức thời",
    desc: "Ghi nhận giao dịch trong vài giây, phân loại tự động và xem xu hướng ngay lập tức.",
    accent: "Chi tiêu",
    icon: "⚡",
  },
  {
    title: "Mục tiêu rõ ràng",
    desc: "Thiết lập budget, nhắc tiến độ và cảnh báo khi sắp vượt ngưỡng.",
    accent: "Mục tiêu",
    icon: "🎯",
  },
  {
    title: "Báo cáo trực quan",
    desc: "Biểu đồ động, so sánh tháng/tuần và gợi ý hành động tối ưu tài chính.",
    accent: "Insight",
    icon: "📈",
  },
];

const steps = [
  { label: "Bước 1", title: "Đăng ký miễn phí", copy: "Tạo tài khoản Fintr4ck để mở khóa hệ thống." },
  { label: "Bước 2", title: "Kết nối & ghi nhận", copy: "Nhập giao dịch, gắn danh mục hoặc sử dụng mẫu có sẵn." },
  { label: "Bước 3", title: "Theo dõi kết quả", copy: "Dashboard realtime và báo cáo tự động giúp bạn ra quyết định." },
];

export default function HomePage() {
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 960 : false,
  );

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 960);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.topGlow} />
      <header
        style={{
          ...styles.header,
          gridTemplateColumns: isNarrow ? "1fr" : "1.1fr 1fr 0.8fr",
          rowGap: isNarrow ? 12 : 16,
        }}
      >
        <div style={styles.logoGroup}>
          <div style={styles.logoMark}>F</div>
          <div>
            <div style={styles.logoName}>Fintr4ck</div>
            <div style={styles.logoTagline}>Personal finance, made confident</div>
          </div>
        </div>

        <nav
          style={{
            ...styles.nav,
            justifyContent: isNarrow ? "flex-start" : "center",
            flexWrap: isNarrow ? "wrap" : "nowrap",
            rowGap: isNarrow ? 8 : 0,
          }}
        >
          <a style={styles.navItem} href="#features">
            Tính năng
          </a>
          <a style={styles.navItem} href="#how-it-works">
            Cách hoạt động
          </a>
          <a style={styles.navItem} href="#cta">
            Bắt đầu
          </a>
        </nav>

        <div style={{ ...styles.actions, justifyContent: isNarrow ? "flex-start" : "flex-end" }}>
          <Link to="/login" style={styles.linkGhost}>
            Đăng nhập
          </Link>
          <Link to="/register" style={styles.linkPrimary}>
            Dùng thử miễn phí
          </Link>
        </div>
      </header>

      <main style={styles.main}>
        <section
          style={{
            ...styles.hero,
            gridTemplateColumns: isNarrow ? "1fr" : "1.1fr 0.9fr",
          }}
        >
          <div style={styles.heroText}>
            <div style={styles.pill}>New · Realtime cashflow radar</div>
            <h1 style={styles.heroTitle}>Làm chủ tài chính cá nhân với nhịp độ nhanh và rõ ràng.</h1>
            <p style={styles.heroDesc}>
              Fintr4ck giúp bạn gom mọi giao dịch, kiểm soát ngân sách và nhìn thấy tiến độ mục tiêu
              chỉ trong một bảng điều khiển. Không còn ghi chép rời rạc hay quên hạn mức.
            </p>
            <div style={styles.heroCtas}>
              <Link to="/register" style={styles.ctaPrimary}>
                Bắt đầu ngay
              </Link>
              <Link to="/login" style={styles.ctaGhost}>
                Xem dashboard demo
              </Link>
            </div>
            <div style={styles.availability}>
              <span style={styles.availabilityDot} />
              <span>Luôn miễn phí cho cá nhân · Không yêu cầu thẻ</span>
            </div>
          </div>

          <div style={styles.heroPanel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>Ảnh chụp tài chính tuần này</span>
              <span style={styles.panelBadge}>Live</span>
            </div>
            <div style={styles.panelStatRow}>
              <div style={{ ...styles.panelStat, marginRight: 12 }}>
                <span style={styles.statLabel}>Dòng tiền ròng</span>
                <span style={styles.statValue}>+12,4%</span>
                <span style={styles.statHint}>vs tuần trước</span>
              </div>
              <div style={{ ...styles.panelStat, background: "rgba(99, 102, 241, 0.08)" }}>
                <span style={styles.statLabel}>Budget dùng</span>
                <span style={styles.statValue}>62%</span>
                <span style={styles.statHint}>Cảnh báo ở 80%</span>
              </div>
            </div>
            <div style={styles.trendCard}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <div style={styles.sparkDot} />
                <span style={styles.sparkLabel}>Nhịp chi tiêu 7 ngày</span>
              </div>
              <div style={styles.sparkline}>
                <div style={{ ...styles.sparkBar, height: 40 }} />
                <div style={{ ...styles.sparkBar, height: 64 }} />
                <div style={{ ...styles.sparkBar, height: 52 }} />
                <div style={{ ...styles.sparkBar, height: 78 }} />
                <div style={{ ...styles.sparkBar, height: 58 }} />
                <div style={{ ...styles.sparkBar, height: 70 }} />
                <div style={{ ...styles.sparkBar, height: 88 }} />
              </div>
              <div style={styles.sparkFooter}>
                <span style={styles.statHint}>Ổn định, không có ngày vượt mức</span>
                <span style={styles.sparkDelta}>+5.2% tuần này</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" style={styles.section}>
          <div style={styles.sectionHead}>
            <div style={styles.kicker}>Tính năng tiêu biểu</div>
            <h2 style={styles.sectionTitle}>Không chỉ ghi chép, mà là trợ lý tài chính</h2>
            <p style={styles.sectionDesc}>
              Mọi thứ bạn cần để giữ tiền bạc có trật tự: từ nhập liệu nhanh, mẫu chi tiêu cho tới báo cáo hành động.
            </p>
          </div>
          <div style={styles.featuresGrid}>
            {features.map((item) => (
              <div key={item.title} style={styles.featureCard}>
                <div style={styles.featureBadge}>
                  {item.icon} {item.accent}
                </div>
                <h3 style={styles.featureTitle}>{item.title}</h3>
                <p style={styles.featureCopy}>{item.desc}</p>
                <div style={styles.featureLink}>
                  Tìm hiểu thêm <span aria-hidden="true">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" style={styles.section}>
          <div style={styles.sectionHead}>
            <div style={styles.kicker}>Cách hoạt động</div>
            <h2 style={styles.sectionTitle}>3 bước để bạn thấy bức tranh rõ ràng</h2>
          </div>
          <div style={styles.steps}>
            {steps.map((step, idx) => (
              <div key={step.title} style={styles.stepCard}>
                <div style={styles.stepMeta}>
                  <span style={styles.stepIndex}>{step.label}</span>
                  <span style={styles.stepLine} />
                  <span style={styles.stepOrder}>0{idx + 1}</span>
                </div>
                <div>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepCopy}>{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="cta"
          style={{
            ...styles.ctaSection,
            gridTemplateColumns: isNarrow ? "1fr" : "1.6fr 1fr",
            alignItems: isNarrow ? "flex-start" : "center",
          }}
        >
          <div>
            <div style={styles.kicker}>Sẵn sàng thử?</div>
            <h2 style={styles.ctaTitle}>Kiểm soát tiền bạc ngay hôm nay</h2>
            <p style={styles.ctaCopy}>
              Tạo tài khoản miễn phí, theo dõi vài giao dịch đầu tiên và cảm nhận sự khác biệt sau 7 ngày.
            </p>
          </div>
          <div style={styles.ctaActions}>
            <Link to="/register" style={styles.ctaPrimary}>
              Đăng ký ngay
            </Link>
            <Link to="/login" style={styles.ctaGhost}>
              Đã có tài khoản
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(103,232,249,0.12), transparent 30%), #0B1021",
    padding: "32px 24px 80px",
    color: "#E2E8F0",
    fontFamily: "'Space Grotesk', 'Manrope', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  topGlow: {
    position: "absolute",
    inset: "-120px auto auto -120px",
    width: 360,
    height: 360,
    background: "radial-gradient(circle, rgba(99,102,241,0.6), transparent 55%)",
    filter: "blur(40px)",
    opacity: 0.6,
    pointerEvents: "none",
  },
  header: {
    maxWidth: 1200,
    margin: "0 auto 32px",
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr 0.8fr",
    alignItems: "center",
    gap: 16,
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#F8FAFC",
    fontSize: 18,
    letterSpacing: 0.5,
    boxShadow: "0 10px 25px rgba(99,102,241,0.35)",
  },
  logoName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#F8FAFC",
  },
  logoTagline: {
    fontSize: 12,
    color: "rgba(226,232,240,0.75)",
  },
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: 18,
  },
  navItem: {
    color: "rgba(226,232,240,0.8)",
    textDecoration: "none",
    fontSize: 14,
    letterSpacing: 0.2,
    padding: "10px 14px",
    borderRadius: 12,
    transition: "background 0.2s ease, color 0.2s ease",
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  linkGhost: {
    color: "#E2E8F0",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.4)",
    transition: "border-color 0.2s ease, transform 0.2s ease",
  },
  linkPrimary: {
    color: "#0B1021",
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(14,165,233,0.95), rgba(99,102,241,0.95))",
    fontWeight: 700,
    boxShadow: "0 15px 40px rgba(99,102,241,0.35)",
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 72,
  },
  hero: {
    padding: 32,
    background: "rgba(15,23,42,0.6)",
    borderRadius: 28,
    border: "1px solid rgba(148,163,184,0.15)",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 28,
    boxShadow: "0 25px 60px rgba(15,23,42,0.45)",
  },
  heroText: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  pill: {
    alignSelf: "flex-start",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(14,165,233,0.15)",
    color: "#67E8F9",
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: 600,
    border: "1px solid rgba(103,232,249,0.4)",
  },
  heroTitle: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.2,
    color: "#F8FAFC",
    letterSpacing: -0.8,
  },
  heroDesc: {
    margin: 0,
    color: "rgba(226,232,240,0.78)",
    fontSize: 17,
    lineHeight: 1.6,
  },
  heroCtas: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 18px",
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(14,165,233,0.95))",
    color: "#0B1021",
    textDecoration: "none",
    fontWeight: 800,
    letterSpacing: 0.4,
    boxShadow: "0 20px 50px rgba(14,165,233,0.35)",
    transition: "transform 0.2s ease",
  },
  ctaGhost: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(226,232,240,0.08)",
    color: "#E2E8F0",
    textDecoration: "none",
    border: "1px solid rgba(148,163,184,0.3)",
    fontWeight: 700,
  },
  availability: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "rgba(226,232,240,0.8)",
  },
  availabilityDot: {
    width: 9,
    height: 9,
    borderRadius: "999px",
    background: "linear-gradient(135deg, #22C55E, #16A34A)",
    boxShadow: "0 0 0 8px rgba(34,197,94,0.12)",
  },
  heroPanel: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(15,23,42,0.6))",
    borderRadius: 24,
    border: "1px solid rgba(148,163,184,0.18)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "0 20px 45px rgba(15,23,42,0.35)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTitle: {
    fontSize: 14,
    color: "rgba(226,232,240,0.85)",
    letterSpacing: 0.3,
  },
  panelBadge: {
    padding: "6px 10px",
    borderRadius: 12,
    background: "rgba(99,102,241,0.2)",
    color: "#A5B4FC",
    fontWeight: 700,
    fontSize: 12,
    border: "1px solid rgba(99,102,241,0.4)",
  },
  panelStatRow: {
    display: "flex",
    gap: 8,
  },
  panelStat: {
    flex: 1,
    background: "rgba(14,165,233,0.08)",
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(148,163,184,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  statLabel: {
    color: "rgba(226,232,240,0.8)",
    fontSize: 13,
  },
  statValue: {
    color: "#F8FAFC",
    fontWeight: 800,
    fontSize: 24,
  },
  statHint: {
    color: "rgba(148,163,184,0.8)",
    fontSize: 12,
  },
  trendCard: {
    background: "rgba(226,232,240,0.02)",
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(148,163,184,0.16)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sparkDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    background: "linear-gradient(135deg, #34D399, #22D3EE)",
    boxShadow: "0 0 0 8px rgba(34,211,238,0.12)",
  },
  sparkLabel: {
    marginLeft: 8,
    color: "rgba(226,232,240,0.9)",
    fontWeight: 600,
  },
  sparkline: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    alignItems: "end",
    height: 110,
  },
  sparkBar: {
    background: "linear-gradient(180deg, rgba(94,234,212,0.9), rgba(59,130,246,0.8))",
    borderRadius: 8,
  },
  sparkFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sparkDelta: {
    color: "#34D399",
    fontWeight: 700,
    fontSize: 14,
  },
  section: {
    background: "rgba(15,23,42,0.5)",
    borderRadius: 24,
    padding: 28,
    border: "1px solid rgba(148,163,184,0.12)",
    boxShadow: "0 20px 50px rgba(15,23,42,0.35)",
  },
  sectionHead: {
    textAlign: "center",
    maxWidth: 760,
    margin: "0 auto 28px",
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(94,234,212,0.12)",
    color: "#67E8F9",
    fontWeight: 700,
    fontSize: 12,
    border: "1px solid rgba(103,232,249,0.3)",
  },
  sectionTitle: {
    margin: "12px 0 8px",
    color: "#F8FAFC",
    fontSize: 28,
    letterSpacing: -0.4,
  },
  sectionDesc: {
    margin: 0,
    color: "rgba(226,232,240,0.8)",
    fontSize: 15,
    lineHeight: 1.6,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  featureCard: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(226,232,240,0.04)",
    border: "1px solid rgba(148,163,184,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },
  featureBadge: {
    alignSelf: "flex-start",
    padding: "6px 10px",
    borderRadius: 10,
    background: "rgba(99,102,241,0.2)",
    color: "#A5B4FC",
    fontWeight: 700,
    fontSize: 12,
  },
  featureTitle: {
    margin: 0,
    color: "#F8FAFC",
    fontSize: 18,
  },
  featureCopy: {
    margin: 0,
    color: "rgba(226,232,240,0.78)",
    lineHeight: 1.5,
    fontSize: 14,
  },
  featureLink: {
    marginTop: "auto",
    color: "#67E8F9",
    fontWeight: 700,
    fontSize: 13,
  },
  steps: {
    display: "grid",
    gap: 14,
  },
  stepCard: {
    display: "grid",
    gridTemplateColumns: "0.7fr 2.3fr",
    gap: 14,
    padding: 18,
    borderRadius: 16,
    background: "rgba(226,232,240,0.03)",
    border: "1px solid rgba(148,163,184,0.12)",
  },
  stepMeta: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#A5B4FC",
    fontWeight: 700,
  },
  stepIndex: {
    padding: "6px 10px",
    borderRadius: 10,
    background: "rgba(99,102,241,0.18)",
  },
  stepLine: {
    flex: 1,
    height: 1,
    background: "linear-gradient(90deg, rgba(99,102,241,0.6), rgba(14,165,233,0.4))",
  },
  stepOrder: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  stepTitle: {
    margin: "0 0 6px",
    color: "#F8FAFC",
    fontSize: 18,
  },
  stepCopy: {
    margin: 0,
    color: "rgba(226,232,240,0.78)",
    lineHeight: 1.5,
    fontSize: 14,
  },
  ctaSection: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(14,165,233,0.25))",
    borderRadius: 22,
    padding: 26,
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    alignItems: "center",
    gap: 16,
    border: "1px solid rgba(148,163,184,0.16)",
    boxShadow: "0 20px 45px rgba(14,165,233,0.25)",
  },
  ctaTitle: {
    margin: "10px 0 8px",
    color: "#0B1021",
    fontSize: 26,
    letterSpacing: -0.4,
  },
  ctaCopy: {
    margin: 0,
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 1.5,
  },
  ctaActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
};
