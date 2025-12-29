import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHotel } from '../../context/hotels/HotelContext';
import { hotelAPI, roomAPI, hotelUtils } from '../../services/hotels/hotelService';
import hotelReviewService from '../../services/hotels/hotelReviewService';
import { useAuth } from '../../context/AuthContext';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Waves,
  Utensils,
  Dumbbell,
  Sparkles,
  Users,
  Bed,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  Navigation,
  Camera,
  MessageSquare,
  Plus,
  X,
  Shield,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hotelActions } = useHotel();
  const { user, isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    infants: 0,
    specialRequests: ''
  });

  // Review-related state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canUserReview, setCanUserReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);

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

  useEffect(() => {
    fetchHotelDetails();
    fetchRooms();
    fetchReviews();
    if (isAuthenticated) {
      checkReviewEligibility();
    }
  }, [id, isAuthenticated]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getHotel(id);
      setHotel(response.data.hotel);
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      toast.error('Failed to load hotel details');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      const response = await roomAPI.getRooms(id);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleImageNavigation = (direction) => {
    if (direction === 'next') {
      setSelectedImageIndex((prev) =>
        prev === hotel.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev === 0 ? hotel.images.length - 1 : prev - 1
      );
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = () => {
    if (!selectedRoom) {
      toast.error('Please select a room first');
      return;
    }

    // Validate booking data
    const validation = hotelUtils.validateDateRange(bookingData.checkIn, bookingData.checkOut);
    if (validation) {
      toast.error(validation);
      return;
    }

    // Navigate to booking page with data
    const bookingParams = new URLSearchParams({
      hotelId: id,
      roomId: selectedRoom._id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adults: bookingData.adults,
      children: bookingData.children,
      infants: bookingData.infants,
      specialRequests: bookingData.specialRequests
    });

    navigate(`/hotels/${id}/booking?${bookingParams.toString()}`);
  };

  const getAmenityIcon = (amenity) => {
    const IconComponent = amenityIcons[amenity] || Sparkles;
    return <IconComponent className="w-5 h-5 text-primary-500" />;
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

  // Review-related functions
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await hotelReviewService.getHotelReviews(id, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const response = await hotelReviewService.canUserReview(id);
      setCanUserReview(response.data.canReview);
      setReviewEligibility(response.data);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanUserReview(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews();
    checkReviewEligibility();
    // Refresh hotel data to update ratings
    fetchHotelDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">Hotel not found</h2>
          <Link to="/hotels" className="text-primary-600 hover:text-primary-800 font-bold hover:underline">
            Back to Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-200/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/hotels')}
            className="flex items-center text-surface-600 hover:text-primary-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Hotels
          </button>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full bg-white text-surface-600 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-white text-surface-600 hover:text-primary-600 hover:bg-blue-50 transition-colors shadow-sm">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hotel Header */}
        <GlassCard className="p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-4xl font-bold font-display text-surface-900">{hotel.name}</h1>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < hotel.starRating ? 'text-yellow-400 fill-current' : 'text-surface-300'
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center text-surface-600 mb-6 font-medium">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                <span>{hotel.location.address}, {hotel.location.city}, {hotel.location.district}</span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-surface-700 mb-6 font-medium">
                <div className="flex items-center">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {hotelUtils.getRatingDisplay(hotel.ratings.overall)} ({hotel.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md flex items-center capitalize">
                    <Users className="w-4 h-4 mr-1" />
                    {hotel.category}
                  </span>
                </div>
              </div>

              <p className="text-surface-600 leading-relaxed max-w-4xl">{hotel.description}</p>
            </div>

            <div className="mt-8 lg:mt-0 lg:ml-8 flex-shrink-0">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg text-center min-w-[240px]">
                {/* Show price if rooms exist, otherwise show 'View Rates' */}
                {rooms.length > 0 ? (
                  <>
                    <p className="text-surface-500 text-sm mb-1 font-medium">Starting from</p>
                    <div className="text-3xl font-bold font-display text-primary-600 mb-2">
                      {hotelUtils.formatPrice(Math.min(...rooms.map(r => r.basePrice || r.pricing?.basePrice || 0)))}
                    </div>
                    <div className="text-sm text-surface-500 mb-4 font-medium">per night</div>
                  </>
                ) : (
                  <div className="mb-4">
                    <p className="text-surface-500 text-sm font-medium">Best Rates Guaranteed</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    const roomsSection = document.getElementById('available-rooms');
                    roomsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-1"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Image Gallery */}
        {hotel.images && hotel.images.length > 0 && (
          <GlassCard className="p-6 mb-8">
            <div className="relative group">
              <div className="aspect-video rounded-2xl overflow-hidden bg-surface-200">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={hotel.images[selectedImageIndex].url}
                  alt={`${hotel.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {hotel.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium">
                {selectedImageIndex + 1} / {hotel.images.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {hotel.images.length > 1 && (
              <div className="flex space-x-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                {hotel.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${index === selectedImageIndex ? 'border-primary-500 ring-2 ring-primary-200 ring-offset-2' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Amenities */}
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold font-display text-surface-900 mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-primary-500" />
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {Object.entries(hotel.amenities).map(([amenity, available]) => (
                  available && (
                    <div key={amenity} className="flex items-center space-x-3 text-surface-700">
                      <div className="p-2 bg-primary-50 rounded-lg">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="font-medium">{getAmenityLabel(amenity)}</span>
                    </div>
                  )
                ))}
              </div>
            </GlassCard>

            {/* Rooms */}
            <div id="available-rooms">
              <h2 className="text-2xl font-bold font-display text-surface-900 mb-6 flex items-center">
                <Bed className="w-6 h-6 mr-3 text-primary-500" />
                Available Rooms
              </h2>

              {roomsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : rooms.length === 0 ? (
                <GlassCard className="text-center py-12 text-surface-500">
                  <Bed className="w-16 h-16 mx-auto mb-4 text-surface-300" />
                  <p className="text-lg font-medium">No rooms available at the moment</p>
                </GlassCard>
              ) : (
                <div className="space-y-6">
                  {rooms.map((room) => (
                    <GlassCard key={room._id} className="p-8 hover:shadow-xl transition-all duration-300 group">
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-surface-900">{room.name}</h3>
                          </div>

                          {/* Room Images */}
                          {room.images && room.images.length > 0 && (
                            <div className="mb-6 h-48 rounded-xl overflow-hidden relative">
                              <img
                                src={room.images[0].url}
                                alt={room.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              {room.images.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                                  +{room.images.length - 1} more
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-surface-600 mb-6 leading-relaxed">{room.description}</p>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center text-sm font-medium text-surface-700">
                              <Users className="w-4 h-4 mr-2 text-primary-500" />
                              <span>{room.maxOccupancy.adults} Adults, {room.maxOccupancy.children} Children</span>
                            </div>
                            <div className="flex items-center text-sm font-medium text-surface-700">
                              <Bed className="w-4 h-4 mr-2 text-primary-500" />
                              <span>{room.bedConfiguration.map(bed => `${bed.quantity} ${bed.type}`).join(', ')}</span>
                            </div>
                            {room.size && (
                              <div className="flex items-center text-sm font-medium text-surface-700">
                                <Box className="w-4 h-4 mr-2 text-primary-500" />
                                <span>{room.size} sq ft</span>
                              </div>
                            )}
                          </div>

                          {room.amenities && room.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {room.amenities.slice(0, 5).map((amenity) => (
                                <span key={amenity} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-700 border border-surface-200">
                                  {getAmenityLabel(amenity)}
                                </span>
                              ))}
                              {room.amenities.length > 5 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-700 border border-surface-200">
                                  +{room.amenities.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-between items-end border-l border-surface-200 pl-8 min-w-[200px]">
                          {hotelUtils.formatPrice(room.pricing?.basePrice) && (
                            <div className="text-right mb-4">
                              <div className="text-2xl font-bold font-display text-primary-600">
                                {hotelUtils.formatPrice(room.pricing?.basePrice)}
                              </div>
                              <div className="text-sm font-medium text-surface-500">per night</div>
                              <div className="text-xs text-green-600 mt-1 font-medium">Includes taxes & fees</div>
                            </div>
                          )}
                          <button
                            onClick={() => handleRoomSelect(room)}
                            className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-1"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <GlassCard className="p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold font-display text-surface-900 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3 text-primary-500" />
                  Guest Reviews
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="ml-2 font-bold text-lg text-surface-900">{hotelUtils.getRatingDisplay(hotel.ratings.overall)}</span>
                    <span className="ml-2 text-sm text-surface-600 font-medium">({hotel.reviewCount} reviews)</span>
                  </div>
                  {isAuthenticated && canUserReview && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors font-bold shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Write Review</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Review Eligibility Messages */}
              {isAuthenticated && !canUserReview && reviewEligibility?.reason && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3 flex-shrink-0">
                    <Award className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div>
                    <p className="text-yellow-800 font-bold mb-1">Review Requirements</p>
                    <p className="text-yellow-700 text-sm">
                      {reviewEligibility.reason}
                    </p>
                  </div>
                </div>
              )}

              {!isAuthenticated && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-8 flex items-start">
                  <div className="p-2 bg-primary-100 rounded-lg mr-3 flex-shrink-0">
                    <Users className="w-5 h-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="text-primary-800 font-bold mb-1">Sign in to write a review</p>
                    <p className="text-primary-700 text-sm">You need to be signed in to write reviews</p>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-surface-500 bg-surface-50 rounded-xl border-dashed border-2 border-surface-200">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-surface-300" />
                  <p className="font-medium">No reviews yet. Be the first to review this hotel!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-surface-100 pb-8 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg shadow-inner">
                            {review.user?.firstName?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <h4 className="font-bold text-surface-900">
                              {review.user?.firstName} {review.user?.lastName}
                            </h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating.overall ? 'text-yellow-400 fill-current' : 'text-surface-200'
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-surface-500 font-medium">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.isVerified && (
                          <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                            <span className="text-xs font-bold">Verified Stay</span>
                          </div>
                        )}
                      </div>

                      <div className="pl-15 ml-15">
                        <p className="text-surface-700 mb-4 leading-relaxed bg-surface-50/50 p-4 rounded-xl border border-surface-100 italic">"{review.content}"</p>

                        {/* Detailed Ratings */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                          {Object.entries({
                            Cleanliness: review.rating.cleanliness,
                            Location: review.rating.location,
                            Service: review.rating.service,
                            Value: review.rating.value,
                            Amenities: review.rating.amenities
                          }).map(([label, rating]) => (
                            <div key={label} className="bg-surface-50 p-2 rounded-lg text-center">
                              <div className="text-xs text-surface-500 font-medium mb-1">{label}</div>
                              <div className="flex justify-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-2 h-2 ${i < rating ? 'text-yellow-400 fill-current' : 'text-surface-200'
                                      }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Review Photos */}
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {review.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo.url}
                                alt={`Review photo ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Sidebar - Contact info etc */}
          <div className="space-y-8">
            <GlassCard className="p-6 sticky top-24">
              <h3 className="text-lg font-bold font-display text-surface-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer group">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-primary-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-surface-700 font-medium group-hover:text-primary-700 transition-colors">{hotel.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer group">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-emerald-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-surface-700 font-medium group-hover:text-emerald-700 transition-colors break-all">{hotel.contact.email}</span>
                </div>
                {hotel.contact.website && (
                  <a
                    href={hotel.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer group"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-blue-600">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-surface-700 font-medium group-hover:text-blue-700 transition-colors">Visit Website</span>
                  </a>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-surface-200">
                <h3 className="text-lg font-bold font-display text-surface-900 mb-4">Location</h3>
                {/* Placeholder for map - could be an image or iframe */}
                <div className="aspect-square bg-surface-200 rounded-xl flex items-center justify-center text-surface-500 mb-4 relative overflow-hidden group">
                  <MapPin className="w-12 h-12 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-200 to-surface-300 opacity-50 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <p className="text-center text-surface-600 text-sm font-medium">
                  {hotel.location.address}, {hotel.location.city}
                </p>
                <button className="w-full mt-4 flex items-center justify-center px-4 py-2 border border-surface-300 rounded-xl text-surface-700 font-medium hover:bg-surface-50 transition-colors">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="max-h-[85vh] overflow-y-auto overflow-x-hidden p-0 relative">
                <div className="p-6 border-b border-surface-200 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between">
                  <h3 className="text-xl font-bold font-display text-surface-900">Write a Review</h3>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="p-2 hover:bg-surface-100 rounded-full transition-colors text-surface-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-primary-500" />
                  </div>
                  <h4 className="text-xl font-bold text-surface-900 mb-2">Share your experience</h4>
                  <p className="text-surface-600 mb-8 max-w-md mx-auto">
                    Your feedback helps other travelers make better choices and helps {hotel.name} improve their service.
                  </p>

                  {/* Placeholder for the actual review form component integration */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm font-medium inline-block">
                    Review submission logic will be connected to the ReviewForm component here.
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Form Modal (Landscape Redesign) */}
      <AnimatePresence>
        {showBookingForm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 text-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingForm(false)}
              className="fixed inset-0 bg-surface-900/70 backdrop-blur-sm transition-opacity"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden text-left transform transition-all"
            >
              {/* Header */}
              <div className="relative h-24 bg-gradient-to-r from-primary-600 to-primary-500 flex items-center px-8">
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative z-10 w-full text-white">
                  <p className="text-primary-100 font-medium text-xs uppercase tracking-wider mb-0.5">Hotel Reservation</p>
                  <h2 className="text-2xl font-bold font-display leading-none">{selectedRoom?.name || 'Select Room'}</h2>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              </div>

              {/* Form Body - 2 Columns */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* LEFT COLUMN: Dates & Guests */}
                  <div className="space-y-5">
                    {/* Check-in / Check-out */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-surface-700">Check-in</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 w-4 h-4 pointer-events-none" />
                          <input
                            type="date"
                            value={bookingData.checkIn}
                            onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                            className="w-full pl-9 pr-2 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all font-medium text-sm text-surface-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-surface-700">Check-out</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 w-4 h-4 pointer-events-none" />
                          <input
                            type="date"
                            value={bookingData.checkOut}
                            onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                            className="w-full pl-9 pr-2 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all font-medium text-sm text-surface-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guests Compact Grid */}
                    <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200 space-y-3">
                      <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider">Guests</label>
                      <div className="grid grid-cols-3 gap-3">
                        {/* Adults */}
                        <div className="text-center bg-white p-2 rounded-xl border border-surface-100 shadow-sm">
                          <span className="block text-xs text-surface-500 mb-1">Adults</span>
                          <input
                            type="number"
                            min="1"
                            max={selectedRoom?.maxOccupancy.adults || 4}
                            value={bookingData.adults}
                            onChange={(e) => setBookingData({ ...bookingData, adults: parseInt(e.target.value) })}
                            className="w-full text-center font-bold text-lg focus:outline-none"
                          />
                        </div>
                        {/* Children */}
                        <div className="text-center bg-white p-2 rounded-xl border border-surface-100 shadow-sm">
                          <span className="block text-xs text-surface-500 mb-1">Children</span>
                          <input
                            type="number"
                            min="0"
                            max={selectedRoom?.maxOccupancy.children || 2}
                            value={bookingData.children}
                            onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) })}
                            className="w-full text-center font-bold text-lg focus:outline-none"
                          />
                        </div>
                        {/* Infants */}
                        <div className="text-center bg-white p-2 rounded-xl border border-surface-100 shadow-sm">
                          <span className="block text-xs text-surface-500 mb-1">Infants</span>
                          <input
                            type="number"
                            min="0"
                            value={bookingData.infants}
                            onChange={(e) => setBookingData({ ...bookingData, infants: parseInt(e.target.value) })}
                            className="w-full text-center font-bold text-lg focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Requests & Action */}
                  <div className="space-y-5 flex flex-col justify-between h-full">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-surface-700">Special Requests <span className="text-surface-400 font-normal text-xs">(Optional)</span></label>
                      <textarea
                        rows="4"
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all text-surface-900 placeholder-surface-400 resize-none"
                        placeholder="Early check-in, dietary requirements..."
                      />
                    </div>

                    <div>
                      <button
                        onClick={handleBookingSubmit}
                        className="w-full bg-primary-600 text-white px-6 py-4 rounded-xl hover:bg-primary-700 transition-all font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-5 h-5" />
                        Continue to Payment
                      </button>
                      <p className="text-center text-xs text-surface-400 mt-3 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" /> Secure Booking Process
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Box icon component placeholder since it was used in code but not imported
const Box = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
)

export default HotelDetails;
