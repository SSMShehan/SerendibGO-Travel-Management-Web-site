// Sample hotel data for seeding
const sampleHotels = [
    {
        name: 'Cinnamon Grand Colombo',
        description: 'A 5-star hotel offering luxury and grandeur in the heart of Colombo. Experience the finest in Sri Lankan hospitality with world-class amenities and dining.',
        shortDescription: 'Luxury city hotel in the heart of Colombo.',
        location: {
            address: '77 Galle Rd, Colombo 00300',
            city: 'Colombo',
            district: 'Colombo',
            coordinates: { latitude: 6.9174, longitude: 79.8495 },
            area: 'City Center'
        },
        owner: null, // To be assigned during seeding
        category: 'Luxury Hotel',
        starRating: 5,
        amenities: {
            wifi: true,
            airConditioning: true,
            hotWater: true,
            parking: true,
            restaurant: true,
            bar: true,
            pool: true,
            gym: true,
            spa: true,
            airportPickup: true,
            tourBooking: true,
            currencyExchange: true,
            laundryService: true,
            englishSpeakingStaff: true,
            safetyDepositBox: true
        },
        images: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Cinnamon_Grand_Hotel_pool.jpg',
                caption: 'Pool View',
                isPrimary: true,
                category: 'pool'
            },
            {
                url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Cinnamon_Grand%2C_Colombo%2C_Atrium.jpg',
                caption: 'Grand Atrium',
                isPrimary: false,
                category: 'interior'
            }
        ],
        roomTypes: [
            {
                name: 'Premium Room',
                description: 'Spacious room with city views and modern amenities.',
                maxOccupancy: 2,
                bedTypes: ['King'],
                size: 35,
                basePrice: 45000,
                availability: 10
            },
            {
                name: 'Executive Suite',
                description: 'Luxury suite with separate living area.',
                maxOccupancy: 3,
                bedTypes: ['King'],
                size: 65,
                basePrice: 85000,
                availability: 5
            }
        ],
        contact: {
            phone: '+94 11 2 437437',
            email: 'grand@cinnamonhotels.com',
            website: 'https://www.cinnamonhotels.com/cinnamongrandcolombo'
        },
        policies: {
            checkInTime: '14:00',
            checkOutTime: '12:00',
            cancellationPolicy: '24 hours'
        },
        status: 'approved',
        featured: true
    },
    {
        name: 'Heritance Kandalama',
        description: 'An architectural masterpiece designed by Geoffrey Bawa, Heritance Kandalama is set amidst the jungle and overlooks the Kandalama Tank.',
        shortDescription: 'Eco-resort designed by Geoffrey Bawa in Dambulla.',
        location: {
            address: 'P.O Box 11, Dambulla',
            city: 'Dambulla',
            district: 'Matale',
            coordinates: { latitude: 7.8596, longitude: 80.7073 },
            area: 'Cultural Triangle'
        },
        owner: null,
        category: 'Eco Lodge',
        starRating: 5,
        amenities: {
            wifi: true,
            pool: true,
            spa: true,
            restaurant: true,
            wildlifeSafari: true,
            heritageExperience: true
        },
        images: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Heritance_Kandalama_Exterior_View.JPG',
                caption: 'Exterior View',
                isPrimary: true,
                category: 'exterior'
            },
            {
                url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Heritance_Kandalama_%28231860281%29.jpeg',
                caption: 'Infinity Pool',
                isPrimary: false,
                category: 'pool'
            }
        ],
        roomTypes: [
            {
                name: 'Superior Room',
                description: 'Room with views of the Kandalama Lake.',
                maxOccupancy: 2,
                bedTypes: ['Queen'],
                size: 30,
                basePrice: 55000,
                availability: 15
            }
        ],
        contact: {
            phone: '+94 66 5 555000',
            email: 'kandalama@heritancehotels.com'
        },
        status: 'approved',
        featured: true
    },
    {
        name: 'Jetwing Blue',
        description: 'A stylish beachfront hotel in Negombo, offering sweeping views of the Indian Ocean and contemporary luxury.',
        shortDescription: 'Beachfront luxury in Negombo.',
        location: {
            address: 'Ethukale, Negombo',
            city: 'Negombo',
            district: 'Gampaha',
            coordinates: { latitude: 7.2343, longitude: 79.8415 },
            area: 'Beach'
        },
        owner: null,
        category: 'Beach Resort',
        starRating: 5,
        amenities: {
            wifi: true,
            pool: true,
            beachAccess: true,
            restaurant: true,
            bar: true,
            airportPickup: true
        },
        images: [
            {
                url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/28733008.jpg?k=15c7a42168472502690382346907604675545229202688006456012015024472&o=&hp=1',
                caption: 'Hotel Exterior and Pool',
                isPrimary: true,
                category: 'exterior'
            }
        ],
        roomTypes: [
            {
                name: 'Deluxe Room',
                description: 'Spacious room with private balcony overlooking the ocean.',
                maxOccupancy: 2,
                bedTypes: ['King'],
                size: 40,
                basePrice: 35000,
                availability: 20
            }
        ],
        contact: {
            phone: '+94 31 2 277000',
            email: 'reservations@jetwinghotels.com'
        },
        status: 'approved',
        featured: true
    },
    {
        name: 'Anantara Peace Haven Tangalle Resort',
        description: 'A secluded beachfront resort on a rocky outcrop along the southern coast of Sri Lanka, offering unparalleled luxury and tranquility.',
        shortDescription: 'Secluded luxury resort on the southern coast.',
        location: {
            address: 'Goyambokka Estate, Tangalle',
            city: 'Tangalle',
            district: 'Hambantota',
            coordinates: { latitude: 6.0355, longitude: 80.7850 },
            area: 'Coastal'
        },
        owner: null,
        category: 'Luxury Hotel',
        starRating: 5,
        amenities: {
            wifi: true,
            pool: true,
            spa: true,
            yoga: true,
            tennisCourt: true,
            privateBeach: true
        },
        images: [
            {
                url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/60101344.jpg?k=b444747535574384077673550884572230784224744475525501503803135041&o=&hp=1',
                caption: 'Resort View',
                isPrimary: true,
                category: 'exterior'
            }
        ],
        roomTypes: [
            {
                name: 'Premier Beach Access Room',
                description: 'Luxury room with direct access to the beach.',
                maxOccupancy: 2,
                bedTypes: ['King'],
                size: 50,
                basePrice: 95000,
                availability: 8
            },
            {
                name: 'Ocean View Pool Villa',
                description: 'Private villa with plunge pool and ocean views.',
                maxOccupancy: 2,
                bedTypes: ['King'],
                size: 100,
                basePrice: 150000,
                availability: 3
            }
        ],
        contact: {
            phone: '+94 47 2 244466',
            email: 'tangalle@anantara.com'
        },
        status: 'approved',
        featured: true
    },
    {
        name: 'Jetwing Jaffna',
        description: 'Ideally located in the heart of Jaffna, blending contemporary hospitality with the rich cultural heritage of the north.',
        shortDescription: 'Modern luxury in the heart of Jaffna.',
        location: {
            address: '37, Mahatma Gandhi Road, Jaffna',
            city: 'Jaffna',
            district: 'Jaffna',
            coordinates: { latitude: 9.6655, longitude: 80.0205 },
            area: 'City Center'
        },
        owner: null,
        category: 'Luxury Hotel',
        starRating: 4,
        amenities: {
            wifi: true,
            airConditioning: true,
            restaurant: true,
            rooftopBar: true
        },
        images: [
            {
                url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/59100892.jpg?k=8644535316447547167667756778465133644265715566085117424682410712&o=&hp=1',
                caption: 'Hotel Exterior',
                isPrimary: true,
                category: 'exterior'
            }
        ],
        roomTypes: [
            {
                name: 'Deluxe Room',
                description: 'Modern room with views of Jaffna city.',
                maxOccupancy: 2,
                bedTypes: ['Double'],
                size: 28,
                basePrice: 25000,
                availability: 12
            }
        ],
        contact: {
            phone: '+94 21 2 215571',
            email: 'jaffna@jetwinghotels.com'
        },
        status: 'approved',
        featured: true
    },
    {
        name: 'Shangri-La Colombo',
        description: 'A personal tropical sanctuary in the heart of Colombo, offering the finest collection of guestrooms, suites, and apartments.',
        shortDescription: 'Ultra-luxury hotel in Colombo.',
        location: {
            address: '1 Galle Face, Colombo 00200',
            city: 'Colombo',
            district: 'Colombo',
            coordinates: { latitude: 6.9298, longitude: 79.8453 },
            area: 'City Center'
        },
        owner: null,
        category: 'Luxury Hotel',
        starRating: 5,
        amenities: {
            wifi: true,
            pool: true,
            spa: true,
            gym: true,
            shoppingMall: true,
            restaurant: true
        },
        images: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Shangri-la_Colombo_under_construction_as_at_June_2017..jpg',
                caption: 'Hotel Exterior',
                isPrimary: true,
                category: 'exterior'
            },
            {
                url: 'https://www.handelarchitects.com/images/uploads/projects/_full/00_849_11_056.jpg',
                caption: 'Shangri-La Colombo Facade',
                isPrimary: false,
                category: 'exterior'
            }
        ],
        roomTypes: [
            {
                name: 'Deluxe Lake View Room',
                description: 'Room with stunning views of the Beira Lake.',
                maxOccupancy: 2,
                bedTypes: ['King'],
                size: 42,
                basePrice: 65000,
                availability: 20
            },
            {
                name: 'Premier Ocean View Room',
                description: 'Spacious room overlooking the Indian Ocean.',
                maxOccupancy: 2,
                bedTypes: ['King'],
                size: 42,
                basePrice: 75000,
                availability: 15
            }
        ],
        contact: {
            phone: '+94 11 7 888288',
            email: 'colombo@shangri-la.com'
        },
        status: 'approved',
        featured: true
    }
];

module.exports = sampleHotels;
