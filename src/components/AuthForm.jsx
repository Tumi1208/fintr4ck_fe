// Component dùng chung cho login/register để đỡ lặp lại giao diện
import { useState } from "react";

export default function AuthForm({ type, onSubmit }) {
  // type = "login" hoặc "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Khi nhấn nút submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2f6ff",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 32,
          backgroundColor: "white",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 8 }}>
          {type === "login" ? "Welcome Back!" : "Join the Community!"}
        </h2>
        <p style={{ textAlign: "center", color: "#555", marginBottom: 20 }}>
          {type === "login"
            ? "Sign in to manage your finances"
            : "Start managing your money smarter"}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 12,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 20,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#1677ff",
              color: "white",
              border: "none",
              padding: 10,
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {type === "login" ? "LOGIN" : "SIGN UP"}
          </button>
        </form>
      </div>
    </div>
  );
}
