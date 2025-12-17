export const ROUTE_COORDS: Record<string, [number, number]> = {
  'cairns airport': [-16.8858, 145.7553],
  'cairns city': [-16.9186, 145.7781],
  'gordonvale': [-17.0977, 145.7802],
  'kuranda': [-16.8196, 145.6380],
  'mission beach': [-17.8681, 146.1046],
  'palm cove': [-16.7414, 145.6703],
  'port douglas': [-16.4837, 145.4630],
  'skyrail smithfield': [-16.8326, 145.6950],
  'tablelands': [-17.2710, 145.4750],
};

export function getCoords(name: string) {
  return ROUTE_COORDS[name.toLowerCase()];
}
