export default function SellerLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 space-y-2 animate-pulse">
        <div className="h-8 w-40 bg-concrete-200 rounded" />
        <div className="h-4 w-72 max-w-full bg-concrete-100 rounded" />
      </div>
      <div className="space-y-3 animate-pulse">
        <div className="card h-28 bg-concrete-50" />
        <div className="card h-28 bg-concrete-50" />
        <div className="card h-28 bg-concrete-50" />
      </div>
    </main>
  );
}
