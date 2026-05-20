/**
 * Institution detail page — Server Component.
 * Parallel data fetching via Promise.all.
 * Calls resolveInstitutionStatus once, passes context to all child components.
 * No "use client" — all rendering is server-side.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getInstitution } from "@/lib/fdic/institutions";
import { getFinancials, getPeerFinancials } from "@/lib/fdic/financials";
import { getFailureRecord } from "@/lib/fdic/failures";
import { resolveInstitutionStatus } from "@/lib/metrics/institutionStatus";
import { computeCapitalAdequacy } from "@/lib/metrics/capitalAdequacy";
import { computeAssetQuality, computeAssetQualityTrend } from "@/lib/metrics/assetQuality";
import { computeEarnings, computeEarningsTrend } from "@/lib/metrics/earnings";
import { computeLiquidity, computeLiquidityTrend } from "@/lib/metrics/liquidity";
import { computeUninsuredConcentration, computeDepositTrend } from "@/lib/metrics/deposits";
import { computePeerMedian, buildPeerComparison } from "@/lib/metrics/peers";
import { parseReportDate } from "@/lib/utils/dates";
import { InstitutionHeader } from "@/components/institution/InstitutionHeader";
import { InstitutionStatusBadge } from "@/components/institution/InstitutionStatusBadge";
import { DataFreshnessNotice } from "@/components/institution/DataFreshnessNotice";
import { FailureNotice } from "@/components/institution/FailureNotice";
import { MergerNotice } from "@/components/institution/MergerNotice";
import { NewlyCharteredNotice } from "@/components/institution/NewlyCharteredNotice";
import { CapitalAdequacyCard } from "@/components/cards/CapitalAdequacyCard";
import { AssetQualityCard } from "@/components/cards/AssetQualityCard";
import { EarningsCard } from "@/components/cards/EarningsCard";
import { LiquidityCard } from "@/components/cards/LiquidityCard";
import { UninsuredDepositCard } from "@/components/cards/UninsuredDepositCard";
import { DepositTrendCard } from "@/components/cards/DepositTrendCard";
import { RegulatoryStatusCard } from "@/components/cards/RegulatoryStatusCard";
import type { FailureInfo, MergerInfo } from "@/types/domain";

interface PageProps {
  params: { cert: string };
}

export default async function BankPage({ params }: PageProps) {
  const cert = parseInt(params.cert, 10);
  if (isNaN(cert)) {
    notFound();
  }

  // Parallel fetch — institution, financials, and failure fire simultaneously
  const [institution, financials, failure] = await Promise.all([
    getInstitution(cert),
    getFinancials(cert),
    getFailureRecord(cert),
  ]);

  if (!institution) {
    notFound();
  }

  // Fetch peer financials now that we know the SPECGRP
  const peerData = institution.SPECGRP
    ? await getPeerFinancials(institution.SPECGRP)
    : [];

  // Resolve institution status once — consumed by all downstream components
  const context = resolveInstitutionStatus(institution, financials, failure);

  // Build failure info for the notice component
  const failureInfo: FailureInfo | null = failure
    ? {
        failDate: parseReportDate(failure.FAILDATE) ?? new Date(),
        resolutionType: failure.RESTYPE,
        acquiringName: failure.BIDNAME,
        estimatedCost: failure.COST,
      }
    : null;

  // Build merger info (simplified — FDIC doesn't expose acquiring cert easily)
  const mergerInfo: MergerInfo | null =
    context.status === "merged" && institution.NAMEHCR
      ? {
          acquiringName: institution.NAMEHCR,
          acquiringCert: null, // Would need a separate lookup
          effectiveDate: institution.ENDEFYMD
            ? parseReportDate(institution.ENDEFYMD)
            : null,
        }
      : null;

  const isNewlyChartered = context.quartersAvailable > 0 && context.quartersAvailable < 4;

  // --- Compute Capital Adequacy metrics ---
  const mostRecentQuarter = financials[0] ?? null;
  const capitalMetrics = mostRecentQuarter
    ? computeCapitalAdequacy(mostRecentQuarter, context.dataAsOf ?? new Date(), context)
    : {
        totalCapitalRatio: { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null },
        leverageRatio: { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null },
        tier1Ratio: { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null },
        category: null,
      };

  // Peer comparisons for capital ratios
  const peerGroupName = institution.SPECGRPN ?? "Peer Group";
  const tier1PeerMedian = peerData.length > 0 ? computePeerMedian(peerData, "RBCT1J") : null;
  const totalPeerMedian = peerData.length > 0 ? computePeerMedian(peerData, "RBCRWAJ") : null;
  // Leverage peer median: compute EQ/ASSET for each peer
  const leveragePeerMedian = peerData.length > 0
    ? (() => {
        const ratios = peerData
          .filter((p) => p.EQ !== null && p.ASSET !== null && p.ASSET > 0)
          .map((p) => ((p.EQ as number) / (p.ASSET as number)) * 100);
        if (ratios.length === 0) return null;
        ratios.sort((a, b) => a - b);
        const mid = Math.floor(ratios.length / 2);
        return ratios.length % 2 === 0 ? (ratios[mid - 1] + ratios[mid]) / 2 : ratios[mid];
      })()
    : null;

  const tier1PeerComp = capitalMetrics.tier1Ratio.kind === "available"
    ? buildPeerComparison(capitalMetrics.tier1Ratio.value, tier1PeerMedian, peerGroupName)
    : null;
  const totalPeerComp = capitalMetrics.totalCapitalRatio.kind === "available"
    ? buildPeerComparison(capitalMetrics.totalCapitalRatio.value, totalPeerMedian, peerGroupName)
    : null;
  const leveragePeerComp = capitalMetrics.leverageRatio.kind === "available"
    ? buildPeerComparison(capitalMetrics.leverageRatio.value, leveragePeerMedian, peerGroupName)
    : null;

  // --- Compute Asset Quality metrics ---
  const assetQualityMetrics = mostRecentQuarter
    ? computeAssetQuality(mostRecentQuarter, context.dataAsOf ?? new Date(), context)
    : {
        nplRatio: { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null },
        chargeOffRate: { kind: "missing" as const, reason: "not_queryable" as const, asOf: null },
      };
  const nplTrend = computeAssetQualityTrend(financials, context);
  const nplPeerMedian = peerData.length > 0 ? computePeerMedian(peerData, "LNLSNTV") : null;
  const nplPeerComp = assetQualityMetrics.nplRatio.kind === "available"
    ? buildPeerComparison(assetQualityMetrics.nplRatio.value, nplPeerMedian, peerGroupName)
    : null;

  // --- Compute Earnings metrics ---
  const earningsMetrics = mostRecentQuarter
    ? computeEarnings(mostRecentQuarter, context.dataAsOf ?? new Date(), context)
    : {
        roa: { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null },
        nim: { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null },
      };
  const earningsTrend = computeEarningsTrend(financials, context);
  const roaPeerMedian = peerData.length > 0 ? computePeerMedian(peerData, "ROAQ") : null;
  const nimPeerMedian = peerData.length > 0 ? computePeerMedian(peerData, "NIMY") : null;
  const roaPeerComp = earningsMetrics.roa.kind === "available"
    ? buildPeerComparison(earningsMetrics.roa.value, roaPeerMedian, peerGroupName)
    : null;
  const nimPeerComp = earningsMetrics.nim.kind === "available"
    ? buildPeerComparison(earningsMetrics.nim.value, nimPeerMedian, peerGroupName)
    : null;

  // --- Compute Liquidity metrics ---
  const liquidityMetrics = mostRecentQuarter
    ? computeLiquidity(mostRecentQuarter, context.dataAsOf ?? new Date(), context)
    : {
        loanToDepositRatio: { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null },
        cashSecuritiesToAssetsRatio: { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null },
      };
  const liquidityTrend = computeLiquidityTrend(financials, context);
  const ltdPeerMedian = peerData.length > 0 ? computePeerMedian(peerData, "LNLSDEPR") : null;
  // Cash+securities/assets peer median: compute derived ratio for each peer
  const cashSecPeerMedian = peerData.length > 0
    ? (() => {
        const ratios = peerData
          .filter((p) => p.CASH !== null && p.SC !== null && p.ASSET !== null && (p.ASSET as number) > 0)
          .map((p) => (((p.CASH as number) + (p.SC as number)) / (p.ASSET as number)) * 100);
        if (ratios.length === 0) return null;
        ratios.sort((a, b) => a - b);
        const mid = Math.floor(ratios.length / 2);
        return ratios.length % 2 === 0 ? (ratios[mid - 1] + ratios[mid]) / 2 : ratios[mid];
      })()
    : null;
  const ltdPeerComp = liquidityMetrics.loanToDepositRatio.kind === "available"
    ? buildPeerComparison(liquidityMetrics.loanToDepositRatio.value, ltdPeerMedian, peerGroupName)
    : null;
  const cashSecPeerComp = liquidityMetrics.cashSecuritiesToAssetsRatio.kind === "available"
    ? buildPeerComparison(liquidityMetrics.cashSecuritiesToAssetsRatio.value, cashSecPeerMedian, peerGroupName)
    : null;

  // --- Compute Uninsured Deposit Concentration (snapshot only) ---
  const uninsuredConcentration = mostRecentQuarter
    ? computeUninsuredConcentration(mostRecentQuarter, context.dataAsOf ?? new Date(), context)
    : { kind: "missing" as const, reason: "data_not_reported" as const, asOf: null };
  // Peer median for uninsured concentration: compute (DEPNIDOM + DEPFOR) / DEP for each peer
  const uninsuredPeerMedian = peerData.length > 0
    ? (() => {
        const ratios = peerData
          .filter((p) => p.DEPNIDOM !== null && p.DEP !== null && (p.DEP as number) > 0)
          .map((p) => (((p.DEPNIDOM as number) + ((p.DEPFOR as number) ?? 0)) / (p.DEP as number)) * 100);
        if (ratios.length === 0) return null;
        ratios.sort((a, b) => a - b);
        const mid = Math.floor(ratios.length / 2);
        return ratios.length % 2 === 0 ? (ratios[mid - 1] + ratios[mid]) / 2 : ratios[mid];
      })()
    : null;
  const uninsuredPeerComp = uninsuredConcentration.kind === "available"
    ? buildPeerComparison(uninsuredConcentration.value, uninsuredPeerMedian, peerGroupName)
    : null;

  // --- Compute Deposit Trend (three series) ---
  const depositTrend = computeDepositTrend(financials, context);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Navigation */}
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Back to search
        </Link>
      </nav>

      {/* Institution header — all 6 fields (Property 16) */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-1">
          <InstitutionHeader institution={institution} />
        </div>
        <InstitutionStatusBadge status={context.status} />
      </div>

      {/* Data freshness — page-level with lag explainer */}
      <DataFreshnessNotice dataAsOf={context.dataAsOf} showLagExplainer />

      {/* Status-specific notices */}
      {failureInfo && <FailureNotice failureInfo={failureInfo} />}
      {mergerInfo && <MergerNotice mergerInfo={mergerInfo} />}
      {isNewlyChartered && (
        <NewlyCharteredNotice quartersAvailable={context.quartersAvailable} />
      )}

      {/* Indicator cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-1 lg:grid-cols-2" aria-label="Financial health indicators">
        {/* Capital Adequacy — Task 12 */}
        <CapitalAdequacyCard
          category={capitalMetrics.category}
          tier1Ratio={capitalMetrics.tier1Ratio}
          totalCapitalRatio={capitalMetrics.totalCapitalRatio}
          leverageRatio={capitalMetrics.leverageRatio}
          tier1PeerComparison={tier1PeerComp}
          totalPeerComparison={totalPeerComp}
          leveragePeerComparison={leveragePeerComp}
          dataAsOf={context.dataAsOf}
        />
        {/* Remaining 6 cards — Tasks 14-19 */}
        <AssetQualityCard
          nplRatio={assetQualityMetrics.nplRatio}
          chargeOffRate={assetQualityMetrics.chargeOffRate}
          nplPeerComparison={nplPeerComp}
          nplTrend={nplTrend}
          cert={cert}
          dataAsOf={context.dataAsOf}
        />
        {/* Remaining 5 cards — Tasks 15-19 */}
        <EarningsCard
          roa={earningsMetrics.roa}
          nim={earningsMetrics.nim}
          roaPeerComparison={roaPeerComp}
          nimPeerComparison={nimPeerComp}
          roaTrend={earningsTrend.roaTrend}
          nimTrend={earningsTrend.nimTrend}
          dataAsOf={context.dataAsOf}
        />
        {/* Remaining 4 cards — Tasks 16-19 */}
        <LiquidityCard
          loanToDepositRatio={liquidityMetrics.loanToDepositRatio}
          cashSecuritiesToAssetsRatio={liquidityMetrics.cashSecuritiesToAssetsRatio}
          ltdPeerComparison={ltdPeerComp}
          cashSecPeerComparison={cashSecPeerComp}
          ltdTrend={liquidityTrend.loanToDepositTrend}
          cashSecTrend={liquidityTrend.cashSecuritiesTrend}
          dataAsOf={context.dataAsOf}
        />
        {/* Remaining 3 cards — Tasks 17-19 */}
        <UninsuredDepositCard
          uninsuredConcentration={uninsuredConcentration}
          peerComparison={uninsuredPeerComp}
          dataAsOf={context.dataAsOf}
        />
        {/* Remaining 2 cards — Tasks 18-19 */}
        <DepositTrendCard
          depositTrend={depositTrend}
          peerComparison={null}
          dataAsOf={context.dataAsOf}
          quartersAvailable={context.quartersAvailable}
        />
        {/* Remaining 1 card — Task 19 */}
        <RegulatoryStatusCard
          failureInfo={failureInfo}
          dataAsOf={context.dataAsOf}
        />
      </section>

      {/* Methodology link */}
      <footer className="mt-12 pt-6 border-t border-gray-200">
        <Link
          href="/methodology"
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          How we calculate this
        </Link>
      </footer>
    </main>
  );
}
