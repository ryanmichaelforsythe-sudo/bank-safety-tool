/**
 * FDIC /institutions endpoint query module.
 *
 * Imports only from @/types/fdic and ./client — no domain types.
 *
 * API notes (validated against live API):
 * - Field for institution name is `NAME` (not INSTNAME)
 * - Search uses `filters=NAME:query*` (wildcard, no quotes)
 * - Response items are nested: data[].data.FIELD
 * - REPDTE format on institutions endpoint is MM/DD/YYYY
 */

import type { FDICInstitution, FDICSearchResponse } from "@/types/fdic";
import { fdicFetch } from "./client";

/** Fields requested for search results (disambiguation list) */
const SEARCH_FIELDS = [
  "CERT",
  "NAME",
  "CITY",
  "STALP",
  "ASSET",
  "ACTIVE",
  "SPECGRP",
  "SPECGRPN",
].join(",");

/** Fields requested for full institution profile */
const PROFILE_FIELDS = [
  "CERT",
  "NAME",
  "CITY",
  "STALP",
  "STNAME",
  "ASSET",
  "ESTYMD",
  "CHRTAGNT",
  "CLASS",
  "ACTIVE",
  "ENDEFYMD",
  "SPECGRP",
  "SPECGRPN",
  "REPDTE",
  "FDICSUPV",
  "REGAGENT2",
  "NAMEHCR",
  "DENESSION",
  "CHANGECODE",
  "RISESSION",
].join(",");

const SEARCH_LIMIT = 25;

/**
 * Search institutions by name, city/state, or FDIC certificate number.
 *
 * - If query is all digits (strict /^\d+$/), filters by CERT directly
 * - Otherwise, uses `filters=NAME:query*` for wildcard name matching
 * - Returns inactive/merged institutions (ACTIVE=0) so the UI can display
 *   merger notices per Req 2.3
 *
 * Revalidate: 300s (5 minutes)
 */
export async function searchInstitutions(
  query: string
): Promise<FDICSearchResponse<FDICInstitution>> {
  const trimmed = query.trim();

  // Strict numeric check — only all-digits routes to CERT lookup
  // "1st National" and "First Bank 1234" hit text search, not CERT
  const isCertLookup = /^\d+$/.test(trimmed);

  const params: Record<string, string | number> = {
    fields: SEARCH_FIELDS,
    limit: SEARCH_LIMIT,
    sort_by: "ASSET",
    sort_order: "DESC",
  };

  if (isCertLookup) {
    params.filters = `CERT:${trimmed}`;
  } else {
    // FDIC API uses filters with wildcard for name search (no quotes)
    params.filters = `NAME:${trimmed}*`;
  }

  return fdicFetch<FDICInstitution>("institutions", params, { revalidate: 300 });
}

/**
 * Fetch a single institution by FDIC certificate number.
 * Returns null if no institution found for the given cert.
 *
 * Revalidate: 300s (5 minutes)
 */
export async function getInstitution(
  cert: number
): Promise<FDICInstitution | null> {
  const response = await fdicFetch<FDICInstitution>(
    "institutions",
    {
      filters: `CERT:${cert}`,
      fields: PROFILE_FIELDS,
      limit: 1,
    },
    { revalidate: 300 }
  );

  return response.data[0]?.data ?? null;
}
