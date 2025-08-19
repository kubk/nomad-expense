export const addCorsHeaders = (response?: Response): Response => {
  const newHeaders = new Headers(response?.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  newHeaders.set("Access-Control-Max-Age", "604800");
  
  return new Response(response?.body, {
    status: response?.status || 200,
    statusText: response?.statusText || "OK",
    headers: newHeaders,
  });
};
