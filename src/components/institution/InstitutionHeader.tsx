/**
 * InstitutionHeader — renders all 6 required fields (Property 16):
 * name, city/state, charter type, asset size, year founded, cert number.
 *
 * Field labels and formatting consistent with FDIC examiner expectations.
 */

import type { FDICInstitution } from "@/types/fdic";
import { formatCurrency } from "@/lib/utils/formatters";

interface InstitutionHeaderProps {
  institution: FDICInstitution;
}

/** Map FDIC charter agent codes to human-readable labels */
const CHARTER_TYPE_MAP: Record<string, string> = {
  OCC: "National Bank",
  STATE: "State-Chartered Bank",
  OTS: "Savings Institution",
  FDIC: "State-Chartered Bank",
};

function getCharterType(chrtagnt: string | null): string {
  if (!chrtagnt) return "Not reported";
  return CHARTER_TYPE_MAP[chrtagnt.toUpperCase()] ?? chrtagnt;
}

function getYearFounded(estymd: string | null): string {
  if (!estymd) return "Not reported";
  // Format is MM/DD/YYYY — extract year
  const parts = estymd.split("/");
  if (parts.length === 3) return `Est. ${parts[2]}`;
  return "Not reported";
}

export function InstitutionHeader({ institution }: InstitutionHeaderProps) {
  const {
    NAME,
    CITY,
    STALP,
    CHRTAGNT,
    ASSET,
    ESTYMD,
    CERT,
  } = institution;

  return (
    <header className="mb-6">
      {/* Institution name */}
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {NAME}
      </h1>

      {/* Secondary details — all 6 fields */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        {/* City/State */}
        <span>{CITY}, {STALP}</span>

        {/* Charter type */}
        <span className="hidden sm:inline">·</span>
        <span>{getCharterType(CHRTAGNT)}</span>

        {/* Asset size */}
        <span className="hidden sm:inline">·</span>
        <span>
          {ASSET != null ? `${formatCurrency(ASSET)} in total assets` : "Assets not reported"}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        {/* Year founded */}
        <span>{getYearFounded(ESTYMD)}</span>

        {/* FDIC cert number */}
        <span>·</span>
        <span>FDIC Certificate #{CERT}</span>
      </div>
    </header>
  );
}
