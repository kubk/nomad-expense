import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { inferImageTransactionDate } from "./infer-image-transaction-date";

const timezone = "Asia/Bangkok";
const referenceDate = DateTime.fromISO("2026-09-02T13:00:00", { zone: timezone });

describe("inferImageTransactionDate", () => {
  it("uses the current year when the year is not visible", () => {
    const date = inferImageTransactionDate({
      dateIso: "2023-08-31T00:00:00",
      timezone,
      referenceDate,
    });

    expect(date.toISOString()).toBe("2026-08-30T17:00:00.000Z");
  });

  it("uses the previous year when the inferred date would be in the future", () => {
    const date = inferImageTransactionDate({
      dateIso: "2023-12-31T00:00:00",
      timezone,
      referenceDate,
    });

    expect(date.toISOString()).toBe("2025-12-30T17:00:00.000Z");
  });
});
