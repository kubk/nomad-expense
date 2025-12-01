import { z } from "zod";
import { ParseTransactionFn } from "./parsed-transaction";
import { env } from "cloudflare:workers";

const apiTransactionSchema = z.object({
  createdAt: z.string().transform((str) => new Date(str)),
  amount: z.number(),
  info: z.string(),
  title: z.string(),
  currency: z.literal("THB"),
});

const apiResponseSchema = z.array(apiTransactionSchema);

export function createKasikornParser(password: string): ParseTransactionFn {
  return async (file: File, _timezone: string) => {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await env.KBANK_SERVICE.fetch(
      new Request(
        `https://kbank.example.com/parse?password=${encodeURIComponent(password)}`,
        {
          method: "POST",
          body: formData,
        },
      ),
    );

    if (!response.ok) {
      throw new Error(
        `KBank API request failed: ${response.status} ${JSON.stringify(await response.json())}`,
      );
    }

    const rawData = await response.json();
    const apiData = apiResponseSchema.parse(rawData);

    return apiData.map((item) => ({
      amountCents: Math.abs(item.amount),
      currency: item.currency,
      description: item.title,
      info: item.info,
      type: item.amount >= 0 ? "income" : "expense",
      createdAt: item.createdAt,
    }));
  };
}
