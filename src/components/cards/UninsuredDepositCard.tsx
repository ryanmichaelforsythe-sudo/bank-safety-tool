/**
 * UninsuredDepositCard — snapshot-only card showing uninsured deposit concentration.
 *
 * HARD CONSTRAINTS (Property tests):
 * - Property 7: NO trend chart, NO time-series, NO sparkline. Snapshot only.
 * - Property 8: Explanation MUST contain the literal string "$250,000"
 *
 * Uses Card primitive directly.
 * Consumes domain types only — no FDIC types reach this component.
 * Color: fully neutral (no judgment color, no invented thresholds).
 * Visual: insured-vs-uninsured split bar (green/gray, informational).
 */

import type { MetricValue, PeerComparison } from "@/types/domain";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricDisplay } from "./MetricDisplay";

interface UninsuredDepositCardProps {
  uninsuredConcentration: MetricValue;
  peerComparison: PeerComparison | null;
  dataAsOf: Date | null;
}

export function UninsuredDepositCard({
  uninsuredConcentration,
  peerComparison,
  dataAsOf,
}: UninsuredDepositCardProps) {
  // Institution-level empty state
  if (uninsuredConcentration.kind === "missing") {
    return (
      <Card aria-label="Uninsured Deposit Concentration indicator card">
        <CardHeader>
          <h3 className="text-base font-semibold text-gray-900">
            Uninsured Deposit Concentration
          </h3>
          <p className="text-xs text-gray-500">
            Uninsured deposits as a percentage of total deposits
          </p>
        </CardHeader>
        <CardContent>
          <EmptyState reason={uninsuredConcentration.reason} />
          <DataAsOfFooter dataAsOf={dataAsOf} />
        </CardContent>
      </Card>
    );
  }

  const concentrationPct = uninsuredConcentration.value;
  const insuredPct = Math.max(0, 100 - concentrationPct);

  return (
    <Card aria-label="Uninsured Deposit Concentration indicator card">
      <CardHeader>
        <h3 className="text-base font-semibold text-gray-900">
          Uninsured Deposit Concentration
        </h3>
        <p className="text-xs text-gray-500">
          Uninsured deposits as a percentage of total deposits
        </p>
      </CardHeader>

      <CardContent>
        {/* Primary metric value */}
        <MetricDisplay
          metric={uninsuredConcentration}
          label="Uninsured Concentration"
          className="mb-3"
        />

        {/* Insured vs. uninsured split bar — informational, not judgmental */}
        <div className="mb-3">
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            <div
              className="bg-green-200"
              style={{ width: `${insuredPct}%` }}
              aria-hidden="true"
            />
            <div
              className="bg-gray-300"
              style={{ width: `${concentrationPct}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>Insured: {insuredPct.toFixed(1)}%</span>
            <span>Uninsured: {concentrationPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Neutral peer comparison */}
        {peerComparison && (
          <p className="mb-4 text-xs text-gray-400">
            {peerComparison.institutionValue.toFixed(2)}% vs. peer median{" "}
            {peerComparison.peerMedian.toFixed(2)}%
            <span className="text-gray-300"> · {peerComparison.peerGroupName}</span>
          </p>
        )}

        {/* Plain-English explanation — MUST contain "$250,000" (Property 8) */}
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          What share of this bank&apos;s deposits exceed the $250,000 FDIC
          insurance limit? Deposits above that threshold aren&apos;t covered if
          the bank fails. Uninsured depositors become creditors of the failed
          bank — they can lose access to their money during the resolution
          process, and may not recover all of it. When a large share of a
          bank&apos;s funding is uninsured, those depositors can withdraw quickly
          at the first sign of trouble, creating the kind of rapid outflow that
          collapsed Silicon Valley Bank in March 2023. A high concentration
          isn&apos;t automatically dangerous, but it means the bank&apos;s
          stability depends more heavily on depositor confidence.
        </p>

        <DataAsOfFooter dataAsOf={dataAsOf} />
      </CardContent>
    </Card>
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
