export const getAfterMonthDate = (
  month: number,
  date: Date | string | null = null,
) => {
  const now = date ? new Date(date) : new Date();
  return new Date(now.setMonth(now.getMonth() + month));
};
