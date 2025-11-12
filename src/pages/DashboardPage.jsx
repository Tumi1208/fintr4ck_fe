//Thêm Logout + chào tên user ở Dashboard
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiMe } from "../api/auth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy lại user từ API để chắc token còn hợp lệ
    apiMe()
      .then((u) => setUser(u))
      .catch(() => {
        // phòng khi token hết hạn giữa chừng
        localStorage.removeItem("fintr4ck_token");
        localStorage.removeItem("fintr4ck_user");
        navigate("/login");
      });
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("fintr4ck_token");
    localStorage.removeItem("fintr4ck_user");
    navigate("/login");
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.topbar}>
          <div>Fintr4ck Dashboard</div>
          <div>
            {user ? `Hello, ${user.name || user.email}` : ""}
            <button style={styles.logout} onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <p>Welcome! You are logged in.</p>
        {/* Ngày 3 sẽ thêm form giao dịch + bảng danh sách ở đây */}
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef5ff" },
  card: { width: 960, padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,.08)" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, fontWeight: 700 },
  logout: { marginLeft: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" },
};
