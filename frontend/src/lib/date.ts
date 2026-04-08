export const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
};

export const toIsoUtcStartOfDay = (dateValue: string) => `${dateValue}T00:00:00.000Z`;

export const formatDateInputValue = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDaysToDateInputValue = (dateValue: string, daysToAdd: number) => {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return formatDateInputValue(date);
};

export const getTodayDateInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
