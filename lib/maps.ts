export type MapCoords = { lat: number; lng: number };

/** Parse lat/lng from a Google Maps share or search URL. */
export function parseGoogleMapsUrl(input: string): MapCoords | null {
  const url = input.trim();
  if (!url) return null;

  const at = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };

  const q = url.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) };

  const ll = url.match(/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (ll) return { lat: parseFloat(ll[1]), lng: parseFloat(ll[2]) };

  return null;
}

export function mapsEmbedUrl(lat: number, lng: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}

export function mapsDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function hasMapLocation(profile: {
  map_lat?: number | null;
  map_lng?: number | null;
}): profile is { map_lat: number; map_lng: number } {
  return profile.map_lat != null && profile.map_lng != null;
}
