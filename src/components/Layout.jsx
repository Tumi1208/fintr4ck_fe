// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { pageVariants } from "../utils/animations";
import ChatbotWidget from "./ChatbotWidget";

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
  { to: "/app", label: "Dashboard", icon: "📊", exact: true },
  { to: "/app/transactions", label: "Transactions", icon: "📜" },
  { to: "/app/categories", label: "Categories", icon: "🧩" },
  { to: "/app/challenges", label: "Challenges", icon: "🏁" },
  { to: "/app/my-challenges", label: "My Challenges", icon: "✅" },
  { to: "/app/templates", label: "Templates", icon: "📋" },
  { to: "/app/resources", label: "Resources", icon: "📚" },
  { to: "/app/settings", label: "Cài đặt", icon: "⚙️" },
];

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("fintr4ck_token");
    navigate("/login");
  }

  return (
    <div style={styles.shell}>
      <div style={styles.backdrop} />
      <aside style={styles.sidebar}>
        <div style={styles.sideLogo}>
          <img src="/logo.svg" alt="Fintr4ck" style={styles.logoImg} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={styles.logoText}>Fintr4ck</span>
            <span style={styles.logoSub}>Personal Finance</span>
          </div>
        </div>

        <nav style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                ...styles.navItem,
                background: isActive
                  ? palette.primary
                  : "rgba(255,255,255,0.04)",
                color: isActive ? "#0b1021" : palette.text,
                border: isActive ? "1px solid rgba(124,58,237,0.35)" : `1px solid ${palette.border}`,
                boxShadow: isActive ? "0 12px 30px rgba(14,165,233,0.28)" : "none",
              })}
            >
              <span style={{ marginRight: 10 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <motion.div
          style={styles.mainInner}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.div>
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
    padding: "10px 14px",
    borderRadius: 999,
    fontSize: 14,
    marginBottom: 8,
    transition: "transform 0.15s ease, background 0.2s ease",
    textDecoration: "none",
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
