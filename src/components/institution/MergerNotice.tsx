/**
 * MergerNotice — contextual banner for merged institutions.
 * Shows acquiring institution name with optional link to their detail page.
 */

import Link from "next/link";
import type { MergerInfo } from "@/types/domain";

interface MergerNoticeProps {
  mergerInfo: MergerInfo;
}

export function MergerNotice({ mergerInfo }: MergerNoticeProps) {
  const { acquiringName, acquiringCert, effectiveDate } = mergerInfo;

  const dateStr = effectiveDate
    ? effectiveDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-sm font-semibold text-amber-800">
        Institution Merged
      </h2>
      <p className="mt-1 text-xs text-amber-700">
        This institution&apos;s charter has been absorbed into{" "}
        {acquiringCert ? (
          <Link
            href={`/bank/${acquiringCert}`}
            className="font-medium underline hover:text-amber-900"
          >
            {acquiringName}
          </Link>
        ) : (
          <strong>{acquiringName}</strong>
        )}
        {dateStr && <> as of {dateStr}</>}.
      </p>
    </div>
  );
}
