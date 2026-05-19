/**
 * PeerComparisonBar — visual comparison of institution value vs. peer median.
 * Domain-specific: consumes PeerComparison type.
 * Accessible: uses aria-label to describe the comparison for screen readers.
 */

import type { PeerComparison } from "@/types/domain";
import { formatPercent } from "@/lib/utils/formatters";

interface PeerComparisonBarProps {
  comparison: PeerComparison;
  className?: string;
}

const DIRECTION_LABELS: Record<PeerComparison["direction"], string> = {
  above: "Above peer median",
  below: "Below peer median",
  at: "At peer median",
};

const DIRECTION_COLORS: Record<PeerComparison["direction"], string> = {
  above: "text-green-700",
  below: "text-amber-700",
  at: "text-gray-700",
};

export function PeerComparisonBar({
  comparison,
  className = "",
}: PeerComparisonBarProps) {
  const { institutionValue, peerMedian, peerGroupName, direction } = comparison;

  const ariaLabel = `Institution value ${formatPercent(institutionValue)} is ${direction} the peer median of ${formatPercent(peerMedian)} for ${peerGroupName}`;

  return (
    <div className={`${className}`} aria-label={ariaLabel} role="figure">
      {/* Visual bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className={`font-medium ${DIRECTION_COLORS[direction]}`}>
          {DIRECTION_LABELS[direction]}
        </span>
      </div>

      {/* Bar visualization */}
      <div className="mt-1.5 flex items-center gap-2">
        <div className="relative h-2 flex-1 rounded-full bg-gray-100">
          {/* Peer median marker */}
          <div
            className="absolute top-0 h-2 w-0.5 bg-gray-400"
            style={{ left: `${Math.min(Math.max(peerMedianPosition(), 5), 95)}%` }}
            aria-hidden="true"
          />
          {/* Institution value marker */}
          <div
            className={`absolute top-0 h-2 w-2 rounded-full ${direction === "below" ? "bg-amber-500" : "bg-green-500"}`}
            style={{ left: `${institutionPosition(institutionValue, peerMedian)}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Labels */}
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>You: {formatPercent(institutionValue)}</span>
        <span>Peer median: {formatPercent(peerMedian)}</span>
      </div>
      <p className="mt-0.5 text-xs text-gray-400">
        Peer group: {peerGroupName}
      </p>
    </div>
  );
}

/**
 * Peer median is always positioned at 50%.
 */
function peerMedianPosition(): number {
  return 50;
}

/**
 * Calculate position of the institution value relative to peer median.
 * Peer median is always at 50%. Institution scales proportionally.
 */
function institutionPosition(institutionValue: number, peerMedian: number): number {
  if (peerMedian === 0) return 50;
  const ratio = institutionValue / peerMedian;
  // Scale: 0.5x peer = 25%, 1x peer = 50%, 1.5x peer = 75%, clamped to [5, 95]
  const position = ratio * 50;
  return Math.min(Math.max(position, 5), 95);
}
