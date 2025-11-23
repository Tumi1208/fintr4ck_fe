import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";

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

const tabSections = [
  {
    label: "Tài khoản",
    subtitle: "Tổng quan ví, ngân hàng, quỹ dự phòng",
    columns: [
      ["Tiền mặt", "Thẻ tín dụng", "Ví điện tử", "Tài khoản tiết kiệm", "Quỹ khẩn cấp"],
      ["Joint account", "Tài khoản lãi suất cao", "Tài khoản USD", "Ví travel", "Ví gia đình"],
      ["Thẻ trả góp", "Thẻ tích điểm", "Thẻ cashback", "Thẻ công ty", "Ví sinh viên"],
    ],
  },
  {
    label: "Ngân sách",
    subtitle: "Chạm nhẹ để chia ngân sách theo mục tiêu",
    columns: [
      ["Ngân sách sinh hoạt", "Ngân sách học tập", "Ngân sách đi lại", "Ngân sách mua sắm", "Ngân sách du lịch"],
      ["Zero-based budget", "50/30/20", "Pay-yourself-first", "6-jars", "Envelope method"],
      ["Ngân sách ăn uống", "Ngân sách nhà cửa", "Ngân sách sức khỏe", "Ngân sách quà tặng", "Ngân sách dự phòng"],
    ],
  },
  {
    label: "Danh mục",
    subtitle: "Nhóm chi tiêu & thu nhập rõ ràng",
    columns: [
      ["Danh mục cố định", "Danh mục định kỳ", "Chi tiêu linh hoạt", "Thu nhập thụ động", "Khoản đầu tư"],
      ["Học phí", "Thuê nhà", "Điện nước", "Internet", "Xăng xe"],
      ["Freelance", "Cổ tức", "Tiền thưởng", "Bán đồ cũ", "Affiliate"],
    ],
  },
  {
    label: "Báo cáo",
    subtitle: "Kiểm thử sức khỏe tài chính nhanh",
    columns: [
      ["Báo cáo tuần", "Báo cáo tháng", "So sánh kế hoạch", "Cảnh báo vượt ngưỡng", "Dòng tiền ròng"],
      ["Trạng thái quỹ khẩn cấp", "Tỷ lệ tiết kiệm", "Tỷ lệ nợ/thu nhập", "Hiệu suất đầu tư", "Heatmap chi tiêu"],
      ["Top danh mục bội chi", "Xu hướng thu nhập", "Dòng tiền theo ngày", "Chu kỳ thanh toán", "Báo cáo PDF"],
    ],
  },
  {
    label: "Mẹo tiết kiệm",
    subtitle: "Tip nhanh, thử thách ngắn và checklist",
    columns: [
      ["Tips tiết kiệm", "Checklist tài chính", "Thử thách 30 ngày", "Mẫu quản lý", "Tự động hoá"],
      ["Cắt giảm subscription", "Bữa ăn 50k/ngày", "No-spend weekend", "Quỹ mini 7 ngày", "Đảo nợ 0%"],
      ["Mẹo giảm phí thẻ", "Săn voucher", "Auto chuyển quỹ", "Đặt hạn mức chi", "Nhắc nhở hóa đơn"],
    ],
  },
];

const deals = [
  { title: "Gợi ý tối ưu phí cố định", desc: "Đánh giá điện, nước, internet, bảo hiểm để giảm chi phí", cta: "Xem gợi ý" },
  { title: "Thử thách tiết kiệm 7 ngày", desc: "Giữ thói quen tốt với checklist hằng ngày", cta: "Bắt đầu thử thách" },
];

const howSteps = [
  { title: "Ghi giao dịch 10 giây", desc: "Thêm thu/chi nhanh với gợi ý danh mục và nguồn tiền", icon: "📝" },
  { title: "Theo dõi ngân sách & cảnh báo", desc: "Tự động trừ ngân sách, cảnh báo khi sắp vượt ngưỡng", icon: "📊" },
  { title: "FintrAI gợi ý tối ưu", desc: "Đề xuất cắt giảm phí, tối ưu dòng tiền và thói quen chi", icon: "✨" },
];

const socialMetrics = [
  { title: "người dùng", target: 10.2, suffix: "k" },
  { title: "giao dịch được ghi", target: 2.1, suffix: "M" },
  { title: "đánh giá", target: 4.8, suffix: "★" },
];

const beforeList = [
  "Ghi chép rời rạc, thiếu thống nhất danh mục",
  "Không rõ tiền đi đâu, cảnh báo vượt ngân sách trễ",
  "Không có gợi ý hành động, dễ bỏ cuộc",
];

const afterList = [
  "Giao dịch chuẩn hóa, tự phân loại & nguồn tiền",
  "Ngân sách realtime, cảnh báo sớm trước khi lệch",
  "FintrAI đề xuất cắt phí, tăng tiết kiệm rõ ràng",
];

const demoCategories = ["Ăn uống", "Đi lại", "Hóa đơn", "Tiết kiệm", "Đầu tư"];

const aiSamples = [
  { q: "Tháng này chi gì nhiều?", a: "Bạn đang chi 42% cho Ăn uống và 26% cho Đi lại. Hãy đặt trần tuần + tự động chuyển phần dư sang tiết kiệm." },
  { q: "Làm sao tiết kiệm?", a: "Tạm đóng băng 2 subscription (250k/tháng), đặt cảnh báo 500k/ngày, chuyển 10% thu nhập vào quỹ khẩn cấp ngay khi nhận lương." },
  { q: "Ngân sách 50/30/20 là gì?", a: "50% thiết yếu, 30% mong muốn, 20% tiết kiệm/đầu tư. FintrAI có thể chia và cảnh báo khi bạn vượt từng phần." },
];

const stays = [
  { title: "Quỹ khẩn cấp", price: "Đã đạt 35.000.000đ", rating: "Tiến độ 70%", tag: "On-track", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80" },
  { title: "Trả nợ thẻ tín dụng", price: "Còn 12.500.000đ", rating: "Tiến độ 40%", tag: "Cần đẩy nhanh", image: "https://images.unsplash.com/photo-1542728000-268c0f9bddc7?auto=format&fit=crop&w=900&q=80" },
  { title: "Tiết kiệm du lịch", price: "Đã đạt 18.000.000đ", rating: "Tiến độ 60%", tag: "Ổn định", image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=900&q=80" },
  { title: "Đầu tư định kỳ", price: "Góp 5.000.000đ/tháng", rating: "Kỷ luật tốt", tag: "Thói quen", image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80" },
  { title: "Mua xe máy", price: "Đã đạt 12.000.000đ", rating: "Tiến độ 50%", tag: "Kiên trì", image: "https://images.unsplash.com/photo-1502877828070-33b167ad6860?auto=format&fit=crop&w=900&q=80" },
  { title: "Quỹ học tập", price: "Đã đạt 20.000.000đ", rating: "Tiến độ 65%", tag: "Ổn định", image: "https://images.unsplash.com/photo-1491841651911-c44c30c34548?auto=format&fit=crop&w=900&q=80" },
  { title: "Cưới hỏi", price: "Đã đạt 45.000.000đ", rating: "Tiến độ 55%", tag: "Đang tích luỹ", image: "https://images.unsplash.com/photo-1499084732479-de2c02d45fcc?auto=format&fit=crop&w=900&q=80" },
  { title: "Quỹ sức khỏe", price: "Đã đạt 25.000.000đ", rating: "Tiến độ 75%", tag: "On-track", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80" },
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
  const [netGrowth, setNetGrowth] = useState(0);
  const [budgetUsage, setBudgetUsage] = useState(0);
  const [chartReady, setChartReady] = useState(false);
  const [socialCounts, setSocialCounts] = useState(socialMetrics.map(() => 0));
  const [activeNav, setActiveNav] = useState("popular");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [demoAmount, setDemoAmount] = useState("");
  const [demoCategory, setDemoCategory] = useState(demoCategories[0]);
  const [demoNote, setDemoNote] = useState("");
  const [demoEntry, setDemoEntry] = useState(null);
  const [aiResponse, setAiResponse] = useState(aiSamples[0].a);
  const popularRef = useRef(null);
  const dealsRef = useRef(null);
  const staysRef = useRef(null);
  const sectionRefs = { popular: popularRef, deals: dealsRef, stays: staysRef };
  const cashflowSeries = [32, 40, 36, 48, 62, 58, 72, 68, 86, 94, 102, 96];
  const budgetSeries = [52, 48, 54, 60, 58, 66, 70, 68, 72, 76, 80, 78];
  const lastCash = cashflowSeries[cashflowSeries.length - 1];
  const lastBudget = budgetSeries[budgetSeries.length - 1];

  useEffect(() => {
    const netTarget = 12.4;
    const budgetTarget = 62;
    const duration = 1100;
    let frameId;
    const start = performance.now();

    const tick = (now) => {
      const rawProgress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(rawProgress);
      if (rawProgress >= 1) {
        setNetGrowth(netTarget);
        setBudgetUsage(budgetTarget);
        return;
      }
      setNetGrowth(Number((netTarget * eased).toFixed(2)));
      setBudgetUsage(Math.round(budgetTarget * eased));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const duration = 1300;
    const start = performance.now();
    let frameId;
    const targets = socialMetrics.map((m) => m.target);

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(progress);
      const next = targets.map((t) => Number((t * eased).toFixed(2)));
      setSocialCounts(next);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("fintr4ck_token");
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section");
            if (id) setActiveNav(id);
          }
        });
      },
      { threshold: 0.42 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const handleScrollTo = (key) => {
    const target = sectionRefs[key]?.current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!demoAmount) return;
    const entry = {
      amount: Number(demoAmount.replace(/\D/g, "")) || Number(demoAmount),
      category: demoCategory,
      note: demoNote,
      type: "CHI TIÊU",
    };
    setDemoEntry(entry);
  };

  const handleAiSample = (ans) => {
    setAiResponse(ans);
  };

  return (
    <PageTransition style={styles.page}>
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
          {[
            { key: "popular", label: "Phổ biến" },
            { key: "deals", label: "Gợi ý" },
            { key: "stays", label: "Mục tiêu" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleScrollTo(item.key)}
              style={{ ...styles.navItem, ...(activeNav === item.key ? styles.navItemActive : {}) }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div style={styles.actions}>
          <Link to="/login" style={styles.linkGhost}>Đăng nhập</Link>
          <Link to={isLoggedIn ? "/dashboard" : "/register"} style={styles.linkPrimary}>
            {isLoggedIn ? "Vào Dashboard" : "Dùng thử miễn phí"}
          </Link>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <span style={styles.pill}>Ưu đãi tài chính real-time</span>
            <h1 style={styles.heroTitle}>Kiểm soát dòng tiền, tiết kiệm chi tiêu và đạt mục tiêu rõ ràng.</h1>
            <p style={styles.heroDesc}>Ghi giao dịch, xem báo cáo tức thì và nhận gợi ý hành động thông minh cho ví tiền của bạn.</p>
            <div style={styles.heroButtons}>
              <Link to={isLoggedIn ? "/dashboard" : "/register"} style={styles.ctaPrimary}>
                {isLoggedIn ? "Vào Dashboard" : "Khám phá ngay"}
              </Link>
              <Link to="/login" style={styles.ctaGhost}>Xem demo</Link>
            </div>
          </div>
          <div style={styles.heroCard}>
            <div style={styles.heroStats}>
              <div>
                <div style={styles.cardLabel}>Dòng tiền ròng</div>
                <div style={styles.cardValue}>+{formatNumber(netGrowth, 1)}%</div>
                <div style={styles.cardHint}>vs tuần trước</div>
              </div>
              <div>
                <div style={styles.cardLabel}>Tỷ lệ dùng ngân sách</div>
                <div style={styles.cardValue}>{formatNumber(budgetUsage, 0)}%</div>
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
                {renderArea(cashflowSeries, 320, 170, "cfArea", true, chartReady)}
                {renderLine(cashflowSeries, 320, 170, "cfLine", 3.5, true, true, chartReady, 0)}
                {renderLine(budgetSeries, 320, 170, "rgba(34,193,195,0.85)", 2.4, false, true, chartReady, 160)}
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
        <div style={styles.heroGlow} aria-hidden />

        <section style={styles.socialProof}>
          <div style={styles.socialGrid}>
            {socialMetrics.map((m, idx) => (
              <div key={m.title} style={styles.socialItem}>
                <div style={styles.socialValue}>{formatNumber(socialCounts[idx] ?? 0, m.suffix === "★" ? 1 : 1)}{m.suffix}</div>
                <div style={styles.socialLabel}>{m.title}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.demoSection}>
          <div style={styles.demoGrid}>
            <div style={styles.demoCard}>
              <div style={styles.demoHeader}>
                <div style={styles.demoTitle}>Thử ghi giao dịch</div>
                <div style={styles.demoHint}>Không cần đăng nhập</div>
              </div>
              <form style={styles.demoForm} onSubmit={handleDemoSubmit}>
                <label style={styles.demoLabel}>
                  Số tiền
                  <input
                    style={styles.demoInput}
                    type="number"
                    value={demoAmount}
                    onChange={(e) => setDemoAmount(e.target.value)}
                    placeholder="50.000"
                    min="0"
                  />
                </label>
                <label style={styles.demoLabel}>
                  Danh mục
                  <select
                    style={styles.demoSelect}
                    value={demoCategory}
                    onChange={(e) => setDemoCategory(e.target.value)}
                  >
                    {demoCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>
                <label style={styles.demoLabel}>
                  Ghi chú (tuỳ chọn)
                  <input
                    style={styles.demoInput}
                    type="text"
                    value={demoNote}
                    onChange={(e) => setDemoNote(e.target.value)}
                    placeholder="Cafe với team"
                  />
                </label>
                <button type="submit" style={styles.demoButton}>Thử ngay</button>
              </form>
              {demoEntry && (
                <div style={styles.demoPreview}>
                  <div style={styles.demoBadge}>Ghi mới</div>
                  <div style={styles.demoPreviewText}>
                    Bạn vừa ghi {demoEntry.type} {demoEntry.amount.toLocaleString("vi-VN")}đ – {demoEntry.category.toLowerCase()}
                  </div>
                  <div style={styles.demoMini}>
                    <div>
                      <div style={styles.demoMiniLabel}>Số dư demo</div>
                      <div style={styles.demoMiniValue}>{(5200000 - demoEntry.amount).toLocaleString("vi-VN")}đ</div>
                    </div>
                    <div style={styles.demoMiniBar}>
                      <div style={{ ...styles.demoMiniFill, width: `${Math.max(12, 100 - demoEntry.amount / 80000)}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.aiCard}>
              <div style={styles.demoHeader}>
                <div style={styles.demoTitle}>Hỏi FintrAI nhanh</div>
                <div style={styles.demoHint}>Preview realtime</div>
              </div>
              <div style={styles.aiChips}>
                {aiSamples.map((s) => (
                  <button key={s.q} style={styles.aiChip} onClick={() => handleAiSample(s.a)}>
                    {s.q}
                  </button>
                ))}
              </div>
              <div style={styles.aiResponse}>
                <div style={styles.aiAvatar}>AI</div>
                <div>
                  <div style={styles.aiLabel}>FintrAI</div>
                  <div style={styles.aiText}>{aiResponse}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.howSection}>
          <h2 style={styles.sectionTitle}>Fintr4ck hoạt động thế nào?</h2>
          <div style={styles.howGrid}>
            {howSteps.map((step) => (
              <div key={step.title} style={styles.howCard}>
                <div style={styles.howIcon}>{step.icon}</div>
                <div>
                  <div style={styles.howTitle}>{step.title}</div>
                  <div style={styles.howDesc}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.compareSection}>
          <h2 style={styles.sectionTitle}>Trước và sau khi dùng Fintr4ck</h2>
          <div style={styles.compareGrid}>
            <div style={styles.compareCol}>
              <div style={styles.compareTitle}>Trước khi dùng</div>
              <div style={styles.compareList}>
                {beforeList.map((item) => (
                  <div key={item} style={styles.compareItem}>
                    <span style={styles.compareIcon}>⛔️</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...styles.compareCol, background: "rgba(14,165,233,0.06)", borderColor: "rgba(14,165,233,0.28)" }}>
              <div style={styles.compareTitle}>Sau khi dùng</div>
              <div style={styles.compareList}>
                {afterList.map((item) => (
                  <div key={item} style={styles.compareItem}>
                    <span style={{ ...styles.compareIcon, background: "rgba(34,197,94,0.14)", color: "#4ade80", borderColor: "rgba(34,197,94,0.3)" }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

    <section id="popular" ref={sectionRefs.popular} data-section="popular" style={styles.section}>
      <h2 style={styles.sectionTitle}>Các danh mục được dùng nhiều</h2>
          <div style={styles.tabs}>
            {tabSections.map((tab, idx) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(idx)}
                style={{ ...styles.tab, ...(activeTab === idx ? styles.tabActive : {}) }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={styles.tabSubtitle}>{tabSections[activeTab].subtitle}</div>
          <div style={{ ...styles.cityGrid, animation: "fadeIn 0.35s ease" }} key={activeTab}>
            {tabSections[activeTab].columns.map((col, i) => (
              <div key={i} style={styles.cityCol}>
                {col.map((city) => (
                  <div key={city} style={styles.cityItem} className="city-item">{city}</div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section id="deals" ref={sectionRefs.deals} data-section="deals" style={styles.section}>
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

        <section id="stays" ref={sectionRefs.stays} data-section="stays" style={styles.section}>
          <h2 style={styles.sectionTitle}>Mục tiêu tài chính nổi bật</h2>
          <div style={styles.stayWrap}>
            <div style={styles.stayTrack}>
              {stayMarquee.map((stay, idx) => (
                <div key={`${stay.title}-${idx}`} style={styles.stayCard}>
                    <div
                      style={{
                        ...styles.stayThumb,
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.12) 10%, rgba(11,16,33,0.72) 70%), url(${stay.image})`,
                      }}
                    />
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
    </PageTransition>
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
  navItem: {
    color: palette.muted,
    textDecoration: "none",
    fontWeight: 700,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px 10px",
    borderRadius: 10,
    transition: "color 0.2s ease, background 0.2s ease",
  },
  navItemActive: {
    color: palette.text,
    background: "rgba(124,58,237,0.16)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
  },
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
    position: "relative",
    overflow: "visible",
    isolation: "isolate",
  },
  heroGlow: {
    position: "absolute",
    inset: "auto 0 -32px 0",
    height: 120,
    background: "radial-gradient(120% 70% at 50% 0%, rgba(124,58,237,0.14), rgba(14,165,233,0.08) 40%, transparent 70%)",
    opacity: 0.09,
    filter: "blur(38px)",
    pointerEvents: "none",
    transform: "translateY(-12px)",
    zIndex: 0,
  },
  socialProof: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    border: `1px solid ${palette.border}`,
    padding: 14,
    boxShadow: "0 14px 36px rgba(0,0,0,0.35)",
  },
  socialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },
  socialItem: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(14,165,233,0.04))",
    border: `1px solid ${palette.border}`,
    display: "grid",
    gap: 4,
    boxShadow: "0 10px 22px rgba(0,0,0,0.28)",
  },
  socialValue: { fontWeight: 800, fontSize: 22, color: palette.text },
  socialLabel: { color: palette.muted, fontSize: 13 },
  demoSection: {
    background: palette.card,
    borderRadius: 24,
    border: `1px solid ${palette.border}`,
    padding: 22,
    boxShadow: palette.shadow,
  },
  demoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  demoCard: {
    borderRadius: 16,
    border: `1px solid ${palette.border}`,
    padding: 16,
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    display: "grid",
    gap: 12,
  },
  demoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  demoTitle: { fontWeight: 800, fontSize: 16 },
  demoHint: { color: palette.muted, fontSize: 13 },
  demoForm: { display: "grid", gap: 10 },
  demoLabel: { display: "grid", gap: 6, color: palette.muted, fontSize: 13, fontWeight: 700 },
  demoInput: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.04)",
    color: palette.text,
  },
  demoSelect: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.04)",
    color: palette.text,
  },
  demoButton: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    color: "#f8fafc",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(14,165,233,0.3)",
  },
  demoPreview: {
    marginTop: 4,
    padding: 12,
    borderRadius: 14,
    border: `1px solid ${palette.border}`,
    background: "rgba(14,165,233,0.06)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
    display: "grid",
    gap: 8,
  },
  demoBadge: {
    alignSelf: "flex-start",
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(124,58,237,0.16)",
    color: "#c4b5fd",
    fontWeight: 700,
    fontSize: 12,
  },
  demoPreviewText: { fontWeight: 700, color: palette.text },
  demoMini: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  demoMiniLabel: { color: palette.muted, fontSize: 12 },
  demoMiniValue: { fontWeight: 800, color: palette.text },
  demoMiniBar: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${palette.border}`,
    overflow: "hidden",
  },
  demoMiniFill: {
    height: "100%",
    background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
  },
  aiCard: {
    borderRadius: 16,
    border: `1px solid ${palette.border}`,
    padding: 16,
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    display: "grid",
    gap: 12,
  },
  aiChips: { display: "flex", flexWrap: "wrap", gap: 8 },
  aiChip: {
    border: `1px solid ${palette.border}`,
    borderRadius: 999,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.05)",
    color: palette.text,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 10px 22px rgba(0,0,0,0.22)",
  },
  aiResponse: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    borderRadius: 14,
    border: `1px solid ${palette.border}`,
    background: "rgba(11,16,33,0.6)",
    padding: 12,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#0b1021",
  },
  aiLabel: { fontWeight: 800, color: palette.text },
  aiText: { color: palette.muted, lineHeight: 1.5, fontSize: 14 },
  howSection: {
    background: palette.card,
    borderRadius: 24,
    border: `1px solid ${palette.border}`,
    padding: 22,
    boxShadow: palette.shadow,
  },
  howGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 12,
  },
  howCard: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },
  howIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontSize: 22,
    background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(14,165,233,0.18))",
    border: `1px solid ${palette.border}`,
    boxShadow: "0 12px 24px rgba(0,0,0,0.28)",
  },
  howTitle: { fontWeight: 800, fontSize: 16, marginBottom: 4 },
  howDesc: { color: palette.muted, fontSize: 14, lineHeight: 1.5 },
  compareSection: {
    background: palette.card,
    borderRadius: 24,
    border: `1px solid ${palette.border}`,
    padding: 22,
    boxShadow: palette.shadow,
  },
  compareGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  compareCol: {
    padding: 14,
    borderRadius: 16,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
    display: "grid",
    gap: 10,
  },
  compareTitle: { fontWeight: 800, fontSize: 16 },
  compareList: { display: "grid", gap: 8 },
  compareItem: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    color: palette.text,
    fontWeight: 600,
    lineHeight: 1.45,
  },
  compareIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    fontSize: 14,
    background: "rgba(239,68,68,0.12)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.28)",
    flexShrink: 0,
  },
  heroLeft: { display: "grid", gap: 14, position: "relative", zIndex: 1 },
  pill: {
    alignSelf: "flex-start",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(124,58,237,0.15)",
    color: "#c4b5fd",
    fontWeight: 700,
    fontSize: 12,
    boxShadow: "0 0 0 0 rgba(124,58,237,0.28)",
    animation: "glowPulse 2.7s ease-in-out infinite",
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
    position: "relative",
    zIndex: 1,
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
  tabSubtitle: { marginBottom: 14, color: palette.muted, fontSize: 14 },
  cityGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, alignItems: "stretch" },
  cityCol: { display: "grid", gap: 10, color: palette.muted, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${palette.border}`, height: "100%" },
  cityItem: {
    fontSize: 14,
    fontWeight: 700,
    color: palette.text,
    padding: "12px 12px",
    lineHeight: 1.45,
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${palette.border}`,
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
  },
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
  stayThumb: {
    height: 140,
    background: "linear-gradient(135deg, #2563eb, #22c1c3)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes glowPulse {
  0% { box-shadow: 0 0 0 0 rgba(124,58,237,0.28); opacity: 0.96; }
  50% { box-shadow: 0 0 20px 10px rgba(14,165,233,0.22); opacity: 1; }
  100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.18); opacity: 0.93; }
}

.city-item:hover {
  transform: translateY(-2px);
  border-color: rgba(124,58,237,0.55);
  box-shadow: 0 12px 26px rgba(0,0,0,0.28);
  background: rgba(255,255,255,0.06);
}
`;

function formatNumber(value, decimals = 0) {
  return value.toFixed(decimals).replace(".", ",");
}

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

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function renderLine(series, width, height, stroke, strokeWidth = 2, glow = false, animate = false, ready = false, delay = 0) {
  const pts = normalizeSeries(series, width, height - 32); // top padding
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y + 18}`).join(" ");
  const animationStyle = animate
    ? {
        pathLength: 1,
        style: {
          strokeDasharray: 1,
          strokeDashoffset: ready ? 0 : 1,
          transition: `stroke-dashoffset 1.2s ease-out ${delay}ms`,
        },
      }
    : {};
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
      {...animationStyle}
    />
  ) : null;
  return (
    <>
      {glowPath}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        {...animationStyle}
      />
    </>
  );
}

function renderArea(series, width, height, fill, animate = false, ready = false) {
  const pts = normalizeSeries(series, width, height - 32);
  const d = [
    `M ${0} ${height}`,
    ...pts.map((p) => `L ${p.x} ${p.y + 18}`),
    `L ${width} ${height}`,
    "Z",
  ].join(" ");
  const style = animate
    ? {
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.65s ease-out 0.15s, transform 0.9s ease-out 0.15s",
      }
    : undefined;
  return <path d={d} fill={`url(#${fill})`} stroke="none" style={style} />;
}
