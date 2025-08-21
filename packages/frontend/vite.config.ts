import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import observerPlugin from "mobx-react-observer/babel-plugin";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          observerPlugin({
            exclude: ["src/components/ui/**"],
          }),
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5194,
  },
});
