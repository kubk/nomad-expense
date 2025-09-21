import { z } from "zod";
import { currencySchema, transactionTypeSchema } from "../../db/enums";

export const parsedTransactionSchema = z.object({
  amountCents: z.number().int(),
  currency: currencySchema,
  description: z.string(),
  info: z.string().optional(),
  type: transactionTypeSchema,
  createdAt: z.date(),
});

export type ParsedTransaction = z.infer<typeof parsedTransactionSchema>;

export type ParseTransactionFn = (file: File) => Promise<ParsedTransaction[]>;
