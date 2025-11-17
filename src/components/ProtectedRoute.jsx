// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("fintr4ck_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
