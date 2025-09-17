import { addCorsHeaders } from "../lib/cloudflare/cors";
import { authenticate } from "../services/auth/authenticate";
import { getDb } from "../services/db";
import { parseWiseStatement } from "../services/bank-parsers/wise-parser";
import { importTransactions } from "../services/transaction-import";

export async function uploadHandler(request: Request): Promise<Response> {
  try {
    const authResult = await authenticate(request);
    if (!authResult) {
      return addCorsHeaders(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const accountId = formData.get("accountId") as string;

    if (!file) {
      return addCorsHeaders(
        new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }

    if (!accountId) {
      return addCorsHeaders(
        new Response(JSON.stringify({ error: "No account ID provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }

    console.log("Processing bank statement:", {
      fileName: file.name,
      fileSize: file.size,
      accountId,
      userId: authResult.userId,
      familyId: authResult.familyId,
    });

    // Parse the Wise CSV file
    const transactions = await parseWiseStatement(file);

    // Import the transactions
    const db = getDb();
    const result = await importTransactions(
      db,
      accountId,
      authResult.familyId,
      transactions,
    );

    return addCorsHeaders(
      new Response(
        JSON.stringify({
          success: true,
          removed: result.removed,
          added: result.added,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
  } catch (error) {
    console.error("Upload error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return addCorsHeaders(
      new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }
}
