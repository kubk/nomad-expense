import { vi } from "vitest";

// Tests run in Node, where `cloudflare:workers` does not exist.
vi.mock("cloudflare:workers", () => ({ env: {} }));
