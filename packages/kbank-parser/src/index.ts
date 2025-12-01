import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createKasikornParser } from "./parse-kasikorn.ts";

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

app.post("/parse", async (c) => {
  try {
    const body = await c.req.parseBody();

    if (!body["pdf"]) {
      return c.json({ error: "No PDF file provided" }, 400);
    }

    const file = body["pdf"] as File;

    if (!(file instanceof File)) {
      return c.json({ error: "Invalid file upload" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const password = c.req.query("password") || "";
    const parser = createKasikornParser(password);
    const transactions = await parser(buffer);

    return c.json(transactions, 200);
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return c.json({ error: "Failed to parse PDF" }, 500);
  }
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
