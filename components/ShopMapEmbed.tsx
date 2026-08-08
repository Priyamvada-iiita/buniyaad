import { mapsEmbedUrl, mapsDirectionsUrl } from '@/lib/maps';

export default function ShopMapEmbed({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-concrete-200 bg-concrete-50">
      <iframe
        title={title || 'Shop location'}
        src={mapsEmbedUrl(lat, lng)}
        className="w-full h-52 md:h-64 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="px-4 py-3 flex items-center justify-between gap-2 bg-white border-t border-concrete-100">
        <p className="text-xs text-graphite-600 truncate">
          📍 {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
        <a
          href={mapsDirectionsUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-rebar-600 hover:underline shrink-0"
        >
          Open in Google Maps →
        </a>
      </div>
    </div>
  );
}

export function ShopMapPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-concrete-300 bg-concrete-50 h-40 flex items-center justify-center text-sm text-graphite-500">
      No map location added yet
    </div>
  );
}

export function ShopMapFromProfile({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  if (lat == null || lng == null) return <ShopMapPlaceholder />;
  return <ShopMapEmbed lat={lat} lng={lng} />;
}
