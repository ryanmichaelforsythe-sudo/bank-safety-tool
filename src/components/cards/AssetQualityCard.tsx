/**
 * AssetQualityCard — renders NPL ratio as primary metric with peer comparison,
 * and charge-off rate as always-missing with institution-specific Call Report link.
 *
 * Uses Card primitive directly (two metrics with different treatments).
 * Consumes domain types only — no FDIC types reach this component.
 *
 * Direction flip: for NPL ratio, BELOW peer = good (fewer bad loans),
 * ABOVE peer = concerning. Opposite of capital ratios.
 */

import Link from "next/link";
import type { MetricValue, PeerComparison, TrendDataPoint } from "@/types/domain";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricDisplay } from "./MetricDisplay";

interface AssetQualityCardProps {
  nplRatio: MetricValue;
  chargeOffRate: MetricValue;
  nplPeerComparison: PeerComparison | null;
  nplTrend: TrendDataPoint[] | null;
  cert: number;
  dataAsOf: Date | null;
}

export function AssetQualityCard({
  nplRatio,
  chargeOffRate,
  nplPeerComparison,
  nplTrend,
  cert,
  dataAsOf,
}: AssetQualityCardProps) {
  // Institution-level empty state — both metrics missing for same reason
  if (
    nplRatio.kind === "missing" &&
    chargeOffRate.kind === "missing" &&
    nplRatio.reason !== "not_queryable"
  ) {
    return (
      <Card aria-label="Asset Quality indicator card">
        <CardHeader>
          <h3 className="text-base font-semibold text-gray-900">Asset Quality</h3>
          <p className="text-xs text-gray-500">Non-Performing Loans Ratio</p>
        </CardHeader>
        <CardContent>
          <EmptyState reason={nplRatio.reason} />
          <DataAsOfFooter dataAsOf={dataAsOf} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card aria-label="Asset Quality indicator card">
      <CardHeader>
        <h3 className="text-base font-semibold text-gray-900">Asset Quality</h3>
        <p className="text-xs text-gray-500">Non-Performing Loans Ratio</p>
      </CardHeader>

      <CardContent>
        {/* Primary metric: NPL ratio */}
        <MetricDisplay metric={nplRatio} label="Non-Performing Loans / Total Loans" className="mb-3" />

        {/* Peer comparison — direction flipped: below = good for NPL */}
        {nplPeerComparison && nplRatio.kind === "available" && (
          <InvertedPeerLine comparison={nplPeerComparison} className="mb-4" />
        )}

        {/* Trend slot — placeholder until TrendChart is wired */}
        {nplTrend && nplTrend.length >= 2 && (
          <div className="mb-4 rounded bg-gray-50 p-3 text-xs text-gray-400 text-center">
            Trend: {nplTrend.length} quarters of data available
          </div>
        )}

        {/* Charge-off rate — always not_queryable */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Net Charge-Off Rate</p>
          <EmptyState reason="not_queryable">
            <Link
              href={`https://banks.data.fdic.gov/bankfind-suite/bankfind/details/${cert}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-blue-600 underline hover:text-blue-800"
            >
              View Call Report on FDIC.gov →
            </Link>
          </EmptyState>
        </div>

        {/* Plain-English explanation */}
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          How many of this bank&apos;s loans aren&apos;t being paid back? The
          non-performing loans ratio measures the share of the bank&apos;s loan
          portfolio where borrowers have stopped making payments. A lower number
          is better — it means fewer loans are in trouble.
        </p>

        <DataAsOfFooter dataAsOf={dataAsOf} />
      </CardContent>
    </Card>
  );
}

// --- Internal: peer comparison with inverted direction colors ---
// For NPL: below = good (green), above = concerning (amber)

function InvertedPeerLine({
  comparison,
  className = "",
}: {
  comparison: PeerComparison;
  className?: string;
}) {
  const { peerMedian, direction } = comparison;

  return (
    <div className={`text-xs ${className}`}>
      <span className="text-gray-400">vs. peer median {peerMedian.toFixed(2)}%</span>
      {" "}
      {direction === "below" && <span className="text-green-600">↓ below (better)</span>}
      {direction === "above" && <span className="text-amber-600">↑ above (concerning)</span>}
      {direction === "at" && <span className="text-gray-500">— at peer</span>}
    </div>
  );
}

// --- Internal: data-as-of footer ---

function DataAsOfFooter({ dataAsOf }: { dataAsOf: Date | null }) {
  return (
    <p className="mt-3 text-xs text-gray-400">
      {dataAsOf
        ? `Data as of ${dataAsOf.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
        : "Data date unavailable"}
    </p>
  );
}
