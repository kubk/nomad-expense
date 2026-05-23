import { authenticate } from "../services/auth/authenticate";
import { getDb } from "../services/db";
import { getAccountByFamilyId } from "../db/account/get-account-by-family-id";
import { jsonResponse } from "../lib/cloudflare/json-response";
import { Transaction } from "../shared";
import { importFile } from "../services/transaction-import/import-filte";
import { getTranslation } from "../translations/translations";

export type UploadHandlerResponse =
  | { type: "error"; message: string }
  | { type: "success"; removed: Transaction[]; added: Transaction[] };

export async function uploadStatementHandler(
  request: Request,
): Promise<Response> {
  let authResult: Awaited<ReturnType<typeof authenticate>> = null;

  try {
    authResult = await authenticate({ type: "api", req: request });
    if (!authResult) {
      const { t } = getTranslation(authResult);
      return jsonResponse(401, { type: "error", message: t("unauthorized") });
    }

    const { t } = getTranslation(authResult);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const accountId = formData.get("accountId") as string;

    if (!file) {
      return jsonResponse(400, {
        type: "error",
        message: t("noFileProvided"),
      });
    }

    if (!accountId) {
      return jsonResponse(400, {
        type: "error",
        message: t("noAccountIdProvided"),
      });
    }

    const db = getDb();
    const accountResult = await getAccountByFamilyId(
      db,
      accountId,
      authResult.familyId,
    );

    if (accountResult.type === "notFound") {
      return jsonResponse(403, { type: "error", message: t("accessDenied") });
    }

    const importResult = await importFile(
      db,
      accountResult.account,
      file,
      authResult.userId,
    );

    return jsonResponse(200, {
      type: "success",
      removed: importResult.removed,
      added: importResult.added,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const { t } = getTranslation(authResult);

    return jsonResponse(500, {
      type: "error",
      message: t("internalServerError"),
    });
  }
}
