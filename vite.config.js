//khoá file để không tự nhảy cổng nữa
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // nếu 5173 bận Vite sẽ báo lỗi, không tự nhảy 5174
  },
});
