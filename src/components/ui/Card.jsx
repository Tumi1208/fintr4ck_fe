export default function Card({ title, actions, children, style }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        boxShadow: "var(--shadow-card)",
        backdropFilter: "blur(10px)",
        color: "var(--text-strong)",
      ...style,
      }}
    >
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  color: "var(--text-strong)",
                  letterSpacing: 0.2,
                  textTransform: "uppercase",
                }}
              >
                {title}
            </h2>
          )}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
