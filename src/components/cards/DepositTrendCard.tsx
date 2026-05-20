"use client";

/**
 * DepositTrendCard — three-series deposit trend visualization.
 *
 * HARD CONSTRAINT (Property 18): renders exactly three time-series when data
 * is available: total deposits (DEP), insured (DEPINS), uninsured (DEPNIDOM).
 *
 * Accessibility: visually-hidden data table with quarterly values for all
 * three series. Chart div is aria-hidden.
 *
 * Color: neutral presentation. No judgment color for direction.
 * Y-axis anchored at 0 to prevent misleading non-zero baselines.
 */

import type { DepositTrendSeries, PeerComparison } from "@/types/domain";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendChart, type ChartDataPoint, type ChartSeries } from "@/components/charts/TrendChart";
import { formatCurrency } from "@/lib/utils/formatters";

interface DepositTrendCardProps {
  depositTrend: DepositTrendSeries | null;
  peerComparison: PeerComparison | null;
  dataAsOf: Date | null;
  quartersAvailable: number;
}

// Colorblind-safe palette: blue / green / orange
const SERIES_CONFIG: ChartSeries[] = [
  { key: "total", label: "Total Deposits", color: "#2563eb" },
  { key: "insured", label: "Insured Deposits", color: "#16a34a" },
  { key: "uninsured", label: "Uninsured Deposits", color: "#ea580c" },
];

export function DepositTrendCard({
  depositTrend,
  peerComparison,
  dataAsOf,
  quartersAvailable,
}: DepositTrendCardProps) {
  // Empty state — insufficient history
  if (!depositTrend) {
    return (
      <Card aria-label="Deposit Trend indicator card">
        <CardHeader>
          <h3 className="text-base font-semibold text-gray-900">Deposit Trend</h3>
          <p className="text-xs text-gray-500">Total, insured, and uninsured deposits over time</p>
        </CardHeader>
        <CardContent>
          <EmptyState reason="insufficient_history" />
          <DataAsOfFooter dataAsOf={dataAsOf} />
        </CardContent>
      </Card>
    );
  }

  // Build chart data — merge three series by quarter
  const chartData = buildChartData(depositTrend);

  // Format for Y-axis (values are in thousands from FDIC)

  return (
    <Card aria-label="Deposit Trend indicator card">
      <CardHeader>
        <h3 className="text-base font-semibold text-gray-900">Deposit Trend</h3>
        <p className="text-xs text-gray-500">Total, insured, and uninsured deposits over time</p>
      </CardHeader>

      <CardContent>
        {/* Limited history note */}
        {quartersAvailable >= 2 && quartersAvailable < 4 && (
          <p className="mb-2 text-xs text-amber-600">
            Limited history — only {quartersAvailable} quarters available.
          </p>
        )}

        {/* Chart (aria-hidden — screen readers use the table below) */}
        <TrendChart
          data={chartData}
          series={SERIES_CONFIG}
          formatType="currency-thousands"
          height={200}
        />

        {/* Accessible data table (visually hidden, screen-reader accessible) */}
        <table className="sr-only">
          <caption>Deposit trend data by quarter</caption>
          <thead>
            <tr>
              <th scope="col">Quarter</th>
              <th scope="col">Total Deposits</th>
              <th scope="col">Insured Deposits</th>
              <th scope="col">Uninsured Deposits</th>
            </tr>
          </thead>
          <tbody>
            {depositTrend.total.map((point, i) => (
              <tr key={point.quarter}>
                <td>{point.quarter}</td>
                <td>{formatCurrency(point.value)}</td>
                <td>{depositTrend.insured[i] ? formatCurrency(depositTrend.insured[i].value) : "N/A"}</td>
                <td>{depositTrend.uninsuredDomestic[i] ? formatCurrency(depositTrend.uninsuredDomestic[i].value) : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Neutral peer comparison */}
        {peerComparison && (
          <p className="mt-3 text-xs text-gray-400">
            Deposit growth vs. peer median: {peerComparison.institutionValue.toFixed(2)}% vs.{" "}
            {peerComparison.peerMedian.toFixed(2)}%
            <span className="text-gray-300"> · {peerComparison.peerGroupName}</span>
          </p>
        )}

        {/* Plain-English explanation */}
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          Is money flowing into or out of this bank? This chart shows total
          deposits, insured deposits, and uninsured deposits over the last
          several quarters. It complements the concentration snapshot above —
          where that card shows how much is uninsured right now, this one shows
          whether that balance is growing or shrinking. Sustained deposit
          outflows, especially in the uninsured portion, can signal declining
          depositor confidence.
        </p>

        <DataAsOfFooter dataAsOf={dataAsOf} />
      </CardContent>
    </Card>
  );
}

// --- Internal helpers ---

function buildChartData(trend: DepositTrendSeries): ChartDataPoint[] {
  // Use total deposits as the primary series for quarter alignment
  return trend.total.map((point, i) => ({
    quarter: point.quarter,
    total: point.value,
    insured: trend.insured[i]?.value ?? 0,
    uninsured: trend.uninsuredDomestic[i]?.value ?? 0,
  }));
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
