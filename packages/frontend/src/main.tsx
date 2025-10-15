import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";
import { ThemeProvider } from "./pages/widgets/theme-provider";
import { App } from "./pages/layout/app";
import { RouterProvider } from "./shared/stacked-router/router";
import { queryClient } from "./shared/api";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider>
          <App />
        </RouterProvider>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
