import { addCorsHeaders } from "./cors";

export function jsonResponse(
  status: number,
  data: Record<string, unknown>,
): Response {
  return addCorsHeaders(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}
