/**
 * Peer comparison computation.
 *
 * Computes median values from a peer group dataset (all institutions
 * sharing the same FDIC SPECGRP). Used by all indicator cards that
 * display peer comparisons.
 *
 * Per Property 17: peer data is filtered exclusively by SPECGRP cohort.
 * No fallback or default cohort is used.
 */

import type { FDICFinancials } from "@/types/fdic";
import type { PeerComparison } from "@/types/domain";

/**
 * Compute the median value for a given numeric field across a peer dataset.
 * Ignores null values in the dataset.
 *
 * @param peerData - Array of FDICFinancials for the peer group
 * @param field - The field name to compute median for
 */
export function computePeerMedian(
  peerData: FDICFinancials[],
  field: keyof FDICFinancials
): number | null {
  const values = peerData
    .map((d) => d[field])
    .filter((v): v is number => typeof v === "number" && !isNaN(v))
    .sort((a, b) => a - b);

  if (values.length === 0) return null;

  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / 2;
  }
  return values[mid];
}

/**
 * Build a PeerComparison object from an institution's value and the peer median.
 * Returns null if either value is unavailable.
 *
 * @param institutionValue - The institution's metric value
 * @param peerMedian - The peer group median (from computePeerMedian)
 * @param peerGroupName - Display name of the peer group (SPECGRPN)
 */
export function buildPeerComparison(
  institutionValue: number | null,
  peerMedian: number | null,
  peerGroupName: string
): PeerComparison | null {
  if (institutionValue === null || peerMedian === null) return null;

  const TOLERANCE = 0.01; // Within 0.01% is considered "at" peer
  let direction: PeerComparison["direction"];

  if (Math.abs(institutionValue - peerMedian) < TOLERANCE) {
    direction = "at";
  } else if (institutionValue > peerMedian) {
    direction = "above";
  } else {
    direction = "below";
  }

  return {
    institutionValue,
    peerMedian,
    peerGroupName,
    direction,
  };
}
