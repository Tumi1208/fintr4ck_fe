// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";

const navItems = [
  { to: "/app", label: "Dashboard", icon: "📊", exact: true },
  { to: "/app/transactions", label: "Transactions", icon: "📜" },
  { to: "/app/categories", label: "Categories", icon: "🧩" },
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
          <div style={styles.logoCircle}>F</div>
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
                  ? "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(14,165,233,0.9))"
                  : "rgba(226,232,240,0.04)",
                color: isActive ? "#0B1021" : "rgba(226,232,240,0.86)",
                border: isActive ? "1px solid rgba(148,163,184,0.45)" : "1px solid rgba(148,163,184,0.15)",
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
        <div style={styles.mainInner}>
          <Outlet />
        </div>
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
    background: "#0B1021",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(circle at 15% 20%, rgba(14,165,233,0.18), transparent 30%), radial-gradient(circle at 85% 0%, rgba(124,58,237,0.24), transparent 32%), #0B1021",
    zIndex: 0,
  },
  sidebar: {
    position: "sticky",
    top: 0,
    width: 260,
    minHeight: "100vh",
    background: "rgba(15,23,42,0.75)",
    backdropFilter: "blur(12px)",
    borderRight: "1px solid rgba(148,163,184,0.15)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    zIndex: 1,
  },
  sideLogo: {
    display: "flex",
    alignItems: "center",
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,0.9), rgba(124,58,237,0.95))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0B1021",
    fontWeight: 700,
    marginRight: 10,
    boxShadow: "0 12px 30px rgba(124,58,237,0.35)",
  },
  logoText: {
    fontWeight: 700,
    color: "#F8FAFC",
    fontSize: 18,
  },
  logoSub: {
    fontSize: 11,
    color: "rgba(226,232,240,0.7)",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontSize: 14,
    marginBottom: 8,
    textDecoration: "none",
    transition: "transform 0.15s ease, background 0.2s ease",
  },
  logoutBtn: {
    marginTop: "auto",
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.35)",
    backgroundColor: "rgba(226,232,240,0.06)",
    color: "#F9FAFB",
    fontSize: 13,
    cursor: "pointer",
  },
  main: {
    flex: 1,
    padding: 24,
    position: "relative",
    zIndex: 1,
  },
  mainInner: {
    minHeight: "100%",
    background: "rgba(226,232,240,0.02)",
    border: "1px solid rgba(148,163,184,0.1)",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
};
