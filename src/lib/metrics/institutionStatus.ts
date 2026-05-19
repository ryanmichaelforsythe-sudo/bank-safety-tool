/**
 * Per-institution status resolver.
 * Applied once per institution, consumed by all downstream metric transforms.
 * Prevents each metric module from independently checking merger/receivership status.
 */

import type { FDICInstitution, FDICFinancials, FDICFailure } from "@/types/fdic";
import type { InstitutionStatus, EmptyStateReason } from "@/types/domain";
import { parseReportDate } from "@/lib/utils/dates";

export interface InstitutionContext {
  /** Resolved institution status */
  status: InstitutionStatus;
  /** If non-null, ALL metrics should use this reason (institution-level override) */
  defaultEmptyReason: EmptyStateReason | null;
  /** Number of quarters of financial data available */
  quartersAvailable: number;
  /** Most recent data-as-of date (from most recent financial quarter) */
  dataAsOf: Date | null;
}

/**
 * Resolve the institution's status and determine whether metrics can be computed.
 * This is called once per institution and passed to all metric modules.
 */
export function resolveInstitutionStatus(
  institution: FDICInstitution,
  financials: FDICFinancials[],
  failure: FDICFailure | null
): InstitutionContext {
  const dataAsOf = financials.length > 0
    ? parseReportDate(financials[0].REPDTE)
    : parseReportDate(institution.REPDTE);

  // Institution in receivership — all metrics are missing
  if (failure) {
    return {
      status: "in_receivership",
      defaultEmptyReason: "in_receivership",
      quartersAvailable: financials.length,
      dataAsOf,
    };
  }

  // Institution is inactive (merged) — all metrics are missing
  if (institution.ACTIVE === 0) {
    return {
      status: "merged",
      defaultEmptyReason: "merged",
      quartersAvailable: financials.length,
      dataAsOf,
    };
  }

  // No financial data available at all
  if (financials.length === 0) {
    return {
      status: "active",
      defaultEmptyReason: "data_not_reported",
      quartersAvailable: 0,
      dataAsOf,
    };
  }

  // Active institution with data available
  return {
    status: "active",
    defaultEmptyReason: null,
    quartersAvailable: financials.length,
    dataAsOf,
  };
}
