import { BULK_EXAMPLE, BULK_FORMAT_COLUMNS, BULK_FORMAT_HEADER } from '@/lib/category-match';
import { PRODUCT_UNITS } from '@/lib/product-units';

const COMMON_SLUGS = [
  'cement-ppc',
  'cement-opc',
  'tmt-8-12',
  'tmt-16-25',
  'river-sand',
  'm-sand',
  'red-brick',
  'floor-tiles',
  'wires-cables',
  'others-custom',
];

export default function BulkAddGuide() {
  return (
    <div className="space-y-4 mb-4">
      <p className="text-sm text-graphite-700 leading-relaxed">
        Har line = <strong>ek product</strong> aapki dukan ke liye. Columns ko pipe{' '}
        <span className="font-mono bg-concrete-100 px-1 rounded">|</span> se alag karein — order same hona chahiye:
      </p>

      <div className="overflow-x-auto rounded-lg border border-concrete-200 bg-white">
        <table className="w-full text-left text-xs min-w-[32rem]">
          <thead>
            <tr className="border-b border-concrete-200 bg-concrete-50">
              <th className="px-3 py-2.5 font-semibold text-graphite-800 w-28">#</th>
              <th className="px-3 py-2.5 font-semibold text-graphite-800 w-36">Column</th>
              <th className="px-3 py-2.5 font-semibold text-graphite-800">Matlab / Meaning</th>
            </tr>
          </thead>
          <tbody>
            {BULK_FORMAT_COLUMNS.map((col, i) => (
              <tr key={col.key} className="border-b border-concrete-100 last:border-0">
                <td className="px-3 py-2.5 font-mono text-rebar-600">{i + 1}</td>
                <td className="px-3 py-2.5">
                  <span className="font-mono font-medium text-ink">{col.key}</span>
                  <span className="block text-graphite-500 mt-0.5">{col.label}</span>
                </td>
                <td className="px-3 py-2.5 text-graphite-600 leading-relaxed">{col.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-graphite-800 bg-ink text-concrete-100 p-4 overflow-x-auto">
        <p className="text-[10px] uppercase tracking-wider text-graphite-400 mb-2">Format template</p>
        <p className="font-mono text-xs text-rebar-400 mb-3 whitespace-nowrap">{BULK_FORMAT_HEADER}</p>
        <p className="text-[10px] uppercase tracking-wider text-graphite-400 mb-2">Examples (copy & edit)</p>
        <pre className="font-mono text-xs leading-relaxed text-concrete-100 whitespace-pre-wrap">{BULK_EXAMPLE}</pre>
      </div>

      <p className="text-xs text-graphite-600">
        <span className="font-semibold">Common slugs:</span>{' '}
        {COMMON_SLUGS.join(', ')} … — poori list category dropdown se dekhein.
      </p>

      <div className="rounded-lg border border-concrete-200 bg-concrete-50 p-3">
        <p className="text-xs font-semibold text-graphite-800 mb-2">Common units (Bihar market)</p>
        <ul className="text-xs text-graphite-600 grid sm:grid-cols-2 gap-x-4 gap-y-1 max-h-40 overflow-y-auto">
          {PRODUCT_UNITS.map((u) => (
            <li key={u.value}>
              <span className="font-mono text-rebar-700">{u.value}</span> — {u.labelHi} ({u.hint.split('—')[0].trim()})
            </li>
          ))}
        </ul>
        <p className="text-xs text-graphite-600 mt-2 pt-2 border-t border-concrete-200">
          <span className="font-semibold">Delivery area?</span> Shop Studio → Storefront mein set karein (All Bihar / district / city).
          Bulk paste mein pincode column nahi chahiye.
        </p>
        <p className="text-xs text-graphite-600 mt-2 pt-2 border-t border-concrete-200">
          <span className="font-semibold">Custom unit?</span> Bulk paste mein koi bhi short text likh sakte ho —{' '}
          <span className="font-mono">peti</span>, <span className="font-mono">dozen</span>,{' '}
          <span className="font-mono">running ft</span>. Single add mein dropdown → Other.
        </p>
      </div>
    </div>
  );
}
