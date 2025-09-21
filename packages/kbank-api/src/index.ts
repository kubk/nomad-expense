import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

const PORT = 3094;

export class MyContainer extends Container<Env> {
  defaultPort = PORT;
  envVars = {
    PORT: PORT.toString(),
  };
}

const app = new Hono<{ Bindings: Env }>();

app.get("/*", (c) => {
  const container = getContainer(c.env.MY_CONTAINER);
  return container.fetch(c.req.raw);
});

app.post("/*", (c) => {
  const container = getContainer(c.env.MY_CONTAINER);
  return container.fetch(c.req.raw);
});

export default app;
