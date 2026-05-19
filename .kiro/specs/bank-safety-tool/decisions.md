# Architecture Decisions

## Decision 1: Single Route Handler Instead of Three (Task 6)

**Original plan (tasks.md):** Three route handlers — `/api/search`, `/api/institution/[cert]`, `/api/peers/[specgrp]` — each proxying FDIC API calls with server-side caching.

**What shipped:** One route handler (`/api/search/route.ts`). The institution detail page and peer comparison data are fetched directly by Server Components importing from `@/lib/fdic/` without an HTTP round-trip.

**Why:** The institution detail page (`/bank/[cert]/page.tsx`) is a Server Component — it runs on the server and can call `getInstitution()`, `getFinancials()`, and `getPeerFinancials()` directly. Wrapping those calls in route handlers would add HTTP serialization overhead, an extra network hop (localhost → localhost), and code that exists only to re-serialize data that's already in memory. The `next: { revalidate }` caching still works because it's applied at the `fetch()` level inside the FDIC client, not at the route handler level. The one exception is `/api/search` — the search input is a Client Component (needs interactivity for debounce and keyboard events), so it must call a server endpoint via `fetch()` from the browser.
