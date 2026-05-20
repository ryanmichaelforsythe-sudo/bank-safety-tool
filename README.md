# Is My Bank Safe?

A consumer-facing tool that lets you look up any U.S. bank and see a plain-English read on its financial health — the same indicators an FDIC examiner looks at, translated for non-experts.

**Live demo:** [https://bank-safety-tool.vercel.app](https://bank-safety-tool.vercel.app)

**Spec artifacts:** See `.kiro/specs/bank-safety-tool/` for the full requirements, design, and task documents. The collaboration log at `.kiro/collaboration-log/` captures the iterative dialogue that shaped the spec before any code was written.

---

## The Problem

After Silicon Valley Bank, Signature, and First Republic collapsed in 2023, depositors learned that "FDIC-insured" doesn't mean "nothing to worry about." The information needed to evaluate a bank's health is publicly available — every U.S. bank files quarterly Call Reports with the FDIC — but that data is dense, regulator-oriented, and effectively inaccessible to anyone who isn't a banker.

Today, a consumer who wants to know "should I be worried about my bank?" has three options: read FDIC call reports directly (impractical), read financial news (only covers banks already in crisis), or trust that FDIC insurance is enough (incomplete — coverage has limits, and the failure process itself disrupts access to your money).

This tool fills the gap. It takes the same public data that examiners use and surfaces it in plain language, with peer context, so a non-expert can form their own view in 30 seconds.

## Who It's For

Financially literate consumers and small-business owners who keep meaningful deposits (>$10K or business operating balances) at a community or regional bank. People who've heard about bank failures and want a periodic gut-check — not a stock-picker view, not a doomscroll.

Explicitly not for: professional investors, banking insiders, or depositors at mega-banks (Chase, BofA, Wells, Citi don't need this tool).

## The FDIC BankFind API — How It Serves the Product

All data comes from the [FDIC BankFind Suite](https://banks.data.fdic.gov/), a public API requiring no authentication. This isn't a wrapper around a generic data source — the FDIC API is specifically designed to expose the same Call Report data that regulators use internally.

**What we query:**
- `/institutions` — bank identity, charter type, peer group classification (SPECGRP), active/inactive status
- `/financials` — quarterly financial metrics: capital ratios, loan quality, earnings, deposits, liquidity
- `/failures` — receivership and failure records (the only regulatory-action data that's actually queryable)

**What we can't query** (and say so explicitly): enforcement actions, consent orders, MOUs, and PCA status. The FDIC publishes these on a separate portal but doesn't expose them via the BankFind API. Rather than pretend this data doesn't exist, we disclose the limitation and link to the FDIC's enforcement orders system.

**Caching strategy:** Institution data revalidates every 5 minutes. Peer group data (used for median comparisons) caches for 24 hours — it only changes when new quarterly Call Reports are filed. This keeps the demo fast and avoids rate-limit issues without serving stale data.

## Run Locally

```bash
git clone https://github.com/ryanmichaelforsythe-sudo/bank-safety-tool.git
cd bank-safety-tool
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run test suite (Vitest) |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint via Next.js |

**Requirements:** Node.js 20+ and npm. No API keys, no environment variables, no database — the FDIC API is public and unauthenticated.

## Product Decisions and Reasoning

**No composite safety score.** The original brief proposed a single "health view" label. I killed it during spec iteration because: (1) whose weights, on what basis? (2) it bumps into CAMELS-analog territory that regulators keep confidential for good reasons, (3) if our label disagrees with reality, it's a liability. Instead, we show the FDIC's own regulatory capital categorization (Well Capitalized / Adequately Capitalized / Undercapitalized) — their thresholds, their label, their data. We don't grade banks.

**Color means concern level, not percentile rank.** Capital category badges use graduated color (green → gray → amber → red) because those are regulatory thresholds with real meaning. But for non-regulatory metrics (earnings, liquidity, deposits), being below the peer median doesn't earn a warning color — by definition, half of all healthy banks are below median. We show the fact and let peer context speak. Warning color fires only on genuine concern signals: negative ROA (bank losing money), or FDIC receivership.

**Deposit trend as a standalone card.** The brief grouped deposits under "liquidity." I split it out because deposit flow is the mechanism of bank runs — SVB's problem wasn't just uninsured concentration (a snapshot), it was that those depositors all left at once (a flow). Showing both as separate cards makes the distinction legible.

**Enforcement actions: transparency over false reassurance.** We can't query enforcement data from the FDIC API. Rather than showing "no actions found" (which would be a lie — we didn't look, we can't look), we disclose the limitation explicitly and link to the FDIC's enforcement orders portal. The copy says "this tool cannot confirm or deny" — deliberately neutral.

**FDIC peer groups (SPECGRP), not custom cohorts.** The FDIC already defines peer groups for its own Uniform Bank Performance Report. Using their grouping means we're not inventing methodology — we're showing the same comparison framework regulators use. No proprietary cohort construction.

**Seven indicators, not five.** The brief proposed 5–7. I landed at 7 after adding deposit trend (the SVB lesson) and confirming that insured/uninsured deposit segmentation is queryable per institution per quarter. Each indicator earns its place by answering a distinct question a depositor would ask.

## What I'd Add With More Time

- **Expand test coverage to the full 19 correctness properties** — the spec defines 19 properties covering capital categorization, rendering invariants, data transparency, and accessibility; implementing them all as fast-check property-based tests would catch regressions systematically
- **NCUA credit union support** — different regulator, different data source, but the same user need exists
- **Trend charts on all cards** — currently only Deposit Trend has a full Recharts visualization; the other cards show trend data counts but not rendered charts
- **Historical failure rate context** — "X banks in this peer group have failed in the last 20 years" gives the concentration metric more meaning
- **Fuzzy search / "did you mean"** — currently uses FDIC's wildcard filter; a Levenshtein-based suggestion would handle typos better
- **PDF export** — let users save a bank's health snapshot as a document they can share with a financial advisor
- **Dark mode** — CSS variables are already in place; just needs the media query variants
