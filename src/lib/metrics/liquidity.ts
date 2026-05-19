/**
 * Liquidity metric calculations.
 *
 * Point-in-time metric: takes singular FDICFinancials (most recent quarter).
 * Trend metric: takes FDICFinancials[] (historical series).
 *
 * Metrics: loan-to-deposit ratio and cash+securities/assets ratio.
 */

import type { FDICFinancials } from "@/types/fdic";
import type { MetricValue, TrendDataPoint } from "@/types/domain";
import type { InstitutionContext } from "./institutionStatus";
import { available, missing } from "./metricValue";
import { formatPercent, formatQuarter } from "@/lib/utils/formatters";

/** Minimum quarters needed for a meaningful trend */
const MIN_TREND_QUARTERS = 2;

/**
 * Compute liquidity metrics for a single quarter (point-in-time).
 * Takes singular FDICFinancials (most recent quarter).
 */
export function computeLiquidity(
  financials: FDICFinancials,
  asOf: Date,
  context: InstitutionContext
): { loanToDepositRatio: MetricValue; cashSecuritiesToAssetsRatio: MetricValue } {
  // Institution-level override
  if (context.defaultEmptyReason) {
    return {
      loanToDepositRatio: missing(context.defaultEmptyReason, asOf),
      cashSecuritiesToAssetsRatio: missing(context.defaultEmptyReason, asOf),
    };
  }

  const { LNLSDEPR, CASH, SC, ASSET } = financials;

  // Loan-to-deposit ratio — directly from FDIC field
  const loanToDepositRatio =
    LNLSDEPR !== null
      ? available(LNLSDEPR, formatPercent(LNLSDEPR), asOf)
      : missing("data_not_reported", asOf);

  // Cash + securities to assets — derived
  let cashSecuritiesToAssetsRatio: MetricValue;
  if (CASH !== null && SC !== null && ASSET !== null && ASSET > 0) {
    const ratio = ((CASH + SC) / ASSET) * 100;
    cashSecuritiesToAssetsRatio = available(ratio, formatPercent(ratio), asOf);
  } else {
    cashSecuritiesToAssetsRatio = missing("data_not_reported", asOf);
  }

  return { loanToDepositRatio, cashSecuritiesToAssetsRatio };
}

/**
 * Compute liquidity trend data (historical series).
 * Takes FDICFinancials[] (multiple quarters).
 * Returns null if fewer than MIN_TREND_QUARTERS have data.
 */
export function computeLiquidityTrend(
  financials: FDICFinancials[],
  context: InstitutionContext
): {
  loanToDepositTrend: TrendDataPoint[] | null;
  cashSecuritiesTrend: TrendDataPoint[] | null;
} {
  if (context.defaultEmptyReason) {
    return { loanToDepositTrend: null, cashSecuritiesTrend: null };
  }

  const loanToDepositTrend: TrendDataPoint[] = [];
  const cashSecuritiesTrend: TrendDataPoint[] = [];

  for (const q of financials) {
    const quarter = formatQuarter(q.REPDTE);

    if (q.LNLSDEPR !== null) {
      loanToDepositTrend.push({ quarter, value: q.LNLSDEPR });
    }
    if (q.CASH !== null && q.SC !== null && q.ASSET !== null && q.ASSET > 0) {
      cashSecuritiesTrend.push({
        quarter,
        value: ((q.CASH + q.SC) / q.ASSET) * 100,
      });
    }
  }

  return {
    loanToDepositTrend:
      loanToDepositTrend.length >= MIN_TREND_QUARTERS
        ? loanToDepositTrend.reverse()
        : null,
    cashSecuritiesTrend:
      cashSecuritiesTrend.length >= MIN_TREND_QUARTERS
        ? cashSecuritiesTrend.reverse()
        : null,
  };
}
