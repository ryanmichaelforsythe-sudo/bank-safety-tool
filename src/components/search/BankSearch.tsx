"use client";

/**
 * BankSearch — client component owning all search state.
 * Live search on debounce (300ms). AbortController cancels in-flight requests
 * when the query changes to prevent stale results overwriting fresh ones.
 *
 * Result rows include all 5 required fields (Property 15):
 * name, city, state, asset size, FDIC cert number.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/formatters";
import type { FDICInstitution, FDICSearchResponse } from "@/types/fdic";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface SearchState {
  results: FDICInstitution[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export function BankSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<SearchState>({
    results: [],
    totalCount: 0,
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  const isCertQuery = /^\d+$/.test(debouncedQuery.trim());

  // Fetch on debounced query change
  useEffect(() => {
    if (debouncedQuery.trim().length < MIN_QUERY_LENGTH) {
      setState({ results: [], totalCount: 0, isLoading: false, error: null, hasSearched: false });
      return;
    }

    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const encodedQuery = encodeURIComponent(debouncedQuery.trim());

    fetch(`/api/search?q=${encodedQuery}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Search failed (${res.status})`);
        }
        return res.json() as Promise<FDICSearchResponse<FDICInstitution>>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({
          results: data.data.map((item) => item.data),
          totalCount: data.totals.count,
          isLoading: false,
          error: null,
          hasSearched: true,
        });
      })
      .catch((err) => {
        // AbortError is expected when query changes — not a user-facing error
        if (err instanceof Error && err.name === "AbortError") return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "An unexpected error occurred.",
          hasSearched: true,
        }));
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit triggers immediate fetch by clearing debounce
    // (the effect will fire because debouncedQuery will match query)
  };

  const handleRetry = () => {
    // Re-trigger by toggling a dummy state — the effect depends on debouncedQuery
    setState((prev) => ({ ...prev, error: null, isLoading: true }));
    const encodedQuery = encodeURIComponent(debouncedQuery.trim());
    fetch(`/api/search?q=${encodedQuery}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        return res.json() as Promise<FDICSearchResponse<FDICInstitution>>;
      })
      .then((data) => {
        setState({
          results: data.data.map((item) => item.data),
          totalCount: data.totals.count,
          isLoading: false,
          error: null,
          hasSearched: true,
        });
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "An unexpected error occurred.",
        }));
      });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search input */}
      <form role="search" onSubmit={handleSubmit} className="mb-6">
        <label htmlFor="bank-search" className="sr-only">
          Search for a bank by name, city/state, or FDIC certificate number
        </label>
        <input
          id="bank-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by bank name, city/state, or FDIC certificate number..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          autoComplete="off"
          autoFocus
        />
      </form>

      {/* Results area — aria-live announces changes to screen readers */}
      <div aria-live="polite" aria-atomic="false">
        {/* CERT lookup hint */}
        {isCertQuery && debouncedQuery.trim().length >= MIN_QUERY_LENGTH && !state.isLoading && (
          <p className="mb-3 text-sm text-gray-500">
            Showing match for FDIC Certificate #{debouncedQuery.trim()}
          </p>
        )}

        {/* Loading state */}
        {state.isLoading && (
          <div className="space-y-3">
            <Skeleton height="h-16" />
            <Skeleton height="h-16" />
            <Skeleton height="h-16" />
          </div>
        )}

        {/* Error state */}
        {state.error && !state.isLoading && (
          <ErrorMessage
            type="api"
            message={state.error}
            onRetry={handleRetry}
          />
        )}

        {/* Zero results */}
        {state.hasSearched && !state.isLoading && !state.error && state.results.length === 0 && (
          <div className="rounded-md bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">
              No banks found matching &ldquo;{debouncedQuery.trim()}&rdquo;.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try checking the spelling, searching by city/state, or entering the FDIC certificate number directly.
            </p>
          </div>
        )}

        {/* Results list */}
        {!state.isLoading && !state.error && state.results.length > 0 && (
          <>
            <p className="mb-3 text-xs text-gray-500">
              {state.totalCount} result{state.totalCount !== 1 ? "s" : ""} found
            </p>
            <ul className="space-y-2">
              {state.results.map((institution) => (
                <li key={institution.CERT}>
                  <Link
                    href={`/bank/${institution.CERT}`}
                    className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Name (headline) */}
                      <h3 className="text-sm font-medium text-gray-900">
                        {institution.NAME}
                      </h3>
                      {/* Inactive badge */}
                      {institution.ACTIVE === 0 && (
                        <Badge variant="neutral" aria-label="This institution is inactive">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {/* Secondary line: city, state, asset size, cert */}
                    <p className="mt-1 text-xs text-gray-500">
                      {institution.CITY}, {institution.STALP}
                      {institution.ASSET != null && (
                        <> · {formatCurrency(institution.ASSET)}</>
                      )}
                      {" · "}FDIC Cert #{institution.CERT}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
