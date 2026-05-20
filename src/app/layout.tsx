import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Is My Bank Safe?",
  description:
    "Look up any U.S. bank and see a plain-English read on its financial health, drawn from public FDIC data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global nav — Property 11: methodology link accessible from every page */}
        <nav className="border-b border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <Link href="/" className="font-medium hover:text-gray-700">
            Is My Bank Safe?
          </Link>
          <Link href="/methodology" className="hover:text-gray-700 underline">
            Methodology
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
