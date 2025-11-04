'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';

// Leafletはクライアントサイド専用のため動的importで対応
export default function MapPreview({
  lat,
  lng,
  address
}: {
  lat: number | null;
  lng: number | null;
  address?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) {
      return;
    }

    const loadMap = async () => {
      const L = await import('leaflet');
      if (instanceRef.current) {
        instanceRef.current.remove();
      }
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      L.marker([lat, lng]).addTo(map);
      instanceRef.current = map;
    };

    void loadMap();

    return () => {
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div className="w-full">
      <div
        ref={mapRef}
        className="h-40 w-full overflow-hidden rounded-xl border border-slate-200"
        aria-label="登録住所周辺の地図プレビュー"
      />
      <p className="mt-2 text-xs text-slate-500">
        {address ? `住所: ${address}` : '住所情報がまだ登録されていません'}
      </p>
    </div>
  );
}
