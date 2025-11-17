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
    gradientBg: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)", // Xanh sang Tím
    glassCard: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: "24px",
      boxShadow: "0 10px 30px -10px rgba(60, 70, 150, 0.15)", // Bóng đổ mềm, sâu
      border: "1px solid rgba(255,255,255,0.5)"
    },
    hoverScale: { scale: 1.02, transition: { duration: 0.2 } }
  };