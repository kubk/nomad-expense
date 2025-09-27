import { describe, it, expect } from "vitest";
import { interpretDateInTimezone } from "./timezone-converter";

describe("interpretDateInTimezone", () => {
  it("should return the same date for UTC timezone", () => {
    const inputDate = new Date("2025-01-16T00:00:00.000Z");
    const result = interpretDateInTimezone(inputDate, "UTC");

    expect(result.toISOString()).toBe("2025-01-16T00:00:00.000Z");
  });

  it("should convert Bangkok timezone correctly", () => {
    // Bangkok is UTC+7, so midnight Bangkok time should become 17:00 UTC the previous day
    const inputDate = new Date("2025-01-16T00:00:00.000Z");
    const result = interpretDateInTimezone(inputDate, "Asia/Bangkok");

    expect(result.toISOString()).toBe("2025-01-15T17:00:00.000Z");
  });

  it("should convert New York timezone correctly", () => {
    // New York is UTC-5 (during winter), so midnight NY time should become 05:00 UTC same day
    const inputDate = new Date("2025-01-16T00:00:00.000Z");
    const result = interpretDateInTimezone(inputDate, "America/New_York");

    expect(result.toISOString()).toBe("2025-01-16T05:00:00.000Z");
  });

  it("should handle times with hours and minutes", () => {
    // 6:30 PM Bangkok time should become 11:30 AM UTC same day
    const inputDate = new Date("2025-01-16T18:30:00.000Z");
    const result = interpretDateInTimezone(inputDate, "Asia/Bangkok");

    expect(result.toISOString()).toBe("2025-01-16T11:30:00.000Z");
  });
});
