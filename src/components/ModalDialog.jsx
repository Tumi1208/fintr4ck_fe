import React from "react";

export default function ModalDialog({
  open,
  title,
  message,
  confirmText = "OK",
  cancelText,
  tone = "neutral",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const toneStyles = {
    neutral: {
      accent: "#22d3ee",
      accentSoft: "rgba(34,211,238,0.15)",
      border: "rgba(148,163,184,0.35)",
      glow: "rgba(34,211,238,0.28)",
      gradient: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(14,165,233,0.9))",
      icon: "•",
    },
    success: {
      accent: "#4ade80",
      accentSoft: "rgba(74,222,128,0.14)",
      border: "rgba(74,222,128,0.4)",
      glow: "rgba(34,197,94,0.32)",
      gradient: "linear-gradient(135deg, rgba(74,222,128,0.9), rgba(16,185,129,0.9))",
      icon: "✓",
    },
    danger: {
      accent: "#fb7185",
      accentSoft: "rgba(251,113,133,0.18)",
      border: "rgba(248,113,113,0.42)",
      glow: "rgba(248,113,113,0.32)",
      gradient: "linear-gradient(135deg, rgba(248,113,113,0.9), rgba(190,24,93,0.9))",
      icon: "!",
    },
  }[tone] || {
    accent: "#22d3ee",
    accentSoft: "rgba(34,211,238,0.15)",
    border: "rgba(148,163,184,0.35)",
    glow: "rgba(34,211,238,0.28)",
    gradient: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(14,165,233,0.9))",
    icon: "•",
  };

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true">
      <div style={styles.cardWrapper}>
        <div style={styles.glow(toneStyles)} />
        <div style={{ ...styles.card, borderColor: toneStyles.border }}>
          <div style={styles.topRow}>
            <div style={{ ...styles.badge, background: toneStyles.accentSoft, color: toneStyles.accent }}>
              <span style={styles.badgeDot(toneStyles)} />
              <span style={styles.iconWrap(toneStyles)}>{toneStyles.icon}</span>
              {tone === "success" ? "Thành công" : tone === "danger" ? "Cảnh báo" : "Thông báo"}
            </div>
            {onCancel && (
              <button
                aria-label="Đóng"
                style={{ ...styles.closeBtn, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onClick={onCancel}
                disabled={loading}
              >
                ×
              </button>
            )}
          </div>

          <div style={styles.header}>
            <div style={styles.title}>{title}</div>
          </div>

          <div style={styles.messageBox}>
            <div style={styles.message}>{message}</div>
          </div>

          <div style={styles.actions}>
            {cancelText && (
              <button
                style={{ ...styles.cancelBtn, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </button>
            )}
            <button
              style={{
                ...styles.confirmBtn,
                background: toneStyles.gradient,
                boxShadow: `0 18px 36px ${toneStyles.glow}`,
                borderColor: toneStyles.border,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(circle at 18% 18%, rgba(124,58,237,0.22), transparent 30%)," +
      "radial-gradient(circle at 82% 12%, rgba(14,165,233,0.2), transparent 26%)," +
      "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 18,
    backdropFilter: "blur(6px)",
  },
  cardWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 480,
  },
  glow: (toneStyles) => ({
    position: "absolute",
    inset: "-14%",
    background: `radial-gradient(circle at 50% 50%, ${toneStyles.glow}, transparent 55%)`,
    filter: "blur(28px)",
    opacity: 0.9,
    zIndex: 0,
    pointerEvents: "none",
  }),
  card: {
    position: "relative",
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(9,12,24,0.96)) padding-box," +
      "linear-gradient(135deg, rgba(124,58,237,0.24), rgba(14,165,233,0.24)) border-box",
    border: "1px solid rgba(148,163,184,0.35)",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 22px 50px rgba(0,0,0,0.55)",
    overflow: "hidden",
    zIndex: 1,
    backdropFilter: "blur(14px)",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 700,
    letterSpacing: 0.2,
    textTransform: "uppercase",
    fontSize: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    width: "fit-content",
  },
  badgeDot: (toneStyles) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: toneStyles.accent,
    boxShadow: `0 0 0 6px ${toneStyles.accentSoft}`,
  }),
  iconWrap: (toneStyles) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: 10,
    background: "rgba(0,0,0,0.25)",
    border: `1px solid ${toneStyles.border}`,
    boxShadow: `0 6px 18px ${toneStyles.glow}`,
    fontWeight: 800,
    color: toneStyles.accent,
    fontSize: 12,
  }),
  title: { fontSize: 18, fontWeight: 800, color: "var(--text-strong)" },
  messageBox: {
    borderRadius: 14,
    padding: 14,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(255,255,255,0.03)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    marginBottom: 18,
  },
  message: { fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-line" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.28)",
    background: "rgba(255,255,255,0.04)",
    color: "var(--text-strong)",
    fontSize: 18,
    cursor: "pointer",
    transition: "transform 0.15s ease, opacity 0.2s ease",
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  cancelBtn: {
    padding: "11px 16px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.28)",
    background: "rgba(255,255,255,0.06)",
    color: "var(--text-strong)",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.15s ease, opacity 0.15s ease",
  },
  confirmBtn: {
    padding: "11px 18px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.32)",
    color: "#0b1021",
    fontWeight: 800,
    cursor: "pointer",
    transition: "transform 0.15s ease, opacity 0.15s ease, box-shadow 0.2s ease",
  },
};
