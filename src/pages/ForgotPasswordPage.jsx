import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApiHelpers } from "../api/auth";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
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
      if (!res.ok) throw new Error(data.message || "Lỗi khi đổi mật khẩu");

      setStep(2);
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
          <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={styles.subtitle}>Nhập email đăng ký và mật khẩu mới để đặt lại.</p>

            {error && <div style={styles.error}>{error}</div>}

            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
            />

            <InputField
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Tối thiểu 6 ký tự"
              minLength={6}
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Đang xử lý..." : "Đổi mật khẩu ngay"}
            </Button>

            <div style={styles.footerLink}>
              <Link to="/login" style={styles.link}>
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: "#4ade80", marginBottom: 8 }}>Thành công!</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Mật khẩu của bạn đã được cập nhật. <br /> Đang chuyển hướng về trang đăng nhập...
            </p>
            <Link to="/login" style={styles.btnLink}>
              Đăng nhập ngay
            </Link>
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
    background:
      "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.18), transparent 32%), radial-gradient(circle at 80% 0%, rgba(124,58,237,0.22), transparent 30%), #0B1021",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(15,23,42,0.75)",
    borderRadius: 26,
    padding: 28,
    boxShadow: "0 22px 60px rgba(0,0,0,0.4)",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "var(--text-strong)",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-strong)",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "var(--text-muted)",
    textAlign: "center",
    marginBottom: 8,
  },
  error: {
    backgroundColor: "rgba(248,113,113,0.12)",
    color: "#fca5a5",
    padding: "8px 12px",
    borderRadius: 12,
    fontSize: 13,
    marginBottom: 6,
    textAlign: "center",
  },
  footerLink: { textAlign: "center", marginTop: 4 },
  link: { color: "#bfdbfe", textDecoration: "none", fontSize: 14, fontWeight: 700 },
  btnLink: {
    display: "inline-flex",
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.2)",
    backgroundColor: "rgba(226,232,240,0.08)",
    color: "var(--text-strong)",
    textDecoration: "none",
    fontWeight: 700,
  },
};

