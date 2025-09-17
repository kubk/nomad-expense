export function calculateMaxAmount(data: { usdAmount: number }[]): number {
  return Math.max(...data.map((item) => item.usdAmount), 0);
}
