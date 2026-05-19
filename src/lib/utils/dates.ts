/**
 * Date utility functions for data freshness calculations.
 * Pure functions — no side effects.
 */

const STALE_THRESHOLD_DAYS = 120;

/**
 * Parse an FDIC report date string into a Date object.
 * Handles both formats:
 * - YYYYMMDD (financials endpoint)
 * - MM/DD/YYYY or M/D/YYYY (institutions and failures endpoints)
 * Returns null if the input is null, undefined, or unparseable.
 */
export function parseReportDate(repdte: string | null | undefined): Date | null {
  if (!repdte) return null;

  let year: number, month: number, day: number;

  if (repdte.includes("/")) {
    // MM/DD/YYYY or M/D/YYYY format
    const parts = repdte.split("/");
    if (parts.length !== 3) return null;
    month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (repdte.length >= 8) {
    // YYYYMMDD format
    year = parseInt(repdte.slice(0, 4), 10);
    month = parseInt(repdte.slice(4, 6), 10) - 1;
    day = parseInt(repdte.slice(6, 8), 10);
  } else {
    return null;
  }

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
