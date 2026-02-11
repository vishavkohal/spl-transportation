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
        question: "Why should you use SPL Transportation to get from Cairns Airport to Port Douglas transfers?",
        answer: "SPL Transportation will pick you up from Cairns Airport and take you to Port Douglas on schedule and in luxury. SPL Transportation makes sure your trip starts off without any stress by providing skilled local drivers, clean vehicles and direct hotel drop-off."
      },
      {
        question: "How far away is Port Douglas from the airport in Cairns?",
        answer: "About 65 kilometers separate Cairns Airport from Port Douglas. The trip is pleasant and beautiful with SPL Transportation. It takes about 60 to 75 minutes along the seaside highway."
      },
      {
        question: "Does SPL Transportation offer private rides to and from the airport?",
        answer: "Yes, SPL Transportation specializes in private Cairns Airport to Port Douglas transfers. You'll have a direct non-stop ride with complete privacy, which is great for families couples and business visitors."
      },
      {
        question: "Can you use SPL Transportation for flights that leave early in the morning or late at night?",
        answer: "Absolutely. SPL Transportation offers airport transfers 24/7 so you can book ahead of time if you need to arrive early or leave late."
      },
      {
        question: "Is it possible to book my transfer from Cairns Airport to Port Douglas ahead of time with SPL Transportation?",
        answer: "Yes, it is best to book in advance to make sure you can get what you want at a set price. If you book ahead of time with SPL Transportation, your driver will be ready for you when you arrive."
      },
      {
        question: "Is SPL Transportation good for moving groups?",
        answer: "Yes SPL Transportation has big vehicles for group transfers so families and bigger groups can travel comfortably with their bags."
      },
      {
        question: "Do they have child seats for airport transfers?",
        answer: "Yes, you can get child seats and booster seats if you ask for them. Please let SPL Transportation know when you book so that we can get your car ready."
      },
      {
        question: "Will SPL Transportation take me right to my hotel in Port Douglas?",
        answer: "Yes, SPL Transportation will pick you up and drop you off at your hotel or resort wherever in Port Douglas for a smooth trip."
      },
      {
        question: "What is remarkable about the drive from Cairns to Port Douglas?",
        answer: "The Captain Cook Highway which has stunning views of the ocean and jungle is the route. When you travel with SPL Transportation, you can relax and enjoy one of Australia's most beautiful roads."
      },
      {
        question: "Is SPL Transportation a safe and legal way to go around?",
        answer: "Yes SPL Transportation is a fully licensed and insured transportation company that puts passenger safety professional service and high travel standards first."
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
        question: "How can I go from Cairns Airport to Palm Cove the easiest way?",
        answer: "A private transfer with SPL Transportation that you reserve ahead of time is the easiest and most reliable approach. You can get picked up right at Cairns Airport and taken straight to your hotel or resort in Palm Cove."
      },
      {
        question: "How long does it take to get from Cairns Airport to Palm Cove Transfers?",
        answer: "Traffic can make the trip take anything from 20 to 30 minutes. SPL Transportation makes sure that packages arrive on time by using the fastest coastal routes."
      },
      {
        question: "Does SPL Transportation provide private rides to Palm Cove?",
        answer: "Yes, SPL Transportation offers private trips from Cairns Airport to Palm Cove Transfers that are only for you. This is great for couples families and people who want privacy and ease."
      },
      {
        question: "Can you get from Cairns Airport to Palm Cove at any time of day or night?",
        answer: "Yes SPL Transportation offers airport transfer services around the clock including early-morning and late-night flight arrivals with advance booking."
      },
      {
        question: "Can I schedule my Palm Cove airport transfer ahead of time with SPL Transportation?",
        answer: "Absolutely. Pre-booking guarantees availability, set prices, and peace of mind, especially during busy holiday times in Palm Cove."
      },
      {
        question: "Is SPL Transportation good for moving families and groups?",
        answer: "Yes, SPL Transportation has big cars for families and groups, and they have plenty of room for suitcases, strollers, and other travel items."
      },
      {
        question: "Do you have kid seats for transfers to Palm Cove?",
        answer: "Yes, you can ask for child seats and booster seats. When you book with SPL Transportation, just tell them what you need."
      },
      {
        question: "Will SPL Transportation take me straight to my Palm Cove resort?",
        answer: "Yes, SPL Transportation will pick you up and drop you off right at your Palm Cove hotel, resort, or vacation apartment."
      },
      {
        question: "How much does it cost to get from Cairns Airport to Palm Cove?",
        answer: "The price depends on the size of the group and the type of vehicle. When you book in advance, SPL Transportation has clear, fair rates with no extra fees."
      },
      {
        question: "Why should you choose SPL Transportation to go to and from the Palm Cove airport?",
        answer: "SPL Transportation is known for its competent drivers clean cars on-time service, and knowledge of the area which makes getting to Palm Cove easy and stress-free."
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
        question: "How can I get from Cairns Airport to Cairns City Transfers the quickest?",
        answer: "SPL Transportation's private airport shuttle is the quickest and easiest way to get to your destination. You will be picked up from Cairns Airport and taken straight to your hotel or other place to stay in Cairns City."
      },
      {
        question: "How long does it take to get from Cairns Airport to Cairns City?",
        answer: "It typically takes 10 to 15 minutes to travel from Cairns Airport to Cairns City, although this time may vary depending on traffic conditions. SPL Transportation ensures that routes are rapid and efficient, allowing people to arrive quickly."
      },
      {
        question: "Does SPL Transportation offer private rides to and from Cairns City airport?",
        answer: "Yes, SPL Transportation specializes in private, door-to-door airport transfers to Cairns City. This is great for business travelers, families, and tourists."
      },
      {
        question: "Are there shuttles from Cairns Airport to Cairns City 24 hours a day, seven days a week?",
        answer: "Yes, SPL Transportation runs all day, every day. With advance booking, they can pick you up and drop you off at any time of day or night."
      },
      {
        question: "Is it possible to reserve my Cairns Airport to Cairns City transfer in advance?",
        answer: "Absolutely. Booking ahead of time with SPL Transportation guarantees availability, a set price, and no wait time when you get to the airport."
      },
      {
        question: "Is SPL Transportation good for dropping people off at hotels and resorts in Cairns City?",
        answer: "Yes, SPL Transportation will drop you off directly at any hotel resort apartment or company in Cairns City."
      },
      {
        question: "Does SPL Transportation have car seats for kids when they take them to the airport?",
        answer: "Yes, you can ask for child seats and booster seats. Please let SPL Transportation know when you make your reservation so that they can make the right plans."
      },
      {
        question: "How much luggage may I bring on a transport to Cairns City?",
        answer: "SPL Transportation trucks have a lot of room for suitcases, backpacks and travel items. If you have a party or extra luggage you can have a bigger vehicle."
      },
      {
        question: "Is SPL Transportation a safe and legal way to go around?",
        answer: "Yes, SPL Transportation is a fully licensed insured, and safe transportation company so you can be confident that your trip will be safe and comfortable."
      },
      {
        question: "Why should you use SPL Transportation to get from Cairns Airport to Cairns City?",
        answer: "SPL Transportation is a reliable choice for airport transfers since they always arrive on time, have skilled drivers, clean vehicles, clear pricing, and local knowledge."
      }
    ]
  },

  /* -------------------------------------------------
     PORT DOUGLAS → CAIRNS AIRPORT
  -------------------------------------------------- */
  [key("Port Douglas", "Cairns Airport")]: {
    intro: {
      h2: "Port Douglas to Cairns Airport Transfers: Gain the Best Travel Experience from SPL Transportation",
      paragraphs: [
        "Looking to travel from Port Douglas to Cairns Airport to explore the breathtaking natural beauty? Get the outstanding, friendly service at an affordable price from SPL Transportation to fulfill all your travel needs and requirements.",
        "We offer the Port Douglas to Cairns Airport Transfers, whether you want to travel as an individual or in a group. Our skilled, trained, and proficient drivers know the best route to travel to Cairns Airport."
      ],
      bullets: [
        "Friendly and Professional Service.",
        "Clean, Air-conditioned, and Well-maintained Vehicles.",
        "Insured, Licensed, Trained, Skilled, and Compassionate Drivers.",
        "Committed to ensuring a Smooth, Safe, and Seamless Travel Experience for the Travelers.",
        "Helping All the Travelers Avoid the Hassle of Finding a Taxi from Port Douglas."
      ],
      cta: "Book your premium, reliable, and comfortable ride transfer from Port Douglas to Cairns Airport with SPL Transportation!"
    },

    destination: {
      h3: "What We Do at SPL Transportation?",
      paragraphs: [
        "At SPL Transportation, we provide premium private transfers with affordable pricing, modern air-conditioned vehicles, and professional and trained local drivers. At Port Douglas Cairns Airport Private Transfer, we are committed to ensuring that every journey for every guest is memorable and mesmerizing.",
        "Whether you are traveling for the holiday or business travel or heading back home, our professional, compassionate, and experienced team is committed to providing you with smooth, seamless, and stunning experiences. With our modern and comfortable fleet and trained and experienced drivers, you can be completely assured that you will have a safe, secure, and pleasant journey. You can be relaxed and enjoy your holidays with us!"
      ]
    },

    travelOptions: {
      h4: "What Are the Various Ways to Get from Port Douglas to Cairns Airport?",
      paragraphs: [
        "At SPL Transportation, you get quality-oriented and comfortable private transfers. After all, we help you make your journey as smooth and convenient as possible. Various ways to get from Port Douglas to Cairns Airport are Shuttle Buses and Airport Transfers, Rideshares, Taxis, Rental Cars, and Private Transfers. The landmarks along the route are Four Mile Beach, Captain Cook Highway, Macrossan Street, Crystal Brook Marina, and Cairns Airport (Domestic and International)."
      ]
    },

    whyUs: {
      h2: "Why Choose SPL Transportation?",
      paragraphs: [
        "At SPL Transportation, we own a fleet of premium, modern, and comfortable vehicles. Our entire team has been operating with the primary motive of providing stress-free, safe, seamless, and smooth travel experiences. We help travelers make their journey as comfortable, mesmerizing, and convenient as possible, whether they need private transfers for leisure travel or business travel.",
        "Now, if you have been wondering why you should trust us for the calm, safe, and convenient Port Douglas to Cairns Airport Transfers, then let us discuss some of the reasons below:"
      ],
      bullets: [
        "Fully Licensed, Insured, Trained, and Compassionate Drivers.",
        "A Vast Fleet of Premium Vehicles defines your style and offers luxury.",
        "Trusted by travelers across the Cairns, Port Douglas, and Palm Cove.",
        "Comfortable, Neat and Clean, Well-maintained, and Air-conditioned Vehicles.",
        "Reliable, Safe, and Secure Door-to-Door Pickup and Drop Off.",
        "Ensuring Safety, Punctuality, and Comfort in Every Journey."
      ],
      cta: "Ensure a pleasant, hassle-free, safe, and stress-free experience for Port Douglas to Cairns Airport Transfers with SPL Transportation! Book your ride now!"
    },

    faqs: [
      {
        question: "What is the Distance Between Port Douglas and Cairns Airport?",
        answer: "The distance between Port Douglas and Cairns Airport is 66 Kms, approximately 1 hour 6 minutes journey via the Captain Cook Highway/ State Route 44."
      },
      {
        question: "What are the landmarks along the route from Port Douglas to Cairns Airport?",
        answer: "The landmarks along the route are Four Mile Beach, Captain Cook Highway, Macrossan Street, Crystal Brook Marina, and Cairns Airport (Domestic and International)."
      }
    ]
  },

  /* -------------------------------------------------
     PALM COVE → CAIRNS AIRPORT
  -------------------------------------------------- */
  [key("Palm Cove", "Cairns Airport")]: {
    intro: {
      h2: "Palm Cove to Cairns Airport Transfers: Get the Best Travel Experiences with SPL Transportation!",
      paragraphs: [
        "Arriving in a new country or any foreign land can lead to many hassles and stressful experiences. Still, the best and most professional private transfer team can lead to mesmerizing and stunning experiences. Have you been looking for Palm Cove to Cairns Airport Transfers? With SPL Transportation, you can be assured that you will get stress-free, safe, and hassle-free experiences with the comfort of modern vehicles and compassionate drivers.",
        "If you value personalized service, convenience, and comfort, then you can trust the professional team of SPL Transportation!"
      ],
      bullets: [
        "Friendly, Compassionate, and Professional Service.",
        "Clean, Air-conditioned, Modern, and Well-maintained Vehicles.",
        "Insured, Licensed, Trained, and Skilled Drivers.",
        "Committed to ensuring a Smooth, Safe, and Seamless Travel Experience for the Travelers.",
        "Helping All the Travelers Avoid the Hassle of Finding a Taxi from Palm Cove."
      ],
      cta: "Book your ride now!"
    },

    destination: {
      h3: "The Key Points for the Palm Cove to Cairns Airport Transfers",
      paragraphs: [
        "Transfer from the Palm Cove to Cairns Airport takes around 25 minutes as it spans approximately 24.8 Kms via Captain Cook Highway / State Route 44 and National Route 1. Let us acquaint you with the key points for this transfer:",
        "1. Personalized Service: At SPL Transportation, we offer a personalized experience unlike the shared shuttles. The drivers are professional, compassionate, and punctual, often sharing local tips and recommendations.",
        "2. Landmarks Along the Route: Palm Cove is a tranquil seaside village located in the Cairns region. The landmarks along the route are Palm Cove Beach, Palm Cove Jetty, Captain Cook Highway, Clifton Beach, and Cairns Airport.",
        "3. Flexibility and Convenience: We have a simple booking process with utmost flexibility. If your flight is rescheduled, our team will accommodate it.",
        "4. No Hidden Fees: For the Palm Cove Private Transfer, we have a transparent pricing policy with no hidden fees."
      ]
    },

    travelOptions: {
      h4: "Journey Details: Palm Cove to Cairns Airport",
      paragraphs: [
        "The transfer from Palm Cove to Cairns Airport is a quick and scenic drive along the coast.",
        "Spanning approximately 24.8 km via the Captain Cook Highway and National Route 1, the journey takes around 25 minutes depending on traffic. Our drivers ensure you arrive at the Domestic or International terminal with plenty of time for your flight."
      ]
    },

    whyUs: {
      h2: "Why You Can Trust SPL Transportation?",
      paragraphs: [
        "At SPL Transportation, we own a fleet of premium, modern, and comfortable vehicles. Whether you need private transfers for business travel or leisure travel, or traveling solo or as a group, at SPL Transportation, we help our esteemed clients make their journey as convenient and comfortable as possible. Our primary motive is to provide safe and stress-free travel experiences.",
        "Now, if you have been wondering what those reasons that make you trust us for the Palm Cove to Cairns Airport Transfers are, then let us acquaint you with them below:"
      ],
      bullets: [
        "Fully Licensed, Insured, Trained, and Compassionate Drivers.",
        "A Vast Fleet of Premium Vehicles defines your style and offers luxury.",
        "Trusted by travelers across the Cairns, Port Douglas, and Palm Cove.",
        "Comfortable, Neat and Clean, Well-maintained, and Air-conditioned Vehicles.",
        "Reliable, Safe, and Secure Door-to-Door Pickup and Drop Off.",
        "Ensuring Safety, Punctuality, and Comfort in Every Journey."
      ],
      cta: "Ensure a safe, stress-free, and hassle-free travel experience for a happier journey from Palm Cove to Cairns Airport with SPL Transportation! Book your ride now!"
    },

    faqs: [
      {
        question: "What is the distance between Palm Cove and Cairns Airport?",
        answer: "The road distance between Palm Cove and Cairns Airport is 24.8 Kms via Captain Cook Highway / State Route 44 and National Route 1. It takes around 25 minutes."
      },
      {
        question: "What are the various landmarks in the route from Palm Cove to Cairns Airport?",
        answer: "Various landmarks are Palm Cove Beach, Palm Cove Jetty, Captain Cook Highway, Clifton Beach, and Cairns Airport (Domestic and International)."
      }
    ]
  },

  /* -------------------------------------------------
     CAIRNS CITY → PALM COVE
  -------------------------------------------------- */
  [key("Cairns City", "Palm Cove")]: {
    intro: {
      h2: "Cairns City to Palm Cove Transfers: Gain Personalized Travel Experience for the Best Journey with SPL Transportation!",
      paragraphs: [
        "Looking to explore the two Queensland treasures – Cairns City and Palm Cove? Make more of your adventure with a safe and comfortable journey with Cairns City to Palm Cove Transfers from SPL Transportation! Get hassle-free and stress-free travel to your destination with our modern vehicles and trained, compassionate drivers. Sit back and relax when you are traveling to Palm Cove from Cairns City and travel in a stylish way!",
        "If you are looking for convenience, comfort, and personalized service, then you can trust the professional and compassionate team of SPL Transportation for Cairns City to Palm Cove Transfers! Book your ride now!"
      ],
      bullets: [
        "Friendly, Compassionate, and Professional Service.",
        "Clean, Air-conditioned, Modern, and Well-maintained Vehicles.",
        "Insured, Licensed, Trained, and Skilled Drivers.",
        "Committed to ensuring a Smooth, Safe, and Seamless Travel Experience for the Travelers.",
        "Helping All the Travelers Avoid the Hassle of Finding a Taxi from Palm Cove."
      ],
      cta: "Book your ride now!"
    },

    destination: {
      h3: "Relax and Rejuvenate with Cairns City to Palm Cove Transfers",
      paragraphs: [
        "Cairns is recognized for the Great Barrier Reef and is also known as the “Spa Capital of Australia.” And, if we must speak of Palm Cove, then it is a tranquil place, where you can relax and rejuvenate. But what if this experience gets more exhilarating with the outstanding and friendly Cairns City to Palm Cove Transfers from SPL Transportation!",
        "Let us discuss the key points for this transfer:",
        "1. Landmarks Along the Route: When traveling from Cairns City to Palm Cove, you will get to witness the attractions of both beautiful destinations. However, when you travel with SPL Transportation, we are committed to not missing any attraction along the route. The landmarks are Cairns Marina, Palm Cove Jetty, Palm Cove Beach, Clifton Beach, Lagoon Precinct, and Cairns Esplanade.",
        "2. Flexibility and Convenience: The flexibility and convenience are the two traits that we consider our forte when you are looking for the Cairns City to Palm Cove Transfers. We have a simple and straightforward booking process so that we help you avoid any hassles.",
        "3. Personalized, Professional Service: At SPL Transportation, we offer personalized service so that you get stunning experiences. Our drivers are trained, experienced and compassionate to make your journey memorable.",
        "4. Affordable Services: We value your time and money, so we have kept our services affordable and economical. But we must say that we never compromise on quality and have no hidden fees when offering the Cairns City to Palm Cove Transfers."
      ]
    },

    travelOptions: {
      h4: "Journey Overview: Cairns City to Palm Cove",
      paragraphs: [
        "The distance between Cairns City and Palm Cove is approximately 25 to 27 kilometers (about 16-17 miles).",
        "The drive typically takes between 25 and 30 minutes, depending on traffic, and is commonly accessed via the Captain Cook Highway."
      ]
    },

    whyUs: {
      h2: "Why SPL Transportation is Your Trusted Travel Partner?",
      paragraphs: [
        "At SPL Transportation, we offer premium private transfers with budget-friendly services, modern, neat, and clean vehicles, trained drivers, and a simple booking process. Well, if you are still wondering why, you should trust us, let us help you with some reasons.",
        "We are committed to ensuring a safe and stress-free travel experience with our modern fleet of vehicles and dedicated team for the Cairns City to Palm Cove Transfers!"
      ],
      bullets: [
        "Fully Licensed, Insured, Trained, and Compassionate Drivers.",
        "A Vast Fleet of Premium Vehicles defines your style and offers luxury.",
        "Trusted by travelers across the Cairns, Port Douglas, and Palm Cove.",
        "Comfortable, Neat and Clean, Well-maintained, and Air-conditioned Vehicles.",
        "Reliable, Safe, and Secure Door-to-Door Pickup and Drop Off.",
        "Ensuring Safety, Punctuality, and Comfort in Every Journey."
      ],
      cta: "Book your ride now!"
    },

    faqs: [
      {
        question: "What are the various landmarks for the Cairns City to Palm Cove Transfers?",
        answer: "Various landmarks are Cairns Marina, Palm Cove Jetty, Palm Cove Beach, Clifton Beach, Lagoon Precinct, and Cairns Esplanade."
      },
      {
        question: "What is the distance between Cairns City and Palm Cove?",
        answer: "The distance between Cairns City and Palm Cove is approximately 25 to 27 kilometers (about 16-17 miles). In addition, the drive typically takes between 25 and 30 minutes, depending on traffic. It is commonly accessed via the Captain Cook Highway."
      }
    ]
  },

};

export function getRoutePageContent(route: Route) {
  return ROUTE_PAGE_CONTENT[key(route.from, route.to)] ?? null;
}
