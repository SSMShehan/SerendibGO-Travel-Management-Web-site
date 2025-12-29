import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  Star,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Heart,
  Share2,
  Navigation,
  DollarSign,
  Fuel as FuelIcon,
  Wrench as WrenchIcon,
  Shield,
  Wifi,
  Music,
  Coffee,
  Phone,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { vehicleSearchService } from '../../services/vehicles/vehicleSearchService';
import toast from 'react-hot-toast';

const VehicleSearchInterface = () => {
  const navigate = useNavigate();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  
  // Filters state
  const [filters, setFilters] = useState({
    vehicleType: '',
    make: '',
    model: '',
    year: '',
    priceRange: { min: '', max: '' },
    fuelType: '',
    transmission: '',
    seatingCapacity: '',
    features: [],
    location: '',
    radius: 50,
    rating: '',
    availability: {
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: ''
    }
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('relevance'); // relevance, price, rating, distance
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  
  useEffect(() => {
    fetchFilterOptions();
    performSearch();
  }, []);
  
  useEffect(() => {
    performSearch();
  }, [filters, sortBy, sortOrder, currentPage]);
  
  const fetchFilterOptions = async () => {
    try {
      const response = await vehicleSearchService.getFilterOptions();
      if (response.status === 'success') {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };
  
  const performSearch = async () => {
    try {
      setLoading(true);
      
      const searchFilters = {
        ...filters,
        query: searchQuery,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 12
      };
      
      const response = await vehicleSearchService.searchVehicles(searchFilters);
      if (response.status === 'success') {
        setVehicles(response.data.vehicles);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error searching vehicles:', error);
      toast.error('Failed to search vehicles');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch();
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };
  
  const handleFeatureToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setFilters({
      vehicleType: '',
      make: '',
      model: '',
      year: '',
      priceRange: { min: '', max: '' },
      fuelType: '',
      transmission: '',
      seatingCapacity: '',
      features: [],
      location: '',
      radius: 50,
      rating: '',
      availability: {
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: ''
      }
    });
    setCurrentPage(1);
  };
  
  const toggleFavorite = (vehicleId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(vehicleId)) {
        newFavorites.delete(vehicleId);
      } else {
        newFavorites.add(vehicleId);
      }
      return newFavorites;
    });
  };
  
  const handleViewVehicle = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };
  
  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 'sedan': return <Car className="w-5 h-5" />;
      case 'suv': return <Car className="w-5 h-5" />;
      case 'hatchback': return <Car className="w-5 h-5" />;
      case 'van': return <Car className="w-5 h-5" />;
      case 'truck': return <Car className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Vehicle</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for vehicles, locations, or features..."
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-lg flex items-center ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </button>
              
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.vehicleType}
                    onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    {filterOptions.vehicleTypes?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="input input-bordered w-full"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="input input-bordered w-full"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                    />
                  </div>
                </div>
                
                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.fuelType}
                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                  >
                    <option value="">All Fuel Types</option>
                    {filterOptions.fuelTypes?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  >
                    <option value="">All Transmissions</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>
                
                {/* Seating Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seating Capacity</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.seatingCapacity}
                    onChange={(e) => handleFilterChange('seatingCapacity', e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="2">2 seats</option>
                    <option value="4">4 seats</option>
                    <option value="5">5 seats</option>
                    <option value="7">7 seats</option>
                    <option value="8">8+ seats</option>
                  </select>
                </div>
                
                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="space-y-2">
                    {filterOptions.features?.map(feature => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm mr-2"
                          checked={filters.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={filters.availability.startDate}
                      onChange={(e) => handleFilterChange('availability', { ...filters.availability, startDate: e.target.value })}
                    />
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={filters.availability.endDate}
                      onChange={(e) => handleFilterChange('availability', { ...filters.availability, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Searching...' : `${vehicles.length} vehicles found`}
                </h2>
                {!loading && (
                  <p className="text-sm text-gray-600 mt-1">
                    Showing results for your search criteria
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Sort by:</label>
                  <select
                    className="select select-bordered select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="distance">Distance</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="btn btn-sm btn-outline"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* View Mode */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {/* Results Grid/List */}
            {!loading && vehicles.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {vehicles.map((vehicle) => (
                  <div key={vehicle._id} className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    {/* Vehicle Image */}
                    <div className={`relative ${viewMode === 'list' ? 'w-64 h-48' : 'h-48'}`}>
                      <img
                        src={vehicle.images?.[0] || '/placeholder-vehicle.jpg'}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <button
                          onClick={() => toggleFavorite(vehicle._id)}
                          className={`p-2 rounded-full ${
                            favorites.has(vehicle._id) 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white text-gray-600 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${favorites.has(vehicle._id) ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-2 bg-white rounded-full text-gray-600 hover:text-blue-500">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Available
                        </span>
                      </div>
                    </div>
                    
                    {/* Vehicle Info */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                          <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                        </div>
                        <div className="flex items-center">
                          {renderStars(vehicle.averageRating || 0)}
                          <span className="ml-1 text-sm text-gray-600">({vehicle.reviewCount || 0})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          {getVehicleTypeIcon(vehicle.type)}
                          <span className="ml-1 capitalize">{vehicle.type}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4" />
                          <span className="ml-1">{vehicle.seatingCapacity} seats</span>
                        </div>
                        <div className="flex items-center">
                          <FuelIcon className="h-4 w-4" />
                          <span className="ml-1">{vehicle.fuelType}</span>
                        </div>
                        <div className="flex items-center">
                          <WrenchIcon className="h-4 w-4" />
                          <span className="ml-1">{vehicle.transmission}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(vehicle.pricing?.basePrice || 0, vehicle.pricing?.currency)}
                          </span>
                          <span className="text-sm text-gray-600">/day</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="ml-1">{vehicle.location?.city}, {vehicle.location?.district}</span>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {vehicle.features?.slice(0, 3).map((feature, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {feature}
                          </span>
                        ))}
                        {vehicle.features?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{vehicle.features.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewVehicle(vehicle._id)}
                          className="flex-1 btn btn-primary btn-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/vehicles/${vehicle._id}/book`)}
                          className="flex-1 btn btn-outline btn-sm"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* No Results */}
            {!loading && vehicles.length === 0 && (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or filters to find more vehicles.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
            
            {/* Pagination */}
            {!loading && vehicles.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSearchInterface;
