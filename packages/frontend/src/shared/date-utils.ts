const getMonthDate = (monthNumber: number) => {
  return new Date(2020, monthNumber - 1, 1);
};

export const getShortMonthName = (monthNumber: number): string => {
  return new Intl.DateTimeFormat(undefined, { month: "short" }).format(
    getMonthDate(monthNumber),
  );
};
