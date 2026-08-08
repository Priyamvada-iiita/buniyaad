export default function SellerShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {title ? (
        <div className="mb-6">
          <h1 className="page-title mb-1">{title}</h1>
          {subtitle ? <p className="text-sm text-graphite-600">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </main>
  );
}
