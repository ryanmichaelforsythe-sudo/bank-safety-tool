/**
 * Deposit metric calculations.
 *
 * Two distinct metrics:
 * 1. Uninsured deposit concentration — point-in-time (snapshot, NO trend)
 *    Takes singular FDICFinancials (most recent quarter).
 * 2. Deposit trend — historical series (three series: total, insured, uninsured)
 *    Takes FDICFinancials[] (multiple quarters).
 *
 * Null propagation:
 * - DEPNIDOM (required): if null → missing("data_not_reported")
 * - DEP (required): if null or 0 → missing("data_not_reported")
 * - DEPFOR (optional): if null → defaults to 0 (many domestic-only banks)
 * - DEPINS (required for trend): if null → that quarter excluded from insured series
 */

import type { FDICFinancials } from "@/types/fdic";
import type { MetricValue, TrendDataPoint, DepositTrendSeries } from "@/types/domain";
import type { InstitutionContext } from "./institutionStatus";
import { available, missing } from "./metricValue";
import { formatPercent, formatQuarter } from "@/lib/utils/formatters";

/** Minimum quarters needed for a meaningful deposit trend */
const MIN_TREND_QUARTERS = 2;

/**
 * Compute uninsured deposit concentration (point-in-time snapshot).
 * Takes singular FDICFinancials (most recent quarter).
 * Formula: (DEPNIDOM + DEPFOR) / DEP * 100
 */
export function computeUninsuredConcentration(
  financials: FDICFinancials,
  asOf: Date,
  context: InstitutionContext
): MetricValue {
  // Institution-level override
  if (context.defaultEmptyReason) {
    return missing(context.defaultEmptyReason, asOf);
  }

  const { DEPNIDOM, DEPFOR, DEP } = financials;

  // Required fields — null means data not reported
  if (DEPNIDOM === null || DEP === null || DEP === 0) {
    return missing("data_not_reported", asOf);
  }

  // DEPFOR is optional — defaults to 0 for domestic-only banks
  const uninsured = DEPNIDOM + (DEPFOR ?? 0);
  const concentration = (uninsured / DEP) * 100;
  return available(concentration, formatPercent(concentration), asOf);
}

/**
 * Compute deposit trend (three time-series: total, insured, uninsured domestic).
 * Takes FDICFinancials[] (historical series).
 * Returns null if fewer than MIN_TREND_QUARTERS have data.
 *
 * Per Req 10 (SHALL hardened): renders exactly three series when data is available.
 */
export function computeDepositTrend(
  financials: FDICFinancials[],
  context: InstitutionContext
): DepositTrendSeries | null {
  // Institution-level override
  if (context.defaultEmptyReason) return null;

  const total: TrendDataPoint[] = [];
  const insured: TrendDataPoint[] = [];
  const uninsuredDomestic: TrendDataPoint[] = [];

  for (const q of financials) {
    const quarter = formatQuarter(q.REPDTE);

    if (q.DEP !== null) {
      total.push({ quarter, value: q.DEP });
    }
    if (q.DEPINS !== null) {
      insured.push({ quarter, value: q.DEPINS });
    }
    if (q.DEPNIDOM !== null) {
      uninsuredDomestic.push({ quarter, value: q.DEPNIDOM });
    }
  }

  // Need at least MIN_TREND_QUARTERS for the primary series (total deposits)
  if (total.length < MIN_TREND_QUARTERS) return null;

  return {
    total: total.reverse(),
    insured: insured.reverse(),
    uninsuredDomestic: uninsuredDomestic.reverse(),
  };
}
