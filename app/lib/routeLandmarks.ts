// app/lib/routeLandmarks.ts
import type { Route } from "../types";

function normalize(name: string) {
  return name.toLowerCase().trim();
}

const LOCATION_LANDMARKS: Record<string, string[]> = {
  "cairns airport": [
    "Cairns Airport (Domestic & International)",
    "Captain Cook Highway",
  ],

  "cairns city": [
    "Cairns Esplanade",
    "Lagoon Precinct",
    "Cairns Marina",
  ],

  gordonvale: [
    "Mulgrave River",
    "Pyramid Mountain",
    "Bruce Highway",
  ],

  kuranda: [
    "Kuranda Rainforest Village",
    "Barron Falls",
    "Kuranda Scenic Railway",
  ],

  "mission beach": [
    "Mission Beach Coastline",
    "Cassowary Coast",
    "Clump Mountain National Park",
  ],

  "palm cove": [
    "Palm Cove Beach",
    "Palm Cove Jetty",
    "Clifton Beach",
  ],

  "port douglas": [
    "Four Mile Beach",
    "Macrossan Street",
    "Crystalbrook Marina",
  ],

  "skyrail smithfield": [
    "Skyrail Rainforest Cableway",
    "Barron Gorge National Park",
  ],

  tablelands: [
    "Atherton Tablelands",
    "Lake Barrine",
    "Lake Eacham",
  ],
};

const CORRIDOR_LANDMARKS = [
  "Captain Cook Highway coastal drive",
  "Great Barrier Reef coastline",
  "World Heritage Rainforest",
  "Scenic ocean viewpoints",
];

export function getLandmarks(route: Route): string[] {
  const from = normalize(route.from);
  const to = normalize(route.to);

  const landmarks = new Set<string>();

  LOCATION_LANDMARKS[from]?.forEach(l => landmarks.add(l));
  LOCATION_LANDMARKS[to]?.forEach(l => landmarks.add(l));

  // Coastal corridor logic
  if (
    (from.includes("cairns") && to.includes("port douglas")) ||
    (from.includes("palm cove") && to.includes("port douglas")) ||
    (from.includes("cairns") && to.includes("palm cove"))
  ) {
    CORRIDOR_LANDMARKS.forEach(l => landmarks.add(l));
    landmarks.add("Rex Lookout");
  }

  // Rainforest corridor logic
  if (to.includes("kuranda") || from.includes("kuranda")) {
    landmarks.add("Rainforest mountain road");
    landmarks.add("Barron Gorge");
  }

  // Fallback (always guaranteed)
  if (landmarks.size === 0) {
    landmarks.add("Scenic regional drive");
    landmarks.add("Tropical North Queensland landscapes");
  }

  return Array.from(landmarks).slice(0, 6);
}
