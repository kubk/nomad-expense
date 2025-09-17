import { env } from "./env";
import { getAuthToken } from "./auth-token";

export type UploadResult = {
  success: boolean;
  removed?: number;
  added?: number;
  error?: string;
};

export async function uploadStatementFile(
  file: File,
  accountId: string,
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);

    const response = await fetch(`${env.VITE_API_URL}/upload-statement`, {
      method: "POST",
      headers: {
        Authorization: getAuthToken(),
      },
      body: formData,
    });

    const result = (await response.json()) as {
      removed?: number;
      added?: number;
      error?: string;
    };

    if (response.ok) {
      return {
        success: true,
        removed: result.removed,
        added: result.added,
      };
    } else {
      return {
        success: false,
        error: result.error || "Upload failed",
      };
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
