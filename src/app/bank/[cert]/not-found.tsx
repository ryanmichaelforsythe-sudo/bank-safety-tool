/**
 * Custom 404 for /bank/[cert] — actively recoverable.
 * Embeds BankSearch so user can search again without navigating back.
 * notFound() in page.tsx returns proper HTTP 404 status.
 */

import Link from "next/link";
import { BankSearch } from "@/components/search/BankSearch";

export default function BankNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="text-center mb-8 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">
          Institution not found
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          We couldn&apos;t find a bank with that FDIC certificate number. The
          number may be incorrect, or the institution may have been merged or
          closed before our data window.
        </p>
      </div>

      {/* Embedded search — user can try again without navigating */}
      <BankSearch />

      {/* Secondary link to FDIC BankFind */}
      <footer className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link
            href="https://www.fdic.gov/bank/individual/find/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700"
          >
            Search on FDIC BankFind
          </Link>
        </p>
      </footer>
    </main>
  );
}
