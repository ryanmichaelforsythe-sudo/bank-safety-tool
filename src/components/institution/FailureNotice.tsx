/**
 * FailureNotice — full-width alert banner for institutions in receivership.
 * Most prominent status notice — this is the most material information.
 */

import type { FailureInfo } from "@/types/domain";

interface FailureNoticeProps {
  failureInfo: FailureInfo;
}

export function FailureNotice({ failureInfo }: FailureNoticeProps) {
  const { failDate, resolutionType, acquiringName } = failureInfo;

  const dateStr = failDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      role="alert"
      className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4"
    >
      <h2 className="text-sm font-semibold text-red-800">
        In FDIC Receivership since {dateStr}
      </h2>
      <p className="mt-1 text-xs text-red-700">
        This institution was placed in FDIC receivership
        {resolutionType && ` (${resolutionType.toLowerCase()})`}.
        {acquiringName && (
          <> Its deposits and assets were acquired by <strong>{acquiringName}</strong>.</>
        )}
      </p>
    </div>
  );
}
