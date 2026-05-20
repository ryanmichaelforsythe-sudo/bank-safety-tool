/**
 * LiquidityCard — renders loan-to-deposit ratio and liquid assets ratio.
 *
 * Uses Card primitive directly (two metrics).
 * Consumes domain types only — no FDIC types reach this component.
 *
 * Color logic: FULLY NEUTRAL for both metrics.
 * - Loan-to-deposit is NOT directional (no single "good" value)
 * - Cash+securities/assets has no regulatory threshold
 * - Peer median side-by-side surfaces outliers without invented thresholds
 * - We show facts and let peer context speak; we don't assign safety grades
 *   to non-regulatory metrics
 */

import type { MetricValue, PeerComparison, TrendDataPoint } from "@/types/domain";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricDisplay } from "./MetricDisplay";

interface LiquidityCardProps {
  loanToDepositRatio: MetricValue;
  cashSecuritiesToAssetsRatio: MetricValue;
  ltdPeerComparison: PeerComparison | null;
  cashSecPeerComparison: PeerComparison | null;
  ltdTrend: TrendDataPoint[] | null;
  cashSecTrend: TrendDataPoint[] | null;
  dataAsOf: Date | null;
}

export function LiquidityCard({
  loanToDepositRatio,
  cashSecuritiesToAssetsRatio,
  ltdPeerComparison,
  cashSecPeerComparison,
  ltdTrend,
  cashSecTrend,
  dataAsOf,
}: LiquidityCardProps) {
  // Institution-level empty state
  if (
    loanToDepositRatio.kind === "missing" &&
    cashSecuritiesToAssetsRatio.kind === "missing"
  ) {
    return (
      <Card aria-label="Liquidity indicator card">
        <CardHeader>
          <h3 className="text-base font-semibold text-gray-900">Liquidity</h3>
          <p className="text-xs text-gray-500">Loan-to-Deposit &amp; Liquid Assets</p>
        </CardHeader>
        <CardContent>
          <EmptyState reason={loanToDepositRatio.reason} />
          <DataAsOfFooter dataAsOf={dataAsOf} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card aria-label="Liquidity indicator card">
      <CardHeader>
        <h3 className="text-base font-semibold text-gray-900">Liquidity</h3>
        <p className="text-xs text-gray-500">Loan-to-Deposit &amp; Liquid Assets</p>
      </CardHeader>

      <CardContent>
        {/* Loan-to-Deposit Ratio */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Loan-to-Deposit Ratio
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Loans outstanding as a percentage of total deposits
          </p>
          <MetricDisplay metric={loanToDepositRatio} label="LTD Ratio" />
          {ltdPeerComparison && loanToDepositRatio.kind === "available" && (
            <NeutralPeerLine comparison={ltdPeerComparison} className="mt-1" />
          )}
        </div>

        {/* LTD trend placeholder */}
        {ltdTrend && ltdTrend.length >= 2 && (
          <div className="mb-4 rounded bg-gray-50 p-2 text-xs text-gray-400 text-center">
            LTD trend: {ltdTrend.length} quarters
          </div>
        )}

        {/* Cash + Securities / Assets */}
        <div className="mb-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Liquid Assets Ratio
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Cash and securities as a percentage of total assets
          </p>
          <MetricDisplay metric={cashSecuritiesToAssetsRatio} label="Liquid Assets" />
          {cashSecPeerComparison && cashSecuritiesToAssetsRatio.kind === "available" && (
            <NeutralPeerLine comparison={cashSecPeerComparison} className="mt-1" />
          )}
        </div>

        {/* Cash+Sec trend placeholder */}
        {cashSecTrend && cashSecTrend.length >= 2 && (
          <div className="mb-4 rounded bg-gray-50 p-2 text-xs text-gray-400 text-center">
            Liquid assets trend: {cashSecTrend.length} quarters
          </div>
        )}

        {/* Plain-English explanation */}
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          Can this bank meet withdrawals without scrambling? The loan-to-deposit
          ratio shows how much of depositors&apos; money has been lent out versus
          kept available. Unlike capital ratios, there&apos;s no single healthy
          number here — it depends on the bank&apos;s business model. A very high
          ratio means less cash on hand; a very low ratio may mean the bank
          isn&apos;t putting deposits to productive use. The liquid assets ratio
          shows the bank&apos;s buffer — assets it can convert to cash quickly if
          needed.
        </p>

        <DataAsOfFooter dataAsOf={dataAsOf} />
      </CardContent>
    </Card>
  );
}

// --- Internal: neutral peer comparison (no judgment color) ---

function NeutralPeerLine({
  comparison,
  className = "",
}: {
  comparison: PeerComparison;
  className?: string;
}) {
  const { institutionValue, peerMedian, peerGroupName } = comparison;

  return (
    <p className={`text-xs text-gray-400 ${className}`}>
      {institutionValue.toFixed(2)}% vs. peer median {peerMedian.toFixed(2)}%
      <span className="text-gray-300"> · {peerGroupName}</span>
    </p>
  );
}

function DataAsOfFooter({ dataAsOf }: { dataAsOf: Date | null }) {
  return (
    <p className="mt-3 text-xs text-gray-400">
      {dataAsOf
        ? `Data as of ${dataAsOf.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
        : "Data date unavailable"}
    </p>
  );
}
