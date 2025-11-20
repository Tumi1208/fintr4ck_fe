export default function Badge({ children, tone = "info" }) {
  const tones = {
    info: { bg: "rgba(96,165,250,0.1)", color: "#bfdbfe", border: "rgba(96,165,250,0.35)" },
    success: { bg: "rgba(34,197,94,0.1)", color: "#bbf7d0", border: "rgba(34,197,94,0.35)" },
    danger: { bg: "rgba(239,68,68,0.12)", color: "#fecdd3", border: "rgba(239,68,68,0.35)" },
    warning: { bg: "rgba(251,191,36,0.12)", color: "#fef3c7", border: "rgba(251,191,36,0.35)" },
  };
  const palette = tones[tone] || tones.info;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}
