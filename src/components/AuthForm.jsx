// src/components/AuthForm.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

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
      <header style={styles.logoBar}>
        <div style={styles.logoCircle}>F</div>
        <span style={styles.logoText}>Fintr4ck</span>
      </header>

      <div style={styles.card}>
        <h1 style={styles.title}>
          {isLogin ? "Welcome Back!" : "Join the Community!"}
        </h1>
        <p style={styles.subtitle}>
          {isLogin
            ? "Sign in to manage your finances"
            : "Start managing your money smarter"}
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          {!isLogin && (
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "default" : "pointer",
            }}
          >
            {submitting
              ? "Please wait..."
              : isLogin
              ? "LOGIN"
              : "SIGN UP"}
          </button>
        </form>

        {isLogin ? (
          <div style={styles.linksBox}>
            <div style={{ marginBottom: 8 }}>
              <Link to="/forgot-password" style={styles.linkSub}>
                Forgot Password?
              </Link>
            </div>
            <span style={styles.helperText}>
              Don't have your account?{" "}
              <Link to="/register" style={styles.linkMain}>
                Sign Up
              </Link>
            </span>
          </div>
        ) : (
          <div style={styles.linksBox}>
            <span style={styles.helperText}>
              Already have account?{" "}
              <Link to="/login" style={styles.linkMain}>
                Login
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F0F8FF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 32,
  },
  logoBar: {
    width: "100%",
    maxWidth: 960,
    display: "flex",
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: "999px",
    backgroundColor: "#2563EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#F0F8FF",
    fontWeight: 700,
    marginRight: 8,
  },
  logoText: {
    fontWeight: 700,
    color: "#0F172A",
    fontSize: 18,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    boxShadow:
      "0 10px 15px -3px rgb(15 23 42 / 0.15), 0 4px 6px -4px rgb(15 23 42 / 0.1)",
    padding: 32,
  },
  title: {
    margin: 0,
    fontSize: 24,
    color: "#1E293B",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 0,
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    marginBottom: 6,
    color: "#64748B",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    fontSize: 14,
    outline: "none",
    backgroundColor: "#F8FAFC",
  },
  button: {
    width: "100%",
    marginTop: 8,
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  linksBox: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 13,
  },
  helperText: {
    color: "#64748B",
  },
  linkMain: {
    color: "#2563EB",
    fontWeight: 600,
    textDecoration: "none",
  },
  linkSub: {
    color: "#2563EB",
    textDecoration: "none",
  },
  error: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
    color: "#EF4444",
  },
};
