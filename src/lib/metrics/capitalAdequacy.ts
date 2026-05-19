/**
 * Capital adequacy metric calculations and regulatory categorization.
 *
 * Point-in-time metric: takes singular FDICFinancials (most recent quarter).
 * Trend metric: takes FDICFinancials[] (historical series) for trend computation.
 *
 * FDIC-defined thresholds from 12 CFR Part 325.
 * Each number is the FLOOR for that category — walk high→low, return first met.
 * Monotonicity (Property 2) is a free consequence of this floor-based algorithm.
 */

import type { FDICFinancials } from "@/types/fdic";
import type { MetricValue, CapitalCategory, TrendDataPoint } from "@/types/domain";
import type { InstitutionContext } from "./institutionStatus";
import { available, missing } from "./metricValue";
import { formatPercent, formatQuarter } from "@/lib/utils/formatters";

// --- FDIC-defined capital category thresholds (12 CFR Part 325) ---
// Each value is the FLOOR (minimum ratio) to qualify for that category.
// Algorithm: walk from well→adequate→under, return first category where
// ALL applicable ratios meet the floor. If none met, critically undercapitalized.

export const CAPITAL_THRESHOLDS = {
  /** Tier 1 Risk-Based Capital Ratio floors */
  tier1RiskBased: { well: 8, adequate: 6, under: 4 },
  /** Total Risk-Based Capital Ratio floors */
  totalRiskBased: { well: 10, adequate: 8, under: 6 },
  /** Leverage Ratio (Tier 1 / Total Assets) floors */
  leverage: { well: 5, adequate: 4, under: 3 },
  /** Critically undercapitalized: tangible equity ≤ 2% of total assets */
  criticallyUnder: 2,
} as const;

/**
 * Categorize an institution's capital adequacy using FDIC-defined thresholds.
 * Takes three ratios, returns the most restrictive category across all three.
 *
 * Algorithm: walk floors high→low. A category requires ALL ratios to meet
 * their respective floor. Return the highest category where all floors are met.
 * If no category is met (all ratios below "under" floors), check for critically
 * undercapitalized (leverage ≤ 2%).
 *
 * @param tier1Ratio - Tier 1 Risk-Based Capital Ratio (%)
 * @param totalCapitalRatio - Total Risk-Based Capital Ratio (%)
 * @param leverageRatio - Leverage Ratio (Tier 1 / Total Assets) (%)
 */
export function categorizeCapital(
  tier1Ratio: number,
  totalCapitalRatio: number,
  leverageRatio: number
): CapitalCategory {
  const { tier1RiskBased, totalRiskBased, leverage, criticallyUnder } =
    CAPITAL_THRESHOLDS;

  // Critically undercapitalized check first (tangible equity ≤ 2%)
  if (leverageRatio <= criticallyUnder) {
    return "critically_undercapitalized";
  }

  // Walk floors high→low
  if (
    tier1Ratio >= tier1RiskBased.well &&
    totalCapitalRatio >= totalRiskBased.well &&
    leverageRatio >= leverage.well
  ) {
    return "well_capitalized";
  }

  if (
    tier1Ratio >= tier1RiskBased.adequate &&
    totalCapitalRatio >= totalRiskBased.adequate &&
    leverageRatio >= leverage.adequate
  ) {
    return "adequately_capitalized";
  }

  if (
    tier1Ratio >= tier1RiskBased.under &&
    totalCapitalRatio >= totalRiskBased.under &&
    leverageRatio >= leverage.under
  ) {
    return "undercapitalized";
  }

  // Below all "under" floors but above critically undercapitalized
  return "significantly_undercapitalized";
}

/**
 * Compute capital adequacy metrics for a single quarter (point-in-time).
 * Takes singular FDICFinancials (most recent quarter).
 */
export function computeCapitalAdequacy(
  financials: FDICFinancials,
  asOf: Date,
  context: InstitutionContext
): { tier1Ratio: MetricValue; equityToAssetsRatio: MetricValue } {
  // Institution-level override
  if (context.defaultEmptyReason) {
    return {
      tier1Ratio: missing(context.defaultEmptyReason, asOf),
      equityToAssetsRatio: missing(context.defaultEmptyReason, asOf),
    };
  }

  const { RBCRWAJ, EQ, ASSET } = financials;

  // Tier 1 ratio — RBCRWAJ is the total risk-based capital ratio from FDIC
  const tier1Ratio =
    RBCRWAJ !== null
      ? available(RBCRWAJ, formatPercent(RBCRWAJ), asOf)
      : missing("data_not_reported", asOf);

  // Equity-to-assets ratio — derived from EQ / ASSET
  let equityToAssetsRatio: MetricValue;
  if (EQ !== null && ASSET !== null && ASSET > 0) {
    const ratio = (EQ / ASSET) * 100;
    equityToAssetsRatio = available(ratio, formatPercent(ratio), asOf);
  } else {
    equityToAssetsRatio = missing("data_not_reported", asOf);
  }

  return { tier1Ratio, equityToAssetsRatio };
}

/**
 * Compute capital adequacy trend data (historical series).
 * Takes FDICFinancials[] (multiple quarters).
 * Returns missing('insufficient_history') if fewer than 2 quarters available.
 */
export function computeCapitalTrend(
  financials: FDICFinancials[],
  context: InstitutionContext
): { tier1Trend: TrendDataPoint[] | null; equityTrend: TrendDataPoint[] | null } {
  if (context.defaultEmptyReason || financials.length < 2) {
    return { tier1Trend: null, equityTrend: null };
  }

  const tier1Trend: TrendDataPoint[] = [];
  const equityTrend: TrendDataPoint[] = [];

  for (const q of financials) {
    const quarter = formatQuarter(q.REPDTE);

    if (q.RBCRWAJ !== null) {
      tier1Trend.push({ quarter, value: q.RBCRWAJ });
    }

    if (q.EQ !== null && q.ASSET !== null && q.ASSET > 0) {
      equityTrend.push({ quarter, value: (q.EQ / q.ASSET) * 100 });
    }
  }

  return {
    tier1Trend: tier1Trend.length >= 2 ? tier1Trend.reverse() : null,
    equityTrend: equityTrend.length >= 2 ? equityTrend.reverse() : null,
  };
}
