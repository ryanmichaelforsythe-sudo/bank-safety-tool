# Implementation Plan: Bank Safety Tool

## Overview

Build a Next.js 14 (App Router) + TypeScript consumer-facing web app that lets users look up any FDIC-insured bank and see a plain-English read on its financial health. Tasks are ordered as shippable increments: scaffold → deploy shell → search → institution summary → Capital Adequacy card → full results page → remaining 6 indicator cards one at a time → polish. If time runs out at any point, what exists is coherent rather than half-built across every surface.

## Tasks

- [ ] 1. Scaffold Next.js 14 project with TypeScript, Tailwind CSS, and Vitest
  - Initialize Next.js 14 App Router project with TypeScript and ESLint (`npx create-next-app@latest`)
  - Install and configure Tailwind CSS with `tailwind.config.ts` and global styles
  - Install Vitest, React Testing Library, `@testing-library/jest-dom`, and fast-check; add `vitest.config.ts`
  - Install Recharts
  - Create the full `src/` directory tree: `app/`, `components/`, `lib/`, `types/`, `tests/`
  - Add `src/types/fdic.ts` and `src/types/domain.ts` as empty typed stubs with placeholder exports
  - _Requirements: 15.1, 15.2_

- [ ] 2. Deploy empty Next.js shell to Vercel
  - Push the scaffolded project to GitHub
  - Connect the repository to Vercel and complete the first production deployment
  - Confirm the live URL resolves and the default Next.js page renders
  - Record the live URL in `README.md` as a placeholder (content filled in later)
  - _Requirements: non-code task — deploy pipeline must be working before content push_

- [ ] 3. Define TypeScript types for FDIC API responses and domain models
  - [ ] 3.1 Write FDIC raw response types in `src/types/fdic.ts`
    - Type `FDICInstitution` covering all fields in the `/institutions` field mapping table (CERT, INSTNAME, CITY, STALP, ASSET, ESTYMD, CHRTAGNT, CLASS, ACTIVE, ENDEFYMD, SPECGRP, SPECGRPN, REPDTE, REGAGNT, DENOVO, etc.)
    - Type `FDICFinancials` covering all `/financials` fields (REPDTE, CERT, ASSET, EQ, RBCT1J, RBCRWAJ, LNLSNET, LNLSNTV, LNLSDEPR, ROAQ, NIMY, DEP, DEPINS, DEPNIDOM, DEPFOR, SC, CASH)
    - Type `FDICFailure` covering `/failures` fields (CERT, NAME, FAILDATE, RESTYPE, RESTYPE1, BIDNAME, COST)
    - Type `FDICSearchResponse<T>` generic wrapper for paginated API responses
    - _Requirements: 1.2, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1_
  - [ ] 3.2 Write domain model types in `src/types/domain.ts`
    - `InstitutionProfile`, `QuarterlyFinancials`, `CapitalCategory`, `CapitalCategorization` as specified in the design
    - `IndicatorCardProps`, `MetricValue`, `PeerComparison`, `TrendDataPoint`, `EmptyStateReason`
    - _Requirements: 2.1, 3.1, 4.2_

- [ ] 4. Implement FDIC API client with error handling and retry logic
  - [ ] 4.1 Write `src/lib/fdic/client.ts` — base fetch wrapper
    - `fdicFetch(path, params)` using `AbortController` with 10-second timeout
    - Exponential backoff retry on HTTP 429 (max 3 attempts: 1s / 2s / 4s delays)
    - Typed error classes: `FDICTimeoutError`, `FDICRateLimitError`, `FDICAPIError`
    - Returns typed `FDICSearchResponse<T>` or throws a typed error
    - _Requirements: 13.1, 13.2_
  - [ ]* 4.2 Write property test for API error handler (Property 9)
    - **Property 9: API Error Handler Returns Non-Empty Response**
    - For any HTTP 4xx or 5xx status, the error handler SHALL return a non-null, non-empty user-facing error message
    - **Validates: Requirements 13.1, 13.5**

- [ ] 5. Implement FDIC endpoint query modules
  - [ ] 5.1 Write `src/lib/fdic/institutions.ts`
    - `searchInstitutions(query)` — queries `/institutions` with name/city/cert filters, returns `FDICInstitution[]`
    - `getInstitution(cert)` — fetches a single institution by CERT
    - _Requirements: 1.2, 2.1_
  - [ ] 5.2 Write `src/lib/fdic/financials.ts`
    - `getFinancials(cert, limit)` — fetches up to 8 quarters of financials for one institution
    - `getPeerFinancials(specgrp)` — fetches most recent quarter financials for all institutions in a SPECGRP
    - _Requirements: 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_
  - [ ] 5.3 Write `src/lib/fdic/failures.ts`
    - `getFailureRecord(cert)` — queries `/failures` by CERT; returns `FDICFailure | null`
    - _Requirements: 11.1_

- [ ] 6. Implement Next.js Route Handlers (API proxy layer)
  - [ ] 6.1 Write `src/app/api/search/route.ts`
    - Proxies to FDIC `/institutions`; applies `next: { revalidate: 300 }` caching
    - Returns typed search results array
    - _Requirements: 1.2, 1.8_
  - [ ] 6.2 Write `src/app/api/institution/[cert]/route.ts`
    - Fetches institution profile + 8 quarters of financials + failure record in parallel
    - Applies `next: { revalidate: 300 }` for profile/financials, `next: { revalidate: 3600 }` for failure
    - _Requirements: 2.1, 13.1_
  - [ ] 6.3 Write `src/app/api/peers/[specgrp]/route.ts`
    - Fetches peer group financials; applies `next: { revalidate: 86400 }` (24-hour TTL)
    - _Requirements: 5.3, 6.3, 7.3, 8.3, 9.3, 10.4_

- [ ] 7. Implement utility and metric calculation functions
  - [ ] 7.1 Write `src/lib/utils/formatters.ts` and `src/lib/utils/dates.ts`
    - `formatCurrency(thousands)`, `formatPercent(ratio)`, `formatQuarter(repdte)` in `formatters.ts`
    - `isStaleData(dataAsOf, thresholdDays)` and `getDataFreshnessLabel(dataAsOf)` in `dates.ts`
    - _Requirements: 12.1, 12.2, 12.3_
  - [ ]* 7.2 Write property test for stale data threshold (Property 6)
    - **Property 6: Stale Data Warning Threshold**
    - For any date ≥ 120 days before today, `isStaleData` returns true; for any date < 120 days, returns false
    - **Validates: Requirements 12.3**
  - [ ] 7.3 Write `src/lib/metrics/capitalAdequacy.ts`
    - `categorizeCapital(tier1Ratio, totalCapitalRatio, leverageRatio): CapitalCategorization`
    - Apply FDIC 12 CFR Part 325 thresholds; return most restrictive category across all ratios
    - _Requirements: 3.1, 3.2_
  - [ ]* 7.4 Write property tests for capital categorization (Properties 1 and 2)
    - **Property 1: Capital Categorization Correctness** — for any ratio triple, result is a valid FDIC category and consistent with thresholds
    - **Property 2: Capital Categorization Monotonicity** — if A has strictly higher ratios than B, A's category is at least as favorable
    - **Validates: Requirements 3.2**
  - [ ] 7.5 Write `src/lib/metrics/peers.ts`
    - `computePeerMedian(peerFinancials, field)` — returns median value for a given field across peer dataset
    - `buildPeerComparison(institutionValue, peerMedian, peerGroupName): PeerComparison`
    - _Requirements: 5.3, 6.3, 7.3, 8.3_
  - [ ] 7.6 Write remaining metric modules: `assetQuality.ts`, `earnings.ts`, `liquidity.ts`, `deposits.ts`
    - `assetQuality.ts`: extract `LNLSNTV` as NPL ratio; charge-off rate returns `null` with `'data_not_reported'` reason
    - `earnings.ts`: extract `ROAQ` and `NIMY`
    - `liquidity.ts`: extract `LNLSDEPR`; compute `(CASH + SC) / ASSET * 100`
    - `deposits.ts`: compute `(DEPNIDOM + DEPFOR) / DEP * 100` for uninsured concentration; extract DEP/DEPINS/DEPNIDOM series for deposit trend
    - _Requirements: 6.1, 7.1, 8.1, 9.1, 10.1_

- [ ] 8. Checkpoint — Ensure all unit and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Build shared UI primitives and base IndicatorCard shell
  - [ ] 9.1 Write `src/components/ui/` primitives
    - `SkeletonCard.tsx` — skeleton placeholder matching indicator card dimensions (no spinners)
    - `ErrorMessage.tsx` — accepts `type: 'timeout' | 'api' | 'partial'` and renders distinct copy per type
    - `EmptyState.tsx` — accepts `reason: EmptyStateReason` and renders context-specific message
    - _Requirements: 13.2, 13.4, 13.5_
  - [ ] 9.2 Write `src/components/charts/TrendChart.tsx`
    - Recharts `LineChart` wrapper accepting `TrendDataPoint[]` and optional `series` array for multi-series
    - Accessible SVG with ARIA labels; visible focus styles on interactive elements
    - _Requirements: 4.2, 15.4, 15.5_
  - [ ] 9.3 Write `src/components/cards/IndicatorCard.tsx` — base card shell
    - Renders headline, metricName, currentValue, peerComparison, trend slot, explanation, dataAsOf date
    - Accepts `emptyStateReason` and delegates to `EmptyState` when set
    - Accepts `warningLevel` and applies visual treatment
    - Data-as-of date is always rendered (never omitted)
    - _Requirements: 4.2, 4.4, 12.1, 12.4_
  - [ ]* 9.4 Write property tests for IndicatorCard base shell (Properties 4 and 5)
    - **Property 4: Seven Cards Always Present in Correct Order** — for any institution data, rendered page contains exactly 7 cards in specified order
    - **Property 5: Data-As-Of Date Always Present** — for any card props, card renders a data-as-of date element
    - **Validates: Requirements 4.1, 4.4, 2.2, 12.1, 12.4**
  - [ ]* 9.5 Write property test for no composite score in rendered output (Property 3)
    - **Property 3: No Composite Score in Rendered Output** — for any institution data, rendered page contains no composite score text, letter grades, or numerical safety ratings
    - **Validates: Requirements 3.5, 4.5**

- [ ] 10. Build search feature (home page — thin vertical slice)
  - [ ] 10.1 Write `src/components/search/SearchInput.tsx`
    - Controlled input with 300ms debounce; fires `onSearch(query)` callback when query ≥ 2 characters
    - Displays credit union detection message when query matches NCUA-regulated entity pattern
    - Accessible: `role="search"`, `aria-label`, visible focus ring
    - _Requirements: 1.1, 1.7, 15.4_
  - [ ] 10.2 Write `src/components/search/SearchResults.tsx`
    - Renders disambiguation list: name, city, state, asset size (formatted), FDIC cert number
    - Handles no-results state with suggestion copy
    - Handles "Did you mean…" fuzzy suggestion when query closely matches but doesn't exactly match
    - Handles API error state with retry button
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.8_
  - [ ] 10.3 Write `src/app/page.tsx` — home page
    - Compose `SearchInput` + `SearchResults`; wire to `/api/search` route handler
    - Navigate directly to `/bank/[cert]` when exactly one result is returned
    - Show `SkeletonCard` while search is in flight
    - Include navigation link to Methodology page
    - _Requirements: 1.2, 1.3, 14.1_
  - [ ]* 10.4 Write property test for search results required fields (Property 15)
    - **Property 15: Search Results Contain Required Fields** — for any non-empty result set, each item in the disambiguation list displays name, city, state, asset size, and FDIC cert number
    - **Validates: Requirements 1.4**

- [ ] 11. Build institution header and data freshness components
  - [ ] 11.1 Write `src/components/institution/InstitutionHeader.tsx`
    - Displays legal name, city/state, charter type, total assets (formatted), year founded, FDIC cert number
    - Displays primary regulator and holding company (if present)
    - _Requirements: 2.1_
  - [ ]* 11.2 Write property test for institution summary required fields (Property 16)
    - **Property 16: Institution Summary Contains All Required Fields** — for any institution data object, rendered header contains all 6 required fields
    - **Validates: Requirements 2.1**
  - [ ] 11.3 Write `src/components/institution/DataFreshnessNotice.tsx`
    - Always shows data-as-of date and "45–60 day lag" notice
    - Shows stale warning banner when data is ≥ 120 days old
    - _Requirements: 12.1, 12.2, 12.3_
  - [ ] 11.4 Write `src/components/institution/CapitalCategoryBadge.tsx`
    - Displays Regulatory Capital Category label with color-coded badge
    - Warning treatment (prominent visual) for Undercapitalized / Significantly / Critically
    - Plain-English explanation of what the category means for depositors
    - _Requirements: 3.1, 3.3, 3.4_
  - [ ] 11.5 Write edge-case notice components
    - `MergedNotice.tsx` — merger notice with acquiring institution name and optional link to acquiring cert
    - `MidAcquisitionNotice.tsx` — contextual warning for in-progress acquisitions
    - `NewlyCharteredNotice.tsx` — limited history notice
    - `CharterConversionNotice.tsx` — peer comparison continuity warning
    - `StateCharteredNotice.tsx` — state regulator explanation
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 12. Build Capital Adequacy indicator card (first card — completes vertical slice)
  - [ ] 12.1 Write `src/components/cards/CapitalAdequacyCard.tsx`
    - Displays Tier 1 capital ratio and equity-to-assets ratio as `MetricValue` items
    - Renders `TrendChart` with 4–8 quarters of both ratios
    - Renders `PeerComparison` block showing institution vs. peer median Tier 1 ratio
    - Plain-English explanation of what capital ratios mean for depositors
    - Delegates to `EmptyState` for newly chartered / merged / receivership / API error scenarios
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 12.2 Wire `src/app/bank/[cert]/page.tsx` — institution detail page (Server Component)
    - Fetch institution profile, 8 quarters of financials, peer financials, and failure record in parallel
    - Transform raw FDIC responses into domain models
    - Render `InstitutionHeader`, `CapitalCategoryBadge`, `DataFreshnessNotice`, edge-case notices
    - Render Capital Adequacy card (only — remaining cards added in subsequent tasks)
    - Show `SkeletonCard` placeholders for the 6 cards not yet implemented
    - _Requirements: 2.1, 3.1, 4.1, 12.1_

- [ ] 13. Checkpoint — Confirm end-to-end vertical slice works
  - Search → select institution → detail page renders with Capital Adequacy card, header, badge, and freshness notice. Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Build Asset Quality indicator card
  - [ ] 14.1 Write `src/components/cards/AssetQualityCard.tsx`
    - Displays NPL ratio (`LNLSNTV`) as primary metric with 4–8Q trend and peer comparison
    - Displays "Data not available via API" for charge-off rate with a link to the institution's FDIC Call Report page
    - Plain-English explanation of NPL ratio and what it means for loan portfolio health
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ] 14.2 Wire `AssetQualityCard` into `src/app/bank/[cert]/page.tsx`
    - Replace Asset Quality skeleton with live card; pass computed metrics and peer data
    - _Requirements: 4.1_

- [ ] 15. Build Earnings indicator card
  - [ ] 15.1 Write `src/components/cards/EarningsCard.tsx`
    - Displays ROA (`ROAQ`) and NIM (`NIMY`) with 4–8Q trend and peer comparison for both metrics
    - Plain-English explanation of what ROA and NIM indicate about earnings health
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 15.2 Wire `EarningsCard` into `src/app/bank/[cert]/page.tsx`
    - _Requirements: 4.1_

- [ ] 16. Build Liquidity indicator card
  - [ ] 16.1 Write `src/components/cards/LiquidityCard.tsx`
    - Displays loan-to-deposit ratio (`LNLSDEPR`) and cash+securities/assets ratio with 4–8Q trend and peer comparison
    - Plain-English explanation of what these ratios mean for meeting withdrawal demands
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ] 16.2 Wire `LiquidityCard` into `src/app/bank/[cert]/page.tsx`
    - _Requirements: 4.1_

- [ ] 17. Build Uninsured Deposit Concentration indicator card
  - [ ] 17.1 Write `src/components/cards/UninsuredDepositCard.tsx`
    - Displays `(DEPNIDOM + DEPFOR) / DEP * 100` as a point-in-time snapshot (most recent quarter only)
    - NO trend chart or time-series visualization element
    - Peer comparison against SPECGRP median uninsured concentration
    - Explanation text MUST reference the $250,000 FDIC insurance limit per depositor per ownership category
    - Tooltip explaining that uninsured figure includes both domestic uninsured (`DEPNIDOM`) and foreign deposits (`DEPFOR`)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [ ]* 17.2 Write property tests for Uninsured Deposit card (Properties 7 and 8)
    - **Property 7: Uninsured Deposit Card Has No Trend** — for any institution data, rendered card contains no trend chart or time-series element
    - **Property 8: Uninsured Deposit Explanation References $250K Limit** — for any institution data, explanation text contains a reference to "$250,000"
    - **Validates: Requirements 9.4, 9.2**
  - [ ] 17.3 Wire `UninsuredDepositCard` into `src/app/bank/[cert]/page.tsx`
    - _Requirements: 4.1_

- [ ] 18. Build Deposit Trend indicator card
  - [ ] 18.1 Write `src/components/cards/DepositTrendCard.tsx`
    - Renders exactly three time-series in `TrendChart`: total deposits (`DEP`), insured deposits (`DEPINS`), uninsured domestic deposits (`DEPNIDOM`) across 4–8 quarters
    - Peer comparison showing how institution's deposit trend compares to SPECGRP peers
    - Plain-English explanation of what deposit trends indicate about depositor confidence
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [ ]* 18.2 Write property test for Deposit Trend three-series rendering (Property 18)
    - **Property 18: Deposit Trend Card Renders Exactly Three Series When Data Is Available** — for any institution data where DEP, DEPINS, and DEPNIDOM are all present, rendered card contains exactly three time-series visualizations
    - **Validates: Requirements 10 (SHOULD upgraded to SHALL)**
  - [ ] 18.3 Wire `DepositTrendCard` into `src/app/bank/[cert]/page.tsx`
    - _Requirements: 4.1_

- [ ] 19. Build Regulatory Status indicator card
  - [ ] 19.1 Write `src/components/cards/RegulatoryStatusCard.tsx`
    - When `/failures` returns a record: display warning treatment with closure date, resolution type, acquiring institution name; plain-English explanation of what receivership means for depositors
    - When `/failures` returns no record: display neutral confirmation that no failure/receivership record was found
    - Always display direct link to FDIC enforcement actions portal with plain-English explanation that active enforcement actions are not queryable via the public API
    - NO warning treatment solely because enforcement action data is absent
    - Card rendered at same prominence as all other indicator cards (not hidden or collapsed)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  - [ ]* 19.2 Write property test for Regulatory Status warning condition (Property 19)
    - **Property 19: Regulatory Status Warning Fires If and Only If /failures Returns a Record** — warning treatment is displayed iff a `/failures` record exists for the institution's CERT; no warning when no record exists or when only enforcement data is absent
    - **Validates: Requirements 11.2, 11.5**
  - [ ] 19.3 Wire `RegulatoryStatusCard` into `src/app/bank/[cert]/page.tsx`
    - All 7 indicator cards now wired; remove all skeleton placeholders
    - _Requirements: 4.1_

- [ ] 20. Checkpoint — All 7 indicator cards rendered end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Build Methodology page
  - [ ] 21.1 Write `src/app/methodology/page.tsx`
    - Sections: data source (FDIC BankFind Suite API with link to docs), all 7 indicator definitions with FDIC field names, capital category thresholds table (12 CFR Part 325), explicit "we don't grade banks" statement, data limitations section (Call Report lag, charge-off rate unavailability, NPL-only for asset quality, enforcement actions not queryable), plain-English disclaimer (informational only, not financial advice)
    - Navigation link back to home page
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  - [ ] 21.2 Add Methodology page link to global navigation
    - Add nav link to `src/app/layout.tsx` (or shared nav component) so it appears on every page including home, institution detail, and methodology itself
    - _Requirements: 14.1_
  - [ ]* 21.3 Write property tests for Methodology page accessibility and completeness (Properties 11 and 12)
    - **Property 11: Methodology Page Accessible from All Pages** — for any page in the app, rendered HTML contains a navigation link to the methodology page
    - **Property 12: Methodology Page Contains All Seven Indicator Definitions** — rendered methodology page contains a definition section for each of the 7 indicators
    - **Validates: Requirements 14.1, 14.3**

- [ ] 22. Implement peer comparison data flow and validate SPECGRP cohort filtering
  - [ ] 22.1 Wire peer data into all indicator cards that display peer comparisons
    - Confirm each card's `PeerComparison` block is populated from the `/api/peers/[specgrp]` route handler
    - Peer median computed client-side via `computePeerMedian()` from institutions sharing the same `SPECGRP`
    - _Requirements: 5.3, 6.3, 7.3, 8.3, 9.3, 10.4_
  - [ ]* 22.2 Write property test for peer comparison SPECGRP cohort (Property 17)
    - **Property 17: Peer Comparison Uses FDIC SPECGRP Cohort** — for any institution data, peer comparison data is computed exclusively from institutions sharing the same FDIC `SPECGRP` value; no institutions from a different SPECGRP or fallback cohort are included
    - **Validates: Requirement 8 (Peer Group Definition — TBD resolved)**

- [ ] 23. Implement responsive layout and accessibility hardening
  - [ ] 23.1 Apply mobile-first responsive grid to institution detail page
    - Indicator cards stack vertically on viewports < 768px; arrange in 2-column grid on md+; 3-column on xl+
    - Verify no horizontal overflow at 320px, 375px, 768px, 1024px, 1440px
    - _Requirements: 15.1, 15.2, 15.6_
  - [ ]* 23.2 Write property test for no horizontal overflow (Property 13)
    - **Property 13: No Horizontal Overflow at Any Supported Viewport Width** — for any viewport width W in [320, 1440], document body width does not exceed W
    - **Validates: Requirements 15.1, 15.6**
  - [ ] 23.3 Audit and fix focus styles on all interactive elements
    - Ensure every button, link, and input has a visually distinct CSS focus ring (`:focus-visible`)
    - _Requirements: 15.4_
  - [ ]* 23.4 Write property test for interactive element focus styles (Property 14)
    - **Property 14: Interactive Elements Have Focus Styles** — for any interactive element in the rendered app, the element has a CSS focus style defined that is visually distinct from its default state
    - **Validates: Requirements 15.4**
  - [ ] 23.5 Add semantic HTML and ARIA labels to all page regions and indicator cards
    - `role="main"`, `aria-label` on search, `aria-live` on search results, `aria-label` on each indicator card
    - _Requirements: 15.3, 15.5_

- [ ] 24. Checkpoint — Ensure all tests pass and responsive layout is verified
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Write README
  - Write `README.md` with these pre-structured sections:
    - **What you built and why** — product summary, target user, problem being solved
    - **APIs and how they serve the product** — FDIC BankFind Suite endpoints used, what each provides, caching strategy, known limitations (charge-off rate, enforcement actions)
    - **Run locally** — prerequisites, `npm install`, `npm run dev`, `npm test`; live demo link
    - **Product decisions and reasoning** — SPECGRP peer groups, no composite score, snapshot vs. trend choices, skeleton loading, one-error-state-per-lifecycle rule
    - **What you'd add with more time** — e.g., NCUA credit union support, historical failure rate context, email alerts for status changes, PDF export
  - _Requirements: non-code task — structured to Nymbus evaluation criteria_

- [ ] 26. Final polish
  - Copy review: read every user-facing string for clarity, accuracy, and plain-English tone; fix any jargon or ambiguous phrasing
  - Error-state walkthrough: manually trigger each error scenario (timeout, 4xx, 5xx, partial response, newly chartered, merged, receivership) and verify correct UI treatment
  - Mobile viewport check: test at 320px and 375px in browser devtools; fix any overflow, truncation, or tap-target issues
  - Methodology page completeness: verify all 7 indicator definitions are present, thresholds table is accurate, disclaimer is present, enforcement actions limitation is documented
  - Broken-link sweep: verify FDIC enforcement portal link, FDIC API docs link, and any acquiring institution links resolve correctly
  - _Requirements: non-code task — final quality gate before submission_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP — but each maps to a named correctness property from the design document
- The 3 mandatory non-code tasks (2, 25, 26) are intentionally placed at deploy-early, pre-submission, and final-polish positions
- Vercel deployment (task 2) happens before any content exists — the pipeline must be proven before the final-day content push
- Indicator cards are implemented one at a time (tasks 12–19) so the app is coherent at every stopping point
- Peer comparison wiring (task 22) is deferred until all cards exist, then validated in one pass
- Property tests are co-located with the feature they validate to catch regressions early
- All 19 correctness properties from the design document are covered by property test sub-tasks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["3.1", "3.2"] },
    { "id": 1, "tasks": ["4.1", "7.1"] },
    { "id": 2, "tasks": ["4.2", "5.1", "5.2", "5.3", "7.2", "7.3"] },
    { "id": 3, "tasks": ["6.1", "6.2", "6.3", "7.4", "7.5", "7.6"] },
    { "id": 4, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 5, "tasks": ["9.4", "9.5", "10.1", "10.2", "11.1", "11.3", "11.4", "11.5"] },
    { "id": 6, "tasks": ["10.3", "10.4", "11.2", "12.1"] },
    { "id": 7, "tasks": ["12.2"] },
    { "id": 8, "tasks": ["14.1", "15.1", "16.1", "17.1"] },
    { "id": 9, "tasks": ["14.2", "15.2", "16.2", "17.2", "17.3", "18.1"] },
    { "id": 10, "tasks": ["18.2", "18.3", "19.1"] },
    { "id": 11, "tasks": ["19.2", "19.3"] },
    { "id": 12, "tasks": ["21.1", "21.2"] },
    { "id": 13, "tasks": ["21.3", "22.1"] },
    { "id": 14, "tasks": ["22.2", "23.1", "23.3", "23.5"] },
    { "id": 15, "tasks": ["23.2", "23.4"] }
  ]
}
```
