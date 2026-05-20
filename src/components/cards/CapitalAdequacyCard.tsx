/**
 * CapitalAdequacyCard — renders the FDIC regulatory capital categorization
 * and three capital ratios with peer comparison.
 *
 * Uses Card primitive directly (not IndicatorCard shell) because this card
 * has a unique layout: category badge + three ratios + inline peer comparisons.
 *
 * Receives only domain types — no FDIC types reach this component.
 * All computation happens in the Server Component (page.tsx).
 *
 * Property 3: The category badge is the FDIC's own categorization applied to
 * their own thresholds. It is NOT a composite score, letter grade, or
 * proprietary rating.
 */

import type { MetricValue, CapitalCategory, PeerComparison } from "@/types/domain";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface CapitalAdequacyCardProps {
  category: CapitalCategory | null;
  tier1Ratio: MetricValue;
  totalCapitalRatio: MetricValue;
  leverageRatio: MetricValue;
  tier1PeerComparison: PeerComparison | null;
  totalPeerComparison: PeerComparison | null;
  leveragePeerComparison: PeerComparison | null;
  dataAsOf: Date | null;
}

// --- Category display config ---

interface CategoryConfig {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  contextLine: string;
}

const CATEGORY_CONFIG: Record<CapitalCategory, CategoryConfig> = {
  well_capitalized: {
    label: "Well Capitalized",
    colorClass: "text-[var(--color-capital-well)]",
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
    contextLine:
      "This bank exceeds FDIC minimum capital requirements with a meaningful buffer.",
  },
  adequately_capitalized: {
    label: "Adequately Capitalized",
    colorClass: "text-[var(--color-capital-adequate)]",
    bgClass: "bg-gray-50",
    borderClass: "border-gray-200",
    contextLine:
      "This bank meets FDIC minimum capital requirements but does not exceed them significantly.",
  },
  undercapitalized: {
    label: "Undercapitalized",
    colorClass: "text-[var(--color-capital-under)]",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    contextLine:
      "This bank is below regulatory capital minimums. Regulators may require corrective action.",
  },
  significantly_undercapitalized: {
    label: "Significantly Undercapitalized",
    colorClass: "text-[var(--color-capital-significantly-under)]",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    contextLine:
      "This bank is significantly below capital minimums. Regulators are likely requiring immediate corrective action.",
  },
  critically_undercapitalized: {
    label: "Critically Undercapitalized",
    colorClass: "text-[var(--color-capital-critically-under)]",
    bgClass: "bg-red-100",
    borderClass: "border-red-300",
    contextLine:
      "This bank's capital is critically low. It may be at risk of closure or receivership.",
  },
};

// --- Component ---

export function CapitalAdequacyCard({
  category,
  tier1Ratio,
  totalCapitalRatio,
  leverageRatio,
  tier1PeerComparison,
  totalPeerComparison,
  leveragePeerComparison,
  dataAsOf,
}: CapitalAdequacyCardProps) {
  // Institution-level empty state — all ratios missing
  const allMissing =
    tier1Ratio.kind === "missing" &&
    totalCapitalRatio.kind === "missing" &&
    leverageRatio.kind === "missing";

  if (allMissing) {
    return (
      <Card aria-label="Capital Adequacy indicator card">
        <CardHeader>
          <h3 className="text-base font-semibold text-gray-900">Capital Adequacy</h3>
          <p className="text-xs text-gray-500">Regulatory Capital Categorization</p>
        </CardHeader>
        <CardContent>
          <EmptyState reason={tier1Ratio.kind === "missing" ? tier1Ratio.reason : "data_not_reported"} />
          {dataAsOf && (
            <p className="mt-3 text-xs text-gray-400">
              Data as of {dataAsOf.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const config = category ? CATEGORY_CONFIG[category] : null;

  return (
    <Card aria-label="Capital Adequacy indicator card">
      <CardHeader>
        <h3 className="text-base font-semibold text-gray-900">Capital Adequacy</h3>
        <p className="text-xs text-gray-500">Regulatory Capital Categorization</p>
      </CardHeader>

      <CardContent>
        {/* Category badge — FDIC's own categorization, NOT a composite score */}
        {config && (
          <div
            className={`mb-4 rounded-md border p-3 ${config.bgClass} ${config.borderClass}`}
            role="status"
            aria-label={`Capital category: ${config.label}`}
          >
            <p className={`text-sm font-semibold ${config.colorClass}`}>
              ● {config.label}
            </p>
            <p className="mt-1 text-xs text-gray-600">{config.contextLine}</p>
          </div>
        )}

        {/* Three ratios with inline peer comparison */}
        <div className="space-y-3">
          <RatioRow
            label="Tier 1 Risk-Based Capital"
            metric={tier1Ratio}
            peerComparison={tier1PeerComparison}
          />
          <RatioRow
            label="Total Risk-Based Capital"
            metric={totalCapitalRatio}
            peerComparison={totalPeerComparison}
          />
          <RatioRow
            label="Leverage Ratio"
            metric={leverageRatio}
            peerComparison={leveragePeerComparison}
          />
        </div>

        {/* Plain-English explanation */}
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          How much of its own money does the bank have backing its loans and
          deposits? Capital ratios measure the cushion a bank holds to absorb
          unexpected losses without putting depositors at risk. The FDIC
          categorizes banks based on these ratios — &ldquo;Well Capitalized&rdquo;
          means the bank exceeds all minimum thresholds.
        </p>

        {/* Data freshness footer */}
        <p className="mt-3 text-xs text-gray-400">
          {dataAsOf
            ? `Data as of ${dataAsOf.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
            : "Data date unavailable"}
        </p>
      </CardContent>
    </Card>
  );
}

// --- Internal: single ratio row ---

interface RatioRowProps {
  label: string;
  metric: MetricValue;
  peerComparison: PeerComparison | null;
}

function RatioRow({ label, metric, peerComparison }: RatioRowProps) {
  if (metric.kind === "missing") {
    return (
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs text-gray-400">Not reported</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{metric.formatted}</span>
      </div>
      {peerComparison && (
        <div className="flex items-center justify-end gap-1 text-xs">
          <span className="text-gray-400">vs. peer median {peerComparison.peerMedian.toFixed(2)}%</span>
          <PeerDirection direction={peerComparison.direction} />
        </div>
      )}
    </div>
  );
}

function PeerDirection({ direction }: { direction: PeerComparison["direction"] }) {
  switch (direction) {
    case "above":
      return <span className="text-green-600">↑ above</span>;
    case "below":
      return <span className="text-amber-600">↓ below</span>;
    case "at":
      return <span className="text-gray-500">— at peer</span>;
  }
}
