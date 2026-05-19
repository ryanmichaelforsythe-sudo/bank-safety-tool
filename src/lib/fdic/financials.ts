/**
 * FDIC /financials endpoint query module.
 *
 * Imports only from @/types/fdic and ./client — no domain types.
 */

import type { FDICFinancials } from "@/types/fdic";
import { fdicFetch } from "./client";

/** All financial fields needed for indicator card calculations */
const FINANCIALS_FIELDS = [
  "REPDTE",
  "CERT",
  "ASSET",
  "EQ",
  "RBCT1J",
  "RBCRWAJ",
  "LNLSNET",
  "LNLSNTV",
  "LNLSDEPR",
  "ROAQ",
  "NIMY",
  "DEP",
  "DEPINS",
  "DEPNIDOM",
  "DEPFOR",
  "SC",
  "CASH",
].join(",");

/** Subset of fields needed for peer median computation (ratios only) */
const PEER_FIELDS = [
  "REPDTE",
  "CERT",
  "RBCRWAJ",
  "LNLSNTV",
  "LNLSDEPR",
  "ROAQ",
  "NIMY",
  "DEP",
  "DEPINS",
  "DEPNIDOM",
  "DEPFOR",
  "ASSET",
  "EQ",
  "SC",
  "CASH",
].join(",");

const DEFAULT_QUARTERS = 8;
const PEER_LIMIT = 10_000;

/**
 * Fetch up to N quarters of financial data for one institution.
 * Sorted by REPDTE descending (most recent first).
 *
 * Revalidate: 300s (5 minutes)
 */
export async function getFinancials(
  cert: number,
  quarters: number = DEFAULT_QUARTERS
): Promise<FDICFinancials[]> {
  const response = await fdicFetch<FDICFinancials>(
    "financials",
    {
      filters: `CERT:${cert}`,
      fields: FINANCIALS_FIELDS,
      sort_by: "REPDTE",
      sort_order: "DESC",
      limit: quarters,
    },
    { revalidate: 300 }
  );

  return response.data.map((item) => item.data);
}

/**
 * Fetch the most recent quarter's financials for ALL institutions
 * in a given SPECGRP (peer group). Used for peer median computation.
 *
 * Only requests ratio fields needed for comparison — not raw dollar amounts
 * beyond what's needed for derived ratios.
 *
 * Revalidate: 86400s (24 hours) — peer data changes only when new
 * Call Reports are filed (quarterly).
 */
export async function getPeerFinancials(
  specgrp: number
): Promise<FDICFinancials[]> {
  const response = await fdicFetch<FDICFinancials>(
    "financials",
    {
      filters: `SPECGRP:${specgrp}`,
      fields: PEER_FIELDS,
      sort_by: "REPDTE",
      sort_order: "DESC",
      limit: PEER_LIMIT,
    },
    { revalidate: 86400 }
  );

  return response.data.map((item) => item.data);
}
