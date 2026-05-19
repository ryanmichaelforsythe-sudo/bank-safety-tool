import Link from "next/link";
import { BankSearch } from "@/components/search/BankSearch";

/**
 * Home page — server component shell with client search island.
 * Clean single-input entry point per UI principles.
 */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Is My Bank Safe?
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-md mx-auto">
          Look up any U.S. bank and see a plain-English read on its financial
          health, drawn from public FDIC data.
        </p>
      </div>

      {/* Search island (client component) */}
      <BankSearch />

      {/* Footer links */}
      <footer className="mt-12 text-center">
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
