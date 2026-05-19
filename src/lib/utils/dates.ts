/**
 * Date utility functions for data freshness calculations.
 * Pure functions — no side effects.
 */

const STALE_THRESHOLD_DAYS = 120;

/**
 * Parse an FDIC report date string (YYYYMMDD) into a Date object.
 * Returns null if the input is null, undefined, or unparseable.
 */
export function parseReportDate(repdte: string | null | undefined): Date | null {
  if (!repdte || repdte.length < 8) return null;

  const year = parseInt(repdte.slice(0, 4), 10);
  const month = parseInt(repdte.slice(4, 6), 10) - 1; // JS months are 0-indexed
  const day = parseInt(repdte.slice(6, 8), 10);

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Determine if data is stale (≥ 120 days old).
 * Per Req 12.3: fires at exactly 120 days or older.
 *
 * @param dataAsOf - The data-as-of date
 * @param now - Current date (injectable for testing)
 */
export function isStaleData(dataAsOf: Date, now: Date = new Date()): boolean {
  const diffMs = now.getTime() - dataAsOf.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= STALE_THRESHOLD_DAYS;
}

/**
 * Get a human-readable freshness label for the data-as-of date.
 */
export function getDataFreshnessLabel(dataAsOf: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return `Data as of ${dataAsOf.toLocaleDateString("en-US", options)}`;
}
