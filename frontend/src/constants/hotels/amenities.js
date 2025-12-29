import { 
  Wifi, 
  Car, 
  Coffee, 
  Tv, 
  Wind, 
  Waves, 
  Utensils, 
  Dumbbell, 
  Sparkles, 
  MapPin, 
  Navigation,
  Globe,
  Users
} from 'lucide-react';

export const HOTEL_AMENITIES = {
  wifi: { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  airConditioning: { id: 'airConditioning', label: 'Air Conditioning', icon: Wind },
  tv: { id: 'tv', label: 'TV', icon: Tv },
  minibar: { id: 'minibar', label: 'Mini Bar', icon: Coffee },
  balcony: { id: 'balcony', label: 'Balcony', icon: Waves },
  oceanView: { id: 'oceanView', label: 'Ocean View', icon: Waves },
  mountainView: { id: 'mountainView', label: 'Mountain View', icon: MapPin },
  roomService: { id: 'roomService', label: 'Room Service', icon: Utensils },
  safe: { id: 'safe', label: 'Safe', icon: Sparkles },
  parking: { id: 'parking', label: 'Parking', icon: Car },
  gym: { id: 'gym', label: 'Gym Access', icon: Dumbbell },
  spa: { id: 'spa', label: 'Spa Access', icon: Sparkles },
  restaurant: { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  bar: { id: 'bar', label: 'Bar', icon: Coffee },
  pool: { id: 'pool', label: 'Swimming Pool', icon: Waves },
  airportPickup: { id: 'airportPickup', label: 'Airport Pickup', icon: Navigation },
  tourBooking: { id: 'tourBooking', label: 'Tour Booking', icon: Globe },
  currencyExchange: { id: 'currencyExchange', label: 'Currency Exchange', icon: Sparkles },
  laundryService: { id: 'laundryService', label: 'Laundry Service', icon: Sparkles },
  englishSpeakingStaff: { id: 'englishSpeakingStaff', label: 'English Speaking Staff', icon: Users },
  localTransportation: { id: 'localTransportation', label: 'Local Transportation', icon: Car },
  safetyDepositBox: { id: 'safetyDepositBox', label: 'Safety Deposit Box', icon: Sparkles },
  internationalAdapters: { id: 'internationalAdapters', label: 'International Adapters', icon: Sparkles },
  ayurveda: { id: 'ayurveda', label: 'Ayurveda', icon: Sparkles },
  culturalShows: { id: 'culturalShows', label: 'Cultural Shows', icon: Sparkles },
  localCuisine: { id: 'localCuisine', label: 'Local Cuisine', icon: Utensils },
  heritageExperience: { id: 'heritageExperience', label: 'Heritage Experience', icon: Sparkles },
  wildlifeSafari: { id: 'wildlifeSafari', label: 'Wildlife Safari', icon: Sparkles },
  plantationTour: { id: 'plantationTour', label: 'Plantation Tour', icon: Sparkles }
};

export const ROOM_AMENITIES = {
  wifi: { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  airConditioning: { id: 'airConditioning', label: 'Air Conditioning', icon: Wind },
  tv: { id: 'tv', label: 'TV', icon: Tv },
  minibar: { id: 'minibar', label: 'Mini Bar', icon: Coffee },
  balcony: { id: 'balcony', label: 'Balcony', icon: Waves },
  oceanView: { id: 'oceanView', label: 'Ocean View', icon: Waves },
  mountainView: { id: 'mountainView', label: 'Mountain View', icon: MapPin },
  roomService: { id: 'roomService', label: 'Room Service', icon: Utensils },
  safe: { id: 'safe', label: 'Safe', icon: Sparkles },
  parking: { id: 'parking', label: 'Parking', icon: Car }
};

export const getAmenityIcon = (amenity) => {
  return HOTEL_AMENITIES[amenity]?.icon || Sparkles;
};

export const getAmenityLabel = (amenity) => {
  return HOTEL_AMENITIES[amenity]?.label || amenity;
};
