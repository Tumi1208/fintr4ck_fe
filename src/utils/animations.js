// src/utils/animations.js
// Cấu hình chuyển động mượt mà (Spring Physics)

export const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: "easeOut" } 
    },
    exit: { opacity: 0, y: -20 }
  };
  
  export const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, type: "spring" }
    })
  };
  
  // Style dùng chung (Gradient & Shadow cao cấp)
  export const globalStyles = {
    gradientBg: "linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)", // Tím sang Xanh cyan
    glassCard: {
      background: "rgba(15, 23, 42, 0.9)",
      backdropFilter: "blur(14px)",
      borderRadius: "24px",
      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)", // Bóng đổ mềm, sâu
      border: "1px solid rgba(148,163,184,0.22)"
    },
    hoverScale: { scale: 1.02, transition: { duration: 0.2 } }
  };
