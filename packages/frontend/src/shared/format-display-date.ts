export const formatDisplayDate = (
  dateString: string,
  options: {
    today: string;
    yesterday: string;
  },
): string => {
  const transactionDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  // Reset time components for accurate comparison
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  transactionDate.setHours(0, 0, 0, 0);

  if (transactionDate.getTime() === today.getTime()) {
    return options.today;
  } else if (transactionDate.getTime() === yesterday.getTime()) {
    return options.yesterday;
  } else {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
};
