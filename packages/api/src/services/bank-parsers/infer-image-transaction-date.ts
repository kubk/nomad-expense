import { DateTime } from "luxon";
import { assert } from "../../lib/typescript/assert";

type InferImageTransactionDateInput = {
  dateIso: string;
  timezone: string;
  referenceDate: DateTime;
};

export function inferImageTransactionDate({
  dateIso,
  timezone,
  referenceDate,
}: InferImageTransactionDateInput): Date {
  const parsedDate = DateTime.fromISO(dateIso, { zone: timezone });
  assert(parsedDate.isValid, `Invalid transaction date: ${dateIso}`);

  const localReferenceDate = referenceDate.setZone(timezone);
  let inferredDate = parsedDate.set({ year: localReferenceDate.year });

  if (inferredDate.startOf("day") > localReferenceDate.startOf("day")) {
    inferredDate = inferredDate.minus({ years: 1 });
  }

  return inferredDate.toJSDate();
}
