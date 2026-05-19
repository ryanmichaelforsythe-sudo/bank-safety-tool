/**
 * FDIC BankFind Suite API client.
 *
 * Pure fetch wrapper — knows how to talk to the FDIC API and nothing else.
 * Returns FDICSearchResponse<T>. Has zero knowledge of domain types.
 *
 * Features:
 * - 10-second timeout via AbortController (fires on no-response, not body parsing)
 * - Exponential backoff retry on HTTP 429 (max 3 attempts: 1s / 2s / 4s)
 * - Typed error classes for timeout, rate limit, and general API errors
 * - Shape guard before type assertion (catches HTML-200 error pages)
 * - console.warn on retries for Vercel function log observability
 */

import type { FDICSearchResponse } from "@/types/fdic";

const FDIC_BASE_URL = "https://api.fdic.gov/banks";
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

// --- Typed error classes ---

export class FDICTimeoutError extends Error {
  constructor(endpoint: string) {
    super(`FDIC API request timed out after ${TIMEOUT_MS}ms: ${endpoint}`);
    this.name = "FDICTimeoutError";
  }
}

export class FDICRateLimitError extends Error {
  public readonly retriesExhausted = MAX_RETRIES;

  constructor(endpoint: string) {
    super(
      `FDIC API rate limit exceeded after ${MAX_RETRIES} retries: ${endpoint}`
    );
    this.name = "FDICRateLimitError";
  }
}

export class FDICAPIError extends Error {
  public readonly status: number;
  public readonly endpoint: string;

  constructor(status: number, endpoint: string, detail?: string) {
    super(
      `FDIC API error ${status} on ${endpoint}${detail ? `: ${detail}` : ""}`
    );
    this.name = "FDICAPIError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

// --- Main fetch function ---

export async function fdicFetch<T>(
  endpoint: string,
  params?: Record<string, string | number>,
  options?: { revalidate?: number }
): Promise<FDICSearchResponse<T>> {
  const url = buildUrl(endpoint, params);
  const fetchOptions = buildFetchOptions(options?.revalidate);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions);

      // Rate limit — retry with backoff
      if (response.status === 429) {
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS_MS[attempt];
          console.warn(
            `[FDIC Client] 429 rate limit on ${endpoint}, retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`
          );
          await sleep(delay);
          continue;
        }
        throw new FDICRateLimitError(endpoint);
      }

      // Other HTTP errors
      if (!response.ok) {
        const detail = await safeReadBody(response);
        throw new FDICAPIError(response.status, endpoint, detail);
      }

      // Parse JSON
      const json: unknown = await response.json();

      // Shape guard — catches HTML error pages returning 200
      assertValidResponse(json, endpoint, response.status);

      return json as FDICSearchResponse<T>;
    } catch (error) {
      if (error instanceof FDICTimeoutError) throw error;
      if (error instanceof FDICRateLimitError) throw error;
      if (error instanceof FDICAPIError) throw error;

      // AbortError from timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new FDICTimeoutError(endpoint);
      }

      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on 429 (handled above) — all other errors propagate immediately
      throw lastError;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError ?? new FDICAPIError(0, endpoint, "Unknown error");
}

// --- Internal helpers ---

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number>
): string {
  const url = new URL(`${FDIC_BASE_URL}/${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  // Request JSON format
  url.searchParams.set("format", "json");
  return url.toString();
}

function buildFetchOptions(revalidate?: number): RequestInit & { next?: { revalidate: number } } {
  const options: RequestInit & { next?: { revalidate: number } } = {
    headers: {
      Accept: "application/json",
    },
  };
  if (revalidate !== undefined) {
    options.next = { revalidate };
  }
  return options;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { next?: { revalidate: number } }
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function assertValidResponse(
  json: unknown,
  endpoint: string,
  status: number
): asserts json is { data: unknown[]; totals: { count: number } } {
  const obj = json as Record<string, unknown>;
  if (
    typeof json !== "object" ||
    json === null ||
    !Array.isArray(obj.data) ||
    typeof obj.totals !== "object" ||
    typeof (obj.totals as Record<string, unknown>)?.count !== "number"
  ) {
    throw new FDICAPIError(
      status,
      endpoint,
      "Response shape invalid — expected { data: [], totals: { count } }"
    );
  }
}

async function safeReadBody(response: Response): Promise<string | undefined> {
  try {
    const text = await response.text();
    return text.slice(0, 200); // Truncate for error messages
  } catch {
    return undefined;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
