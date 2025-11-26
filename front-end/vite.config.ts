import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { configDefaults } from "vitest/config";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@ui": path.resolve(__dirname, "./src/components/ui"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
