/**
 * Raw FDIC BankFind Suite API response types.
 * Full type definitions implemented in Task 3.1.
 *
 * Source: https://banks.data.fdic.gov/docs/
 */

// Placeholder — replaced in Task 3.1
export type FDICInstitution = Record<string, unknown>;
export type FDICFinancials = Record<string, unknown>;
export type FDICFailure = Record<string, unknown>;
export type FDICSearchResponse<T> = { data: T[]; meta: { total: number } };
