import { env } from "./env";
import { getAuthToken } from "./auth-token";
import { UploadHandlerResponse } from "api";

function rtrim(str: string, char: string) {
  return str.replace(new RegExp(char + "$"), "");
}

export async function uploadStatementFile(
  file: File,
  accountId: string,
): Promise<UploadHandlerResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("accountId", accountId);

  const response = await fetch(
    `${rtrim(env.VITE_API_URL, "/")}/upload-statement`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthToken(),
      },
      body: formData,
    },
  );

  return (await response.json()) as UploadHandlerResponse;
}
