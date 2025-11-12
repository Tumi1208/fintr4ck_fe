// Trang đăng ký
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

export default function RegisterPage() {
  const navigate = useNavigate();

  // Khi nhấn đăng ký
  const handleRegister = async ({ email, password }) => {
    console.log("Register attempt:", email, password);
    // Gọi API thật ở các ngày sau
    navigate("/login");
  };

  return <AuthForm type="register" onSubmit={handleRegister} />;
}
