// src/utils/date-utils.ts
export function getDatesForWeekdayInRange(
  startDate: Date,
  endDate: Date,
  targetDayOfWeek: number, // 0 = Sunday ... 6 = Saturday
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  // Set current to the first occurrence of targetDayOfWeek >= startDate
  current.setDate(current.getDate() + ((7 + targetDayOfWeek - current.getDay()) % 7));

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return dates;
}
