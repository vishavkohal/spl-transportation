'use client';

import dynamic from 'next/dynamic';
import { getCoords } from '../lib/routeCoordinates';

const RouteMapLeaflet = dynamic(() => import('./RouteMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs font-semibold">
      Loading Interactive Map…
    </div>
  ),
});

type Props = {
  from: string;
  to: string;
};

export default function RouteMapClient({ from, to }: Props) {
  const fromCoords = getCoords(from);
  const toCoords = getCoords(to);

  return (
    <RouteMapLeaflet
      fromLabel={from}
      toLabel={to}
      fromCoords={fromCoords}
      toCoords={toCoords}
    />
  );
}
