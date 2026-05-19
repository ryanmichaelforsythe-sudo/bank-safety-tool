/**
 * Earnings metric calculations.
 *
 * Point-in-time metric: takes singular FDICFinancials (most recent quarter).
 * Trend metric: takes FDICFinancials[] (historical series).
 *
 * Metrics: ROA (return on assets) and NIM (net interest margin).
 */

import type { FDICFinancials } from "@/types/fdic";
import type { MetricValue, TrendDataPoint } from "@/types/domain";
import type { InstitutionContext } from "./institutionStatus";
import { available, missing } from "./metricValue";
import { formatPercent, formatQuarter } from "@/lib/utils/formatters";

/** Minimum quarters needed for a meaningful trend */
const MIN_TREND_QUARTERS = 2;

/**
 * Compute earnings metrics for a single quarter (point-in-time).
 * Takes singular FDICFinancials (most recent quarter).
 */
export function computeEarnings(
  financials: FDICFinancials,
  asOf: Date,
  context: InstitutionContext
): { roa: MetricValue; nim: MetricValue } {
  // Institution-level override
  if (context.defaultEmptyReason) {
    return {
      roa: missing(context.defaultEmptyReason, asOf),
      nim: missing(context.defaultEmptyReason, asOf),
    };
  }

  const { ROAQ, NIMY } = financials;

  const roa =
    ROAQ !== null
      ? available(ROAQ, formatPercent(ROAQ), asOf)
      : missing("data_not_reported", asOf);

  const nim =
    NIMY !== null
      ? available(NIMY, formatPercent(NIMY), asOf)
      : missing("data_not_reported", asOf);

  return { roa, nim };
}

/**
 * Compute earnings trend data (historical series).
 * Takes FDICFinancials[] (multiple quarters).
 * Returns null if fewer than MIN_TREND_QUARTERS have data.
 */
export function computeEarningsTrend(
  financials: FDICFinancials[],
  context: InstitutionContext
): { roaTrend: TrendDataPoint[] | null; nimTrend: TrendDataPoint[] | null } {
  if (context.defaultEmptyReason) {
    return { roaTrend: null, nimTrend: null };
  }

  const roaTrend: TrendDataPoint[] = [];
  const nimTrend: TrendDataPoint[] = [];

  for (const q of financials) {
    const quarter = formatQuarter(q.REPDTE);

    if (q.ROAQ !== null) {
      roaTrend.push({ quarter, value: q.ROAQ });
    }
    if (q.NIMY !== null) {
      nimTrend.push({ quarter, value: q.NIMY });
    }
  }

  return {
    roaTrend: roaTrend.length >= MIN_TREND_QUARTERS ? roaTrend.reverse() : null,
    nimTrend: nimTrend.length >= MIN_TREND_QUARTERS ? nimTrend.reverse() : null,
  };
}
