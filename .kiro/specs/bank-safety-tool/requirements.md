# Requirements Document

## Introduction

The Bank Safety Tool is a consumer-facing web application that lets users look up any U.S. bank by name, city/state, or FDIC certificate number and receive a plain-English read on that bank's financial health. All data is drawn from the public FDIC BankFind Suite API (no authentication required). The tool surfaces seven financial health indicator cards, a regulatory capital categorization, and contextual warnings for edge cases such as mergers, enforcement actions, and data gaps. It does not publish proprietary composite safety scores or investment advice.

Target users are financially literate consumers and small-business owners with meaningful deposits (>$10K or business operating balances) at community or regional banks who want to understand their bank's condition without needing a finance background.

---

## Glossary

- **Tool**: The Bank Safety Tool web application.
- **User**: A consumer or small-business owner using the Tool to look up a bank.
- **FDIC**: Federal Deposit Insurance Corporation.
- **FDIC API**: The FDIC BankFind Suite public API at `https://banks.data.fdic.gov`.
- **Institution**: A U.S. bank or savings institution with an active or historical FDIC certificate.
- **Certificate Number**: The unique FDIC-assigned identifier for an Institution.
- **Indicator Card**: A UI component displaying one financial health metric with its current value, peer comparison, trend, and plain-English explanation.
- **Regulatory Capital Category**: One of the FDIC-defined capital adequacy tiers: Well Capitalized, Adequately Capitalized, Undercapitalized, Significantly Undercapitalized, or Critically Undercapitalized.
- **Peer Group**: A cohort of institutions used for comparative benchmarking. *(TBD pending API validation in design phase — see Requirement 8.)*
- **Enforcement Action**: A formal regulatory action (MOU, consent order, cease-and-desist, or PCA directive) issued against an Institution by its primary regulator.
- **Call Report**: Quarterly financial report filed by FDIC-insured institutions; the primary source for financial metrics. Data typically lags 45–60 days after quarter-end.
- **Data-As-Of Date**: The date of the most recent Call Report data available for a given Institution.
- **Merged Institution**: An Institution whose charter has been absorbed into another Institution.
- **Mid-Acquisition Institution**: An Institution that has been acquired but whose charter has not yet been retired in FDIC records.
- **Newly Chartered Institution**: An Institution with fewer than four quarters of Call Report history.
- **Charter Conversion**: An event where an Institution changes its charter type (e.g., state to national), which may disrupt peer comparison continuity.
- **Credit Union**: A member-owned financial cooperative regulated by the NCUA, not the FDIC. Out of scope for this Tool.
- **Methodology Page**: A dedicated page or modal explaining the Tool's data sources, indicator definitions, and limitations.

---

## Requirements

### Requirement 1: Bank Search

**User Story:** As a User, I want to search for a bank by name, city/state, or FDIC certificate number, so that I can quickly find the institution I bank with.

#### Acceptance Criteria

1. THE Tool SHALL provide a single search input on the home page that accepts free-text queries including bank name, city/state combinations, and FDIC certificate numbers.
2. WHEN a User submits a search query of at least two characters, THE Tool SHALL query the FDIC API `/institutions` endpoint and return matching results within 3 seconds under normal network conditions.
3. WHEN a search query returns exactly one matching Institution, THE Tool SHALL navigate directly to that Institution's detail view.
4. WHEN a search query returns multiple matching Institutions, THE Tool SHALL display a disambiguation list showing each Institution's name, city, state, asset size, and FDIC certificate number so the User can select the correct one.
5. WHEN a search query returns no matching Institutions, THE Tool SHALL display a "no results" message and suggest the User check the spelling, try a city/state, or enter the FDIC certificate number directly.
6. WHEN a search query closely resembles but does not exactly match an Institution name, THE Tool SHALL display a "Did you mean…" suggestion using fuzzy matching against Institution names returned by the FDIC API.
7. WHEN a User enters a name that matches a known Credit Union rather than an FDIC-insured bank, THE Tool SHALL display a message explaining that credit unions are regulated by the NCUA and are not covered by this Tool.
8. IF the FDIC API returns an error or times out during a search, THEN THE Tool SHALL display a user-friendly error message and offer the User the option to retry the search.

---

### Requirement 2: Institution Summary

**User Story:** As a User, I want to see a clear summary of the bank I looked up, so that I can confirm I have the right institution and understand its basic profile.

#### Acceptance Criteria

1. WHEN an Institution detail view is displayed, THE Tool SHALL show the Institution's legal name, headquarters city and state, charter type (national bank, state bank, savings institution, etc.), total asset size, year founded, and FDIC certificate number.
2. THE Tool SHALL display the Data-As-Of Date for the Institution's most recent FDIC filing in every Indicator Card, regardless of whether the underlying metrics are calculable. WHEN metrics cannot be calculated, THE Tool SHALL display a context-specific reason in place of the metric value, drawn from a defined set of empty-state scenarios including: newly chartered institution (insufficient history), merged institution (charter retired), institution in receivership, and data not yet reported for the current quarter.
3. WHEN an Institution is a Merged Institution, THE Tool SHALL display a notice stating the bank has merged and identify the acquiring institution by name. WHERE the acquiring institution's FDIC record is resolvable, THE Tool SHALL provide a link to the acquiring institution's detail view. WHERE the acquiring institution cannot be resolved, THE Tool SHALL display the merger notice and acquiring institution name without a link, and SHALL NOT suppress the merged institution's available historical data.
4. WHEN an Institution is a Mid-Acquisition Institution, THE Tool SHALL display a contextual warning that the institution is in the process of being acquired and that some data may be contextually misleading.
5. WHEN an Institution is a Newly Chartered Institution with fewer than four quarters of Call Report history, THE Tool SHALL display a notice stating that limited historical data is available and show only the quarters that exist.
6. WHEN an Institution has undergone a Charter Conversion, THE Tool SHALL display a notice that the institution changed its charter type and that peer comparison data prior to the conversion may not be directly comparable.
7. WHEN an Institution is state-chartered, THE Tool SHALL display a plain-English explanation that the institution is supervised by its state regulator in addition to the FDIC, and that examination reports may differ from nationally chartered banks.

---

### Requirement 3: Regulatory Capital Categorization

**User Story:** As a User, I want to see the bank's official FDIC capital adequacy category at the top of the results page, so that I immediately understand whether regulators consider the bank well-funded.

#### Acceptance Criteria

1. WHEN an Institution detail view is displayed, THE Tool SHALL show the Institution's current Regulatory Capital Category (Well Capitalized, Adequately Capitalized, Undercapitalized, Significantly Undercapitalized, or Critically Undercapitalized) as the primary status indicator, positioned above all Indicator Cards.
2. THE Tool SHALL derive the Regulatory Capital Category exclusively from FDIC-defined thresholds applied to Tier 1 capital ratio and Total capital ratio data from the FDIC API — no proprietary scoring or weighting SHALL be applied.
3. WHEN an Institution is categorized as Undercapitalized, Significantly Undercapitalized, or Critically Undercapitalized, THE Tool SHALL display the category with a visually prominent warning treatment and a plain-English explanation of what the category means for depositors.
4. THE Tool SHALL display a plain-English explanation of the Regulatory Capital Category alongside the category label, written for a non-specialist audience.
5. THE Tool SHALL NOT display a proprietary composite safety score, letter grade, or numerical rating for any Institution.

---

### Requirement 4: Financial Health Indicator Cards

**User Story:** As a User, I want to see the key financial health indicators for my bank presented as individual cards, so that I can understand each dimension of the bank's health separately.

#### Acceptance Criteria

1. WHEN an Institution detail view is displayed, THE Tool SHALL display exactly seven Indicator Cards in the following order: (1) Capital Adequacy, (2) Asset Quality, (3) Earnings, (4) Liquidity, (5) Uninsured Deposit Concentration, (6) Deposit Trend, (7) Regulatory Status.
2. EACH Indicator Card SHALL display: the indicator's plain-English headline, the technical metric name as a subtitle, the current metric value, a peer comparison showing how the Institution compares to its Peer Group, a trend visualization covering 4–8 quarters of history, and a plain-English explanation of what the metric means and why it matters.
3. WHEN fewer than four quarters of data are available for an Indicator Card, THE Tool SHALL display the available quarters and a notice that the trend is based on limited history.
4. WHEN data for a specific metric is unavailable from the FDIC API, THE Tool SHALL display "Data not available" for that metric within the Indicator Card and retain the card in the layout rather than hiding it.
5. THE Tool SHALL NOT combine or aggregate Indicator Card values into a composite score or overall rating.

---

### Requirement 5: Capital Adequacy Indicator

**User Story:** As a User, I want to see how well-capitalized my bank is, so that I can understand whether it has a sufficient financial cushion to absorb losses.

#### Acceptance Criteria

1. THE Capital Adequacy Indicator Card SHALL display the Institution's Tier 1 capital ratio and equity-to-total-assets ratio sourced from the FDIC API `/financials` endpoint.
2. THE Capital Adequacy Indicator Card SHALL display a trend of both ratios across the most recent 4–8 quarters available.
3. THE Capital Adequacy Indicator Card SHALL display a peer comparison showing how the Institution's Tier 1 capital ratio compares to its Peer Group median. *(Peer Group definition is TBD pending API validation in design phase — see Requirement 8.)*
4. THE Capital Adequacy Indicator Card SHALL include a plain-English explanation that describes what capital ratios measure and what the Institution's current level means for a depositor.

---

### Requirement 6: Asset Quality Indicator

**User Story:** As a User, I want to see the quality of my bank's loan portfolio, so that I can understand whether the bank is carrying significant bad debt.

#### Acceptance Criteria

1. THE Asset Quality Indicator Card SHALL display the Institution's non-performing loans as a percentage of total loans and the net charge-off rate, sourced from the FDIC API `/financials` endpoint.
2. THE Asset Quality Indicator Card SHALL display a trend of both metrics across the most recent 4–8 quarters available.
3. THE Asset Quality Indicator Card SHALL display a peer comparison for both metrics against the Institution's Peer Group median. *(Peer Group definition is TBD pending API validation in design phase — see Requirement 8.)*
4. THE Asset Quality Indicator Card SHALL include a plain-English explanation of what non-performing loans and charge-offs mean and what the Institution's current levels suggest about loan portfolio health.

---

### Requirement 7: Earnings Indicator

**User Story:** As a User, I want to see whether my bank is profitable, so that I can understand whether it is generating the income needed to remain financially healthy.

#### Acceptance Criteria

1. THE Earnings Indicator Card SHALL display the Institution's return on assets (ROA) and net interest margin (NIM), sourced from the FDIC API `/financials` endpoint.
2. THE Earnings Indicator Card SHALL display a trend of both metrics across the most recent 4–8 quarters available.
3. THE Earnings Indicator Card SHALL display a peer comparison for both metrics against the Institution's Peer Group median. *(Peer Group definition is TBD pending API validation in design phase — see Requirement 8.)*
4. THE Earnings Indicator Card SHALL include a plain-English explanation of what ROA and NIM measure and what the Institution's current levels indicate about its earnings health.

---

### Requirement 8: Liquidity Indicator

**User Story:** As a User, I want to see how liquid my bank is, so that I can understand whether it has enough cash and liquid assets to meet withdrawal demands.

#### Acceptance Criteria

1. THE Liquidity Indicator Card SHALL display the Institution's loan-to-deposit ratio and the ratio of cash plus securities to total assets, sourced from the FDIC API `/financials` endpoint.
2. THE Liquidity Indicator Card SHALL display a trend of both metrics across the most recent 4–8 quarters available.
3. THE Liquidity Indicator Card SHALL display a peer comparison for both metrics against the Institution's Peer Group median.
4. THE Liquidity Indicator Card SHALL include a plain-English explanation of what these ratios measure and what the Institution's current levels suggest about its ability to meet depositor withdrawals.

> **TBD — Peer Group Definition (affects Requirements 5–8):** The method for defining the Peer Group cohort used in peer comparisons must be validated against the FDIC API in the design phase. Options include using FDIC-defined peer groups (if surfaceable via the API) or constructing cohorts by asset-size band. This decision affects all four indicator cards that include peer comparisons.

---

### Requirement 9: Uninsured Deposit Concentration Indicator

**User Story:** As a User, I want to see what percentage of my bank's deposits are uninsured, so that I can understand how much of the deposit base exceeds FDIC insurance limits.

#### Acceptance Criteria

1. THE Uninsured Deposit Concentration Indicator Card SHALL display uninsured deposits as a percentage of total deposits as a point-in-time snapshot for the most recent quarter available, sourced from the FDIC API `/financials` endpoint.
2. THE Uninsured Deposit Concentration Indicator Card SHALL display a plain-English explanation of what uninsured deposit concentration means, including a reference to the $250,000 FDIC insurance limit per depositor per ownership category.
3. THE Uninsured Deposit Concentration Indicator Card SHALL display a peer comparison showing how the Institution's uninsured deposit concentration compares to its Peer Group median. *(Peer Group definition is TBD pending API validation in design phase — see Requirement 8.)*
4. THE Uninsured Deposit Concentration Indicator Card SHALL NOT display a trend visualization, as this metric is presented as a snapshot only.

---

### Requirement 10: Deposit Trend Indicator

**User Story:** As a User, I want to see whether total deposits at my bank are growing or shrinking over time, so that I can understand whether depositors are moving money in or out.

#### Acceptance Criteria

1. THE Deposit Trend Indicator Card SHALL display the change in total deposits across the most recent 4–8 quarters available, sourced from the FDIC API `/financials` endpoint.
2. THE Deposit Trend Indicator Card SHALL display the deposit values as a time-series trend visualization showing quarter-over-quarter direction and magnitude.
3. THE Deposit Trend Indicator Card SHALL include a plain-English explanation of what deposit trends indicate about depositor confidence and bank stability.
4. THE Deposit Trend Indicator Card SHALL display a peer comparison showing how the Institution's deposit trend compares to its Peer Group. *(Peer Group definition is TBD pending API validation in design phase — see Requirement 8.)*

> **TBD — Insured vs. Uninsured Deposit Segmentation:** Whether the FDIC `/financials` endpoint provides total deposit change segmented by insured vs. uninsured deposits must be verified in the design phase. If available, the Deposit Trend card SHOULD display both segmented series. If not available, the card SHALL display total deposits only and note the limitation.

---

### Requirement 11: Regulatory Status Indicator

**User Story:** As a User, I want to see my bank's regulatory status, so that I can understand whether regulators have taken formal action against it or closed it.

#### Acceptance Criteria

1. THE Regulatory Status Indicator Card SHALL display the Institution's receivership or failure status when present, sourced from the FDIC API `/failures` endpoint, including the closure date, resolution type, and acquiring institution name where available.
2. WHEN an Institution has a record in the FDIC `/failures` endpoint, THE Tool SHALL display the Regulatory Status Indicator Card with a visually prominent warning treatment and a plain-English explanation of what receivership means for depositors.
3. WHEN an Institution has no record in the FDIC `/failures` endpoint, THE Regulatory Status Indicator Card SHALL display a neutral confirmation that no failure or receivership record was found in FDIC public data — this is a transparency disclosure, not a safety signal.
4. THE Regulatory Status Indicator Card SHALL include a direct link to the FDIC's enforcement actions portal (`https://www.fdic.gov/bank/individual/enforcement/`) with a plain-English explanation that active enforcement actions (MOUs, consent orders, PCA directives) are published by the FDIC but are not queryable through the public data API used by this Tool.
5. THE Tool SHALL NOT display a warning treatment on the Regulatory Status Indicator Card solely because enforcement action data is unavailable via the API — absence of queryable data is disclosed as a transparency limitation, not treated as a signal.
6. THE Regulatory Status Indicator Card SHALL be displayed at the same prominence level as all other Indicator Cards — it SHALL NOT be hidden, collapsed, or relegated to a footer.

---

### Requirement 12: Data Freshness and Transparency

**User Story:** As a User, I want to know how current the data I'm seeing is, so that I can understand whether it reflects the bank's most recent condition.

#### Acceptance Criteria

1. THE Tool SHALL display the Data-As-Of Date for each Institution's financial data on the detail view, sourced from the most recent Call Report period available in the FDIC API.
2. THE Tool SHALL display a notice on every Institution detail view explaining that FDIC Call Report data typically lags 45–60 days after quarter-end.
3. WHEN the most recent available data for an Institution is 120 days old or older, THE Tool SHALL display an additional warning that the data may be significantly out of date.
4. THE Tool SHALL NOT display financial metrics without an associated Data-As-Of Date.

---

### Requirement 13: API Resilience and Error Handling

**User Story:** As a User, I want the tool to handle data errors gracefully, so that I am never shown a broken page or misleading partial data without explanation.

#### Acceptance Criteria

1. IF the FDIC API returns an HTTP error (4xx or 5xx) for any request, THEN THE Tool SHALL display a user-friendly error message identifying which data could not be loaded and offer a retry option.
2. IF the FDIC API does not respond within 10 seconds, THEN THE Tool SHALL display a timeout-specific error message. Each request lifecycle SHALL resolve to exactly one error state; error messages SHALL NOT stack or overlap. WHERE compound conditions exist (e.g., stale cache combined with a failed refresh), THE Tool SHALL express them as a single combined message rather than two competing ones. The timeout message SHALL be distinct from general API error messages so the User understands that retrying immediately is appropriate.
3. IF the FDIC API returns a partial response missing one or more financial metrics, THEN THE Tool SHALL display the available metrics and mark unavailable metrics as "Data not available" within their respective Indicator Cards.
4. WHILE a data request to the FDIC API is in progress, THE Tool SHALL display a loading indicator so the User knows data is being fetched.
5. THE Tool SHALL NOT display a blank page or unhandled error state to the User under any API failure condition.

---

### Requirement 14: Methodology Page

**User Story:** As a User, I want to understand where the data comes from and what the tool does and does not show, so that I can trust the information and know its limitations.

#### Acceptance Criteria

1. THE Tool SHALL provide a Methodology Page accessible from every page of the application.
2. THE Methodology Page SHALL explain that all data is sourced from the FDIC BankFind Suite public API and include a link to the FDIC API documentation.
3. THE Methodology Page SHALL define each of the seven financial health indicators, including the specific FDIC data fields used to calculate each metric.
4. THE Methodology Page SHALL explain the Regulatory Capital Category thresholds used (Tier 1 and Total capital ratio thresholds as defined by the FDIC).
5. THE Methodology Page SHALL explicitly state that the Tool does not publish proprietary composite safety scores, letter grades, or investment recommendations.
6. THE Methodology Page SHALL explain the limitations of the data, including Call Report lag, the treatment of merged and newly chartered institutions, and the TBD items that remain subject to API validation.
7. THE Methodology Page SHALL include a plain-English disclaimer that the Tool is for informational purposes only and does not constitute financial or investment advice.

---

### Requirement 15: Responsive and Accessible UI

**User Story:** As a User, I want to use the tool comfortably on any device, so that I can look up my bank from my phone, tablet, or desktop.

#### Acceptance Criteria

1. THE Tool SHALL render correctly and be fully usable on viewport widths from 320px (small mobile) through 1440px (desktop).
2. THE Tool SHALL use a mobile-first responsive layout where Indicator Cards stack vertically on small viewports and arrange in a grid on larger viewports.
3. THE Tool SHALL meet WCAG 2.1 Level AA color contrast requirements for all text and interactive elements.
4. THE Tool SHALL provide visible focus indicators for all interactive elements to support keyboard navigation.
5. THE Tool SHALL use semantic HTML elements and ARIA labels where appropriate so that screen readers can interpret the page structure and Indicator Card content.
6. THE Tool SHALL NOT require horizontal scrolling on any supported viewport width.
