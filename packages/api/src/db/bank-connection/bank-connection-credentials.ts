import { z } from "zod";
import type { BankConnection } from "../db-types";

const bankConnectionCredentialsSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("wise"),
    apiToken: z.string().min(1),
  }),
]);

export function getBankConnectionCredentials(
  connection: Pick<BankConnection, "credentials">,
) {
  return bankConnectionCredentialsSchema.parse(connection.credentials);
}
