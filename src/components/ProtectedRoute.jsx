// Chặn truy cập nếu chưa có token hợp lệ. Gọi /auth/me để xác thực.

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiMe } from "../api/auth";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking | authed | guest

  useEffect(() => {
    const token = localStorage.getItem("fintr4ck_token");
    if (!token) {
      setStatus("guest");
      return;
    }
    apiMe()
      .then(() => setStatus("authed"))
      .catch(() => {
        // token sai/hết hạn → xóa và đá về login
        localStorage.removeItem("fintr4ck_token");
        localStorage.removeItem("fintr4ck_user");
        setStatus("guest");
      });
  }, []);

  if (status === "checking") {
    return <div style={{ padding: 24, textAlign: "center" }}>Loading…</div>;
  }
  if (status === "guest") return <Navigate to="/login" replace />;
  return children;
}
