import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5194,
    // Lets remote previews (Amp portals) reach the local API on the same origin via VITE_API_URL=/api.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8794",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
