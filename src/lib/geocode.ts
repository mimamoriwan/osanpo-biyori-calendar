export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Nominatim (OpenStreetMap) を使用して住所から緯度経度を取得
 * 利用規約: https://operations.osmfoundation.org/policies/nominatim/
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&addressdetails=1&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'osanpo-biyori-calendar/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      return null;
    }

    const result = data[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * 緯度経度から住所を取得（逆ジオコーディング）
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'osanpo-biyori-calendar/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};
