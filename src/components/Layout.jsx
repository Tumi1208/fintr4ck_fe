// src/components/Layout.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ChatbotWidget from "./ChatbotWidget";
import PageTransition from "./PageTransition";
import Icon from "./ui/Icon";
import ScrollToTopButton from "./common/ScrollToTopButton";
import { useBreakpoint } from "../hooks/useBreakpoint";

const palette = {
  bg: "var(--bg-primary)",
  card: "var(--bg-card)",
  surface: "var(--bg-surface)",
  border: "var(--border-soft)",
  text: "var(--text-strong)",
  muted: "var(--text-muted)",
  primary: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
};

const navItems = [
  { to: "/app", label: "Dashboard", icon: "dashboard", tone: "brand", exact: true },
  { to: "/app/transactions", label: "Transactions", icon: "receipt", tone: "blue" },
  { to: "/app/categories", label: "Categories", icon: "puzzle", tone: "brand" },
  { to: "/app/challenges", label: "Challenges", icon: "flag", tone: "amber" },
  { to: "/app/my-challenges", label: "My Challenges", icon: "checkBadge", tone: "green" },
  { to: "/app/templates", label: "Templates", icon: "clipboard", tone: "slate" },
  { to: "/app/resources", label: "Resources", icon: "book", tone: "brand" },
  { to: "/app/settings", label: "Settings", icon: "gear", tone: "slate" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const navRefs = useRef({});
  const [ripple, setRipple] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const MotionSpan = motion.span;
  const MotionDiv = motion.div;
  const { isMobile, isTablet } = useBreakpoint();
  const styles = useMemo(() => getStyles({ isMobile, isTablet, sidebarOpen }), [isMobile, isTablet, sidebarOpen]);

  useEffect(() => {
    const sidebarEl = sidebarRef.current;
    if (!sidebarEl) return;

    const activeItem = navItems.find((item) =>
      item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    const targetEl = activeItem ? navRefs.current[activeItem.to] : null;
    const sidebarRect = sidebarEl.getBoundingClientRect();
    const { x, y } = targetEl
      ? (() => {
          const rect = targetEl.getBoundingClientRect();
          return {
            x: rect.left - sidebarRect.left + rect.width / 2,
            y: rect.top - sidebarRect.top + rect.height / 2,
          };
        })()
      : { x: sidebarRect.width / 2, y: 60 };

    setRipple({
      x,
      y,
      key: `${location.pathname}-${Date.now()}`,
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, location.pathname]);

  function handleLogout() {
    localStorage.removeItem("fintr4ck_token");
    navigate("/login");
  }

  return (
    <div style={styles.shell}>
      <div style={styles.backdrop} />
      {isMobile && (
        <div style={styles.mobileTopbar}>
          <button type="button" style={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Mở menu">
            <Icon name="menu" tone="brand" size={18} />
          </button>
          <div style={styles.mobileBrand}>
            <img src="/logo.svg" alt="Fintr4ck" style={styles.logoImg} />
            <div style={{ display: "grid", lineHeight: 1.2 }}>
              <span style={styles.logoText}>Fintr4ck</span>
              <span style={{ ...styles.logoSub, fontSize: 10 }}>Personal Finance</span>
            </div>
          </div>
          <button type="button" style={styles.mobileLogout} onClick={handleLogout}>
            Thoát
          </button>
        </div>
      )}

      <div
        style={styles.sidebarOverlay}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />
      <aside style={styles.sidebar} ref={sidebarRef}>
        {isMobile && (
          <button
            type="button"
            aria-label="Đóng menu"
            style={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon name="close" tone="slate" size={16} />
          </button>
        )}
        <AnimatePresence>
          {ripple && (
            <MotionSpan
              key={ripple.key}
              style={{ ...styles.ripple, top: ripple.y, left: ripple.x }}
              initial={{ opacity: 0.28, scale: 0.2 }}
              animate={{ opacity: 0.12, scale: 1.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.72, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <div style={styles.sideLogo}>
          <img src="/logo.svg" alt="Fintr4ck" style={styles.logoImg} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={styles.logoText}>Fintr4ck</span>
            <span style={styles.logoSub}>Personal Finance</span>
          </div>
        </div>

        <nav style={styles.navList}>
          {navItems.map((item) => (
            <div
              key={item.to}
              style={styles.navItemWrap}
              ref={(el) => {
                if (el) navRefs.current[item.to] = el;
              }}
            >
              <NavLink
                to={item.to}
                end={item.exact}
                onClick={() => isMobile && setSidebarOpen(false)}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  color: isActive ? "#0b1021" : palette.text,
                  border: isActive ? "1px solid rgba(124,58,237,0.35)" : `1px solid ${palette.border}`,
                  boxShadow: isActive ? "0 12px 32px rgba(14,165,233,0.32)" : "0 10px 24px rgba(0,0,0,0.2)",
                })}
              >
                {({ isActive }) => {
                  const iconStyle = {
                    ...styles.navIconWrap,
                    ...(isActive ? styles.navIconActive : {}),
                    ...(item.icon === "puzzle" && isActive ? styles.puzzleGlow : {}),
                  };
                  return (
                    <>
                      {isActive && (
                        <MotionDiv
                          layoutId="navActiveBg"
                          style={styles.navActiveBg}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span style={iconStyle}>
                        <Icon name={item.icon} tone={item.tone || "brand"} size={18} />
                      </span>
                      <span style={{ ...styles.navLabel, color: isActive ? "#0b1021" : palette.text }}>
                        {item.label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            </div>
          ))}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <PageTransition key={location.pathname} style={styles.mainInner}>
          <Outlet />
        </PageTransition>
      </main>

      <ScrollToTopButton />
      <ChatbotWidget />
    </div>
  );
}

function getStyles({ isMobile, isTablet, sidebarOpen }) {
  const sidebarWidth = isMobile ? "82vw" : isTablet ? 230 : 260;
  const cardRadius = isMobile ? 18 : 24;
  const mainPadding = isMobile ? 12 : 24;

  return {
    shell: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      position: "relative",
      background: palette.bg,
      color: palette.text,
      width: "100%",
      overflowX: "hidden",
    },
    backdrop: {
      position: "fixed",
      inset: 0,
      background:
        "radial-gradient(circle at 15% 20%, rgba(124,58,237,0.18), transparent 30%), radial-gradient(circle at 82% 5%, rgba(14,165,233,0.16), transparent 32%), radial-gradient(circle at 60% 74%, rgba(34,193,195,0.14), transparent 26%), var(--bg-primary)",
      zIndex: 0,
    },
    mobileTopbar: {
      display: isMobile ? "flex" : "none",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "12px 16px",
      position: "sticky",
      top: 0,
      zIndex: 3,
      background: "rgba(11,16,33,0.94)",
      borderBottom: `1px solid ${palette.border}`,
      boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
      backdropFilter: "blur(12px)",
    },
    menuBtn: {
      borderRadius: 12,
      border: `1px solid ${palette.border}`,
      background: "rgba(255,255,255,0.06)",
      padding: 8,
      cursor: "pointer",
      color: palette.text,
    },
    mobileBrand: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
    mobileLogout: {
      borderRadius: 12,
      border: `1px solid ${palette.border}`,
      background: "rgba(255,255,255,0.08)",
      color: palette.text,
      padding: "8px 12px",
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    sidebarOverlay: {
      display: isMobile && sidebarOpen ? "block" : "none",
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.48)",
      zIndex: 2,
      transition: "opacity 0.2s ease",
    },
    sidebar: {
      position: isMobile ? "fixed" : "sticky",
      top: isMobile ? 12 : 0,
      left: isMobile ? 12 : 0,
      width: sidebarWidth,
      maxWidth: isMobile ? "calc(100vw - 24px)" : sidebarWidth,
      minHeight: isMobile ? "calc(100vh - 24px)" : "100vh",
      background: palette.surface,
      backdropFilter: "blur(14px)",
      borderRight: `1px solid ${palette.border}`,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      zIndex: isMobile ? 3 : 1,
      boxShadow: isMobile ? "0 20px 48px rgba(0,0,0,0.55)" : "0 16px 42px rgba(0,0,0,0.35)",
      overflow: "hidden",
      isolation: "isolate",
      transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-110%)") : "translateX(0)",
      transition: "transform 0.22s ease, box-shadow 0.22s ease",
      pointerEvents: isMobile && !sidebarOpen ? "none" : "auto",
      borderRadius: isMobile ? 20 : 0,
    },
    closeBtn: {
      position: "absolute",
      right: 12,
      top: 12,
      background: "rgba(255,255,255,0.06)",
      border: `1px solid ${palette.border}`,
      borderRadius: 12,
      padding: 8,
      cursor: "pointer",
      color: palette.text,
    },
    navList: {
      marginTop: 28,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      zIndex: 1,
    },
    navItemWrap: {
      position: "relative",
    },
    sideLogo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 6,
    },
    logoImg: {
      width: 38,
      height: 38,
    },
    logoText: {
      fontWeight: 700,
      color: palette.text,
      fontSize: 18,
    },
    logoSub: {
      fontSize: 11,
      color: palette.muted,
    },
    navItem: {
      display: "flex",
      alignItems: "center",
      padding: isMobile ? "10px 12px" : "11px 14px",
      borderRadius: 999,
      fontSize: 14,
      transition: "transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease",
      textDecoration: "none",
      gap: 12,
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(140deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    },
    navActiveBg: {
      position: "absolute",
      inset: -3,
      borderRadius: 999,
      background: "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(14,165,233,0.92))",
      boxShadow: "0 14px 38px rgba(14,165,233,0.32)",
      zIndex: 0,
    },
    navIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
      position: "relative",
      zIndex: 1,
    },
    navIconActive: {
      background: "rgba(11,16,33,0.16)",
      border: "1px solid rgba(0,0,0,0.05)",
    },
    puzzleGlow: {
      boxShadow: "0 0 0 6px rgba(59,130,246,0.08), 0 14px 26px rgba(14,165,233,0.35)",
    },
    navLabel: {
      fontWeight: 700,
      position: "relative",
      zIndex: 1,
      whiteSpace: "nowrap",
    },
    navGlow: {
      position: "absolute",
      inset: -6,
      background: "radial-gradient(circle at 10% 30%, rgba(124,58,237,0.24), transparent 45%)",
      filter: "blur(12px)",
      pointerEvents: "none",
      zIndex: 0,
    },
    ripple: {
      position: "absolute",
      width: 360,
      height: 360,
      borderRadius: "50%",
      background:
        "radial-gradient(circle at center, rgba(124,58,237,0.34), rgba(14,165,233,0.2), transparent 68%)",
      filter: "blur(20px)",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      zIndex: 0,
    },
    logoutBtn: {
      marginTop: "auto",
      padding: "10px 12px",
      borderRadius: 999,
      border: `1px solid ${palette.border}`,
      background: "rgba(255,255,255,0.04)",
      color: palette.text,
      fontSize: 13,
      cursor: "pointer",
      fontWeight: 700,
      width: isMobile ? "100%" : "auto",
    },
    main: {
      flex: 1,
      padding: mainPadding,
      paddingTop: isMobile ? 10 : mainPadding,
      position: "relative",
      zIndex: 1,
      width: "100%",
      boxSizing: "border-box",
    },
    mainInner: {
      minHeight: "100%",
      background: palette.card,
      border: `1px solid ${palette.border}`,
      borderRadius: cardRadius,
      padding: isMobile ? 16 : 24,
      boxShadow: "var(--shadow-card)",
    },
  };
}
