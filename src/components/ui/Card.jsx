import { motion } from "framer-motion";
import { cardVariants } from "../../utils/animations";

export default function Card({ title, actions, children, style, animate = false, custom = 0, ...rest }) {
  const Wrapper = animate ? motion.div : "div";
  const motionProps = animate
    ? { variants: cardVariants, initial: "hidden", animate: "visible", custom }
    : {};

  return (
    <Wrapper
      {...motionProps}
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
      {...rest}
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
    </Wrapper>
  );
}
