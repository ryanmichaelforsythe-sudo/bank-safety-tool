/**
 * Domain model types — our product's view of the data.
 * Independent of FDIC field names. Connected by transform functions.
 * Only display-ready values appear here; raw derivation inputs stay
 * in the transform layer.
 */

// --- Metric value discriminated union ---
// Forces components to handle both cases at compile time.
// Prevents the silent-zero bug class (Req 2.2).

export type MetricValue =
  | { kind: "available"; value: number; formatted: string; asOf: Date }
  | { kind: "missing"; reason: EmptyStateReason; asOf: Date | null };

export type EmptyStateReason =
  | "newly_chartered"
  | "merged"
  | "in_receivership"
  | "data_not_reported"
  | "api_error"
  | "not_queryable"; // For metrics like charge-off rate that FDIC API doesn't expose

// --- Institution profile ---

export interface InstitutionProfile {
  cert: number;
  name: string;
  city: string;
  state: string;
  stateAbbreviation: string;
  charterType: string;
  totalAssets: MetricValue;
  yearFounded: number | null;
  primaryRegulator: string | null;
  holdingCompany: string | null;
  peerGroup: PeerGroupInfo | null;
  dataAsOf: Date | null;
  status: InstitutionStatus;
  mergerInfo: MergerInfo | null;
  failureInfo: FailureInfo | null;
  isNewlyChartered: boolean;
  hasCharterConversion: boolean;
  isStateChartered: boolean;
}

export type InstitutionStatus =
  | "active"
  | "merged"
  | "in_receivership"
  | "inactive";

export interface PeerGroupInfo {
  code: number;
  name: string;
}

export interface MergerInfo {
  acquiringName: string;
  acquiringCert: number | null;
  effectiveDate: Date | null;
}

export interface FailureInfo {
  failDate: Date;
  resolutionType: string | null;
  acquiringName: string | null;
  estimatedCost: number | null;
}

// --- Quarterly financials (display-ready only) ---
// Raw derivation inputs (DEPNIDOM, DEPFOR, DEP, etc.) stay in transform layer.
// Only computed/display values appear here.

export interface QuarterlyFinancials {
  quarter: string; // "Q4 2024"
  reportDate: Date;

  // Capital Adequacy
  tier1CapitalRatio: MetricValue;
  equityToAssetsRatio: MetricValue;

  // Asset Quality
  nonPerformingLoansRatio: MetricValue;
  netChargeOffRate: MetricValue; // Will always be { kind: 'missing', reason: 'not_queryable' }

  // Earnings
  returnOnAssets: MetricValue;
  netInterestMargin: MetricValue;

  // Liquidity
  loanToDepositRatio: MetricValue;
  cashAndSecuritiesToAssetsRatio: MetricValue;

  // Uninsured Deposit Concentration (snapshot — no trend)
  uninsuredDepositConcentration: MetricValue;

  // Deposit Trend (three series)
  totalDeposits: MetricValue;
  insuredDeposits: MetricValue;
  uninsuredDomesticDeposits: MetricValue;
}

// --- Regulatory capital categorization ---

export type CapitalCategory =
  | "well_capitalized"
  | "adequately_capitalized"
  | "undercapitalized"
  | "significantly_undercapitalized"
  | "critically_undercapitalized";

export interface CapitalCategorization {
  category: CapitalCategory;
  tier1Ratio: MetricValue;
  totalCapitalRatio: MetricValue;
  leverageRatio: MetricValue;
  thresholds: CapitalThresholds;
}

export interface CapitalThresholds {
  tier1: { well: number; adequate: number; under: number; significantlyUnder: number };
  total: { well: number; adequate: number; under: number; significantlyUnder: number };
  leverage: { well: number; adequate: number; under: number; significantlyUnder: number };
}

// --- Peer comparison ---

export interface PeerComparison {
  institutionValue: number;
  peerMedian: number;
  peerGroupName: string;
  direction: "above" | "below" | "at";
}

// --- Trend data ---

export interface TrendDataPoint {
  quarter: string; // "Q4 2024"
  value: number;
}

export interface DepositTrendSeries {
  total: TrendDataPoint[];
  insured: TrendDataPoint[];
  uninsuredDomestic: TrendDataPoint[];
}

// --- Indicator card props ---

export interface IndicatorCardProps {
  headline: string;
  metricName: string;
  currentValue: MetricValue;
  peerComparison: PeerComparison | null;
  trend: TrendDataPoint[] | null;
  explanation: string;
  warningLevel: WarningLevel;
}

export type WarningLevel = "none" | "caution" | "warning" | "critical";

// --- Search result (for disambiguation list) ---

export interface SearchResult {
  cert: number;
  name: string;
  city: string;
  state: string;
  totalAssets: number | null; // Raw number for display formatting
  isActive: boolean;
}
