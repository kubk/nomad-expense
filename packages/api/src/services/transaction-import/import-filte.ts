import { AccountFromFamily } from "../../db/account/get-account-by-family-id";
import { getTransactionParserByAccount } from "../bank-parsers/get-transaction-parser-by-account";
import {
  StatementFormatError,
  StatementParseError,
} from "../bank-parsers/statement-import-error";
import { DB } from "../db";
import { importTransactions } from "./transaction-import";

export async function importFile(
  db: DB,
  account: AccountFromFamily,
  file: File,
  authorUserId: string,
) {
  const transactionParser = getTransactionParserByAccount(account);
  let parsedTransactions;

  try {
    parsedTransactions = await transactionParser(file, account.timezone);
  } catch (error) {
    if (
      error instanceof StatementFormatError ||
      error instanceof StatementParseError
    ) {
      throw error;
    }

    throw new StatementParseError(error);
  }

  const importResult = await importTransactions(
    db,
    account,
    parsedTransactions,
    authorUserId,
  );

  return importResult;
}
