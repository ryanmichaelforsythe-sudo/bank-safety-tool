/**
 * RegulatoryStatusCard — the last of the 7 indicator cards.
 *
 * HARD CONSTRAINT (Property 19): warning treatment fires if and only if
 * the FDIC /failures endpoint returns a record for the institution.
 * Absence of enforcement-action queryability does NOT trigger a warning.
 *
 * Two modes:
 * - Mode A: failure record exists → danger treatment, show details
 * - Mode B: no failure record → neutral transparency disclosure
 *
 * Verified URL: https://orders.fdic.gov/s/ (FDIC Enforcement Orders portal)
 */

import Link from "next/link";
import type { FailureInfo } from "@/types/domain";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

const ENFORCEMENT_PORTAL_URL = "https://orders.fdic.gov/s/";

interface RegulatoryStatusCardProps {
  failureInfo: FailureInfo | null;
  dataAsOf: Date | null;
}

export function RegulatoryStatusCard({
  failureInfo,
  dataAsOf,
}: RegulatoryStatusCardProps) {
  // Mode A: failure/receivership record exists — warning fires
  if (failureInfo) {
    return <FailureMode failureInfo={failureInfo} dataAsOf={dataAsOf} />;
  }

  // Mode B: no failure record — neutral transparency disclosure
  return <NeutralMode dataAsOf={dataAsOf} />;
}

// --- Mode A: Failed Institution ---

function FailureMode({
  failureInfo,
  dataAsOf,
}: {
  failureInfo: FailureInfo;
  dataAsOf: Date | null;
}) {
  const { failDate, acquiringName } = failureInfo;

  const dateStr = failDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card aria-label="Regulatory Status indicator card">
      <CardHeader>
        <h3 className="text-base font-semibold text-gray-900">Regulatory Status</h3>
        <p className="text-xs text-gray-500">Failure and receivership records</p>
      </CardHeader>

      <CardContent>
        {/* Warning treatment — danger border and background */}
        <div className="rounded-md border border-red-300 bg-red-50 p-4 mb-4">
          <p className="text-sm font-semibold text-red-800">
            Failed Institution
          </p>
          <p className="mt-2 text-xs text-red-700">
            This institution was placed in FDIC receivership on {dateStr}.
            {acquiringName && (
              <> Deposits and assets were acquired by <strong>{acquiringName}</strong>.</>
            )}
          </p>
        </div>

        {/* Explanation */}
        <p className="text-xs text-gray-600 leading-relaxed">
          When a bank enters receivership, the FDIC takes control of the
          institution and works to resolve it — typically by selling its deposits
          and assets to another bank. Insured depositors are protected up to
          $250,000 per ownership category.
        </p>

        {/* Enforcement portal link */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            For enforcement orders related to this institution:{" "}
            <Link
              href={ENFORCEMENT_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Search FDIC Enforcement Orders →
            </Link>
          </p>
        </div>

        <DataAsOfFooter dataAsOf={dataAsOf} />
      </CardContent>
    </Card>
  );
}

// --- Mode B: No failure record — transparency disclosure ---

function NeutralMode({ dataAsOf }: { dataAsOf: Date | null }) {
  return (
    <Card aria-label="Regulatory Status indicator card">
      <CardHeader>
        <h3 className="text-base font-semibold text-gray-900">Regulatory Status</h3>
        <p className="text-xs text-gray-500">Failure, receivership, and enforcement records</p>
      </CardHeader>

      <CardContent>
        {/* Factual statement — scoped to what we queried */}
        <p className="text-sm text-gray-700 mb-3">
          No failure or receivership record was found for this institution in
          FDIC public data.
        </p>

        {/* Transparency disclosure — not an alarm, not a clean bill of health */}
        <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            Active enforcement actions — like consent orders, cease-and-desist
            orders, or supervisory agreements — are not available in the
            FDIC&apos;s public data. This tool cannot confirm or deny whether any
            such actions exist for this institution.
          </p>
          <p className="mt-2">
            <Link
              href={ENFORCEMENT_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              Search FDIC Enforcement Orders →
            </Link>
          </p>
        </div>

        {/* Explanation of what enforcement actions are */}
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          Enforcement actions are formal measures taken by banking regulators
          when they identify serious problems at an institution. They can range
          from memoranda of understanding (informal agreements to fix issues) to
          cease-and-desist orders (legally binding directives). The FDIC
          publishes these separately from the financial data used by this tool.
        </p>

        <DataAsOfFooter dataAsOf={dataAsOf} />
      </CardContent>
    </Card>
  );
}

function DataAsOfFooter({ dataAsOf }: { dataAsOf: Date | null }) {
  return (
    <p className="mt-3 text-xs text-gray-400">
      {dataAsOf
        ? `Data as of ${dataAsOf.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
        : "Data date unavailable"}
    </p>
  );
}
