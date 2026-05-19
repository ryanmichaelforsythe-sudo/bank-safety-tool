/**
 * Raw FDIC BankFind Suite API response types.
 * These mirror exactly what the API returns — field names are FDIC's,
 * types reflect actual API nullability.
 *
 * Source: https://banks.data.fdic.gov/docs/
 */

// --- /institutions endpoint ---

export interface FDICInstitution {
  CERT: number;
  NAME: string; // Institution legal name
  CITY: string;
  STALP: string; // State abbreviation
  STNAME: string; // State full name
  ASSET: number | null; // Total assets (thousands)
  ESTYMD: string | null; // Establishment date (MM/DD/YYYY)
  CHRTAGNT: string | null; // Charter agent (OCC, STATE, OTS)
  CLASS: string | null; // Institution class code
  ACTIVE: number; // 1=active, 0=inactive
  ENDEFYMD: string | null; // End effective date
  SPECGRP: number | null; // Peer group code (1-9)
  SPECGRPN: string | null; // Peer group name
  REPDTE: string | null; // Most recent report date (MM/DD/YYYY on institutions endpoint)
  FDICSUPV: string | null; // FDIC supervisory region
  REGAGENT2: string | null; // Primary regulator
  NAMEHCR: string | null; // Holding company name
  DENESSION: string | null; // De novo flag
  CHANGECODE: number | null; // Change code for mergers/conversions
  INSCOML: number | null; // FDIC insurance commencement date
  RISESSION: string | null; // Receivership flag
  ID: string; // FDIC internal ID
}

// --- /financials endpoint ---

export interface FDICFinancials {
  REPDTE: string; // Report date (YYYYMMDD)
  CERT: number;
  ASSET: number | null; // Total assets (thousands)
  EQ: number | null; // Total equity capital (thousands)
  RBCT1J: number | null; // Tier 1 capital (thousands)
  RBCRWAJ: number | null; // Total risk-based capital ratio (%)
  LNLSNET: number | null; // Net loans and leases (thousands)
  LNLSNTV: number | null; // Non-performing loans as % of total loans
  LNLSDEPR: number | null; // Loan-to-deposit ratio (%)
  ROAQ: number | null; // Return on assets, quarterly annualized (%)
  NIMY: number | null; // Net interest margin (%)
  DEP: number | null; // Total deposits (thousands)
  DEPINS: number | null; // Estimated insured deposits (thousands)
  DEPNIDOM: number | null; // Uninsured domestic deposits (thousands)
  DEPFOR: number | null; // Foreign deposits (thousands)
  SC: number | null; // Total securities (thousands)
  CASH: number | null; // Cash and due from banks (thousands)
  ID: string; // FDIC internal ID (e.g., "628_20251231")
}

// --- /failures endpoint ---

export interface FDICFailure {
  CERT: number;
  NAME: string;
  FAILDATE: string; // Failure date (M/D/YYYY)
  RESTYPE: string | null; // Resolution type
  RESTYPE1: string | null; // Resolution subtype (PA, PI, etc.)
  BIDNAME: string | null; // Acquiring institution name
  COST: number | null; // Estimated cost to DIF (thousands)
  ID: string; // FDIC internal ID
}

// --- Generic API response wrapper ---
// FDIC API nests each item as { data: { ...fields }, score: N }

export interface FDICSearchResponseItem<T> {
  data: T;
  score: number;
}

export interface FDICSearchResponse<T> {
  data: FDICSearchResponseItem<T>[];
  totals: {
    count: number;
  };
  meta?: {
    total: number;
    parameters: Record<string, string>;
  };
}
