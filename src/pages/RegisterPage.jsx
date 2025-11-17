// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { apiRegister } from "../api/auth";

export default function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(values) {
    try {
      setError("");
      setSubmitting(true);
      const data = await apiRegister(values);
      localStorage.setItem("fintr4ck_token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm
      type="register"
      onSubmit={handleRegister}
      submitting={submitting}
      error={error}
    />
  );
}
