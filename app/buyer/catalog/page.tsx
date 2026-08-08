import { redirect } from 'next/navigation';

export default function BuyerCatalogRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const p = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (typeof v === 'string') p.set(k, v);
  });
  const q = p.toString();
  redirect(q ? `/catalog?${q}` : '/catalog');
}
