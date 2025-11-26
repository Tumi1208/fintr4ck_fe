import { useEffect, useState } from "react";

function resolveSize() {
  if (typeof window === "undefined") {
    return { width: 1280, isMobile: false, isTablet: false };
  }
  const width = window.innerWidth;
  return {
    width,
    isMobile: width < 768,
    isTablet: width < 1100,
  };
}

export function useBreakpoint() {
  const [state, setState] = useState(resolveSize);

  useEffect(() => {
    const handleResize = () => setState(resolveSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return state;
}
