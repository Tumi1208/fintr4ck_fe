const baseStyles = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontWeight: 700,
  fontSize: 14,
  borderRadius: "var(--radius-md)",
  padding: "12px 16px",
  border: "1px solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease",
};

const variants = {
  primary: {
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
    color: "#0B1021",
    boxShadow: "0 18px 40px rgba(14,165,233,0.35)",
  },
  ghost: {
    background: "rgba(255,255,255,0.06)",
    color: "var(--text-strong)",
    border: "1px solid var(--border-soft)",
  },
  subtle: {
    background: "rgba(255,255,255,0.05)",
    color: "var(--text-muted)",
    border: "1px solid rgba(148,163,184,0.18)",
  },
  danger: {
    background: "rgba(239,68,68,0.1)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.35)",
  },
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  style,
  ...rest
}) {
  return (
    <button
      {...rest}
      style={{
        ...baseStyles,
        ...variants[variant],
        width: fullWidth ? "100%" : "auto",
        ...style,
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      {children}
    </button>
  );
}
