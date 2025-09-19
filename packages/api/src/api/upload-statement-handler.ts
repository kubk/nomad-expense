import { authenticate } from "../services/auth/authenticate";
import { getDb } from "../services/db";
import { parseWiseStatement } from "../services/bank-parsers/wise-parser";
import { importTransactions } from "../services/transaction-import";
import {
  AccountFromFamily,
  getAccountByFamilyId,
} from "../db/account/get-account-by-family-id";
import { ParseTransactionFn } from "../services/bank-parsers/parsed-transaction";
import { jsonResponse } from "../lib/cloudflare/json-response";
import { kasikornParser } from "../services/bank-parsers/kasikorn-parser";

export type UploadHandlerResponse =
  | { type: "error"; message: string }
  | { type: "success"; removed: number; added: number };

function getTransactionParserByAccount(
  account: AccountFromFamily,
): ParseTransactionFn {
  switch (account.bankType) {
    case "Wise":
      return parseWiseStatement;
    case "Kasikorn":
      return kasikornParser;
    default:
      throw new Error("Unsupported bank type: " + account.bankType);
  }
}

export async function uploadStatementHandler(
  request: Request,
): Promise<Response> {
  try {
    const authResult = await authenticate(request);
    if (!authResult) {
      return jsonResponse(401, { type: "error", message: "Unauthorized" });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const accountId = formData.get("accountId") as string;

    if (!file) {
      return jsonResponse(400, { type: "error", message: "No file provided" });
    }

    if (!accountId) {
      return jsonResponse(400, {
        type: "error",
        message: "No account ID provided",
      });
    }

    const db = getDb();
    const accountResult = await getAccountByFamilyId(
      db,
      accountId,
      authResult.familyId,
    );

    if (accountResult.type === "notFound") {
      return jsonResponse(403, { type: "error", message: "Access denied" });
    }

    const transactionParser = getTransactionParserByAccount(
      accountResult.account,
    );

    const result = await importTransactions(
      db,
      accountResult.account,
      await transactionParser(file),
    );

    return jsonResponse(200, {
      type: "success",
      removed: result.removed,
      added: result.added,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return jsonResponse(500, {
      type: "error",
      message: "Internal server error",
    });
  }
}
