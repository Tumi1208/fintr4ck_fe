import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApiHelpers } from "../api/auth"; // Helper để gọi API

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // Step 1: Nhập form, Step 2: Thông báo thành công
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { API_BASE } = authApiHelpers;

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi khi đổi mật khẩu");
      }

      // Thành công
      setStep(2); 
      // Tự động chuyển về login sau 3 giây
      setTimeout(() => navigate("/login"), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Khôi phục mật khẩu</h2>
        
        {step === 1 ? (
          <form onSubmit={handleReset}>
            <p style={styles.subtitle}>
              Nhập email đăng ký và mật khẩu mới để đặt lại.
            </p>
            
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Mật khẩu mới</label>
              <input
                type="password"
                style={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
              />
            </div>

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Đang xử lý..." : "Đổi mật khẩu ngay"}
            </button>

            <div style={styles.footerLink}>
              <Link to="/login" style={styles.link}>&larr; Quay lại đăng nhập</Link>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: "#10B981", marginBottom: 8 }}>Thành công!</h3>
            <p style={{ color: "#64748B", marginBottom: 24 }}>
              Mật khẩu của bạn đã được cập nhật. <br/> Đang chuyển hướng về trang đăng nhập...
            </p>
            <Link to="/login" style={styles.btn}>Đăng nhập ngay</Link>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, color: "#475569", marginBottom: 6, fontWeight: 500 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 14,
    outline: "none",
  },
  btn: {
    width: "100%",
    padding: "12px",
    borderRadius: 999,
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  error: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  footerLink: { textAlign: "center", marginTop: 20 },
  link: { color: "#2563EB", textDecoration: "none", fontSize: 14 },
};