import React from 'react';
import { 
  Users, 
  Bed, 
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
  Globe
} from 'lucide-react';
import { hotelUtils } from '../../services/hotels/hotelService';

const RoomCard = ({ room, onSelect, selected = false }) => {
  const amenityIcons = {
    wifi: Wifi,
    airConditioning: Wind,
    tv: Tv,
    minibar: Coffee,
    balcony: Waves,
    oceanView: Waves,
    mountainView: MapPin,
    roomService: Utensils,
    safe: Sparkles,
    parking: Car,
    gym: Dumbbell,
    spa: Sparkles,
    restaurant: Utensils,
    bar: Coffee,
    pool: Waves,
    airportPickup: Navigation,
    tourBooking: Globe,
    currencyExchange: Sparkles,
    laundryService: Sparkles,
    englishSpeakingStaff: Users,
    localTransportation: Car,
    safetyDepositBox: Sparkles,
    internationalAdapters: Sparkles,
    ayurveda: Sparkles,
    culturalShows: Sparkles,
    localCuisine: Utensils,
    heritageExperience: Sparkles,
    wildlifeSafari: Sparkles,
    plantationTour: Sparkles
  };

  const getAmenityIcon = (amenity) => {
    const IconComponent = amenityIcons[amenity] || Sparkles;
    return <IconComponent className="w-4 h-4" />;
  };

  const getAmenityLabel = (amenity) => {
    const labels = {
      wifi: 'Free WiFi',
      airConditioning: 'Air Conditioning',
      tv: 'TV',
      minibar: 'Mini Bar',
      balcony: 'Balcony',
      oceanView: 'Ocean View',
      mountainView: 'Mountain View',
      roomService: 'Room Service',
      safe: 'Safe',
      parking: 'Parking',
      gym: 'Gym Access',
      spa: 'Spa Access',
      restaurant: 'Restaurant',
      bar: 'Bar',
      pool: 'Swimming Pool',
      airportPickup: 'Airport Pickup',
      tourBooking: 'Tour Booking',
      currencyExchange: 'Currency Exchange',
      laundryService: 'Laundry Service',
      englishSpeakingStaff: 'English Speaking Staff',
      localTransportation: 'Local Transportation',
      safetyDepositBox: 'Safety Deposit Box',
      internationalAdapters: 'International Adapters',
      ayurveda: 'Ayurveda',
      culturalShows: 'Cultural Shows',
      localCuisine: 'Local Cuisine',
      heritageExperience: 'Heritage Experience',
      wildlifeSafari: 'Wildlife Safari',
      plantationTour: 'Plantation Tour'
    };
    return labels[amenity] || amenity;
  };

  return (
    <div className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
            {hotelUtils.formatPrice(room.basePrice) && (
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {hotelUtils.formatPrice(room.basePrice)}
                </div>
                <div className="text-sm text-gray-600">per night</div>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-4">{room.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{room.maxOccupancy.adults} adults, {room.maxOccupancy.children} children</span>
            </div>
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{room.bedConfiguration.join(', ')}</span>
            </div>
            {room.size && (
              <div className="flex items-center">
                <span>{room.size} sq ft</span>
              </div>
            )}
          </div>

          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {room.amenities.slice(0, 6).map((amenity) => (
                <div key={amenity} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {getAmenityIcon(amenity)}
                  <span>{getAmenityLabel(amenity)}</span>
                </div>
              ))}
              {room.amenities.length > 6 && (
                <span className="text-xs text-gray-500">
                  +{room.amenities.length - 6} more
                </span>
              )}
            </div>
          )}

          {room.images && room.images.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto">
              {room.images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${room.name} - Image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ))}
              {room.images.length > 3 && (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                  +{room.images.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 lg:mt-0 lg:ml-6">
          <button
            onClick={() => onSelect(room)}
            className={`w-full px-6 py-2 rounded-lg transition-colors ${
              selected
                ? 'bg-blue-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {selected ? 'Selected' : 'Select Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
