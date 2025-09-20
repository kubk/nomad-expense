import { z } from "zod";
import { ParseTransactionFn } from "./parsed-transaction";
import { getEnv } from "../env";

const apiTransactionSchema = z.object({
  createdAt: z.string().transform((str) => new Date(str)),
  amount: z.number(),
  info: z.string(),
  title: z.string(),
  currency: z.literal("THB"),
});

const apiResponseSchema = z.array(apiTransactionSchema);

export function createKasikornParser(password: string): ParseTransactionFn {
  return async (file: File) => {
    const formData = new FormData();
    formData.append("pdf", file);

    const url = new URL(getEnv().KASIKORN_API_URL);
    url.searchParams.set("password", password);

    const response = await fetch(url.toString(), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `KBank API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const rawData = await response.json();
    const apiData = apiResponseSchema.parse(rawData);

    return apiData.map((item) => ({
      amount: item.amount,
      currency: item.currency,
      description: item.title,
      info: item.info,
      type: item.amount >= 0 ? "income" : "expense",
      createdAt: item.createdAt,
    }));
  };
}
