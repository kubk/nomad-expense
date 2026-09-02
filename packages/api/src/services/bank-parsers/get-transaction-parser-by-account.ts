import { AccountFromFamily } from "../../db/account/get-account-by-family-id";
import { ParseTransactionFn } from "./parsed-transaction";
import { parseWiseStatement } from "./wise-parser";
import { createKasikornParser } from "./create-kasikorn-parser";
import { parseImageStatement } from "./image-parser";
import { getAccountMeta } from "../../db/account/account-meta";
import { parseEtherFiStatement } from "./ether-fi-parser";

export function getTransactionParserByAccount(
  account: AccountFromFamily,
): ParseTransactionFn {
  if (!account.bankType) {
    throw new Error("Account has no bank type");
  }

  switch (account.bankType) {
    case "Wise":
      return parseWiseStatement;
    case "Ether.fi":
      return parseEtherFiStatement;
    case "Kasikorn":
      const meta = getAccountMeta(account);
      if (!meta || meta.type !== "kasikorn") {
        throw new Error("Invalid account meta");
      }
      return createKasikornParser(meta.pdfPassword);
    case "Image":
      return parseImageStatement;
    case "YapiKredi":
    case "Tinkoff":
      throw new Error("Unsupported bank type: " + account.bankType);
    default:
      return account.bankType satisfies never;
  }
}
