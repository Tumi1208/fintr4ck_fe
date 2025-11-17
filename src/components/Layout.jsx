// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";

// --- CẬP NHẬT MENU: THÊM MỤC TEMPLATES ---
const navItems = [
  { to: "/", label: "Dashboard", icon: "📊", exact: true },
  { to: "/transactions", label: "Transactions", icon: "📜" },
  { to: "/categories", label: "Categories", icon: "🧩" },
  { to: "/templates", label: "Templates", icon: "📋" }, // <--- MỤC MỚI THÊM
  { to: "/resources", label: "Resources", icon: "📚" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("fintr4ck_token");
    navigate("/login");
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.sideLogo}>
          <div style={styles.logoCircle}>F</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={styles.logoText}>Fintr4ck</span>
            <span style={styles.logoSub}>Personal Finance</span>
          </div>
        </div>

        <nav style={{ marginTop: 32 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                ...styles.navItem,
                backgroundColor: isActive ? "#2563EB" : "transparent",
                color: isActive ? "#FFFFFF" : "#E0F2FE",
              })}
            >
              <span style={{ marginRight: 10 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.mainInner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#F0F8FF",
  },
  sidebar: {
    width: 260,
    backgroundColor: "#4A90E2",
    padding: 24,
    display: "flex",
    flexDirection: "column",
  },
  sideLogo: {
    display: "flex",
    alignItems: "center",
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: "999px",
    backgroundColor: "#F0F8FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563EB",
    fontWeight: 700,
    marginRight: 10,
  },
  logoText: {
    fontWeight: 700,
    color: "#FFFFFF",
    fontSize: 18,
  },
  logoSub: {
    fontSize: 11,
    color: "#E0F2FE",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontSize: 14,
    marginBottom: 8,
    textDecoration: "none",
  },
  logoutBtn: {
    marginTop: "auto",
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(248,250,252,0.7)",
    backgroundColor: "transparent",
    color: "#F9FAFB",
    fontSize: 13,
    cursor: "pointer",
  },
  main: {
    flex: 1,
    padding: 24,
  },
  mainInner: {
    height: "100%",
  },
};