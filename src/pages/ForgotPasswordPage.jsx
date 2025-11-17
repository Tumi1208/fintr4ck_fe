// src/pages/ForgotPasswordPage.jsx
export default function ForgotPasswordPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F0F8FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: 24,
          boxShadow:
            "0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.1)",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: 8,
            fontSize: 22,
            color: "#1E293B",
          }}
        >
          Forgot Password
        </h1>
        <p style={{ margin: 0, marginBottom: 16, color: "#64748B", fontSize: 14 }}>
          Chức năng này chưa được triển khai trong phiên bản demo.
        </p>
        <p style={{ margin: 0, color: "#94A3B8", fontSize: 13 }}>
          Vui lòng liên hệ giảng viên nếu cần khôi phục mật khẩu.
        </p>
      </div>
    </div>
  );
}
