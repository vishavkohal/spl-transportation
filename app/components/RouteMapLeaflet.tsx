'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

type Props = {
  fromLabel: string;
  toLabel: string;
  fromCoords: [number, number];
  toCoords: [number, number];
};

export default function RouteMapLeaflet({
  fromLabel,
  toLabel,
  fromCoords,
  toCoords,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<{
    distanceKm: number;
    durationMin: number;
  } | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let map: any;
    let cancelled = false;

    async function init() {
      const L = (await import('leaflet')).default;

      if (cancelled || !mapRef.current) return;

      // Guard against re-initialization (React Strict Mode / HMR)
      if ((mapRef.current as any)._leaflet_id) {
        return;
      }

      map = L.map(mapRef.current!, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.marker(fromCoords).addTo(map).bindPopup(fromLabel);
      L.marker(toCoords).addTo(map).bindPopup(toLabel);

      try {
        const res = await fetch(
          'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
          {
            method: 'POST',
            headers: {
              Authorization: process.env.NEXT_PUBLIC_ORS_KEY!,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coordinates: [
                [fromCoords[1], fromCoords[0]],
                [toCoords[1], toCoords[0]],
              ],
            }),
          }
        );

        const data = await res.json();

        if (cancelled || !data || !data.features || !data.features.length) {
          if (!cancelled) console.error('OpenRouteService API error:', data);
          return;
        }

        const routeLayer = L.geoJSON(data, {
          style: { color: '#A61924', weight: 5 },
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });

        const summary = data.features[0].properties.summary;
        setInfo({
          distanceKm: +(summary.distance / 1000).toFixed(1),
          durationMin: Math.round(summary.duration / 60),
        });
      } catch (err) {
        if (!cancelled) console.error('Route fetch failed:', err);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [fromCoords, toCoords, fromLabel, toLabel]);

  return (
    <div className="space-y-4">
      <div ref={mapRef} className="h-[420px] w-full rounded-3xl shadow-2xl" />

      {info && (
        <div className="flex gap-6 justify-center text-sm text-gray-700">
          <span>
            <strong>{info.distanceKm} km</strong> distance
          </span>
          <span>
            <strong>{info.durationMin} mins</strong> approx travel time
          </span>
        </div>
      )}
    </div>
  );
}
