const MONTHS_IN_YEAR = 12;

const getMonthDate = (monthNumber: number) => {
  return new Date(2020, monthNumber - 1, 1);
};

export const getShortMonthName = (monthNumber: number): string => {
  return new Intl.DateTimeFormat(undefined, { month: "short" }).format(
    getMonthDate(monthNumber),
  );
};

export const getFullMonthName = (monthNumber: number): string => {
  return new Intl.DateTimeFormat(undefined, { month: "long" }).format(
    getMonthDate(monthNumber),
  );
};

export const getMonthNumbers = (): number[] => {
  return Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);
};

export const isMonthInFuture = (year: number, month: number): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month > currentMonth);
};
