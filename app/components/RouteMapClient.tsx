'use client';

import RouteMapLeaflet from './RouteMapLeaflet';
import { getCoords } from '../lib/routeCoordinates';

type Props = {
  from: string;
  to: string;
};

export default function RouteMapClient({ from, to }: Props) {
  const fromCoords = getCoords(from);
  const toCoords = getCoords(to);

  if (!fromCoords || !toCoords) return null;

  return (
    <RouteMapLeaflet
      fromLabel={from}
      toLabel={to}
      fromCoords={fromCoords}
      toCoords={toCoords}
    />
  );
}
