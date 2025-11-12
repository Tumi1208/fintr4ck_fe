// src/components/AuthForm.jsx
// Component dùng chung cho Login / Register, nhận props: type, onSubmit, submitting

import { useState } from "react";

export default function AuthForm({ type, onSubmit, submitting }) {
  const isLogin = type === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Khi submit form
  function handleSubmit(e) {
    e.preventDefault();
    console.log("handleSubmit() fired"); // debug
    if (isLogin) onSubmit({ email, password });
    else onSubmit({ name, email, password });
  }

  // Khi click nút
  function handleClick() {
    console.log("Button onClick fired"); // debug
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, textAlign: "center" }}>
            {isLogin ? "Welcome Back!" : "Join the Community!"}
          </h2>
          <p style={{ color: "#6b7a90", textAlign: "center", marginTop: 8 }}>
            {isLogin
              ? "Sign in to manage your finances"
              : "Start managing your money smarter"}
          </p>
        </div>

        {/* Form chính */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <input
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            style={styles.button}
            onClick={handleClick}
          >
            {submitting
              ? "Please wait..."
              : isLogin
              ? "LOGIN"
              : "SIGN UP"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef5ff",
  },
  card: {
    width: 420,
    padding: 28,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 10px 40px rgba(0,0,0,.08)",
  },
  input: {
    width: "100%",
    height: 42,
    padding: "0 12px",
    margin: "8px 0",
    border: "1px solid #dfe5f0",
    borderRadius: 8,
    outline: "none",
  },
  button: {
    width: "100%",
    height: 44,
    marginTop: 8,
    background: "#1e88e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },
};
