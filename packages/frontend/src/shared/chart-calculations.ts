export function calculateMaxAmount(data: { amount: number }[]): number {
  return Math.max(...data.map((item) => item.amount), 0);
}
