/**
 * Display formatting utilities.
 * Pure functions — no side effects, no imports from domain or FDIC types.
 */

/**
 * Format a percentage value for display.
 * @param value - The percentage (e.g., 12.4 means 12.4%)
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a dollar amount in thousands for display.
 * FDIC reports values in thousands — this converts to human-readable.
 * @param thousands - Value in thousands of dollars
 */
export function formatCurrency(thousands: number): string {
  const value = thousands * 1000;
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return `$${(value / 1_000).toFixed(0)}K`;
}

/**
 * Format an FDIC report date (YYYYMMDD) into a quarter label.
 * @param repdte - FDIC report date string (e.g., "20241231")
 */
export function formatQuarter(repdte: string): string {
  const year = repdte.slice(0, 4);
  const month = parseInt(repdte.slice(4, 6), 10);

  const quarter = Math.ceil(month / 3);
  return `Q${quarter} ${year}`;
}
