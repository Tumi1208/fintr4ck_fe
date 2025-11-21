export default function InputField({
  label,
  hint,
  error,
  rightSlot,
  onRightSlotClick,
  ...props
}) {
  return (
    <label style={{ display: "block", width: "100%" }}>
      {label && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
          {hint && <span style={{ fontSize: 12, color: "rgba(148,163,184,0.8)" }}>{hint}</span>}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          {...props}
          style={{
            width: "100%",
            padding: rightSlot ? "12px 40px 12px 14px" : "12px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-soft)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text-strong)",
            fontSize: 14,
            outline: "none",
          }}
        />
        {rightSlot && (
          <button
            type="button"
            onClick={onRightSlotClick}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 13,
              cursor: onRightSlotClick ? "pointer" : "default",
              padding: "4px 6px",
            }}
            disabled={!onRightSlotClick}
            aria-label="trailing button"
          >
            {rightSlot}
          </button>
        )}
      </div>
      {error && <div style={{ marginTop: 4, fontSize: 12, color: "#fca5a5" }}>{error}</div>}
    </label>
  );
}
