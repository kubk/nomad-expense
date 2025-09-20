import z from "zod";
import { AccountFromFamily } from "./get-account-by-family-id";

const accountMetaSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("kasikorn"),
      pdfPassword: z.string(),
    }),
  ])
  .nullable();

export function getAccountMeta(account: AccountFromFamily) {
  return accountMetaSchema.parse(account.meta);
}
