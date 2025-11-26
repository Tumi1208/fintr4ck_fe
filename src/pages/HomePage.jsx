import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { useBreakpoint } from "../hooks/useBreakpoint";
import ModalDialog from "../components/ModalDialog";
import { apiCreateTransaction } from "../api/transactions";

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

const demoGoals = [
  { title: "Quỹ khẩn cấp", currentAmount: 35000000, targetAmount: 50000000, status: "On-track" },
  { title: "Trả nợ thẻ tín dụng", currentAmount: 7300000, targetAmount: 14000000, status: "At risk" },
  { title: "Tiết kiệm du lịch", currentAmount: 12000000, targetAmount: 20000000, status: "On-track" },
  { title: "Đầu tư định kỳ", currentAmount: 18000000, targetAmount: 30000000, status: "On-track" },
  { title: "Mua xe máy", currentAmount: 8000000, targetAmount: 16000000, status: "At risk" },
];

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
  const [tipsModalOpen, setTipsModalOpen] = useState(false);
  const [lockedTooltip, setLockedTooltip] = useState("");
  const [demoAmount, setDemoAmount] = useState("");
  const [demoCategory, setDemoCategory] = useState(demoCategories[0]);
  const [demoNote, setDemoNote] = useState("");
  const [demoTransactions, setDemoTransactions] = useState([]);
  const [aiResponse, setAiResponse] = useState(aiSamples[0].a);
  const [demoToast, setDemoToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const goalsRef = useRef(null);
  const goalAutoTimer = useRef(null);
  const goalRaf = useRef(null);
  const [isGoalHover, setIsGoalHover] = useState(false);
  const popularRef = useRef(null);
  const staysRef = useRef(null);
  const sectionRefs = useMemo(() => ({ popular: popularRef, stays: staysRef }), []);
  const cashflowSeries = [32, 40, 36, 48, 62, 58, 72, 68, 86, 94, 102, 96];
  const budgetSeries = [52, 48, 54, 60, 58, 66, 70, 68, 72, 76, 80, 78];
  const lastCash = cashflowSeries[cashflowSeries.length - 1];
  const lastBudget = budgetSeries[budgetSeries.length - 1];
  const { isMobile, isTablet } = useBreakpoint();
  const styles = useMemo(() => createStyles({ isMobile, isTablet }), [isMobile, isTablet]);
  const navigate = useNavigate();

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
    setGoalsLoading(true);
    if (isLoggedIn) {
      const mock = [
        { title: "Quỹ khẩn cấp", currentAmount: 36000000, targetAmount: 50000000, status: "On-track" },
        { title: "Trả nợ thẻ tín dụng", currentAmount: 8200000, targetAmount: 14000000, status: "At risk" },
        { title: "Tiết kiệm du lịch", currentAmount: 15000000, targetAmount: 22000000, status: "On-track" },
        { title: "Đầu tư định kỳ", currentAmount: 24000000, targetAmount: 32000000, status: "On-track" },
        { title: "Mua xe máy", currentAmount: 9000000, targetAmount: 16000000, status: "At risk" },
      ];
      setGoals(mock);
      setGoalsLoading(false);
    } else {
      setGoals(demoGoals);
      setGoalsLoading(false);
    }
  }, [isLoggedIn]);

  const goalsFlow = useMemo(() => {
    if (goalsLoading) return [];
    const visible = goals.slice(0, 5);
    return [...visible, ...visible];
  }, [goals, goalsLoading]);

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
  }, [sectionRefs]);

  const handleScrollTo = (key) => {
    const target = sectionRefs[key]?.current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoAmount) return;
    const amount = Number(demoAmount.replace(/\D/g, "")) || Number(demoAmount);
    if (!amount || Number.isNaN(amount)) return;
    const entry = {
      id: Date.now(),
      amount,
      category: demoCategory,
      note: demoNote || "Giao dịch demo",
      type: "expense",
      date: new Date().toISOString(),
      isDemo: !isLoggedIn,
      pending: isLoggedIn,
    };

    if (!isLoggedIn) {
      setDemoTransactions((prev) => [entry, ...prev].slice(0, 5));
      setDemoToast({ message: "Đã thêm vào demo. Đăng ký để lưu thật!", tone: "info" });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setDemoToast(null), 2200);
      setDemoAmount("");
      setDemoNote("");
      return;
    }

    // Logged-in: optimistic update then call API
    setDemoTransactions((prev) => [entry, ...prev].slice(0, 5));
    setDemoAmount("");
    setDemoNote("");
    try {
      const res = await apiCreateTransaction({
        amount,
        type: "expense",
        note: entry.note,
        categoryName: entry.category,
        source: "home_demo",
      });
      const normalized = res.transaction || res || {};
      const committed = {
        ...entry,
        ...normalized,
        id: normalized.id || normalized._id || entry.id,
        pending: false,
        isDemo: false,
      };
      setDemoTransactions((prev) => [committed, ...prev.filter((t) => t.id !== entry.id)].slice(0, 5));
      setDemoToast({ message: "Đã thêm giao dịch!", tone: "success" });
    } catch (err) {
      console.error(err);
      setDemoTransactions((prev) => prev.filter((t) => t.id !== entry.id));
      setDemoToast({ message: "Không thể lưu. Vui lòng thử lại.", tone: "danger" });
    } finally {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setDemoToast(null), 2400);
    }
  };

  const handleAiSample = (ans) => {
    setAiResponse(ans);
  };

  const handleHoverIn = (e) => {
    if (!e?.currentTarget) return;
    e.currentTarget.style.transform = "translateY(-1px)";
    e.currentTarget.style.boxShadow = "0 16px 32px rgba(14,165,233,0.3)";
  };

  const handleHoverOut = (e, baseShadow = palette.shadow) => {
    if (!e?.currentTarget) return;
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = baseShadow;
  };

  const handleCategoryClick = (category) => {
    if (isLoggedIn) {
      navigate(`/app/categories?group=${encodeURIComponent(category)}`);
    } else {
      setLockedTooltip("Đăng ký để tạo danh mục");
      setTimeout(() => setLockedTooltip(""), 1600);
    }
  };

  const scrollGoals = (dir = 1) => {
    const el = goalsRef.current;
    if (!el) return;
    const view = el.clientWidth || 320;
    const delta = view * 0.9 * dir;
    const max = el.scrollWidth - view;
    const target = el.scrollLeft + delta;
    if (target >= max && dir > 0) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (target <= 0 && dir < 0) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      el.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  const handleGoalClick = () => {
    if (isLoggedIn) {
      navigate("/app/templates");
    } else {
      navigate("/register");
    }
  };

  useEffect(() => {
    if (goalAutoTimer.current) clearInterval(goalAutoTimer.current);
    if (goalRaf.current) cancelAnimationFrame(goalRaf.current);
    if (goalsLoading || goals.length <= 1) return undefined;

    const el = goalsRef.current;
    if (!el) return undefined;

    const speed = 0.28; // px per ms for smooth flow
    let last = performance.now();

    const tick = (now) => {
      if (!el) return;
      const dt = now - last;
      last = now;
      if (!isGoalHover) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          const next = el.scrollLeft + dt * speed;
          if (next >= max) {
            el.scrollLeft = 0;
          } else {
            el.scrollLeft = next;
          }
        }
      }
      goalRaf.current = requestAnimationFrame(tick);
    };

    goalRaf.current = requestAnimationFrame(tick);

    return () => {
      if (goalRaf.current) cancelAnimationFrame(goalRaf.current);
    };
  }, [goalsLoading, goals.length, isGoalHover]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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
          <Link to={isLoggedIn ? "/app/dashboard" : "/register"} style={styles.linkPrimary}>
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
              <Link
                to={isLoggedIn ? "/app/dashboard" : "/register"}
                style={styles.ctaPrimary}
                onMouseEnter={handleHoverIn}
                onFocus={handleHoverIn}
                onBlur={(e) => handleHoverOut(e, styles.ctaPrimary.boxShadow)}
              >
                {isLoggedIn ? "Vào Dashboard" : "Khám phá ngay"}
              </Link>
              <Link
                to={isLoggedIn ? "/app/dashboard" : "/demo"}
                style={styles.ctaGhost}
                onMouseEnter={handleHoverIn}
                onFocus={handleHoverIn}
                onBlur={(e) => handleHoverOut(e, styles.ctaGhost.boxShadow || palette.shadow)}
              >
                Xem demo
              </Link>
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
              {demoToast && (
                <div style={{ ...styles.demoPreview, borderColor: demoToast.tone === "danger" ? "rgba(248,113,113,0.4)" : styles.demoPreview.border }}>
                  <div style={styles.demoBadge}>{demoToast.tone === "success" ? "Thành công" : "Thông báo"}</div>
                  <div style={styles.demoPreviewText}>{demoToast.message}</div>
                </div>
              )}
              <div style={styles.demoSummary}>
                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>Tổng chi demo</div>
                  <div style={styles.summaryValue}>
                    {demoTransactions
                      .filter((t) => t.type !== "income")
                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                      .toLocaleString("vi-VN")}
                    đ
                  </div>
                </div>
                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>Tổng thu demo</div>
                  <div style={styles.summaryValue}>
                    {demoTransactions
                      .filter((t) => t.type === "income")
                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                      .toLocaleString("vi-VN")}
                    đ
                  </div>
                </div>
                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>Delta</div>
                  <div style={styles.summaryValue}>
                    {(() => {
                      const income = demoTransactions.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
                      const expense = demoTransactions.filter((t) => t.type !== "income").reduce((s, t) => s + (t.amount || 0), 0);
                      const delta = income - expense;
                      return `${delta >= 0 ? "+" : ""}${delta.toLocaleString("vi-VN")}đ`;
                    })()}
                  </div>
                </div>
              </div>
              <div style={styles.demoList}>
                {demoTransactions.length === 0 ? (
                  <div style={styles.demoEmpty}>Chưa có giao dịch demo. Hãy thử thêm một khoản!</div>
                ) : (
                  demoTransactions.map((tx) => {
                    const isIncome = tx.type === "income";
                    return (
                      <div key={tx.id} style={styles.demoRow}>
                        <div>
                          <div style={styles.demoRowTitle}>{tx.note || "Giao dịch"}</div>
                          <div style={styles.demoRowMeta}>{tx.category} • {new Date(tx.date || Date.now()).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        <div style={{ ...styles.demoRowAmount, color: isIncome ? "#22c55e" : "#fca5a5" }}>
                          {isIncome ? "+" : "-"}{tx.amount.toLocaleString("vi-VN")}đ
                          {tx.pending && <span style={styles.pendingDot}>...</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
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
          {!isLoggedIn && lockedTooltip && <div style={styles.lockedHint}>{lockedTooltip}</div>}
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
                  <div
                    key={city}
                    style={styles.cityItem}
                    className="city-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCategoryClick(city)}
                    onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(city)}
                    title={isLoggedIn ? undefined : "Đăng ký để tạo danh mục"}
                  >
                    {city}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>


        <section id="stays" ref={sectionRefs.stays} data-section="stays" style={styles.section}>
          <h2 style={styles.sectionTitle}>Mục tiêu tài chính nổi bật</h2>
          <div style={styles.goalBar}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {!isLoggedIn && <span style={styles.goalBadge}>Ví dụ mục tiêu</span>}
              {isLoggedIn && <span style={styles.goalBadge}>Dữ liệu của bạn</span>}
              {!isLoggedIn && (
                <span style={styles.goalHint}>Đăng ký để theo dõi mục tiêu thật.</span>
              )}
            </div>
            <div style={styles.goalControls}>
              {!isLoggedIn && (
                <Link to="/register" style={styles.goalCTA}>Tạo mục tiêu của bạn</Link>
              )}
              <div style={styles.arrowGroup}>
                <button style={styles.arrowBtn} onClick={() => scrollGoals(-1)} aria-label="Cuộn trái">←</button>
                <button style={styles.arrowBtn} onClick={() => scrollGoals(1)} aria-label="Cuộn phải">→</button>
              </div>
            </div>
          </div>
          <div
            style={styles.goalScroller}
            ref={goalsRef}
            onMouseEnter={() => setIsGoalHover(true)}
            onMouseLeave={() => setIsGoalHover(false)}
          >
            {goalsLoading ? (
              <div style={styles.goalLoading}>Đang tải mục tiêu...</div>
            ) : goalsFlow.length === 0 ? (
              <div style={styles.goalLoading}>Chưa có mục tiêu nào. Hãy tạo mục tiêu mới!</div>
            ) : (
              goalsFlow.map((goal, idx) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const statusTone =
                  goal.status === "Completed" ? "success" : goal.status === "At risk" ? "danger" : "info";
                const targetLabel = `${goal.currentAmount.toLocaleString("vi-VN")}đ / ${goal.targetAmount.toLocaleString("vi-VN")}đ`;
                const statusLabel = goal.status === "Completed" ? "Hoàn thành" : goal.status === "At risk" ? "Cần chú ý" : "On-track";
                return (
                  <button
                    key={`${goal.title}-${idx}`}
                    style={styles.goalCard}
                    onClick={() => handleGoalClick()}
                    onMouseEnter={handleHoverIn}
                    onMouseLeave={(e) => handleHoverOut(e, styles.goalCard.boxShadow)}
                    onFocus={handleHoverIn}
                    onBlur={(e) => handleHoverOut(e, styles.goalCard.boxShadow)}
                  >
                    <div style={styles.goalTop}>
                      <div style={styles.goalTitle}>{goal.title}</div>
                      <span style={{ ...styles.goalStatus, ...(statusTone === "danger" ? styles.goalStatusDanger : statusTone === "success" ? styles.goalStatusSuccess : styles.goalStatusInfo) }}>
                        {statusLabel}
                      </span>
                    </div>
                    <div style={styles.goalTarget}>{targetLabel}</div>
                    <div style={styles.goalProgress}>
                      <div style={{ ...styles.goalProgressFill, width: `${percent}%`, background: percent >= 100 ? "linear-gradient(135deg, #22c55e, #0ea5e9)" : statusTone === "danger" ? "linear-gradient(135deg, #f97316, #fb7185)" : "linear-gradient(135deg, #7c3aed, #0ea5e9)" }} />
                    </div>
                    <div style={styles.goalMeta}>
                      <span>Tiến độ</span>
                      <strong>{percent}%</strong>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </main>

      <ModalDialog
        open={tipsModalOpen}
        title="3 gợi ý tiết kiệm nhanh"
        message={
          "• Chuyển 10% lương vào quỹ ngay khi nhận\n" +
          "• Đặt trần 500k/ngày cho ăn uống, tự động chuyển dư sang Tiết kiệm\n" +
          "• Huỷ 2 subscription ít dùng để tiết kiệm mỗi tháng"
        }
        confirmText="Đăng ký để xem đầy đủ"
        cancelText="Đóng"
        onConfirm={() => navigate("/register")}
        onCancel={() => setTipsModalOpen(false)}
      />

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

const baseStyles = {
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
  demoSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 10,
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.04)",
  },
  summaryItem: { display: "grid", gap: 4 },
  summaryLabel: { color: palette.muted, fontSize: 12 },
  summaryValue: { fontWeight: 800, color: palette.text },
  demoList: {
    marginTop: 10,
    display: "grid",
    gap: 10,
  },
  demoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 10,
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.03)",
  },
  demoRowTitle: { fontWeight: 700, color: palette.text },
  demoRowMeta: { color: palette.muted, fontSize: 12 },
  demoRowAmount: { fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 6 },
  pendingDot: { color: palette.muted, fontSize: 12 },
  demoEmpty: {
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.02)",
    color: palette.muted,
    textAlign: "center",
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
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    color: "#0b1021",
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: palette.shadow,
    minWidth: 0,
    transition: "transform 0.15s ease, box-shadow 0.25s ease, opacity 0.15s ease",
    outline: "2px solid transparent",
    outlineOffset: 2,
  },
  ctaGhost: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.04)",
    color: palette.text,
    fontWeight: 700,
    textDecoration: "none",
    minWidth: 0,
    transition: "transform 0.15s ease, box-shadow 0.25s ease, opacity 0.15s ease",
    outline: "2px solid transparent",
    outlineOffset: 2,
  },
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
    cursor: "pointer",
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
    pointerEvents: "auto",
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
    boxShadow: palette.shadow,
    transition: "transform 0.15s ease, box-shadow 0.25s ease, opacity 0.15s ease",
  },
  goalBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  goalBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.04)",
    color: palette.text,
    fontWeight: 800,
    fontSize: 13,
  },
  goalHint: { color: palette.muted, fontSize: 13 },
  goalControls: { display: "flex", alignItems: "center", gap: 10 },
  goalCTA: {
    padding: "10px 14px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    color: "#0b1021",
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: palette.shadow,
  },
  arrowGroup: { display: "flex", gap: 8 },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.06)",
    color: palette.text,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
  },
  goalScroller: {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "minmax(280px, 340px)",
    gap: 12,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    paddingBottom: 6,
    scrollbarWidth: "thin",
  },
  goalCard: {
    borderRadius: 16,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.04)",
    padding: 14,
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    textAlign: "left",
    scrollSnapAlign: "start",
    minWidth: 240,
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.25s ease",
  },
  goalTop: { display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" },
  goalTitle: { fontWeight: 800, fontSize: 15 },
  goalStatus: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${palette.border}`,
    fontWeight: 700,
    fontSize: 12,
  },
  goalStatusDanger: { color: "#fca5a5", borderColor: "rgba(248,113,113,0.35)", background: "rgba(248,113,113,0.12)" },
  goalStatusSuccess: { color: "#4ade80", borderColor: "rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.12)" },
  goalStatusInfo: { color: "#c4b5fd", borderColor: "rgba(124,58,237,0.35)", background: "rgba(124,58,237,0.12)" },
  goalTarget: { color: palette.muted, fontSize: 13, marginTop: 8 },
  goalProgress: {
    marginTop: 10,
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${palette.border}`,
    overflow: "hidden",
  },
  goalProgressFill: { height: "100%", borderRadius: 999, boxShadow: "0 10px 24px rgba(14,165,233,0.3)" },
  goalMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, color: palette.muted, fontSize: 13 },
  goalLoading: {
    padding: 16,
    borderRadius: 14,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.03)",
    color: palette.muted,
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
  },
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
  lockedHint: {
    marginBottom: 8,
    color: palette.muted,
    fontSize: 13,
    padding: "8px 12px",
    borderRadius: 10,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.03)",
  },
};

function createStyles({ isMobile, isTablet }) {
  return {
    ...baseStyles,
    header: {
      ...baseStyles.header,
      padding: isMobile ? "16px 14px" : "24px 20px",
      gap: isMobile ? 12 : 20,
      flexWrap: isTablet ? "wrap" : "nowrap",
      alignItems: isTablet ? "flex-start" : "center",
      rowGap: isTablet ? 12 : 0,
    },
    nav: {
      ...baseStyles.nav,
      gap: isMobile ? 10 : 16,
      flex: isTablet ? "1 1 100%" : "0 0 auto",
      order: isTablet ? 3 : 0,
      overflowX: isTablet ? "auto" : "visible",
      paddingBottom: isTablet ? 6 : 0,
    },
    actions: {
      ...baseStyles.actions,
      gap: isMobile ? 8 : 10,
      flexWrap: isTablet ? "wrap" : "nowrap",
      width: isTablet ? "100%" : "auto",
      justifyContent: isTablet ? "flex-start" : "flex-end",
      order: isTablet ? 2 : 0,
    },
    linkGhost: {
      ...baseStyles.linkGhost,
      width: isMobile ? "100%" : "auto",
      textAlign: "center",
    },
    linkPrimary: {
      ...baseStyles.linkPrimary,
      width: isMobile ? "100%" : "auto",
      textAlign: "center",
    },
    main: {
      ...baseStyles.main,
      padding: isMobile ? "0 14px 48px" : isTablet ? "0 18px 56px" : "0 20px 60px",
      gap: isMobile ? 24 : baseStyles.main.gap,
    },
    hero: {
      ...baseStyles.hero,
      gridTemplateColumns: isTablet ? "1fr" : "1.2fr 1fr",
      padding: isMobile ? 18 : 28,
      gap: isMobile ? 16 : 24,
    },
    heroTitle: {
      ...baseStyles.heroTitle,
      fontSize: isMobile ? 26 : isTablet ? 32 : 36,
    },
    heroDesc: {
      ...baseStyles.heroDesc,
      fontSize: isMobile ? 14 : 16,
    },
    heroButtons: {
      ...baseStyles.heroButtons,
      flexWrap: "wrap",
      flexDirection: isMobile ? "column" : "row",
      width: "100%",
      alignItems: isMobile ? "stretch" : "center",
    },
    ctaPrimary: {
      ...baseStyles.ctaPrimary,
      width: isMobile ? "100%" : "auto",
    },
    ctaGhost: {
      ...baseStyles.ctaGhost,
      width: isMobile ? "100%" : "auto",
    },
    heroCard: {
      ...baseStyles.heroCard,
      borderRadius: isMobile ? 18 : 24,
      minWidth: 0,
    },
    heroStats: {
      ...baseStyles.heroStats,
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    },
    chartShell: {
      ...baseStyles.chartShell,
      height: isMobile ? 200 : 220,
    },
    chartMeta: {
      ...baseStyles.chartMeta,
      position: isMobile ? "static" : "absolute",
      marginTop: isMobile ? 10 : 0,
      alignSelf: isMobile ? "stretch" : undefined,
      width: isMobile ? "100%" : "auto",
    },
    sectionTitle: {
      ...baseStyles.sectionTitle,
      fontSize: isMobile ? 20 : 24,
    },
    footerBottom: {
      ...baseStyles.footerBottom,
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
    },
  };
}

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
