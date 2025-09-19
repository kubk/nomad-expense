import { Hono } from "hono";
import { serve } from "@hono/node-server";
const app = new Hono();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : undefined;

if (!PORT) {
  throw new Error("PORT is not defined");
}

app.get("/", (c) => {
  return c.json({ message: "Kbank main" }, 200);
});

app.get("/health", (c) => {
  return c.json({ message: "Kbank health" }, 200);
});

serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`Server is running on http://localhost:${PORT}`);
console.log(`Health check available at http://localhost:${PORT}/health`);

const gracefulShutdown = () => {
  console.log("Process terminated");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
