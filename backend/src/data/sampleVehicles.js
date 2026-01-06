// Sample vehicles data for when database is not available
const sampleVehicles = [
  {
    _id: 'sample-1',
    name: 'Toyota Corolla',
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    vehicleType: 'Sedan',
    description: 'Comfortable sedan perfect for city tours and short trips.',
    capacity: { passengers: 4, luggage: 2 },
    seatingCapacity: 4,
    fuelType: 'Petrol',
    pricing: {
      currency: 'LKR',
      dailyRate: 8000,
      hourlyRate: 1000,
      perKmRate: 50
    },
    features: {
      airConditioning: true,
      wifi: false,
      gps: true,
      musicSystem: false,
      chargingPorts: false,
      wheelchairAccessible: false,
      childSeat: false
    },
    images: [],
    status: 'available',
    approvalDetails: {
      needsApproval: false,
      isApproved: true
    }
  },
  {
    _id: 'sample-2',
    name: 'Toyota Hiace',
    make: 'Toyota',
    model: 'Hiace',
    year: 2022,
    vehicleType: 'Van',
    description: 'Spacious van ideal for group tours and family trips.',
    capacity: { passengers: 12, luggage: 4 },
    seatingCapacity: 12,
    fuelType: 'Diesel',
    pricing: {
      currency: 'LKR',
      dailyRate: 12000,
      hourlyRate: 1500,
      perKmRate: 60
    },
    features: {
      airConditioning: true,
      wifi: false,
      gps: true,
      musicSystem: true,
      chargingPorts: true,
      wheelchairAccessible: false,
      childSeat: true
    },
    images: [],
    status: 'available',
    approvalDetails: {
      needsApproval: false,
      isApproved: true
    }
  },
  {
    _id: 'sample-3',
    name: 'Honda Civic',
    make: 'Honda',
    model: 'Civic',
    year: 2024,
    vehicleType: 'Sedan',
    description: 'Modern sedan with excellent fuel efficiency and comfort.',
    capacity: { passengers: 5, luggage: 2 },
    seatingCapacity: 5,
    fuelType: 'Petrol',
    pricing: {
      currency: 'LKR',
      dailyRate: 9000,
      hourlyRate: 1200,
      perKmRate: 55
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
    images: [],
    status: 'available',
    approvalDetails: {
      needsApproval: false,
      isApproved: true
    }
  }
];

module.exports = sampleVehicles;
