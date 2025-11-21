// src/components/AuthForm.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import InputField from "./ui/InputField";

export default function AuthForm({ type, onSubmit, submitting, error }) {
  const isLogin = type === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;
    if (isLogin) onSubmit({ email, password });
    else onSubmit({ name, email, password });
  }

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>F</div>
          <div>
            <div style={styles.logoText}>Fintr4ck</div>
            <div style={styles.logoHint}>Personal finance, made confident</div>
          </div>
        </div>

        <h1 style={styles.title}>
          {isLogin ? "Chào mừng quay lại" : "Tạo tài khoản mới"}
        </h1>
        <p style={styles.subtitle}>
          {isLogin
            ? "Quản lý tiền bạc rõ ràng, nhanh chóng."
            : "Đăng ký miễn phí để bắt đầu kiểm soát tài chính."}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!isLogin && (
            <InputField
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <InputField
            label="Email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightSlot="Min 6 ký tự"
          />

          {error && <div style={styles.error}>{error}</div>}

          <Button
            type="submit"
            fullWidth
            disabled={submitting}
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký ngay"}
          </Button>
        </form>

        {isLogin ? (
          <div style={styles.linksBox}>
            <Link to="/forgot-password" style={styles.linkMain}>
              Quên mật khẩu?
            </Link>
            <div style={styles.helperText}>
              Chưa có tài khoản?{" "}
              <Link to="/register" style={styles.linkAccent}>
                Đăng ký
              </Link>
            </div>
          </div>
        ) : (
          <div style={styles.linksBox}>
            <div style={styles.helperText}>
              Đã có tài khoản?{" "}
              <Link to="/login" style={styles.linkAccent}>
                Đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 18% 20%, rgba(124,58,237,0.12), transparent 30%), radial-gradient(circle at 82% 10%, rgba(14,165,233,0.14), transparent 30%), #0b1021",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    inset: "-40% -50% auto auto",
    width: "60%",
    height: "80%",
    background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 50%)",
    filter: "blur(40px)",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    padding: 32,
    borderRadius: 28,
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(148,163,184,0.22)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
    backdropFilter: "blur(12px)",
    color: "var(--text-strong)",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#0b1021",
    letterSpacing: 0.4,
    boxShadow: "0 14px 32px rgba(124,58,237,0.35)",
  },
  logoText: {
    fontWeight: 800,
    letterSpacing: -0.2,
  },
  logoHint: {
    color: "var(--text-muted)",
    fontSize: 12,
  },
  title: {
    margin: "8px 0 4px",
    fontSize: 28,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 0,
    marginBottom: 18,
    color: "var(--text-muted)",
    fontSize: 14,
  },
  linksBox: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 13,
    color: "var(--text-muted)",
  },
  helperText: {
    color: "var(--text-muted)",
  },
  linkMain: {
    color: "#bfdbfe",
    textDecoration: "none",
    fontWeight: 700,
  },
  linkAccent: {
    color: "#67e8f9",
    textDecoration: "none",
    fontWeight: 700,
  },
  error: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 13,
    color: "#fca5a5",
  },
};
