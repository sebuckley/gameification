import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      jsxRuntime: "automatic"
    })
  ],
  base: command === "serve" ? "/" : "/gameification/",
  build: {
    outDir: "build",
  },
  server: {
    port: 3000,
  },
}));
