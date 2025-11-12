import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { apiRegister } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate(); // hook điều hướng
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(form) {
    try {
      console.log("Bắt đầu đăng ký..."); // debug
      setError("");
      setSubmitting(true);
      const res = await apiRegister(form);
      console.log("Đăng ký thành công:", res);
      navigate("/login"); // chuyển trang login
    } catch (e) {
      console.log("Lỗi đăng ký:", e);
      setError(e?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthForm type="register" onSubmit={handleRegister} submitting={submitting} />
      <p style={styles.note}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
      {error && <p style={styles.err}>{error}</p>}
    </>
  );
}

const styles = { note: { textAlign: "center", marginTop: 8 }, err: { textAlign: "center", color: "crimson" } };
