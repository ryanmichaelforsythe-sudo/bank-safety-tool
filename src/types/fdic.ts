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
  INSTNAME: string;
  CITY: string;
  STALP: string; // State abbreviation
  STNAME: string; // State full name
  ASSET: number | null; // Total assets (thousands)
  ESTYMD: string | null; // Establishment date (MM/DD/YYYY or YYYYMMDD)
  CHRTAGNT: string | null; // Charter agent (OCC, STATE, OTS)
  CLASS: string | null; // Institution class code
  ACTIVE: number; // 1=active, 0=inactive
  ENDEFYMD: string | null; // End effective date (99991231=active)
  SPECGRP: number | null; // Peer group code (1-9)
  SPECGRPN: string | null; // Peer group name
  REPDTE: string | null; // Most recent report date (YYYYMMDD)
  FDICSUPV: string | null; // FDIC supervisory region
  REGAGNT: string | null; // Primary regulator
  NAMEHCR: string | null; // Holding company name
  DENOVO: string | null; // De novo flag
  PROCDATE: string | null; // Last processed date
  CHANGECODE: number | null; // Change code for mergers/conversions
  INSCOML: number | null; // FDIC insurance commencement date
  RISESSION: string | null; // Receivership flag
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
}

// --- /failures endpoint ---

export interface FDICFailure {
  CERT: number;
  NAME: string;
  FAILDATE: string; // Failure date (MM/DD/YYYY)
  RESTYPE: string | null; // Resolution type
  RESTYPE1: string | null; // Resolution subtype (PA, PI, etc.)
  BIDNAME: string | null; // Acquiring institution name
  COST: number | null; // Estimated cost to DIF (thousands)
}

// --- Generic API response wrapper ---

export interface FDICSearchResponse<T> {
  data: T[];
  totals: {
    count: number;
  };
  meta?: {
    total: number;
    parameters: Record<string, string>;
  };
}
