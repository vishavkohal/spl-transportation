// app/lib/blogPosts.ts
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date string
  updatedAt?: string;
  readMinutes: number;
  tags: string[];
  // simple string content; you can later switch to MDX
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "top-places-to-visit-in-cairns-tropical-north-queensland",
    title: "Top Places to Visit in Cairns & Tropical North Queensland (2025 Travel Guide)",
    excerpt:
      "From Kuranda Koala Gardens and Palm Cove Beach to Port Douglas, Mission Beach, Green Island, Fitzroy Island and the Great Barrier Reef – discover the must-visit places in Tropical North Queensland and how to get there easily with private transfers.",
    publishedAt: "2025-12-08T00:00:00.000Z",
    updatedAt: "2025-12-08T00:00:00.000Z",
    readMinutes: 9,
    tags: [
      "Cairns",
      "Port Douglas",
      "Palm Cove",
      "Kuranda",
      "Mission Beach",
      "Great Barrier Reef",
      "Travel Guide",
      "Queensland"
    ],
    content: `
<p>Tropical North Queensland is a world-renowned destination filled with rainforests, beaches, wildlife encounters, reef excursions and scenic day trips. Whether you're visiting Cairns for a family holiday, a romantic escape, or a nature-packed adventure, this guide highlights the best attractions you simply cannot miss.</p>

<p>Private transfers and shuttle services make exploring the region easier than ever — from Palm Cove to Port Douglas, Kuranda to Mission Beach, and the iconic Great Barrier Reef.</p>

<hr />

<h2>🐨 1. Kuranda Koala Gardens</h2>
<p><strong>Best for:</strong> Families, wildlife lovers, first-time visitors<br />
<strong>Location:</strong> Kuranda Village<br />
<strong>Google Maps:</strong> <a href="https://share.google/Vg0VSQeVCuBKnDQ1E" target="_blank" rel="noopener noreferrer">Kuranda Koala Gardens</a></p>

<p>Kuranda Koala Gardens is one of the only places in Queensland where visitors can enjoy close-up encounters with koalas, wallabies, reptiles and wombats. This boutique wildlife attraction is tucked inside the famous Kuranda Heritage Markets, making it a perfect addition to any Kuranda day trip.</p>

<p>Visitors can cuddle a koala (extra charge), take wildlife photos, and explore the surrounding rainforest village at a relaxed pace.</p>

<hr />

<h2>🏖️ 2. Palm Cove Beach</h2>
<p><strong>Best for:</strong> Relaxation, luxury resorts, sunrise walks<br />
<strong>Location:</strong> Palm Cove Esplanade<br />
<strong>Google Maps:</strong> <a href="https://share.google/ANTdlPv7UwTFq4WQa" target="_blank" rel="noopener noreferrer">Palm Cove Beach</a></p>

<p>Palm Cove Beach is one of the most picturesque coastlines in Australia — lined with palm trees, beachfront spas, boutique resorts and high-end dining. Its calm waters and tropical atmosphere make it a favourite for couples and families alike.</p>

<p>Private transfers from Cairns Airport to Palm Cove are among the most popular routes for visitors seeking a peaceful beachfront escape close to Cairns.</p>

<hr />

<h2>🌊 3. Cairns Esplanade Lagoon</h2>
<p><strong>Best for:</strong> Families, budget-friendly activities, swimming<br />
<strong>Location:</strong> Cairns CBD<br />
<strong>Google Maps:</strong> <a href="https://share.google/aUebrtjU6HzNeW1tM" target="_blank" rel="noopener noreferrer">Cairns Esplanade Lagoon</a></p>

<p>The Cairns Lagoon is an iconic saltwater swimming pool overlooking the esplanade and Coral Sea. It’s free, lifeguard-patrolled, and surrounded by BBQ areas, walking tracks and shaded lawns. This is the perfect spot to cool off on a hot day between tours and outdoor activities.</p>

<hr />

<h2>🚡 4. Skyrail Rainforest Cableway</h2>
<p><strong>Best for:</strong> Nature lovers, photographers, families<br />
<strong>Location:</strong> Smithfield Terminal (north of Cairns City)<br />
<strong>Google Maps:</strong> <a href="https://share.google/UzaR2p5oBMLFaW1Pr" target="_blank" rel="noopener noreferrer">Skyrail Rainforest Cableway</a></p>

<p>The Skyrail Rainforest Cableway glides above UNESCO-listed rainforest, offering breathtaking views of waterfalls, mountains and dense ancient canopies. Stops at Red Peak and Barron Falls provide boardwalk lookouts and guided ranger tours.</p>

<p>Many visitors combine Skyrail with the Kuranda Scenic Railway for a full-day rainforest adventure.</p>

<hr />

<h2>🏖️ 5. Trinity Beach</h2>
<p><strong>Best for:</strong> Quiet beach stays, local cafes, coastal walks<br />
<strong>Google Maps:</strong> <a href="https://share.google/2KnRP2kGUzqFpNJtr" target="_blank" rel="noopener noreferrer">Trinity Beach</a></p>

<p>Trinity Beach is a quieter alternative to Palm Cove, offering relaxed beachfront dining and scenic coastal walks. It’s perfect for travellers looking for a peaceful seaside stay within around 20 minutes of Cairns Airport.</p>

<hr />

<h2>🌴 6. Port Douglas</h2>
<p><strong>Best for:</strong> Reef tours, luxury resorts, Four Mile Beach<br />
<strong>Travel time from Cairns:</strong> Approx. 60–70 minutes by road<br />
<strong>Google Maps:</strong> <a href="https://share.google/q4cEeQu6QXwwajlEf" target="_blank" rel="noopener noreferrer">Port Douglas</a></p>

<p>Port Douglas is the gateway to the world-famous Great Barrier Reef and Daintree Rainforest. Its palm-lined Four Mile Beach is ideal for long walks, swimming, and sunset views, while Macrossan Street offers boutiques, restaurants and bars.</p>

<p>Private transfers between Cairns Airport and Port Douglas are among the most in-demand services for international travellers, especially during the dry season.</p>

<hr />

<h2>🏝️ 7. Mission Beach</h2>
<p><strong>Best for:</strong> Secluded beaches, skydiving, reef access<br />
<strong>Google Maps:</strong> <a href="https://share.google/L691BPdN4CjB8Bkxh" target="_blank" rel="noopener noreferrer">Mission Beach</a></p>

<p>Mission Beach is a tropical paradise roughly halfway between Cairns and Townsville. It’s known for cassowary sightings, world-class skydiving over the reef and islands, and easy access to Dunk Island.</p>

<p>The quiet beachfront vibe makes it a favourite among nature seekers and adventure travellers looking to slow down and enjoy the coastline.</p>

<hr />

<h2>🌿 8. Paronella Park</h2>
<p><strong>Best for:</strong> History lovers, photographers, romantic trips<br />
<strong>Google Maps:</strong> <a href="https://share.google/isRZxxcQD8co3RQjG" target="_blank" rel="noopener noreferrer">Paronella Park</a></p>

<p>Paronella Park is a magical heritage-listed site featuring Spanish-inspired castle ruins, waterfalls, lush gardens and atmospheric night tours. Built in the 1930s, it remains one of Queensland’s most unique attractions.</p>

<p>Many visitors pair Paronella Park with the Atherton Tablelands waterfall circuit, making it a full-day experience from Cairns.</p>

<hr />

<h2>🦋 9. Australian Butterfly Sanctuary</h2>
<p><strong>Best for:</strong> Families, rainforest enthusiasts, photographers<br />
<strong>Location:</strong> Kuranda Village<br />
<strong>Google Maps:</strong> <a href="https://share.google/LLhWudXD9dTD3HT4p" target="_blank" rel="noopener noreferrer">Australian Butterfly Sanctuary</a></p>

<p>The sanctuary is Australia’s largest butterfly aviary, home to over 1,500 tropical butterflies including the bright blue Ulysses and the green-gold Cairns Birdwing. It’s a great educational experience for kids and adults, and pairs perfectly with Kuranda Koala Gardens on the same day.</p>

<hr />

<h2>🪸 10. The Great Barrier Reef</h2>
<p><strong>Best for:</strong> Snorkelling, scuba diving, reef cruises<br />
<strong>Google Maps:</strong> <a href="https://share.google/ecuuvbaTPybzAixe4" target="_blank" rel="noopener noreferrer">Great Barrier Reef</a></p>

<p>No trip to Cairns is complete without visiting the Great Barrier Reef — the largest coral ecosystem on Earth. From half-day snorkel tours to full-day diving expeditions, the reef offers breathtaking marine life, coral formations and tropical islands.</p>

<p>Most reef tours depart from the Cairns Marina or Port Douglas, and hotel or private transfers can easily get you to the departure point on time.</p>

<hr />

<h2>🏝️ 11. Green Island</h2>
<p><strong>Best for:</strong> Short island trips, snorkelling, glass-bottom boats<br />
<strong>Google Maps:</strong> <a href="https://share.google/tT9qWsqHTu3tFBLUb" target="_blank" rel="noopener noreferrer">Green Island</a></p>

<p>Green Island is a 45-minute ferry ride from Cairns and offers beaches, rainforest boardwalks and easy snorkelling straight off the beach. It’s a great choice for families and travellers wanting a half-day or full-day island escape without long travel times.</p>

<hr />

<h2>🏝️ 12. Fitzroy Island</h2>
<p><strong>Best for:</strong> Hiking, snorkelling, turtles, Nudey Beach<br />
<strong>Google Maps:</strong> <a href="https://share.google/46O8qzT7eZhpWsHei" target="_blank" rel="noopener noreferrer">Fitzroy Island</a></p>

<p>Fitzroy Island is one of the most beautiful islands off Cairns, known for coral beaches, rainforest trails and the stunning Nudey Beach — often listed among Australia’s best beaches. You can hike, snorkel with turtles, kayak or simply relax by the shoreline.</p>

<hr />

<h2>🚐 Getting Around: Private Transfers in Cairns & Tropical North Queensland</h2>

<p>Exploring the region is easiest with <strong>pre-booked private airport transfers, hotel pickups and door-to-door shuttles</strong>. Popular routes include:</p>

<ul>
  <li>Cairns Airport → Port Douglas</li>
  <li>Cairns Airport → Palm Cove</li>
  <li>Cairns Airport → Cairns City</li>
  <li>Cairns City → Kuranda / Skyrail</li>
  <li>Cairns City → Mission Beach</li>
  <li>Cairns City → Atherton Tablelands &amp; Paronella Park</li>
</ul>

<p>Booking a private transfer means your driver is waiting when you land, your vehicle is sized correctly for your group and luggage, and your price is fixed in advance in Australian dollars. It’s the most comfortable, stress-free way to start or end your trip in Tropical North Queensland.</p>

<p>If you're planning to visit several of the locations above, consider grouping attractions by direction — for example, a northern beaches and Port Douglas day, a Kuranda and Skyrail day, and a southern tablelands and Paronella Park day — and arranging transfers or tours accordingly.</p>
`
  }
];
