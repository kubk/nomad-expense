import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import mobxReactPlugin from "mobx-react-plugin/vite";
import { execSync } from "child_process";

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(
      execSync("git rev-parse --short HEAD").toString().trim(),
    ),
  },
  plugins: [
    // Wraps components in observer, adds "use no memo" so React Compiler leaves them to MobX, and turns async store methods into flows
    mobxReactPlugin({ exclude: ["src/components/ui/**"] }),
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
