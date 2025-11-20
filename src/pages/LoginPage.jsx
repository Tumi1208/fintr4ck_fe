// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { apiLogin } from "../api/auth";

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(values) {
    try {
      setError("");
      setSubmitting(true);
      const data = await apiLogin(values);
      localStorage.setItem("fintr4ck_token", data.token);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      submitting={submitting}
      error={error}
    />
  );
}
