/**
 * EarningsCard — renders ROA and NIM with neutral peer comparison.
 *
 * Uses Card primitive directly (two metrics side by side).
 * Consumes domain types only — no FDIC types reach this component.
 *
 * Color logic: NEUTRAL peer presentation (no green/amber for above/below median).
 * Warning color reserved for genuine concern thresholds only:
 * - Negative ROA (bank is losing money) → amber/red
 * - Simply being below median does NOT earn a warning color
 *
 * This principle applies to all non-regulatory metrics: color = concern level,
 * never percentile rank.
 */

import type { MetricValue, PeerComparison, TrendDataPoint } from "@/types/domain";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricDisplay } from "./MetricDisplay";

interface EarningsCardProps {
  roa: MetricValue;
  nim: MetricValue;
  roaPeerComparison: PeerComparison | null;
  nimPeerComparison: PeerComparison | null;
  roaTrend: TrendDataPoint[] | null;
  nimTrend: TrendDataPoint[] | null;
  dataAsOf: Date | null;
}

export function EarningsCard({
  roa,
  nim,
  roaPeerComparison,
  nimPeerComparison,
  roaTrend,
  nimTrend,
  dataAsOf,
}: EarningsCardProps) {
  // Institution-level empty state
  if (roa.kind === "missing" && nim.kind === "missing" && roa.reason !== "not_queryable") {
    return (
      <Card aria-label="Earnings indicator card">
        <CardHeader>
          <h3 className="text-base font-semibold text-gray-900">Earnings</h3>
          <p className="text-xs text-gray-500">Return on Assets &amp; Net Interest Margin</p>
        </CardHeader>
        <CardContent>
          <EmptyState reason={roa.reason} />
          <DataAsOfFooter dataAsOf={dataAsOf} />
        </CardContent>
      </Card>
    );
  }

  // Concern threshold: negative ROA means the bank is losing money
  const roaConcern = roa.kind === "available" && roa.value < 0;

  return (
    <Card aria-label="Earnings indicator card">
      <CardHeader>
        <h3 className="text-base font-semibold text-gray-900">Earnings</h3>
        <p className="text-xs text-gray-500">Return on Assets &amp; Net Interest Margin</p>
      </CardHeader>

      <CardContent>
        {/* ROA */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Return on Assets (ROA)
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Annualized from the latest quarter
          </p>
          <div className={roaConcern ? "rounded-md bg-amber-50 p-2 border border-amber-200" : ""}>
            <MetricDisplay metric={roa} label="ROA" />
            {roaConcern && (
              <p className="mt-1 text-xs text-amber-700">
                This bank is currently losing money.
              </p>
            )}
          </div>
          {roaPeerComparison && roa.kind === "available" && (
            <NeutralPeerLine comparison={roaPeerComparison} className="mt-1" />
          )}
        </div>

        {/* ROA trend placeholder */}
        {roaTrend && roaTrend.length >= 2 && (
          <div className="mb-4 rounded bg-gray-50 p-2 text-xs text-gray-400 text-center">
            ROA trend: {roaTrend.length} quarters
          </div>
        )}

        {/* NIM */}
        <div className="mb-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Net Interest Margin
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Spread between lending income and deposit costs
          </p>
          <MetricDisplay metric={nim} label="NIM" />
          {nimPeerComparison && nim.kind === "available" && (
            <NeutralPeerLine comparison={nimPeerComparison} className="mt-1" />
          )}
        </div>

        {/* NIM trend placeholder */}
        {nimTrend && nimTrend.length >= 2 && (
          <div className="mb-4 rounded bg-gray-50 p-2 text-xs text-gray-400 text-center">
            NIM trend: {nimTrend.length} quarters
          </div>
        )}

        {/* Plain-English explanation */}
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          Is this bank earning enough to stay healthy? Return on assets measures
          how much profit the bank generates from everything it owns. Net interest
          margin measures the difference between what the bank earns on loans and
          what it pays on deposits — essentially, its core business profitability.
          A bank that consistently earns money can absorb unexpected losses without
          eating into its capital cushion. A chronically unprofitable bank erodes
          that cushion over time.
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
