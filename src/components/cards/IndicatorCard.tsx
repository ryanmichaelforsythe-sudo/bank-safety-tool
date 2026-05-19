/**
 * IndicatorCard — base card shell for all 7 financial health indicators.
 * Domain-specific: consumes MetricValue, PeerComparison, TrendDataPoint, WarningLevel.
 * Composes primitives: Card, Badge, EmptyState.
 *
 * Structure:
 * - Plain-English headline (large)
 * - Technical metric name (subtitle)
 * - Current metric value (via MetricDisplay)
 * - Peer comparison (via PeerComparisonBar)
 * - Trend visualization slot (children — TrendChart injected by specific cards)
 * - Plain-English explanation
 * - Data-as-of date (always present per Property 5)
 */

import type { MetricValue, PeerComparison, WarningLevel } from "@/types/domain";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricDisplay } from "./MetricDisplay";
import { PeerComparisonBar } from "./PeerComparisonBar";

interface IndicatorCardProps {
  /** Plain-English headline (e.g., "How well-capitalized is this bank?") */
  headline: string;
  /** Technical metric name as subtitle (e.g., "Tier 1 Capital Ratio") */
  metricName: string;
  /** Primary metric value — dispatches to MetricDisplay */
  currentValue: MetricValue;
  /** Peer comparison data — null if unavailable */
  peerComparison: PeerComparison | null;
  /** Plain-English explanation of what this metric means */
  explanation: string;
  /** Warning level for visual treatment */
  warningLevel?: WarningLevel;
  /** Data-as-of date — always displayed (Property 5) */
  dataAsOf: Date | null;
  /** Optional children for trend chart or additional content */
  children?: React.ReactNode;
  /** Optional children passed to EmptyState when metric is missing */
  emptyStateChildren?: React.ReactNode;
}

const WARNING_BADGE_VARIANTS: Record<WarningLevel, "success" | "warning" | "danger" | "neutral"> = {
  none: "neutral",
  caution: "neutral",
  warning: "warning",
  critical: "danger",
};

export function IndicatorCard({
  headline,
  metricName,
  currentValue,
  peerComparison,
  explanation,
  warningLevel = "none",
  dataAsOf,
  children,
  emptyStateChildren,
}: IndicatorCardProps) {
  const showWarningBadge = warningLevel === "warning" || warningLevel === "critical";

  return (
    <Card aria-label={`${headline} indicator card`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{headline}</h3>
            <p className="text-xs text-gray-500">{metricName}</p>
          </div>
          {showWarningBadge && (
            <Badge variant={WARNING_BADGE_VARIANTS[warningLevel]}>
              {warningLevel === "critical" ? "Critical" : "Warning"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Primary metric value */}
        <MetricDisplay
          metric={currentValue}
          label={metricName}
          emptyStateChildren={emptyStateChildren}
          className="mb-4"
        />

        {/* Peer comparison */}
        {peerComparison && currentValue.kind === "available" && (
          <PeerComparisonBar comparison={peerComparison} className="mb-4" />
        )}

        {/* Trend chart slot */}
        {children && <div className="mb-4">{children}</div>}

        {/* Plain-English explanation */}
        <p className="text-xs text-gray-600 leading-relaxed">{explanation}</p>

        {/* Data-as-of date — always present (Property 5) */}
        <p className="mt-2 text-xs text-gray-400">
          {dataAsOf
            ? `Data as of ${dataAsOf.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
            : "Data date unavailable"}
        </p>
      </CardContent>
    </Card>
  );
}
