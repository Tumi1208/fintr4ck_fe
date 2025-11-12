import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { apiLogin } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(form) {
    try {
      console.log("Đang đăng nhập..."); // debug
      setError("");
      setSubmitting(true);
      const data = await apiLogin(form);
      console.log("Đăng nhập thành công:", data);
      localStorage.setItem("fintr4ck_token", data.token);
      localStorage.setItem("fintr4ck_user", JSON.stringify(data.user));
      navigate("/"); // chuyển sang Dashboard
    } catch (e) {
      console.log("Lỗi đăng nhập:", e);
      setError(e?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthForm type="login" onSubmit={handleLogin} submitting={submitting} />
      <p style={styles.note}>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
      {error && <p style={styles.err}>{error}</p>}
    </>
  );
}

const styles = { note: { textAlign: "center", marginTop: 8 }, err: { textAlign: "center", color: "crimson" } };
