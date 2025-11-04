export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  if (!query) return null;

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    addressdetails: '0'
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      'Accept-Language': 'ja',
      'User-Agent': 'osanpo-biyori-calendar/0.1 (contact: example@example.com)'
    }
  });

  if (!response.ok) {
    console.error('ジオコーディングに失敗しました', response.statusText);
    return null;
  }

  const json = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!json.length) {
    return null;
  }

  return {
    lat: Number.parseFloat(json[0].lat),
    lng: Number.parseFloat(json[0].lon),
    displayName: json[0].display_name
  };
}
