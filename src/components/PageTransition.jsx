// src/components/PageTransition.jsx
import { motion } from "framer-motion";
import { pageVariants } from "../utils/animations";

export default function PageTransition({ children, style, ...rest }) {
  const MotionDiv = motion.div;

  return (
    <MotionDiv
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={style}
      {...rest}
    >
      {children}
    </MotionDiv>
  );
}
