// src/components/Layout.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ChatbotWidget from "./ChatbotWidget";
import PageTransition from "./PageTransition";
import Icon from "./ui/Icon";

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
  const MotionSpan = motion.span;
  const MotionDiv = motion.div;

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

  function handleLogout() {
    localStorage.removeItem("fintr4ck_token");
    navigate("/login");
  }

  return (
    <div style={styles.shell}>
      <div style={styles.backdrop} />
      <aside style={styles.sidebar} ref={sidebarRef}>
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

      <ChatbotWidget />
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    position: "relative",
    background: palette.bg,
    color: palette.text,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(circle at 15% 20%, rgba(124,58,237,0.18), transparent 30%), radial-gradient(circle at 82% 5%, rgba(14,165,233,0.16), transparent 32%), radial-gradient(circle at 60% 74%, rgba(34,193,195,0.14), transparent 26%), var(--bg-primary)",
    zIndex: 0,
  },
  sidebar: {
    position: "sticky",
    top: 0,
    width: 260,
    minHeight: "100vh",
    background: palette.surface,
    backdropFilter: "blur(14px)",
    borderRight: `1px solid ${palette.border}`,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    zIndex: 1,
    boxShadow: "0 16px 42px rgba(0,0,0,0.35)",
    overflow: "hidden",
    isolation: "isolate",
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
  },
  logoImg: {
    width: 38,
    height: 38,
    marginRight: 10,
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
    padding: "11px 14px",
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
  },
  main: {
    flex: 1,
    padding: 24,
    position: "relative",
    zIndex: 1,
  },
  mainInner: {
    minHeight: "100%",
    background: palette.card,
    border: `1px solid ${palette.border}`,
    borderRadius: 24,
    padding: 24,
    boxShadow: "var(--shadow-card)",
  },
};
