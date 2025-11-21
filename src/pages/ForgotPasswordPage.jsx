import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApiHelpers } from "../api/auth";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import Icon from "../components/ui/Icon";

const bgImage =
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1800&q=80";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { API_BASE } = authApiHelpers;

  const avatarLetter = useMemo(() => {
    const source = email || "F";
    return source.trim().charAt(0).toUpperCase();
  }, [email]);

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
    <div style={styles.shell}>
      <div style={styles.backdrop} />
      <div style={styles.bgImage} />
      <div style={styles.overlayGradient} />

      <div style={styles.centerWrap}>
        <div style={styles.card}>
          <div style={styles.logoWrap}>
            <div style={styles.logoMark}>F</div>
            <div>
              <div style={styles.logoText}>Fintr4ck</div>
              <div style={styles.logoHint}>Personal finance, made confident</div>
            </div>
          </div>

          <div style={styles.avatar}>
            <span>{avatarLetter}</span>
          </div>

          <h1 style={styles.title}>Khôi phục mật khẩu</h1>
          <p style={styles.subtitle}>Nhập email đăng ký và mật khẩu mới để đặt lại.</p>

          {step === 1 ? (
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                  <Icon name="arrowLeft" tone="slate" size={16} background={false} /> Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 16 }}>
                <Icon name="check" tone="green" size={60} />
              </div>
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
    </div>
  );
}

const styles = {
  shell: { minHeight: "100vh", position: "relative", overflow: "hidden", backgroundColor: "#050814" },
  backdrop: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 12% 18%, rgba(124,58,237,0.2), transparent 30%), radial-gradient(circle at 82% 6%, rgba(14,165,233,0.18), transparent 28%)",
    filter: "blur(50px)",
  },
  bgImage: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "saturate(0.9)",
  },
  overlayGradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(5,8,20,0.7) 0%, rgba(5,8,20,0.9) 55%, rgba(5,8,20,0.94) 100%)",
  },
  centerWrap: {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "linear-gradient(160deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))",
    borderRadius: 20,
    padding: 28,
    boxShadow: "0 30px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
    color: "var(--text-strong)",
    display: "grid",
    gap: 10,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 12 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#0b1021",
    letterSpacing: 0.4,
    boxShadow: "0 14px 32px rgba(124,58,237,0.35)",
  },
  logoText: { fontWeight: 800, letterSpacing: -0.2, color: "var(--text-strong)" },
  logoHint: { color: "var(--text-muted)", fontSize: 12 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "grid",
    placeItems: "center",
    fontSize: 22,
    fontWeight: 800,
    color: "#e2e8f0",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  title: { fontSize: 28, fontWeight: 800, color: "var(--text-strong)", margin: "4px 0 0" },
  subtitle: { fontSize: 14, color: "var(--text-muted)", marginBottom: 12 },
  error: {
    backgroundColor: "rgba(248,113,113,0.12)",
    color: "#fca5a5",
    padding: "8px 12px",
    borderRadius: 12,
    fontSize: 13,
    marginBottom: 6,
    border: "1px solid rgba(248,113,113,0.35)",
  },
  footerLink: { textAlign: "center", marginTop: 4 },
  link: {
    color: "#bfdbfe",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
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
