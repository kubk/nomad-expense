import { createGateway, generateText, Output } from "ai";
import { z } from "zod";
import { DateTime } from "luxon";
import { getEnv } from "../env";
import { currencySchema, transactionTypeSchema } from "../../db/enums";
import { assert } from "../../lib/typescript/assert";
import { ParsedTransaction, ParseTransactionFn } from "./parsed-transaction";
import { inferImageTransactionDate } from "./infer-image-transaction-date";

const imageTransactionSchema = z.object({
  description: z.string(),
  amountHuman: z
    .number()
    .describe("Amount as shown, positive value (e.g. 5.16)"),
  currency: currencySchema,
  createdAt: z.string().describe("ISO 8601 date string"),
  type: transactionTypeSchema,
});

type ImageTransaction = z.infer<typeof imageTransactionSchema>;

const bankStatementModelId = "openai/gpt-4.1-2025-04-14";

async function parseImageBase64(
  imageBase64: string,
  referenceDate: DateTime,
): Promise<ImageTransaction[]> {
  const currencyList = currencySchema.options.join(", ");
  const gateway = createGateway({
    apiKey: getEnv().AI_GATEWAY_API_KEY,
  });

  const result = await generateText({
    model: gateway(bankStatementModelId),
    output: Output.array({ element: imageTransactionSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: imageBase64,
          },
          {
            type: "text",
            text: `Extract all transactions from this bank statement image. For each transaction, extract:
- description: the merchant/vendor name
- amountHuman: the transaction amount as shown, positive value (e.g. 5.17)
- currency: the currency code, must be one of: ${currencyList}
- createdAt: the transaction date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
- type: "expense" for purchases/withdrawals, "income" for deposits/refunds

The current date in the bank account timezone is ${referenceDate.toISODate()}.
The transaction year is likely not visible in supported bank screenshots. If it is not visible, use the current year unless that would put the transaction in the future; in that case, use the previous year.

There might be multiple transactions with the same name, but different dates and amounts, don't confuse them.

You must return ALL transactions found in the image with correct date`,
          },
        ],
      },
    ],
  });

  assert(result.output, "Failed to parse image statement");
  return result.output;
}

export const parseImageStatement: ParseTransactionFn = async (
  file,
  timezone,
) => {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const referenceDate = DateTime.now().setZone(timezone);
  const transactions = await parseImageBase64(base64, referenceDate);

  return transactions.map(
    (t): ParsedTransaction => ({
      description: t.description,
      amountCents: Math.round(t.amountHuman * 100),
      currency: t.currency,
      createdAt: inferImageTransactionDate({
        dateIso: t.createdAt,
        timezone,
        referenceDate,
      }),
      type: t.type,
    }),
  );
};
