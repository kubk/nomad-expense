import { DateTime } from "luxon";

export function interpretDateInTimezone(date: Date, timezone: string): Date {
  // Extract the date components and create a new DateTime in the specified timezone
  const originalDate = DateTime.fromJSDate(date);
  const localDateTime = DateTime.fromObject(
    {
      year: originalDate.year,
      month: originalDate.month,
      day: originalDate.day,
      hour: originalDate.hour,
      minute: originalDate.minute,
      second: originalDate.second,
      millisecond: originalDate.millisecond,
    },
    { zone: timezone },
  );

  return localDateTime.toUTC().toJSDate();
}
