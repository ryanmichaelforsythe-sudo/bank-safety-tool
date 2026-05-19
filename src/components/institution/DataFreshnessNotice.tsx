/**
 * DataFreshnessNotice — reusable data freshness indicator.
 * Shows "Data as of [date]" always (Property 5).
 * Shows stale warning when data is ≥120 days old (Property 6).
 * Optionally shows the 45–60 day lag explainer (page-level only).
 */

import { isStaleData, getDataFreshnessLabel } from "@/lib/utils/dates";

interface DataFreshnessNoticeProps {
  dataAsOf: Date | null;
  /** Show the "FDIC data typically lags 45–60 days" explainer (page-level) */
  showLagExplainer?: boolean;
}

export function DataFreshnessNotice({
  dataAsOf,
  showLagExplainer = false,
}: DataFreshnessNoticeProps) {
  const isStale = dataAsOf ? isStaleData(dataAsOf) : false;

  return (
    <div className="mb-4">
      {/* Data-as-of date — always present */}
      <p className="text-xs text-gray-500">
        {dataAsOf ? getDataFreshnessLabel(dataAsOf) : "Data date unavailable"}
      </p>

      {/* Lag explainer — page-level only */}
      {showLagExplainer && (
        <p className="mt-0.5 text-xs text-gray-400">
          FDIC Call Report data typically lags 45–60 days after quarter-end.
        </p>
      )}

      {/* Stale data warning — ≥120 days old */}
      {isStale && (
        <div
          role="alert"
          className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2"
        >
          <p className="text-xs font-medium text-amber-800">
            ⚠️ This data may be significantly out of date.
          </p>
        </div>
      )}
    </div>
  );
}
