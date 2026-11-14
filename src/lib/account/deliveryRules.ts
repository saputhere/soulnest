export const DOMESTIC_LEAD_DAYS = 5;
export const INTERNATIONAL_LEAD_DAYS = 18;

const TIME_ZONE = "Asia/Colombo";
const MAX_DAYS_AHEAD = 365 * 5;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isDomesticCountry(country: string): boolean {
  const value = country.trim().toLowerCase();
  return value === "sri lanka" || value === "lk";
}

export function leadDaysFor(isDomestic: boolean): number {
  return isDomestic ? DOMESTIC_LEAD_DAYS : INTERNATIONAL_LEAD_DAYS;
}

/** Today's date in Sri Lanka time, as YYYY-MM-DD. */
export function todayInColombo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Adds days to a YYYY-MM-DD date using UTC arithmetic, so time zones don't shift the result. */
export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function earliestSendDate(isDomestic: boolean, today: string): string {
  return addDays(today, leadDaysFor(isDomestic));
}

/** Returns an error message for an unacceptable date, or null when the date is allowed. */
export function checkSendDate(sendOn: string, isDomestic: boolean, today: string): string | null {
  if (!ISO_DATE.test(sendOn)) return "Please choose a valid date.";

  const earliest = earliestSendDate(isDomestic, today);
  if (sendOn < earliest) {
    return `Please choose a date at least ${leadDaysFor(isDomestic)} days from today.`;
  }

  if (sendOn > addDays(today, MAX_DAYS_AHEAD)) {
    return "Please choose a date within the next five years.";
  }

  return null;
}