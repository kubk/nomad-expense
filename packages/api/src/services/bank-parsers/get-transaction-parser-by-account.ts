import { AccountFromFamily } from "../../db/account/get-account-by-family-id";
import { ParseTransactionFn } from "./parsed-transaction";
import { parseWiseStatement } from "./wise-parser";
import { createKasikornParser } from "./create-kasikorn-parser";
import { parseImageStatement } from "./image-parser";
import { getAccountMeta } from "../../db/account/account-meta";

export function getTransactionParserByAccount(
  account: AccountFromFamily,
): ParseTransactionFn {
  switch (account.bankType) {
    case "Wise":
      return parseWiseStatement;
    case "Kasikorn":
      const meta = getAccountMeta(account);
      if (!meta || meta.type !== "kasikorn") {
        throw new Error("Invalid account meta");
      }
      return createKasikornParser(meta.pdfPassword);
    case "Image":
      return parseImageStatement;
    default:
      throw new Error("Unsupported bank type: " + account.bankType);
  }
}
