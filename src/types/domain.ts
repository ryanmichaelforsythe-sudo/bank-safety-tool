/**
 * Domain model types — transformed from raw FDIC API responses.
 * Full type definitions implemented in Task 3.2.
 */

// Placeholder — replaced in Task 3.2
export type InstitutionProfile = Record<string, unknown>;
export type QuarterlyFinancials = Record<string, unknown>;
export type CapitalCategory =
  | "well_capitalized"
  | "adequately_capitalized"
  | "undercapitalized"
  | "significantly_undercapitalized"
  | "critically_undercapitalized";
export type EmptyStateReason =
  | "newly_chartered"
  | "merged"
  | "in_receivership"
  | "data_not_reported"
  | "api_error";
