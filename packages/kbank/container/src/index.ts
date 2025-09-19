import { Hono } from "hono";
import { serve } from "@hono/node-server";
import multer from "multer";
import { createKasikornParser } from "./kasikorn/parse-kasikorn";

const app = new Hono();

const upload = multer({ storage: multer.memoryStorage() });

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
    const uploadMiddleware = upload.single("pdf");

    await new Promise<void>((resolve, reject) => {
      uploadMiddleware(c.req.raw as any, {} as any, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const file = (c.req.raw as any).file;

    if (!file) {
      return c.json({ error: "No PDF file provided" }, 400);
    }

    if (file.mimetype !== "application/pdf") {
      return c.json({ error: "File must be a PDF" }, 400);
    }

    const password = c.req.query("password") || "";
    const parser = createKasikornParser(password);
    const transactions = await parser(file.buffer);

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
