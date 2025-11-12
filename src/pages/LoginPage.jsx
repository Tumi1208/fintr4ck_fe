// Trang đăng nhập
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  const navigate = useNavigate();

  // Hàm xử lý khi người dùng submit form
  const handleLogin = async ({ email, password }) => {
    console.log("Login attempt:", email, password);
    // Gọi API thật ở các ngày sau
    navigate("/");
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
}
