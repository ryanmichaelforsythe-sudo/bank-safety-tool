/**
 * Factory functions for MetricValue construction.
 * Every metric module uses these — no inline object construction.
 */

import type { MetricValue, EmptyStateReason } from "@/types/domain";

/**
 * Construct an available metric value.
 */
export function available(
  value: number,
  formatted: string,
  asOf: Date
): MetricValue {
  return { kind: "available", value, formatted, asOf };
}

/**
 * Construct a missing metric value with a reason.
 */
export function missing(
  reason: EmptyStateReason,
  asOf: Date | null
): MetricValue {
  return { kind: "missing", reason, asOf };
}
