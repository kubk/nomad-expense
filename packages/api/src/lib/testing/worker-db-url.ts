export function getWorkerDbUrl(templateDbUrl: string, poolId: number) {
  const url = new URL(templateDbUrl);
  url.pathname = `${url.pathname}_${poolId}`;
  return url.toString();
}

export function getDbName(dbUrl: string) {
  return new URL(dbUrl).pathname.slice(1);
}
