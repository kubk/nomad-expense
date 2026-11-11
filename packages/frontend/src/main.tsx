import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { Toaster } from "sonner";
import { refetchActiveQueriesOnVisible } from "mobx-query-lite";
import "./index.css";
import "./store/theme-store";
import { App } from "./pages/layout/app";
import { platform } from "./shared/platform/platforms";

platform.initialize();
refetchActiveQueriesOnVisible();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
);
