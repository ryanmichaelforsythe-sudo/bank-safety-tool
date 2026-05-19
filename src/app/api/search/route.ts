/**
 * GET /api/search?q=<query>
 *
 * Proxies search requests to the FDIC /institutions endpoint.
 * Called by the client-side SearchInput component.
 *
 * Returns raw FDIC types — no domain transformation.
 * Error classes map to appropriate HTTP status codes.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchInstitutions } from "@/lib/fdic/institutions";
import {
  FDICTimeoutError,
  FDICRateLimitError,
  FDICAPIError,
} from "@/lib/fdic/client";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  // Validate query parameter
  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Query parameter 'q' is required and must be at least 2 characters.",
      },
      { status: 400 }
    );
  }

  try {
    const results = await searchInstitutions(query.trim());
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof FDICTimeoutError) {
      return NextResponse.json(
        { error: "timeout", message: error.message },
        { status: 504 }
      );
    }

    if (error instanceof FDICRateLimitError) {
      return NextResponse.json(
        { error: "rate_limit", message: error.message },
        { status: 503 }
      );
    }

    if (error instanceof FDICAPIError) {
      return NextResponse.json(
        {
          error: "api_error",
          message: error.message,
          status: error.status,
        },
        { status: error.status >= 500 ? 502 : error.status }
      );
    }

    // Unexpected error — don't leak internals
    return NextResponse.json(
      { error: "internal", message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
