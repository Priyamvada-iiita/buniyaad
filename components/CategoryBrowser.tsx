import Link from 'next/link';

type Cat = { id: string; name: string; slug: string; parent_id: string | null };

export default function CategoryBrowser({
  parents,
  children,
  activeParentId,
  activeChildId,
  district,
  basePath = '/catalog',
  extraParams,
}: {
  parents: Cat[];
  children: Cat[];
  activeParentId?: string;
  activeChildId?: string;
  district?: string;
  basePath?: string;
  extraParams?: Record<string, string | undefined>;
}) {
  const buildHref = (categoryId?: string) => {
    const p = new URLSearchParams();
    if (categoryId) p.set('category', categoryId);
    if (district) p.set('district', district);
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v) p.set(k, v);
      });
    }
    const s = p.toString();
    return `${basePath}${s ? `?${s}` : ''}`;
  };

  const subs = activeParentId
    ? children.filter((c) => c.parent_id === activeParentId)
    : [];

  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase text-graphite-600 mb-3">Browse categories</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <Link
          href={buildHref()}
          className={`tag border ${!activeParentId ? 'bg-rebar-600 text-white border-rebar-600' : 'bg-white border-concrete-300 hover:border-rebar-500'}`}
        >
          All
        </Link>
        {parents.map((p) => (
          <Link
            key={p.id}
            href={buildHref(p.id)}
            className={`tag border ${
              activeParentId === p.id && !activeChildId
                ? 'bg-rebar-600 text-white border-rebar-600'
                : activeParentId === p.id
                ? 'bg-rebar-100 border-rebar-600 text-rebar-800'
                : 'bg-white border-concrete-300 hover:border-rebar-500'
            }`}
          >
            {p.name}
          </Link>
        ))}
      </div>
      {subs.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-1 border-l-2 border-rebar-200 ml-1">
          {subs.map((c) => (
            <Link
              key={c.id}
              href={buildHref(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                activeChildId === c.id
                  ? 'bg-steel-500 text-white border-steel-500'
                  : 'bg-concrete-50 border-concrete-200 hover:border-steel-500'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
