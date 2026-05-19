/**
 * Institution detail page — Server Component.
 * Parallel data fetching via Promise.all.
 * Calls resolveInstitutionStatus once, passes context to all child components.
 * No "use client" — all rendering is server-side.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getInstitution } from "@/lib/fdic/institutions";
import { getFinancials } from "@/lib/fdic/financials";
import { getFailureRecord } from "@/lib/fdic/failures";
import { resolveInstitutionStatus } from "@/lib/metrics/institutionStatus";
import { parseReportDate } from "@/lib/utils/dates";
import { InstitutionHeader } from "@/components/institution/InstitutionHeader";
import { InstitutionStatusBadge } from "@/components/institution/InstitutionStatusBadge";
import { DataFreshnessNotice } from "@/components/institution/DataFreshnessNotice";
import { FailureNotice } from "@/components/institution/FailureNotice";
import { MergerNotice } from "@/components/institution/MergerNotice";
import { NewlyCharteredNotice } from "@/components/institution/NewlyCharteredNotice";
import type { FailureInfo, MergerInfo } from "@/types/domain";

interface PageProps {
  params: { cert: string };
}

export default async function BankPage({ params }: PageProps) {
  const cert = parseInt(params.cert, 10);
  if (isNaN(cert)) {
    notFound();
  }

  // Parallel fetch — all three calls fire simultaneously
  const [institution, financials, failure] = await Promise.all([
    getInstitution(cert),
    getFinancials(cert),
    getFailureRecord(cert),
  ]);

  if (!institution) {
    notFound();
  }

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

      {/* Indicator cards placeholder — Tasks 12-19 */}
      <section className="mt-8" aria-label="Financial health indicators">
        <p className="text-sm text-gray-400">
          Indicator cards will render here (Tasks 12–19).
        </p>
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
