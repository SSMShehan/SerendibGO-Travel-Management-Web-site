const mongoose = require('mongoose');

// Sample tour data for database seeding
const sampleTours = [
  {
    title: 'Sigiriya Rock Fortress Adventure',
    description: 'Experience the ancient wonder of Sigiriya Rock Fortress, a UNESCO World Heritage site that stands majestically in the heart of Sri Lanka. This full-day adventure takes you through the rich history and breathtaking views of one of the world\'s most impressive ancient monuments. Climb the 1,200 steps to the top and discover the fascinating frescoes, palace ruins, and the legendary Lion\'s Gate.',
    shortDescription: 'Climb the ancient rock fortress and discover Sri Lanka\'s rich history',
    images: [
      { url: '/api/placeholder/800/600', alt: 'Sigiriya Rock Fortress', isPrimary: true },
      { url: '/api/placeholder/800/600', alt: 'Ancient Frescoes', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Lion\'s Gate', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Palace Ruins', isPrimary: false }
    ],
    price: 299,
    originalPrice: 399,
    duration: 1,
    maxParticipants: 15,
    minParticipants: 2,
    category: 'adventure',
    difficulty: 'moderate',
    location: {
      name: 'Sigiriya',
      city: 'Matale',
      coordinates: [7.9569, 80.7597],
      address: 'Sigiriya, Central Province, Sri Lanka'
    },
    rating: { average: 4.8, count: 127 },
    isFeatured: true,
    tags: ['UNESCO', 'Historical', 'Adventure', 'Cultural'],
    highlights: [
      'Climb the 1,200 steps to the top of Sigiriya Rock',
      'Explore ancient frescoes and palace ruins',
      'Learn about the fascinating history from expert guides',
      'Enjoy panoramic views of the surrounding landscape',
      'Visit the Lion\'s Gate and Mirror Wall'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Sigiriya Rock Fortress Exploration',
        activities: [
          'Early morning pickup from hotel',
          'Guided tour of the rock fortress',
          'Climb to the top for breathtaking views',
          'Explore ancient frescoes and ruins',
          'Lunch at a local restaurant',
          'Visit nearby Dambulla Cave Temple',
          'Return to hotel in the evening'
        ],
        accommodation: 'Not included (day tour)',
        meals: ['Lunch included'],
        highlights: ['Sigiriya Rock', 'Ancient Frescoes', 'Dambulla Cave Temple']
      }
    ],
    included: [
      'Professional English-speaking guide',
      'Transportation in air-conditioned vehicle',
      'Entrance fees to all attractions',
      'Lunch at a local restaurant',
      'Bottled water throughout the tour',
      'Hotel pickup and drop-off'
    ],
    excluded: [
      'Personal expenses and tips',
      'Additional meals and beverages',
      'Travel insurance',
      'International flights',
      'Visa fees'
    ],
    requirements: [
      'Moderate physical fitness required',
      'Comfortable walking shoes recommended',
      'Sun protection (hat, sunscreen)',
      'Camera for photos',
      'Valid passport/ID'
    ],
    seasonality: {
      bestMonths: ['December', 'January', 'February', 'March', 'April'],
      avoidMonths: ['May', 'June', 'July', 'August', 'September', 'October', 'November']
    },
    cancellationPolicy: 'moderate',
    cancellationDetails: 'Free cancellation up to 24 hours before tour start. 50% refund for cancellations within 24 hours.'
  },
  {
    title: 'Tea Country Cultural Experience',
    description: 'Immerse yourself in the beautiful world of Ceylon tea with this comprehensive cultural experience. Visit working tea plantations, learn about the tea-making process from leaf to cup, and enjoy the cool climate of Sri Lanka\'s hill country. This tour combines cultural education with stunning natural beauty.',
    shortDescription: 'Explore the beautiful tea plantations and learn about Ceylon tea',
    images: [
      { url: '/api/placeholder/800/600', alt: 'Tea Plantations', isPrimary: true },
      { url: '/api/placeholder/800/600', alt: 'Tea Factory', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Tea Tasting', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Hill Country Views', isPrimary: false }
    ],
    price: 199,
    originalPrice: null,
    duration: 2,
    maxParticipants: 12,
    minParticipants: 2,
    category: 'cultural',
    difficulty: 'easy',
    location: {
      name: 'Nuwara Eliya',
      city: 'Nuwara Eliya',
      coordinates: [6.9497, 80.7891],
      address: 'Nuwara Eliya, Central Province, Sri Lanka'
    },
    rating: { average: 4.6, count: 89 },
    isFeatured: false,
    tags: ['Tea', 'Culture', 'Scenic', 'Educational'],
    highlights: [
      'Visit working tea plantations',
      'Learn about tea processing from experts',
      'Enjoy tea tasting sessions',
      'Experience cool hill country climate',
      'Meet local tea workers and families'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Tea Plantation Tour',
        activities: [
          'Morning pickup from hotel',
          'Visit to working tea plantation',
          'Learn about tea cultivation',
          'Meet tea pickers and learn their techniques',
          'Lunch at plantation bungalow',
          'Tea factory tour and processing demonstration',
          'Return to hotel'
        ],
        accommodation: 'Hotel in Nuwara Eliya',
        meals: ['Lunch included'],
        highlights: ['Tea Plantation', 'Tea Factory', 'Local Culture']
      },
      {
        day: 2,
        title: 'Tea Tasting and Cultural Experience',
        activities: [
          'Morning tea tasting session',
          'Visit to tea museum',
          'Cultural exchange with local families',
          'Traditional Sri Lankan cooking class',
          'Afternoon tea ceremony',
          'Shopping for tea and souvenirs',
          'Return to hotel'
        ],
        accommodation: 'Hotel in Nuwara Eliya',
        meals: ['Breakfast and lunch included'],
        highlights: ['Tea Tasting', 'Cultural Exchange', 'Cooking Class']
      }
    ],
    included: [
      'Professional English-speaking guide',
      'Transportation in air-conditioned vehicle',
      'All entrance fees',
      'Meals as specified',
      'Tea tasting sessions',
      'Hotel accommodation (1 night)',
      'Cultural activities'
    ],
    excluded: [
      'Personal expenses and tips',
      'Additional meals and beverages',
      'Travel insurance',
      'International flights',
      'Visa fees'
    ],
    requirements: [
      'Comfortable walking shoes',
      'Light jacket for cool weather',
      'Camera for photos',
      'Valid passport/ID'
    ],
    seasonality: {
      bestMonths: ['December', 'January', 'February', 'March', 'April', 'May'],
      avoidMonths: ['June', 'July', 'August', 'September', 'October', 'November']
    },
    cancellationPolicy: 'flexible',
    cancellationDetails: 'Free cancellation up to 48 hours before tour start. Full refund for cancellations within 48 hours.'
  },
  {
    title: 'Yala National Park Safari',
    description: 'Embark on an unforgettable wildlife adventure in Yala National Park, home to the highest density of leopards in the world. This safari experience offers the chance to spot elephants, crocodiles, sloth bears, and a variety of bird species in their natural habitat. With experienced guides and comfortable vehicles, this is the ultimate wildlife photography experience.',
    shortDescription: 'Spot leopards, elephants, and other wildlife in their natural habitat',
    images: [
      { url: '/api/placeholder/800/600', alt: 'Yala Safari', isPrimary: true },
      { url: '/api/placeholder/800/600', alt: 'Leopard Sighting', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Elephant Herd', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Bird Watching', isPrimary: false }
    ],
    price: 450,
    originalPrice: 550,
    duration: 1,
    maxParticipants: 8,
    minParticipants: 2,
    category: 'wildlife',
    difficulty: 'easy',
    location: {
      name: 'Yala National Park',
      city: 'Hambantota',
      coordinates: [6.3729, 81.5204],
      address: 'Yala National Park, Southern Province, Sri Lanka'
    },
    rating: { average: 4.9, count: 203 },
    isFeatured: true,
    tags: ['Wildlife', 'Safari', 'Photography', 'Leopards'],
    highlights: [
      'Highest leopard density in the world',
      'Elephant herds and other wildlife',
      'Professional wildlife photography guidance',
      'Experienced safari guides',
      'Comfortable safari vehicles'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Yala National Park Safari',
        activities: [
          'Early morning pickup (5:30 AM)',
          'Arrive at Yala National Park',
          'Morning safari drive (6:00 AM - 10:00 AM)',
          'Breakfast at park entrance',
          'Afternoon safari drive (2:00 PM - 6:00 PM)',
          'Wildlife photography session',
          'Return to hotel in the evening'
        ],
        accommodation: 'Not included (day tour)',
        meals: ['Breakfast included'],
        highlights: ['Leopard Spotting', 'Elephant Herds', 'Bird Watching']
      }
    ],
    included: [
      'Professional wildlife guide',
      'Safari vehicle with experienced driver',
      'Park entrance fees',
      'Breakfast',
      'Binoculars for wildlife viewing',
      'Hotel pickup and drop-off'
    ],
    excluded: [
      'Personal expenses and tips',
      'Additional meals and beverages',
      'Travel insurance',
      'International flights',
      'Visa fees'
    ],
    requirements: [
      'Comfortable clothing for safari',
      'Camera with zoom lens recommended',
      'Sun protection (hat, sunscreen)',
      'Valid passport/ID'
    ],
    seasonality: {
      bestMonths: ['December', 'January', 'February', 'March', 'April', 'May'],
      avoidMonths: ['June', 'July', 'August', 'September', 'October', 'November']
    },
    cancellationPolicy: 'moderate',
    cancellationDetails: 'Free cancellation up to 24 hours before tour start. 50% refund for cancellations within 24 hours.'
  },
  {
    title: 'Galle Fort Heritage Walk',
    description: 'Discover the colonial charm and rich history of Galle Fort, a UNESCO World Heritage site that showcases 400 years of European influence in Sri Lanka. This guided walking tour takes you through cobblestone streets, colonial architecture, and hidden gems while learning about the fort\'s fascinating past.',
    shortDescription: 'Discover the colonial charm of Galle Fort with a guided walking tour',
    images: [
      { url: '/api/placeholder/800/600', alt: 'Galle Fort', isPrimary: true },
      { url: '/api/placeholder/800/600', alt: 'Colonial Architecture', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Lighthouse', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Fort Walls', isPrimary: false }
    ],
    price: 89,
    originalPrice: null,
    duration: 1,
    maxParticipants: 20,
    minParticipants: 2,
    category: 'historical',
    difficulty: 'easy',
    location: {
      name: 'Galle Fort',
      city: 'Galle',
      coordinates: [6.0535, 80.2210],
      address: 'Galle Fort, Southern Province, Sri Lanka'
    },
    rating: { average: 4.7, count: 156 },
    isFeatured: false,
    tags: ['UNESCO', 'Heritage', 'Walking', 'Colonial'],
    highlights: [
      'UNESCO World Heritage site',
      '400 years of colonial history',
      'Beautiful colonial architecture',
      'Historic lighthouse and ramparts',
      'Local artisan workshops'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Galle Fort Heritage Walk',
        activities: [
          'Morning pickup from hotel',
          'Introduction to Galle Fort history',
          'Walk through main gate and ramparts',
          'Visit historic lighthouse',
          'Explore colonial buildings and churches',
          'Local artisan workshop visits',
          'Lunch at fort restaurant',
          'Shopping for local crafts',
          'Return to hotel'
        ],
        accommodation: 'Not included (day tour)',
        meals: ['Lunch included'],
        highlights: ['Fort History', 'Colonial Architecture', 'Local Crafts']
      }
    ],
    included: [
      'Professional English-speaking guide',
      'Transportation',
      'All entrance fees',
      'Lunch at local restaurant',
      'Map of Galle Fort',
      'Hotel pickup and drop-off'
    ],
    excluded: [
      'Personal expenses and tips',
      'Additional meals and beverages',
      'Travel insurance',
      'International flights',
      'Visa fees'
    ],
    requirements: [
      'Comfortable walking shoes',
      'Sun protection (hat, sunscreen)',
      'Camera for photos',
      'Valid passport/ID'
    ],
    seasonality: {
      bestMonths: ['December', 'January', 'February', 'March', 'April', 'May'],
      avoidMonths: ['June', 'July', 'August', 'September', 'October', 'November']
    },
    cancellationPolicy: 'flexible',
    cancellationDetails: 'Free cancellation up to 24 hours before tour start. Full refund for cancellations within 24 hours.'
  },
  {
    title: 'Ella Scenic Train Journey',
    description: 'Experience one of the world\'s most beautiful train rides through the stunning tea country of Sri Lanka. This scenic journey takes you from Kandy to Ella, passing through misty mountains, tea plantations, and breathtaking landscapes. The journey itself is the destination, offering unparalleled views and a truly authentic Sri Lankan experience.',
    shortDescription: 'Experience one of the world\'s most beautiful train rides through tea country',
    images: [
      { url: '/api/placeholder/800/600', alt: 'Ella Train', isPrimary: true },
      { url: '/api/placeholder/800/600', alt: 'Tea Country Views', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Nine Arch Bridge', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Mountain Scenery', isPrimary: false }
    ],
    price: 149,
    originalPrice: 199,
    duration: 1,
    maxParticipants: 25,
    minParticipants: 2,
    category: 'nature',
    difficulty: 'easy',
    location: {
      name: 'Ella',
      city: 'Badulla',
      coordinates: [6.8667, 81.0464],
      address: 'Ella, Uva Province, Sri Lanka'
    },
    rating: { average: 4.8, count: 178 },
    isFeatured: true,
    tags: ['Train', 'Scenic', 'Nature', 'Photography'],
    highlights: [
      'World-famous scenic train journey',
      'Stunning tea country landscapes',
      'Nine Arch Bridge photo opportunity',
      'Authentic local experience',
      'Misty mountain views'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Ella Scenic Train Journey',
        activities: [
          'Early morning pickup from hotel',
          'Transfer to Kandy railway station',
          'Board the scenic train to Ella',
          'Enjoy breathtaking mountain views',
          'Photo stop at Nine Arch Bridge',
          'Arrive in Ella and explore the town',
          'Lunch at local restaurant',
          'Visit Little Adam\'s Peak for sunset views',
          'Return to hotel'
        ],
        accommodation: 'Not included (day tour)',
        meals: ['Lunch included'],
        highlights: ['Train Journey', 'Nine Arch Bridge', 'Mountain Views']
      }
    ],
    included: [
      'Professional English-speaking guide',
      'Train tickets (2nd class reserved)',
      'Transportation to/from stations',
      'Lunch at local restaurant',
      'Entrance fees',
      'Hotel pickup and drop-off'
    ],
    excluded: [
      'Personal expenses and tips',
      'Additional meals and beverages',
      'Travel insurance',
      'International flights',
      'Visa fees'
    ],
    requirements: [
      'Comfortable clothing for train journey',
      'Camera for photos',
      'Light jacket for cool weather',
      'Valid passport/ID'
    ],
    seasonality: {
      bestMonths: ['December', 'January', 'February', 'March', 'April', 'May'],
      avoidMonths: ['June', 'July', 'August', 'September', 'October', 'November']
    },
    cancellationPolicy: 'moderate',
    cancellationDetails: 'Free cancellation up to 48 hours before tour start. 50% refund for cancellations within 48 hours.'
  },
  {
    title: 'Mirissa Whale Watching',
    description: 'Embark on an exciting marine adventure to spot blue whales, sperm whales, and dolphins in the deep waters off the coast of Mirissa. This whale watching experience offers the chance to see these magnificent creatures in their natural habitat, with experienced marine biologists providing insights into their behavior and conservation.',
    shortDescription: 'Watch blue whales and dolphins in the deep waters off Mirissa',
    images: [
      { url: '/api/placeholder/800/600', alt: 'Whale Watching', isPrimary: true },
      { url: '/api/placeholder/800/600', alt: 'Blue Whale', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Dolphins', isPrimary: false },
      { url: '/api/placeholder/800/600', alt: 'Ocean Views', isPrimary: false }
    ],
    price: 399,
    originalPrice: null,
    duration: 1,
    maxParticipants: 30,
    minParticipants: 2,
    category: 'wildlife',
    difficulty: 'easy',
    location: {
      name: 'Mirissa',
      city: 'Matara',
      coordinates: [5.9483, 80.4719],
      address: 'Mirissa, Southern Province, Sri Lanka'
    },
    rating: { average: 4.5, count: 92 },
    isFeatured: false,
    tags: ['Whales', 'Marine', 'Photography', 'Conservation'],
    highlights: [
      'Blue whale sightings (highest success rate)',
      'Sperm whales and dolphins',
      'Marine biologist guide',
      'Conservation education',
      'Professional photography tips'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Mirissa Whale Watching',
        activities: [
          'Early morning pickup (5:30 AM)',
          'Arrive at Mirissa harbor',
          'Safety briefing and equipment check',
          'Board whale watching boat',
          'Search for whales and dolphins',
          'Marine biology education session',
          'Return to harbor',
          'Lunch at beach restaurant',
          'Return to hotel'
        ],
        accommodation: 'Not included (day tour)',
        meals: ['Breakfast and lunch included'],
        highlights: ['Whale Spotting', 'Marine Education', 'Ocean Adventure']
      }
    ],
    included: [
      'Professional marine biologist guide',
      'Whale watching boat with experienced crew',
      'Safety equipment and life jackets',
      'Breakfast and lunch',
      'Marine conservation education',
      'Hotel pickup and drop-off'
    ],
    excluded: [
      'Personal expenses and tips',
      'Additional meals and beverages',
      'Travel insurance',
      'International flights',
      'Visa fees'
    ],
    requirements: [
      'Comfortable clothing for boat ride',
      'Camera with zoom lens recommended',
      'Motion sickness medication (if needed)',
      'Valid passport/ID'
    ],
    seasonality: {
      bestMonths: ['December', 'January', 'February', 'March', 'April'],
      avoidMonths: ['May', 'June', 'July', 'August', 'September', 'October', 'November']
    },
    cancellationPolicy: 'strict',
    cancellationDetails: 'Free cancellation up to 72 hours before tour start. No refund for cancellations within 72 hours due to weather dependency.'
  }
];

module.exports = sampleTours;
