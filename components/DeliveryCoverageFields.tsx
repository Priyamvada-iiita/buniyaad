'use client';

import {
  DELIVERY_SCOPE_OPTIONS,
  BIHAR_DISTRICTS,
  parseDeliveryDistricts,
  type DeliveryScope,
} from '@/lib/delivery-scope';

export default function DeliveryCoverageFields({
  scope,
  districts,
  shopDistrict,
  shopCity,
  onScopeChange,
  onDistrictsChange,
}: {
  scope: DeliveryScope;
  districts: string[];
  shopDistrict: string;
  shopCity: string;
  onScopeChange: (scope: DeliveryScope) => void;
  onDistrictsChange: (districts: string[]) => void;
}) {
  const toggleDistrict = (name: string) => {
    if (districts.includes(name)) {
      onDistrictsChange(districts.filter((d) => d !== name));
    } else {
      onDistrictsChange([...districts, name]);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-steel-200 bg-steel-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-ink">Delivery coverage</p>
        <p className="text-xs text-graphite-600 mt-1 leading-relaxed">
          Har product ke liye alag pincode nahi — ek baar yahan set karo, saari listings par lag jayega.
          Shop pincode upar sirf aapki dukan ka address hai.
        </p>
      </div>

      <div className="space-y-2">
        {DELIVERY_SCOPE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              scope === opt.value
                ? 'border-rebar-500 bg-white shadow-sm'
                : 'border-concrete-200 bg-white/80 hover:border-concrete-300'
            }`}
          >
            <input
              type="radio"
              name="delivery_scope"
              className="mt-1"
              checked={scope === opt.value}
              onChange={() => onScopeChange(opt.value)}
            />
            <span>
              <span className="block text-sm font-semibold">{opt.label}</span>
              <span className="block text-xs text-graphite-600 mt-0.5">{opt.hint}</span>
              {opt.value === 'my_district' && shopDistrict ? (
                <span className="block text-xs text-steel-700 mt-1 font-medium">→ {shopDistrict}</span>
              ) : null}
              {opt.value === 'my_city' && shopCity ? (
                <span className="block text-xs text-steel-700 mt-1 font-medium">→ {shopCity}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>

      {scope === 'custom_districts' ? (
        <div>
          <p className="text-xs font-semibold text-graphite-700 mb-2">Select districts you deliver to</p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded-lg border border-concrete-200">
            {BIHAR_DISTRICTS.map((d) => {
              const on = districts.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDistrict(d)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    on
                      ? 'bg-rebar-600 text-white border-rebar-600'
                      : 'bg-concrete-50 text-graphite-700 border-concrete-200 hover:border-rebar-300'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {districts.length === 0 ? (
            <p className="text-xs text-amber-800 mt-2">Kam se kam ek district chuno.</p>
          ) : (
            <p className="text-xs text-graphite-600 mt-2">{districts.length} district(s) selected</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function deliveryScopeFromProfile(profile: {
  delivery_scope?: string | null;
  delivery_districts?: unknown;
}): { scope: DeliveryScope; districts: string[] } {
  const scope = (profile.delivery_scope || 'my_district') as DeliveryScope;
  return {
    scope,
    districts: parseDeliveryDistricts(profile.delivery_districts),
  };
}
