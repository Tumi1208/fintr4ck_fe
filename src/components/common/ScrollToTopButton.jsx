import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 250);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      onClick={scrollToTop}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 22px 44px rgba(14,165,233,0.4), 0 0 0 8px rgba(124,58,237,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = styles.button.boxShadow;
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(0.97)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
      }}
      style={{
        ...styles.button,
        ...(visible ? styles.visible : styles.hidden),
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.65))" }}
      >
        <path
          d="M12 18V6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 10.5 12 6l4.5 4.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

const styles = {
  button: {
    position: "fixed",
    right: "clamp(16px, 4vw, 24px)",
    bottom: "clamp(76px, 12vw, 96px)", // đặt phía trên bubble chatbot
    width: "clamp(40px, 4vw, 48px)",
    height: "clamp(40px, 4vw, 48px)",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
    color: "#0b1021",
    boxShadow: "0 18px 40px rgba(14,165,233,0.35), 0 0 0 6px rgba(124,58,237,0.08)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
    zIndex: 1000,
  },
  visible: {
    opacity: 1,
    transform: "scale(1)",
    pointerEvents: "auto",
  },
  hidden: {
    opacity: 0,
    transform: "scale(0.9)",
    pointerEvents: "none",
  },
};
