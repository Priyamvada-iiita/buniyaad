'use client';

import {
  CUSTOM_UNIT_VALUE,
  getUnitOptionLabel,
  PRODUCT_UNIT_GROUPS,
  PRODUCT_UNITS,
  sanitizeCustomUnitInput,
  UNITS_BY_PARENT_SLUG,
  type ProductUnit,
} from '@/lib/product-units';

export default function UnitSelectField({
  parentSlug,
  unit,
  unitCustom,
  onUnitChange,
  onUnitCustomChange,
}: {
  parentSlug?: string;
  unit: string;
  unitCustom: string;
  onUnitChange: (unit: string) => void;
  onUnitCustomChange: (text: string) => void;
}) {
  const isCustom = unit === CUSTOM_UNIT_VALUE;
  const recommended = (UNITS_BY_PARENT_SLUG[parentSlug || ''] || [])
    .map((v) => PRODUCT_UNITS.find((u) => u.value === v))
    .filter((u): u is ProductUnit => Boolean(u));
  const recommendedSet = new Set(recommended.map((u) => u.value));
  const groups = Object.keys(PRODUCT_UNIT_GROUPS) as ProductUnit['group'][];

  return (
    <div className="space-y-2">
      <select
        className="input-field"
        value={isCustom ? CUSTOM_UNIT_VALUE : unit}
        onChange={(e) => {
          const next = e.target.value;
          if (next === CUSTOM_UNIT_VALUE) {
            onUnitChange(CUSTOM_UNIT_VALUE);
          } else {
            onUnitChange(next);
            onUnitCustomChange('');
          }
        }}
      >
        {recommended.length > 0 ? (
          <optgroup label="Is category ke liye common">
            {recommended.map((u) => (
              <option key={u.value} value={u.value}>
                {getUnitOptionLabel(u)}
              </option>
            ))}
          </optgroup>
        ) : null}
        {groups.map((g) => {
          const units = PRODUCT_UNITS.filter((u) => u.group === g && !recommendedSet.has(u.value));
          if (!units.length) return null;
          return (
            <optgroup key={g} label={PRODUCT_UNIT_GROUPS[g]}>
              {units.map((u) => (
                <option key={u.value} value={u.value}>
                  {getUnitOptionLabel(u)}
                </option>
              ))}
            </optgroup>
          );
        })}
        <optgroup label="Apna unit">
          <option value={CUSTOM_UNIT_VALUE}>Other / अपना unit — custom count, length, etc.</option>
        </optgroup>
      </select>

      {isCustom ? (
        <div className="rounded-lg border border-rebar-200 bg-rebar-50/40 p-3 space-y-1.5">
          <label className="block text-xs font-semibold text-ink">Your custom unit</label>
          <p className="text-[11px] text-graphite-600 leading-relaxed">
            Jo bhi aap market mein bolte ho — peti, dozen, running ft, bhari, etc. Buyers ko price isi unit ke saath dikhega.
          </p>
          <input
            className="input-field"
            value={unitCustom}
            onChange={(e) => onUnitCustomChange(sanitizeCustomUnitInput(e.target.value))}
            placeholder="e.g. peti, dozen, running ft, भाड़ी"
            maxLength={32}
            required
          />
          {unitCustom.trim() ? (
            <p className="text-[11px] text-steel-700">
              Preview: ₹…/<span className="font-semibold">{unitCustom.trim()}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
