/**
 * Asset quality metric calculations.
 *
 * Point-in-time metric: takes singular FDICFinancials (most recent quarter).
 * Trend metric: takes FDICFinancials[] (historical series).
 *
 * NPL ratio is the primary metric. Charge-off rate is always missing
 * (not queryable via FDIC BankFind Suite API — documented limitation).
 */

import type { FDICFinancials } from "@/types/fdic";
import type { MetricValue, TrendDataPoint } from "@/types/domain";
import type { InstitutionContext } from "./institutionStatus";
import { available, missing } from "./metricValue";
import { formatPercent, formatQuarter } from "@/lib/utils/formatters";

/** Minimum quarters needed for a meaningful trend */
const MIN_TREND_QUARTERS = 2;

/**
 * Compute asset quality metrics for a single quarter (point-in-time).
 * Takes singular FDICFinancials (most recent quarter).
 */
export function computeAssetQuality(
  financials: FDICFinancials,
  asOf: Date,
  context: InstitutionContext
): { nplRatio: MetricValue; chargeOffRate: MetricValue } {
  // Institution-level override
  if (context.defaultEmptyReason) {
    return {
      nplRatio: missing(context.defaultEmptyReason, asOf),
      chargeOffRate: missing(context.defaultEmptyReason, asOf),
    };
  }

  const { LNLSNTV } = financials;

  // NPL ratio — directly from FDIC field
  const nplRatio =
    LNLSNTV != null
      ? available(LNLSNTV, formatPercent(LNLSNTV), asOf)
      : missing("data_not_reported", asOf);

  // Charge-off rate — always missing (not queryable via FDIC API)
  const chargeOffRate = missing("not_queryable", asOf);

  return { nplRatio, chargeOffRate };
}

/**
 * Compute asset quality trend data (historical series).
 * Takes FDICFinancials[] (multiple quarters).
 * Returns null if fewer than MIN_TREND_QUARTERS have data.
 */
export function computeAssetQualityTrend(
  financials: FDICFinancials[],
  context: InstitutionContext
): TrendDataPoint[] | null {
  if (context.defaultEmptyReason) return null;

  const trend: TrendDataPoint[] = [];

  for (const q of financials) {
    if (q.LNLSNTV != null) {
      trend.push({ quarter: formatQuarter(q.REPDTE), value: q.LNLSNTV });
    }
  }

  if (trend.length < MIN_TREND_QUARTERS) return null;
  return trend.reverse();
}
