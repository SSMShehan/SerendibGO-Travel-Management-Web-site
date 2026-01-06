// Sample vehicles data with real details and images
const sampleVehicles = [
  {
    name: 'Toyota Hiace High Roof Van',
    make: 'Toyota',
    model: 'Hiace High Roof',
    year: 2018,
    vehicleType: 'Van',
    description: 'Spacious high-roof van perfect for group tours and airport transfers. Features ample luggage space and comfortable seating.',
    capacity: { passengers: 14, luggage: 8 },
    pricing: {
      dailyRate: 15000,
      hourlyRate: 1500,
      fuelIncluded: false,
      driverIncluded: true
    },
    features: {
      airConditioning: true,
      wifi: false,
      gps: true,
      musicSystem: true,
      chargingPorts: false,
      wheelchairAccessible: false,
      childSeat: false
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Toyota_Hiace_70_001.JPG',
        caption: 'Toyota Hiace High Roof Exterior',
        isPrimary: true
      }
    ],
    status: 'available',
    location: {
      city: 'Colombo',
      district: 'Colombo',
      coordinates: { latitude: 6.9271, longitude: 79.8612 }
    },
    registration: {
      number: 'WP-NC-1234',
      expiryDate: new Date('2025-12-31')
    },
    insurance: {
      policyNumber: 'INS-HIACE-001',
      expiryDate: new Date('2025-12-31'),
      coverage: 'comprehensive'
    }
  },
  {
    name: 'Toyota Land Cruiser Prado',
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2019,
    vehicleType: 'SUV',
    description: 'Luxury SUV for comfortable long-distance travel and off-road adventures. Premium leather interior and smooth ride.',
    capacity: { passengers: 7, luggage: 4 },
    pricing: {
      dailyRate: 35000,
      hourlyRate: 3500,
      fuelIncluded: false,
      driverIncluded: true
    },
    features: {
      airConditioning: true,
      wifi: true,
      gps: true,
      musicSystem: true,
      chargingPorts: true,
      wheelchairAccessible: false,
      childSeat: true
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Toyota_Land_Cruiser_Prado_150.jpg',
        caption: 'Toyota Land Cruiser Prado Exterior',
        isPrimary: true
      }
    ],
    status: 'available',
    location: {
      city: 'Kandy',
      district: 'Kandy',
      coordinates: { latitude: 7.2906, longitude: 80.6337 }
    },
    registration: {
      number: 'CP-KX-5678',
      expiryDate: new Date('2025-10-15')
    },
    insurance: {
      policyNumber: 'INS-PRADO-002',
      expiryDate: new Date('2025-10-15'),
      coverage: 'full-coverage'
    }
  },
  {
    name: 'Nissan Serena',
    make: 'Nissan',
    model: 'Serena',
    year: 2018,
    vehicleType: 'Van',
    description: 'Modern MPV (Multi-Purpose Vehicle) ideal for families. Hybrid technology for silent and smooth city travel.',
    capacity: { passengers: 7, luggage: 3 },
    pricing: {
      dailyRate: 12000,
      hourlyRate: 1200,
      fuelIncluded: false,
      driverIncluded: true
    },
    features: {
      airConditioning: true,
      wifi: true,
      gps: true,
      musicSystem: true,
      chargingPorts: true,
      wheelchairAccessible: false,
      childSeat: true
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/2018_Nissan_Serena_hybrid.jpg',
        caption: 'Nissan Serena Hybrid Exterior',
        isPrimary: true
      }
    ],
    status: 'available',
    location: {
      city: 'Negombo',
      district: 'Gampaha',
      coordinates: { latitude: 7.2008, longitude: 79.8737 }
    },
    registration: {
      number: 'WP-NA-9988',
      expiryDate: new Date('2025-08-20')
    },
    insurance: {
      policyNumber: 'INS-SERENA-003',
      expiryDate: new Date('2025-08-20'),
      coverage: 'comprehensive'
    }
  },
  {
    name: 'Nissan X-Trail',
    make: 'Nissan',
    model: 'X-Trail',
    year: 2017,
    vehicleType: 'SUV',
    description: 'Versatile SUV with panoramic sunroof and spacious interior. Great for touring Sri Lanka with style and comfort.',
    capacity: { passengers: 5, luggage: 3 },
    pricing: {
      dailyRate: 18000,
      hourlyRate: 1800,
      fuelIncluded: false,
      driverIncluded: true
    },
    features: {
      airConditioning: true,
      wifi: false,
      gps: true,
      musicSystem: true,
      chargingPorts: true,
      wheelchairAccessible: false,
      childSeat: false
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Nissan_X-Trail_%28T32%29_Registered_November_2014_1598cc.jpg',
        caption: 'Nissan X-Trail Exterior',
        isPrimary: true
      }
    ],
    status: 'available',
    location: {
      city: 'Galle',
      district: 'Galle',
      coordinates: { latitude: 6.0535, longitude: 80.2210 }
    },
    registration: {
      number: 'SP-KO-4455',
      expiryDate: new Date('2025-11-10')
    },
    insurance: {
      policyNumber: 'INS-XTRAIL-004',
      expiryDate: new Date('2025-11-10'),
      coverage: 'comprehensive'
    }
  },
  {
    name: 'Toyota Prius',
    make: 'Toyota',
    model: 'Prius',
    year: 2016,
    vehicleType: 'Car',
    description: 'Eco-friendly hybrid sedan. Perfect for city tours and budget-conscious travelers seeking comfort.',
    capacity: { passengers: 4, luggage: 2 },
    pricing: {
      dailyRate: 9000,
      hourlyRate: 900,
      fuelIncluded: false,
      driverIncluded: true
    },
    features: {
      airConditioning: true,
      wifi: false,
      gps: true,
      musicSystem: true,
      chargingPorts: true,
      wheelchairAccessible: false,
      childSeat: false
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/2016_Toyota_Prius.jpg',
        caption: 'Toyota Prius Exterior',
        isPrimary: true
      }
    ],
    status: 'available',
    location: {
      city: 'Colombo',
      district: 'Colombo',
      coordinates: { latitude: 6.9271, longitude: 79.8612 }
    },
    registration: {
      number: 'WP-CA-3322',
      expiryDate: new Date('2025-06-30')
    },
    insurance: {
      policyNumber: 'INS-PRIUS-005',
      expiryDate: new Date('2025-06-30'),
      coverage: 'third-party'
    }
  },
  {
    name: 'Yutong Luxury Bus',
    make: 'Yutong',
    model: 'ZK6122H',
    year: 2019,
    vehicleType: 'Bus',
    description: 'Large luxury tourist bus with reclining seats and ample legroom. Ideal for large groups and excursions.',
    capacity: { passengers: 45, luggage: 45 },
    pricing: {
      dailyRate: 45000,
      hourlyRate: 4500,
      fuelIncluded: false,
      driverIncluded: true
    },
    features: {
      airConditioning: true,
      wifi: true,
      gps: true,
      musicSystem: true,
      chargingPorts: false,
      wheelchairAccessible: false,
      childSeat: false
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Yutong_city_bus.jpg',
        caption: 'Yutong Luxury Bus Exterior',
        isPrimary: true
      }
    ],
    status: 'available',
    location: {
      city: 'Colombo',
      district: 'Colombo',
      coordinates: { latitude: 6.9271, longitude: 79.8612 }
    },
    registration: {
      number: 'WP-NB-7777',
      expiryDate: new Date('2025-09-01')
    },
    insurance: {
      policyNumber: 'INS-YUTONG-006',
      expiryDate: new Date('2025-09-01'),
      coverage: 'full-coverage'
    }
  },
  {
    name: 'Toyota KDH Van',
    make: 'Toyota',
    model: 'KDH 200',
    year: 2017,
    vehicleType: 'Van',
    description: 'Wide-body luxury van (KDH) offering premium comfort for small groups. Known for reliability and spacious interior.',
    capacity: { passengers: 10, luggage: 6 },
    pricing: {
      dailyRate: 14000,
      hourlyRate: 1400,
      fuelIncluded: false,
      driverIncluded: true
    },
    features: {
      airConditioning: true,
      wifi: false,
      gps: true,
      musicSystem: true,
      chargingPorts: true,
      wheelchairAccessible: false,
      childSeat: false
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Hiace1456%28front%29.jpg',
        caption: 'Toyota KDH Exterior',
        isPrimary: true
      }
    ],
    status: 'available',
    location: {
      city: 'Kandy',
      district: 'Kandy',
      coordinates: { latitude: 7.2906, longitude: 80.6337 }
    },
    registration: {
      number: 'CP-KD-1122',
      expiryDate: new Date('2025-07-15')
    },
    insurance: {
      policyNumber: 'INS-KDH-007',
      expiryDate: new Date('2025-07-15'),
      coverage: 'comprehensive'
    }
  }
];

module.exports = sampleVehicles;
