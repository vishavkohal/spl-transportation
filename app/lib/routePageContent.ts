import type { Route } from "../types";

export type RoutePageContent = {
  intro: {
    h2: string;
    paragraphs: string[];
    bullets: string[];
    cta: string;
  };
  destination: {
    h3: string;
    paragraphs: string[];
  };
  travelOptions: {
    h4: string;
    paragraphs: string[];
  };
  whyUs: {
    h2: string;
    paragraphs: string[];
    bullets: string[];
    cta: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
};

function key(from: string, to: string) {
  return `${from.toLowerCase()}__${to.toLowerCase()}`;
}

export const ROUTE_PAGE_CONTENT: Record<string, RoutePageContent> = {
  /* -------------------------------------------------
     CAIRNS AIRPORT → PORT DOUGLAS
  -------------------------------------------------- */
  [key("Cairns Airport", "Port Douglas")]: {
    intro: {
      h2:
        "Cairns Airport to Port Douglas: Safe, Reliable, and Premium Ride Transfer Services from SPL Transportation",
      paragraphs: [
        "Have you been planning a trip from Cairns to Port Douglas? At SPL Transportation, we provide safe, reliable, and professional Cairns Airport to Port Douglas transfers.",
        "Whether you are arriving at Cairns Airport or travelling from the city, our private transfers ensure a smooth, stress-free journey."
      ],
      bullets: [
        "Safe, reliable and stress-free transfers",
        "Professional local drivers",
        "Easy online booking with instant confirmation",
        "Modern, clean and air-conditioned vehicles"
      ],
      cta:
        "Book your Cairns Airport to Port Douglas transfer with SPL Transportation today!"
    },

    destination: {
      h3:
        "Why Visit Port Douglas from Cairns?",
      paragraphs: [
        "Port Douglas is a laid-back tropical town and a gateway to the Great Barrier Reef and Daintree Rainforest.",
        "It offers pristine beaches, reef adventures, boutique shopping, and fine dining experiences."
      ]
    },

    travelOptions: {
      h4:
        "Travel Options from Cairns Airport to Port Douglas",
      paragraphs: [
        "Travellers can choose between shuttle buses, rental cars, or private transfers.",
        "Private transfers are the fastest and most comfortable way to reach Port Douglas in approximately 65 minutes."
      ]
    },

    whyUs: {
      h2:
        "Why Choose SPL Transportation?",
      paragraphs: [
        "We focus on comfort, safety, punctuality, and personalised service for every journey."
      ],
      bullets: [
        "Licensed and insured drivers",
        "Door-to-door pickup and drop-off",
        "Reliable service trusted by travellers",
        "Comfort and safety guaranteed"
      ],
      cta:
        "Reserve your Port Douglas transfer with confidence. Book now!"
    },

    faqs: [
      {
        question: "Is pricing per person or per vehicle?",
        answer: "All prices are charged per vehicle, not per person."
      },
      {
        question: "How long does the journey take?",
        answer: "The drive takes approximately 65 minutes depending on traffic."
      }
    ]
  },

  /* -------------------------------------------------
     CAIRNS AIRPORT → PALM COVE (NEW ROUTE)
  -------------------------------------------------- */
  [key("Cairns Airport", "Palm Cove")]: {
    intro: {
      h2:
        "Cairns Airport to Palm Cove Transfers: Comfortable, Fast & Reliable Private Rides",
      paragraphs: [
        "Travelling from Cairns Airport to Palm Cove? SPL Transportation offers premium private transfers for a relaxed and seamless journey.",
        "Our professional drivers ensure timely pickups, comfortable vehicles, and stress-free travel straight to your accommodation."
      ],
      bullets: [
        "Direct airport pickup with flight tracking",
        "Comfortable and air-conditioned vehicles",
        "Professional local drivers",
        "Transparent pricing with no hidden fees"
      ],
      cta:
        "Book your Cairns Airport to Palm Cove transfer with SPL Transportation today!"
    },

    destination: {
      h3:
        "Why Visit Palm Cove?",
      paragraphs: [
        "Palm Cove is a beautiful beachfront village known for its palm-lined esplanade, luxury resorts, and relaxed tropical atmosphere.",
        "It is the perfect destination for couples, families, and leisure travellers looking to unwind near Cairns."
      ]
    },

    travelOptions: {
      h4:
        "Best Way to Travel from Cairns Airport to Palm Cove",
      paragraphs: [
        "Options include taxis, shuttle buses, rental cars, and private transfers.",
        "Private transfers offer the quickest and most comfortable journey, taking approximately 25–30 minutes."
      ]
    },

    whyUs: {
      h2:
        "Why Choose SPL Transportation for Palm Cove Transfers?",
      paragraphs: [
        "We specialise in premium airport transfers designed for comfort, reliability, and peace of mind."
      ],
      bullets: [
        "On-time pickups with flight monitoring",
        "Clean, modern and spacious vehicles",
        "Friendly and experienced drivers",
        "Door-to-door service"
      ],
      cta:
        "Enjoy a smooth start to your Palm Cove holiday. Book your transfer now!"
    },

    faqs: [
      {
        question: "How long does it take to reach Palm Cove from Cairns Airport?",
        answer: "The journey typically takes 25–30 minutes depending on traffic."
      },
      {
        question: "Is this a private transfer?",
        answer: "Yes, all SPL Transportation services are private and exclusive to your group."
      }
    ]
  },

  [key("Cairns Airport", "Cairns City")]: {
  intro: {
    h2:
      "Cairns Airport to Cairns City: Ensure a Smooth, Stress-Free and Seamless Travel Experience with SPL Transportation",
    paragraphs: [
      "SPL Transportation offers the easiest, most convenient, and affordable way to travel from Cairns Airport to Cairns City. Whether your plans are well-organised or spontaneous, we ensure a safe, smooth, and pleasant travel experience.",
      "Our neat, clean, and comfortable shuttle and private taxi services, paired with professional, trained, and empathetic drivers, ensure you arrive relaxed and on time from Cairns Airport (Domestic and International) to the city."
    ],
    bullets: [
      "Premium and reliable ride transfer services between Cairns Airport and Cairns City",
      "Professional, trained, skilled, and compassionate drivers",
      "Safe, comfortable, and smooth travel experience",
      "Avoid the hassle of finding airport taxis with pre-booked transfers"
    ],
    cta:
      "Book your reliable ride transfer from Cairns Airport to Cairns City with SPL Transportation!"
  },

  destination: {
    h3:
      "Why is Cairns City One of the Best Travel Destinations in Australia?",
    paragraphs: [
      "Cairns is one of Australia’s top travel destinations and serves as the gateway to two spectacular World Heritage sites — the Daintree Rainforest and the Great Barrier Reef.",
      "Beyond its natural beauty, Cairns offers vibrant markets, relaxed coastal vibes, diverse food options, and a laid-back atmosphere, making it perfect for travellers seeking both adventure and rejuvenation.",
      "If you are planning to explore this stunning city and need premium transfers from Cairns Airport to Cairns City, SPL Transportation is your trusted travel partner."
    ]
  },

  travelOptions: {
    h4:
      "What Are the Different Ways to Travel from Cairns Airport to Cairns City?",
    paragraphs: [
      "Cairns Airport is located approximately six kilometres from Cairns City, making it a short and convenient journey. As it also serves nearby tourist destinations like Palm Cove and Port Douglas, several transport options are available.",
      "These include public buses, airport shuttles, private taxis, rideshare services, car hire, and private airport transfers.",
      "Among these, private taxis and pre-booked transfers offer the fastest, most convenient, and comfortable way to reach the city — especially for families and travellers with luggage."
    ]
  },

  whyUs: {
    h2:
      "Why SPL Transportation Is Your Trusted Travel Partner",
    paragraphs: [
      "At SPL Transportation, our mission is to provide safe, stress-free, and seamless travel experiences for both leisure and business travellers.",
      "We focus on comfort, punctuality, and personalised service to ensure every journey from Cairns Airport to Cairns City is smooth and enjoyable."
    ],
    bullets: [
      "Fully licensed, insured, trained, and compassionate drivers",
      "Trusted by travellers across Cairns and surrounding regions",
      "Comfortable, clean, and air-conditioned vehicles",
      "Reliable and secure door-to-door pickup and drop-off",
      "Strong focus on safety, punctuality, and passenger comfort"
    ],
    cta:
      "Ensure a smooth and stress-free Cairns Airport to Cairns City transfer with SPL Transportation. Book your ride now!"
  },

  faqs: [
    {
      question:
        "What are the different ways to get from Cairns Airport to Cairns City?",
      answer:
        "You can travel via public bus, Cairns Airport shuttle, private taxis, private airport transfers, rideshare services, or by hiring a car at Cairns Airport."
    },
    {
      question:
        "What are the highlights along the route from Cairns Airport to Cairns City?",
      answer:
        "Highlights along the route include Cairns Airport (Domestic and International), Lagoon Precinct, Cairns Esplanade, Cairns Marina, and Captain Cook Highway."
    }
  ]
},

};

export function getRoutePageContent(route: Route) {
  return ROUTE_PAGE_CONTENT[key(route.from, route.to)] ?? null;
}
