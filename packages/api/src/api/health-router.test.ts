import { expect, it, describe, vi } from "vitest";
import { setUpDbTest } from "../lib/testing/set-up-db-test";
import { getCaller } from "../lib/testing/get-trpc-caller";

vi.mock("cloudflare:workers", () => ({
  env: {},
}));

describe("health-router", () => {
  setUpDbTest();

  it("should return ok", async () => {
    const caller = await getCaller({ loginAs: "alice" });
    const result = await caller.status();
    expect(result).toMatchInlineSnapshot(`
      {
        "db": "ok",
        "stage": "local",
        "status": "ok",
      }
    `);
  });
});
