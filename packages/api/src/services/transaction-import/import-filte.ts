import { AccountFromFamily } from "../../db/account/get-account-by-family-id";
import { getTransactionParserByAccount } from "../bank-parsers/get-transaction-parser-by-account";
import { DB } from "../db";
import { importTransactions } from "./transaction-import";

export async function importFile(
  db: DB,
  account: AccountFromFamily,
  file: File,
) {
  const transactionParser = getTransactionParserByAccount(account);
  const parsedTransactions = await transactionParser(file, account.timezone);

  const importResult = await importTransactions(
    db,
    account,
    parsedTransactions,
  );

  return importResult;
}
