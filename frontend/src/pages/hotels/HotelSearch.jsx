import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHotel } from '../../context/hotels/HotelContext';
import { hotelUtils } from '../../services/hotels/hotelService';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Filter,
  Star,
  Loader2,
  AlertCircle,
  Wifi,
  Wind,
  Waves,
  Utensils,
  Car,
  Plane,
  Coffee,
  Heart,
  ArrowRight,
  Check,
  ChevronDown
} from 'lucide-react';

const HotelSearch = () => {
  const navigate = useNavigate();
  const { hotels, hotelsLoading, hotelsError, filterActions, hotelActions } = useHotel();

  const [searchParams, setSearchParams] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    infants: 0
  });

  const [filters, setFilters] = useState({
    category: '',
    starRating: '',
    minPrice: '',
    maxPrice: '',
    amenities: [],
    area: ''
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load hotels on component mount
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      await hotelActions.getHotels({
        ...filters,
        sort: sortBy,
        order: sortOrder
      });
    } catch (error) {
      console.error('Failed to load hotels:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadHotels();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      starRating: '',
      minPrice: '',
      maxPrice: '',
      amenities: [],
      area: ''
    });
  };

  const handleHotelClick = (hotelId) => {
    navigate(`/hotels/${hotelId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateNights = () => {
    if (searchParams.checkIn && searchParams.checkOut) {
      return hotelUtils.calculateNights(searchParams.checkIn, searchParams.checkOut);
    }
    return 0;
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (lower.includes('park')) return <Car className="w-3 h-3" />;
    if (lower.includes('food') || lower.includes('restaurant')) return <Utensils className="w-3 h-3" />;
    if (lower.includes('pool')) return <Waves className="w-3 h-3" />;
    if (lower.includes('spa')) return <Wind className="w-3 h-3" />;
    if (lower.includes('coffee')) return <Coffee className="w-3 h-3" />;
    if (lower.includes('airport')) return <Plane className="w-3 h-3" />;
    return <Check className="w-3 h-3" />;
  }

  return (
    <div className="min-h-screen bg-surface-50 relative">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-200/20 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Hero Section */}
      <div
        className="relative overflow-hidden h-[40vh] flex items-center justify-center z-10"
        style={{
          backgroundImage: 'url(/hero_hotel.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-[2px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-display font-bold mb-4 drop-shadow-lg"
          >
            Find Your Perfect <span className="text-secondary-400">Stay</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto font-medium"
          >
            Discover luxury hotels, cozy villas, and serene resorts across Sri Lanka.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">

        {/* Unified Search & Filter Bar */}
        <GlassCard className="p-6 mb-12 shadow-2xl border-white/20 bg-white/60 backdrop-blur-2xl">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              {/* Destination Search (Top Bar) */}
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <select
                  value={searchParams.city}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, city: e.target.value }))}
                  className="block w-full pl-11 pr-10 py-4 bg-white/40 border border-white/30 rounded-xl leading-5 text-surface-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all duration-300 sm:text-sm backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option value="">Select Destination</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Negombo">Negombo</option>
                  <option value="Bentota">Bentota</option>
                  <option value="Hikkaduwa">Hikkaduwa</option>
                  <option value="Unawatuna">Unawatuna</option>
                  <option value="Mirissa">Mirissa</option>
                  <option value="Weligama">Weligama</option>
                  <option value="Tangalle">Tangalle</option>
                  <option value="Arugam Bay">Arugam Bay</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Ella">Ella</option>
                  <option value="Sigiriya">Sigiriya</option>
                  <option value="Dambulla">Dambulla</option>
                  <option value="Anuradhapura">Anuradhapura</option>
                  <option value="Polonnaruwa">Polonnaruwa</option>
                  <option value="Trincomalee">Trincomalee</option>
                  <option value="Jaffna">Jaffna</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-surface-400" />
                </div>
              </div>

              {/* Filters Toggle */}
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-4 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all w-full md:w-auto justify-center ${showFilters ? 'bg-primary-600 text-white' : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
                >
                  <Filter className="w-4 h-4" /> Advanced Filters
                </button>
                <button
                  type="submit"
                  className="md:hidden px-6 py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 flex items-center justify-center transition-all"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Expandable Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 border-t border-surface-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Date Filters */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Check-in</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                          <input
                            type="date"
                            value={searchParams.checkIn}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, checkIn: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Check-out</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                          <input
                            type="date"
                            value={searchParams.checkOut}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, checkOut: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guest & Price */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Guests</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                          <select
                            value={`${searchParams.adults} adults, ${searchParams.children} children`}
                            onChange={(e) => {
                              const [adults, children] = e.target.value.split(', ');
                              setSearchParams(prev => ({
                                ...prev,
                                adults: parseInt(adults),
                                children: parseInt(children)
                              }));
                            }}
                            className="w-full pl-10 pr-8 py-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all"
                          >
                            <option value="1 adults, 0 children">1 adult</option>
                            <option value="2 adults, 0 children">2 adults</option>
                            <option value="2 adults, 1 children">2 adults + 1 child</option>
                            <option value="2 adults, 2 children">2 adults + 2 children</option>
                            <option value="4 adults, 0 children">4 adults</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Price Range (LKR)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="w-1/2 px-3 py-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="w-1/2 px-3 py-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category & Rating */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Category</label>
                        <div className="relative">
                          <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-4 py-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all"
                          >
                            <option value="">All Categories</option>
                            <option value="Beach Resort">Beach Resort</option>
                            <option value="Luxury Hotel">Luxury Hotel</option>
                            <option value="Villa">Villa</option>
                            <option value="Boutique Hotel">Boutique Hotel</option>
                            <option value="Eco Lodge">Eco Lodge</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Star Rating</label>
                        <div className="relative">
                          <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                          <select
                            value={filters.starRating}
                            onChange={(e) => handleFilterChange('starRating', e.target.value)}
                            className="w-full pl-10 pr-8 py-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all"
                          >
                            <option value="">Any Rating</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                            <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
                            <option value="3">⭐⭐⭐ 3+ Stars</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Actions & Amenities Preview */}
                    <div className="flex flex-col justify-end space-y-4">
                      <button
                        type="submit"
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 flex items-center justify-center transition-all transform hover:scale-[1.02]"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Update Results
                      </button>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm font-bold text-surface-500 hover:text-primary-600 transition-colors text-center"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  {/* Amenities Quick Select (Optional Row) */}
                  <div className="mt-6 pt-6 border-t border-surface-200/50">
                    <label className="block text-xs font-bold text-surface-600 uppercase mb-3 tracking-wider">Popular Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {['wifi', 'pool', 'spa', 'gym', 'restaurant', 'parking'].map(amenity => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleAmenityChange(amenity)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${filters.amenities.includes(amenity)
                            ? 'bg-primary-100 border-primary-200 text-primary-700'
                            : 'bg-white/40 border-surface-200 text-surface-600 hover:bg-white'
                            }`}
                        >
                          {getAmenityIcon(amenity)}
                          <span className="capitalize">{amenity}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </GlassCard>


        <div className="w-full">


          {/* Results Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-surface-900">
                {hotels.length} Hotels Found
              </h2>
              {searchParams.city && (
                <p className="text-surface-600 mt-1">
                  in {searchParams.city}
                  {searchParams.checkIn && searchParams.checkOut && (
                    <span> • {formatDate(searchParams.checkIn)} - {formatDate(searchParams.checkOut)}</span>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button
                className="lg:hidden px-4 py-2 bg-white border border-surface-200 rounded-lg shadow-sm text-surface-700 font-medium"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </button>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-surface-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-700 font-medium"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="ratings.overall-desc">Highest Rated</option>
                <option value="starRating-desc">Highest Star Rating</option>
                <option value="averageRoomPrice-asc">Price: Low to High</option>
                <option value="averageRoomPrice-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {hotelsLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
              <p className="mt-4 text-surface-600 font-medium animate-pulse">Finding the best prices...</p>
            </div>
          )}

          {/* Error State */}
          {hotelsError && (
            <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-red-800 mb-2">Error Loading Hotels</h3>
              <p className="text-red-600">{hotelsError}</p>
            </div>
          )}

          {/* Hotels Grid */}
          {!hotelsLoading && !hotelsError && (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {hotels.map((hotel, index) => (
                  <motion.div
                    key={hotel._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <GlassCard
                      className="bg-white/80 hover:bg-white transition-all duration-300 cursor-pointer overflow-hidden border-transparent hover:border-primary-100 ring-0 hover:ring-2 hover:ring-primary-500/20"
                      onClick={() => handleHotelClick(hotel._id)}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Hotel Image */}
                        <div className="md:w-1/3 relative overflow-hidden h-64 md:h-auto">
                          <div className="absolute inset-0 bg-surface-200 animate-pulse" />
                          <img
                            src={hotel.primaryImage || (hotel.images && hotel.images[0]?.url) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                            alt={hotel.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                            }}
                          />
                          <div className="absolute top-4 right-4">
                            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all shadow-lg">
                              <Heart className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-bold uppercase tracking-wider">
                              {hotel.category}
                            </div>
                          </div>
                        </div>

                        {/* Hotel Details */}
                        <div className="md:w-2/3 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-2xl font-display font-bold text-surface-900 group-hover:text-primary-600 transition-colors">
                                  {hotel.name}
                                </h3>
                                <div className="flex items-center text-surface-600 text-sm mt-1">
                                  <MapPin className="w-4 h-4 text-primary-500 mr-1" />
                                  {hotel.location?.city}, {hotel.location?.district}
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <div className="flex items-center bg-secondary-50 px-2 py-1 rounded-lg border border-secondary-100">
                                  <Star className="w-4 h-4 text-secondary-500 fill-current mr-1" />
                                  <span className="font-bold text-secondary-700">{hotel.ratings?.overall?.toFixed(1) || 'New'}</span>
                                </div>
                                <span className="text-xs text-surface-500 mt-1">{hotel.reviewCount} reviews</span>
                              </div>
                            </div>

                            <div className="flex items-center mb-4">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < (hotel.starRating || 0) ? 'text-amber-400 fill-current' : 'text-surface-200'
                                    }`}
                                />
                              ))}
                            </div>

                            <p className="text-surface-600 text-sm leading-relaxed mb-4 line-clamp-2">
                              {hotel.shortDescription || hotel.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {hotelUtils.getAmenitiesList(hotel.amenities).slice(0, 4).map(amenity => (
                                <span
                                  key={amenity}
                                  className="px-2.5 py-1 bg-surface-100 text-surface-600 text-xs font-medium rounded-lg border border-surface-200 flex items-center"
                                >
                                  {getAmenityIcon(amenity)}
                                  <span className="ml-1.5">{amenity.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </span>
                              ))}
                              {hotelUtils.getAmenitiesList(hotel.amenities).length > 4 && (
                                <span className="px-2.5 py-1 bg-surface-50 text-surface-500 text-xs font-medium rounded-lg border border-surface-100">
                                  +{hotelUtils.getAmenitiesList(hotel.amenities).length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-end justify-between border-t border-surface-100 pt-4 mt-2">
                            <div>
                              {hotel.averageRoomPrice ? (
                                <>
                                  <p className="text-sm text-surface-500">Starting from</p>
                                  <div className="text-2xl font-bold text-primary-600 font-display">
                                    {hotelUtils.formatPrice(hotel.averageRoomPrice)}
                                  </div>
                                  <p className="text-xs text-surface-400">per night / includes taxes</p>
                                </>
                              ) : (
                                <div className="text-lg font-bold text-primary-600">Contact for Price</div>
                              )}
                            </div>

                            <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all flex items-center transform group-hover:-translate-y-1">
                              View Details <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* No Results */}
          {!hotelsLoading && !hotelsError && hotels.length === 0 && (
            <GlassCard className="text-center py-16">
              <div className="bg-surface-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-surface-400" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">No hotels found</h3>
              <p className="text-surface-600 max-w-md mx-auto mb-6">
                We couldn't find any hotels matching your criteria. Try adjusting your dates, destination, or filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-white border border-surface-300 hover:bg-surface-50 text-surface-700 font-bold rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelSearch;
