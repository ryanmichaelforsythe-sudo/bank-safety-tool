// Institution detail page — full implementation in Tasks 11–19
export default function BankPage({ params }: { params: { cert: string } }) {
  return (
    <main className="min-h-screen p-8">
      <p className="text-gray-500">Institution detail for cert {params.cert} — coming in Task 12.</p>
    </main>
  );
}
