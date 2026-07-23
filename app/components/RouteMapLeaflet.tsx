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

      // Initialize map centered at origin
      map = L.map(mapRef.current!, {
        center: fromCoords,
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom styled badge marker icons
      const createBadgeIcon = (label: string, isOrigin: boolean) => {
        const bg = isOrigin ? '#102A43' : '#0F766E';
        return L.divIcon({
          className: 'custom-leaflet-badge',
          html: `
            <div style="
              background-color: ${bg};
              color: white;
              padding: 5px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              font-family: system-ui, sans-serif;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              border: 2px solid white;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 6px;
              cursor: pointer;
            ">
              <span style="
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background-color: ${isOrigin ? '#2DD4BF' : '#4ADE80'};
                display: inline-block;
              "></span>
              ${label}
            </div>
          `,
          iconSize: [120, 36],
          iconAnchor: [60, 18],
        });
      };

      // Add markers
      const originMarker = L.marker(fromCoords, {
        icon: createBadgeIcon(fromLabel, true),
      }).addTo(map);
      originMarker.bindPopup(`<b>Pickup:</b> ${fromLabel}`);

      const destMarker = L.marker(toCoords, {
        icon: createBadgeIcon(toLabel, false),
      }).addTo(map);
      destMarker.bindPopup(`<b>Dropoff:</b> ${toLabel}`);

      // Fallback straight line polyline immediately
      const fallbackPolyline = L.polyline([fromCoords, toCoords], {
        color: '#0F766E',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.8,
      }).addTo(map);

      // Fit map to markers bounds immediately
      const bounds = L.latLngBounds([fromCoords, toCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });

      // Try fetching driving route from OpenRouteService if API key present
      const apiKey = process.env.NEXT_PUBLIC_ORS_KEY;
      if (apiKey) {
        try {
          const res = await fetch(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            {
              method: 'POST',
              headers: {
                Authorization: apiKey,
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

          if (res.ok) {
            const data = await res.json();
            if (!cancelled && data?.features?.length) {
              // Remove fallback line and add actual driving route
              map.removeLayer(fallbackPolyline);

              const routeLayer = L.geoJSON(data, {
                style: { color: '#0F766E', weight: 5, opacity: 0.9 },
              }).addTo(map);

              map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });

              const summary = data.features[0].properties.summary;
              if (summary) {
                setInfo({
                  distanceKm: +(summary.distance / 1000).toFixed(1),
                  durationMin: Math.round(summary.duration / 60),
                });
              }
            }
          }
        } catch (err) {
          // Fallback line remains if ORS fetch encounters an error
          console.warn('ORS driving route fetch fallback active:', err);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [fromCoords, toCoords, fromLabel, toLabel]);

  return (
    <div className="w-full h-full min-h-[380px] flex flex-col justify-between">
      <div ref={mapRef} className="w-full h-full min-h-[360px] rounded-2xl overflow-hidden z-0" />

      {info && (
        <div className="flex gap-6 justify-center text-xs font-semibold text-slate-700 pt-2 bg-slate-50 p-2 border-t border-slate-100">
          <span>
            <strong className="text-[#0F766E]">{info.distanceKm} km</strong> distance
          </span>
          <span>
            <strong className="text-[#0F766E]">{info.durationMin} mins</strong> estimated drive time
          </span>
        </div>
      )}
    </div>
  );
}
