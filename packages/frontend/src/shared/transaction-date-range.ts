import { DateTime } from "luxon";
import type { TransactionFilters } from "api";
import type { DateRange } from "react-day-picker";

export function getTransactionDateRange(
  date: TransactionFilters["date"],
): DateRange {
  const today = DateTime.local().startOf("day");

  if (date.type === "range") {
    return {
      from: DateTime.fromISO(date.from).toJSDate(),
      to: DateTime.fromISO(date.to).toJSDate(),
    };
  }

  if (date.type === "days") {
    return {
      from: today.minus({ days: date.value }).toJSDate(),
      to: today.toJSDate(),
    };
  }

  if (date.type === "months") {
    return {
      from: today.minus({ months: date.value }).toJSDate(),
      to: today.toJSDate(),
    };
  }

  return { from: today.startOf("month").toJSDate(), to: today.toJSDate() };
}

export function formatTransactionDateRange(range: DateRange, language: string) {
  const formatter = new Intl.DateTimeFormat(language, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const formatDate = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const yearIndex = parts.findIndex((part) => part.type === "year");
    return parts
      .filter((part, index) => part.type !== "literal" || index <= yearIndex)
      .map((part) => part.type === "month" ? part.value.replace(/\.$/, "") : part.value)
      .join("")
      .trim();
  };

  if (!range.from) return "";
  const from = formatDate(range.from);
  return range.to ? `${from} - ${formatDate(range.to)}` : `${from} - …`;
}

export function getTransactionMonthRange(
  year: number,
  month: number,
): Extract<TransactionFilters["date"], { type: "range" }> {
  const start = DateTime.local(year, month, 1);
  return {
    type: "range",
    from: start.toFormat("yyyy-MM-dd"),
    to: start.endOf("month").toFormat("yyyy-MM-dd"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
