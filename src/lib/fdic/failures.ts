/**
 * FDIC /failures endpoint query module.
 *
 * Imports only from @/types/fdic and ./client — no domain types.
 * Queries on-demand per institution (not bulk fetch).
 */

import type { FDICFailure } from "@/types/fdic";
import { fdicFetch } from "./client";

const FAILURE_FIELDS = [
  "CERT",
  "NAME",
  "FAILDATE",
  "RESTYPE",
  "RESTYPE1",
  "BIDNAME",
  "COST",
].join(",");

/**
 * Fetch the failure/receivership record for a single institution.
 * Returns null if no failure record exists (the common case for active banks).
 *
 * On-demand per institution — the response is 0 or 1 records.
 * Revalidate: 3600s (1 hour). Failures are rare but time-sensitive.
 */
export async function getFailureRecord(
  cert: number
): Promise<FDICFailure | null> {
  const response = await fdicFetch<FDICFailure>(
    "failures",
    {
      filters: `CERT:${cert}`,
      fields: FAILURE_FIELDS,
      limit: 1,
    },
    { revalidate: 3600 }
  );

  return response.data[0]?.data ?? null;
}
