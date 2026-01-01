import { parseImageStatement } from "./image-parser";
import { readFileSync } from "fs";
import { expect, it, describe, beforeAll } from "vitest";
import { setEnv } from "../env";

describe("parseImageStatement", () => {
  beforeAll(() => {
    setEnv(process.env);
  });

  it("should parse bybit statement image correctly", async () => {
    const imageBuffer = readFileSync("./fixtures/bybit.png");
    const file = new File([imageBuffer], "bybit.png", { type: "image/png" });

    const transactions = await parseImageStatement(file, "Asia/Bangkok");

    expect(transactions).toMatchInlineSnapshot(`
      [
        {
          "amountCents": 516,
          "createdAt": 2025-12-31T20:02:26.000Z,
          "currency": "USD",
          "description": "Cloudflare",
          "type": "expense",
        },
        {
          "amountCents": 132,
          "createdAt": 2025-12-29T19:40:59.000Z,
          "currency": "USD",
          "description": "BEM",
          "type": "expense",
        },
        {
          "amountCents": 132,
          "createdAt": 2025-12-27T20:40:07.000Z,
          "currency": "USD",
          "description": "BEM",
          "type": "expense",
        },
        {
          "amountCents": 153,
          "createdAt": 2025-12-22T20:15:19.000Z,
          "currency": "USD",
          "description": "BEM",
          "type": "expense",
        },
        {
          "amountCents": 65,
          "createdAt": 2025-12-16T20:15:58.000Z,
          "currency": "USD",
          "description": "BEM",
          "type": "expense",
        },
        {
          "amountCents": 71,
          "createdAt": 2025-12-15T20:19:03.000Z,
          "currency": "USD",
          "description": "BEM",
          "type": "expense",
        },
        {
          "amountCents": 265,
          "createdAt": 2025-12-02T19:14:21.000Z,
          "currency": "USD",
          "description": "Google Workspace",
          "type": "expense",
        },
        {
          "amountCents": 516,
          "createdAt": 2025-12-01T19:47:27.000Z,
          "currency": "USD",
          "description": "Cloudflare",
          "type": "expense",
        },
      ]
    `);
    },
    30000,
  );
});
