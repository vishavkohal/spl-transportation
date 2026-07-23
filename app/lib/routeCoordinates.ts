export const ROUTE_COORDS: Record<string, [number, number]> = {
  'cairns airport': [-16.8858, 145.7553],
  'cairns city': [-16.9186, 145.7781],
  'cairns': [-16.9186, 145.7781],
  'gordonvale': [-17.0977, 145.7802],
  'kuranda': [-16.8196, 145.6380],
  'mission beach': [-17.8681, 146.1046],
  'palm cove': [-16.7414, 145.6703],
  'port douglas': [-16.4837, 145.4630],
  'skyrail smithfield': [-16.8326, 145.6950],
  'smithfield': [-16.8326, 145.6950],
  'tablelands': [-17.2710, 145.4750],
  'atherton tablelands': [-17.2710, 145.4750],
  'trinity beach': [-16.7900, 145.6970],
  'clifton beach': [-16.7600, 145.6780],
  'kewarra beach': [-16.7800, 145.6880],
  'yorkeys knob': [-16.8100, 145.7170],
  'machans beach': [-16.8500, 145.7470],
  'holloways beach': [-16.8400, 145.7370],
  'mossman': [-16.4590, 145.3740],
  'daintree': [-16.2500, 145.3200],
};

export function getCoords(name: string): [number, number] {
  if (!name) return ROUTE_COORDS['cairns city'];

  const n = name.toLowerCase().trim();

  // 1. Exact match
  if (ROUTE_COORDS[n]) {
    return ROUTE_COORDS[n];
  }

  // 2. Partial/fuzzy match
  for (const [key, coords] of Object.entries(ROUTE_COORDS)) {
    if (n.includes(key) || key.includes(n)) {
      return coords;
    }
  }

  // 3. Fallback coordinates based on keywords
  if (n.includes('airport')) return ROUTE_COORDS['cairns airport'];
  if (n.includes('douglas')) return ROUTE_COORDS['port douglas'];
  if (n.includes('palm')) return ROUTE_COORDS['palm cove'];
  if (n.includes('kuranda')) return ROUTE_COORDS['kuranda'];

  // Default fallback to Cairns City
  return ROUTE_COORDS['cairns city'];
}
