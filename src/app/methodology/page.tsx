import Link from "next/link";

/**
 * Methodology page — explains data sources, indicator definitions,
 * peer comparison approach, and limitations.
 *
 * Property 11: accessible from every page (nav link in layout).
 * Property 12: contains a definition section for each of the 7 indicators.
 */
export default function MethodologyPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Navigation */}
      <nav className="mb-8">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Back to search
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        How We Calculate This
      </h1>

      {/* Section 1: Data Source */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Data Source</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          All data shown in this tool comes from the{" "}
          <Link
            href="https://banks.data.fdic.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            FDIC BankFind Suite
          </Link>
          , a public dataset maintained by the Federal Deposit Insurance
          Corporation. No authentication or special access is required — the same
          data is available to anyone. Financial metrics are drawn from quarterly
          Call Reports that every FDIC-insured institution is required to file.
          Call Report data typically lags 45–60 days after quarter-end.
        </p>
      </section>

      {/* Section 2: What We Show (and Don't) */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          What We Show (and Don&apos;t)
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We don&apos;t grade banks. We don&apos;t publish composite safety
          scores, letter grades, or numerical ratings. We show you the
          FDIC&apos;s own regulatory capital categorization — which uses their
          thresholds, not ours — alongside the financial indicators that bank
          examiners look at, presented in plain language with peer context. You
          decide what it means for your situation.
        </p>
      </section>

      {/* Section 3: Regulatory Capital Categorization */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Regulatory Capital Categorization
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          The capital category shown at the top of each bank&apos;s page is
          determined by FDIC-defined thresholds from 12 CFR Part 325. The most
          restrictive category across all applicable ratios determines the
          classification.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-2 pr-4 font-medium text-gray-700">Tier 1 Risk-Based</th>
                <th className="text-left py-2 pr-4 font-medium text-gray-700">Total Risk-Based</th>
                <th className="text-left py-2 font-medium text-gray-700">Leverage</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">Well Capitalized</td>
                <td className="py-2 pr-4">≥ 8%</td>
                <td className="py-2 pr-4">≥ 10%</td>
                <td className="py-2">≥ 5%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">Adequately Capitalized</td>
                <td className="py-2 pr-4">≥ 6%</td>
                <td className="py-2 pr-4">≥ 8%</td>
                <td className="py-2">≥ 4%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">Undercapitalized</td>
                <td className="py-2 pr-4">&lt; 6%</td>
                <td className="py-2 pr-4">&lt; 8%</td>
                <td className="py-2">&lt; 4%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">Significantly Undercapitalized</td>
                <td className="py-2 pr-4">&lt; 4%</td>
                <td className="py-2 pr-4">&lt; 6%</td>
                <td className="py-2">&lt; 3%</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Critically Undercapitalized</td>
                <td className="py-2" colSpan={3}>Tangible equity ≤ 2% of total assets</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: The Seven Indicators */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          The Seven Indicators
        </h2>

        <div className="space-y-4">
          <IndicatorDefinition
            name="Capital Adequacy"
            description="Tier 1 risk-based capital ratio, total risk-based capital ratio, and leverage ratio (equity / total assets)."
            source="FDIC fields: RBCT1J, RBCRWAJ, EQ, ASSET"
          />
          <IndicatorDefinition
            name="Asset Quality"
            description="Non-performing loans as a percentage of total loans. Note: the net charge-off rate is not available through the FDIC public data and is not shown."
            source="FDIC field: LNLSNTV"
          />
          <IndicatorDefinition
            name="Earnings"
            description="Return on assets (ROA, annualized from the latest quarter) and net interest margin (NIM)."
            source="FDIC fields: ROAQ, NIMY"
          />
          <IndicatorDefinition
            name="Liquidity"
            description="Loan-to-deposit ratio and liquid assets ratio (cash + securities / total assets)."
            source="FDIC fields: LNLSDEPR, CASH, SC, ASSET"
          />
          <IndicatorDefinition
            name="Uninsured Deposit Concentration"
            description="Uninsured deposits (domestic + foreign) as a percentage of total deposits. Shown as a point-in-time snapshot, not a trend."
            source="FDIC fields: DEPNIDOM, DEPFOR, DEP"
          />
          <IndicatorDefinition
            name="Deposit Trend"
            description="Total deposits, insured deposits, and uninsured domestic deposits over 4–8 quarters."
            source="FDIC fields: DEP, DEPINS, DEPNIDOM"
          />
          <IndicatorDefinition
            name="Regulatory Status"
            description="Failure and receivership records from the FDIC. Active enforcement actions (consent orders, MOUs, supervisory agreements) are not available in the FDIC's public data and cannot be shown by this tool."
            source="FDIC endpoint: /failures"
          />
        </div>
      </section>

      {/* Section 5: Peer Comparison */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Peer Comparison
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Each indicator includes a comparison to the institution&apos;s
          FDIC-defined peer group. Peer groups are determined by the FDIC&apos;s
          SPECGRP classification — the same grouping used in the FDIC&apos;s own
          Uniform Bank Performance Report (UBPR). The peer median is computed
          from all active institutions in the same group for the most recent
          quarter.
        </p>
      </section>

      {/* Section 6: Data Freshness */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Data Freshness
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          FDIC Call Report data is filed quarterly and typically becomes available
          45–60 days after quarter-end. We display the &ldquo;data as of&rdquo;
          date on every page. When data is 120 days or older, we display an
          additional warning that it may be significantly out of date.
        </p>
      </section>

      {/* Section 7: What's Not Covered */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          What&apos;s Not Covered
        </h2>
        <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
          <li>
            <strong>Credit unions</strong> are regulated by the NCUA, not the
            FDIC, and use a different data source. This tool covers FDIC-insured
            banks only.
          </li>
          <li>
            <strong>Active enforcement actions</strong> (consent orders,
            cease-and-desist orders, supervisory agreements) are published by the
            FDIC separately and are not queryable through the public data used by
            this tool.
          </li>
          <li>
            <strong>Net charge-off rate</strong> is not available as a
            pre-computed field in the FDIC public dataset.
          </li>
          <li>
            <strong>Investment advice</strong> — this tool shows institutional
            financial data. It does not tell you what to do with your money.
          </li>
        </ul>
      </section>

      {/* Section 8: Disclaimer */}
      <section className="mb-8 rounded-md bg-gray-50 border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Disclaimer</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          This tool is for informational purposes only. It does not constitute
          financial, investment, or legal advice. The data shown is sourced from
          public FDIC filings and may not reflect the institution&apos;s current
          condition. Always consult a qualified professional for financial
          decisions.
        </p>
      </section>

      {/* Footer */}
      <footer className="pt-6 border-t border-gray-200">
        <Link
          href="/"
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          ← Back to search
        </Link>
      </footer>
    </main>
  );
}

// --- Internal: indicator definition block ---

function IndicatorDefinition({
  name,
  description,
  source,
}: {
  name: string;
  description: string;
  source: string;
}) {
  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <h3 className="text-sm font-medium text-gray-800">{name}</h3>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
      <p className="text-xs text-gray-400 mt-0.5">{source}</p>
    </div>
  );
}
