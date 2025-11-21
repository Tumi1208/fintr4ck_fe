// src/components/AuthForm.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import InputField from "./ui/InputField";

const bgImage =
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=80";

export default function AuthForm({ type, onSubmit, submitting, error }) {
  const isLogin = type === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const avatarLetter = useMemo(() => {
    const source = (isLogin ? email : name) || "F";
    return source.trim().charAt(0).toUpperCase();
  }, [isLogin, email, name]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;
    if (isLogin) onSubmit({ email, password });
    else onSubmit({ name, email, password });
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

          <h1 style={styles.title}>
            {isLogin ? "Quay lại nào!" : "Gia nhập Fintr4ck"}
          </h1>
          <p style={styles.subtitle}>
            {isLogin
              ? "Theo dõi dòng tiền và ngân sách mỗi ngày."
              : "Tạo tài khoản để đồng bộ ví, mục tiêu và báo cáo."}
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
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
              {submitting ? "Đang xử lý..." : isLogin ? "Tiếp tục" : "Tạo tài khoản"}
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
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#050814",
  },
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
  title: {
    margin: "4px 0 0",
    fontSize: 28,
    letterSpacing: -0.4,
    color: "var(--text-strong)",
  },
  subtitle: { marginTop: 2, marginBottom: 14, color: "var(--text-muted)", fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 14, marginTop: 6 },
  linksBox: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 13,
    color: "var(--text-muted)",
  },
  helperText: { color: "var(--text-muted)" },
  linkMain: { color: "#bfdbfe", textDecoration: "none", fontWeight: 700 },
  linkAccent: { color: "#67e8f9", textDecoration: "none", fontWeight: 700 },
  error: {
    marginTop: 2,
    marginBottom: 2,
    fontSize: 13,
    color: "#fca5a5",
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.35)",
    padding: "10px 12px",
    borderRadius: 12,
  },
};
