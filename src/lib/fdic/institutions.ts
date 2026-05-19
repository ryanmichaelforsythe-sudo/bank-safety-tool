/**
 * FDIC /institutions endpoint query module.
 *
 * Imports only from @/types/fdic and ./client — no domain types.
 */

import type { FDICInstitution, FDICSearchResponse } from "@/types/fdic";
import { fdicFetch } from "./client";

/** Fields requested for search results (disambiguation list) */
const SEARCH_FIELDS = [
  "CERT",
  "INSTNAME",
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
  "INSTNAME",
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
  "REGAGNT",
  "NAMEHCR",
  "DENOVO",
  "PROCDATE",
  "CHANGECODE",
  "INSCOML",
  "RISESSION",
].join(",");

const SEARCH_LIMIT = 25;

/**
 * Search institutions by name, city/state, or FDIC certificate number.
 *
 * - If query is all digits (strict /^\d+$/), filters by CERT directly
 * - Otherwise, uses FDIC search parameter against INSTNAME and CITY
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
    params.search = trimmed;
    params.search_fields = "INSTNAME,CITY";
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

  return response.data[0] ?? null;
}
