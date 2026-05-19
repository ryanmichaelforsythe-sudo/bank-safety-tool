/**
 * MetricDisplay — domain-specific component that renders a MetricValue.
 * Pattern-matches on MetricValue.kind to show either the value or an empty state.
 * Lives in cards/ because it consumes domain types (MetricValue, EmptyStateReason).
 */

import type { MetricValue } from "@/types/domain";
import { EmptyState } from "@/components/ui/EmptyState";

interface MetricDisplayProps {
  metric: MetricValue;
  label: string;
  /** Optional children passed to EmptyState for context (e.g., Call Report link) */
  emptyStateChildren?: React.ReactNode;
  className?: string;
}

export function MetricDisplay({
  metric,
  label,
  emptyStateChildren,
  className = "",
}: MetricDisplayProps) {
  switch (metric.kind) {
    case "available":
      return (
        <div className={`${className}`}>
          <p className="text-2xl font-bold text-gray-900">{metric.formatted}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      );
    case "missing":
      return (
        <EmptyState reason={metric.reason} className={className}>
          {emptyStateChildren}
        </EmptyState>
      );
  }
}
