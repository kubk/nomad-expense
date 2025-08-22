const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const FULL_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTHS_IN_YEAR = 12;

export const getShortMonthName = (monthNumber: number): string => {
  return SHORT_MONTH_NAMES[monthNumber - 1];
};

export const getFullMonthName = (monthNumber: number): string => {
  return FULL_MONTH_NAMES[monthNumber - 1];
};

export const getMonthNumbers = (): number[] => {
  return Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);
};
