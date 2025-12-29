import React, { useState, useEffect } from 'react'
import { Car, Users, Fuel, Calendar, Loader2, Gauge, Shield, CheckCircle2, ArrowRight, Search, Filter, ChevronDown, Zap, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import GlassCard from '../components/common/GlassCard'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [pickupDate, setPickupDate] = useState('')
  const [dropoffDate, setDropoffDate] = useState('')
  const [maxPrice, setMaxPrice] = useState(500)
  const [selectedPassengers, setSelectedPassengers] = useState('Any')
  const [selectedTransmission, setSelectedTransmission] = useState('Any')
  const [showFilters, setShowFilters] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        try {
          const response = await api.get('/vehicles?status=available')
          setVehicles(response.data.data || [])
        } catch (mainError) {
          console.log('Main vehicles endpoint failed, trying sample data:', mainError.message)
          const sampleResponse = await api.get('/sample-vehicles?status=available')
          setVehicles(sampleResponse.data.data?.vehicles || [])
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err)
        setError('Failed to load vehicles')
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  // Derived state for filtering
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle.description && vehicle.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'All' || vehicle.vehicleType === selectedType;

    const price = vehicle.pricing?.dailyRate || 0;
    const matchesPrice = price <= maxPrice;

    const capacity = vehicle.capacity?.passengers || vehicle.seatingCapacity || 0;
    const matchesPassengers = selectedPassengers === 'Any' || capacity >= parseInt(selectedPassengers);

    const matchesTransmission = selectedTransmission === 'Any' || (vehicle.transmission && vehicle.transmission.toLowerCase() === selectedTransmission.toLowerCase());

    return matchesSearch && matchesType && matchesPrice && matchesPassengers && matchesTransmission;
  });

  const vehicleTypes = ['All', ...new Set(vehicles.map(v => v.vehicleType).filter(Boolean))];

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden h-[50vh] flex items-center justify-center"
        style={{
          backgroundImage: 'url(/hero_vehicle.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-[2px] z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Premium <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">Fleet</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
              Travel in comfort and style with our selection of well-maintained vehicles.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-24">

        {/* Search & Filter Bar */}
        <GlassCard className="p-6 mb-12 shadow-2xl border-white/20 bg-white/60 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white/40 border border-white/30 rounded-xl leading-5 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all duration-300 sm:text-sm backdrop-blur-sm"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="relative min-w-[180px]">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-4 bg-white/40 border border-white/30 rounded-xl text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 shadow-sm cursor-pointer hover:border-white/50 transition-all backdrop-blur-sm"
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all min-w-[120px] justify-center ${showFilters ? 'bg-primary-600 text-white' : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
              >
                <Filter className="w-4 h-4" /> Filters
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
                <div className="pt-6 border-t border-surface-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Date Pickers */}
                  <div className="flex gap-2 w-full">
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Pickup</label>
                      <input
                        type="date"
                        value={pickupDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full h-11 px-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all backdrop-blur-sm"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Dropoff</label>
                      <input
                        type="date"
                        value={dropoffDate}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDropoffDate(e.target.value)}
                        className="w-full h-11 px-3 bg-white/40 border border-white/30 rounded-xl text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {/* Transmission Filter (New) */}
                  <div className="relative w-full">
                    <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Transmission</label>
                    <div className="relative">
                      <select
                        value={selectedTransmission}
                        onChange={(e) => setSelectedTransmission(e.target.value)}
                        className="w-full h-11 appearance-none pl-3 pr-8 bg-white/40 border border-white/30 rounded-xl text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all cursor-pointer backdrop-blur-sm"
                      >
                        <option value="Any">Any Transmission</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="relative w-full">
                    <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 tracking-wider">Seats</label>
                    <div className="relative">
                      <select
                        value={selectedPassengers}
                        onChange={(e) => setSelectedPassengers(e.target.value)}
                        className="w-full h-11 appearance-none pl-3 pr-8 bg-white/40 border border-white/30 rounded-xl text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all cursor-pointer backdrop-blur-sm"
                      >
                        <option value="Any">Any</option>
                        <option value="2">2+</option>
                        <option value="4">4+</option>
                        <option value="6">6+</option>
                        <option value="8">8+</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="w-full pb-2">
                    <label className="block text-xs font-bold text-surface-600 uppercase mb-2 ml-1 flex justify-between tracking-wider">
                      <span>Max Price</span>
                      <span className="text-primary-600">${maxPrice}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-2 bg-surface-200/50 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Results Count */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-surface-900">
            {loading ? 'Loading Fleet...' : `${filteredVehicles.length} Vehicles Available`}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" />
              <span className="text-surface-600 font-medium">Loading your ride...</span>
            </div>
          </div>
        ) : error ? (
          <GlassCard className="text-center py-12 p-8">
            <Car className="h-16 w-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">Unable to load vehicles</h3>
            <p className="text-surface-600">{error}</p>
          </GlassCard>
        ) : filteredVehicles.length === 0 ? (
          <GlassCard className="text-center py-12 p-8">
            <Car className="h-16 w-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">No vehicles found</h3>
            <p className="text-surface-600">Try adjusting your search or filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setMaxPrice(1000);
                setSelectedPassengers('Any');
                setPickupDate('');
                setDropoffDate('');
                setSelectedTransmission('Any');
              }}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear All Filters
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence>
              {filteredVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="overflow-hidden group hover:border-primary-200 transition-all duration-300 bg-white/80 hover:bg-white/90 backdrop-blur-md">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8">
                      {/* Image Section */}
                      <div className="h-64 lg:h-auto bg-surface-200 relative overflow-hidden">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img
                            src={vehicle.images[0].url || vehicle.images[0]}
                            alt={vehicle.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-surface-400">
                            <Car className="w-16 h-16" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-surface-900 shadow-sm uppercase tracking-wide border border-white/20">
                            {vehicle.vehicleType}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="lg:col-span-2 p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-surface-900 mb-2 group-hover:text-primary-600 transition-colors">{vehicle.name}</h3>
                              <p className="text-surface-600 text-sm leading-relaxed max-w-2xl">{vehicle.description}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="text-3xl font-bold text-primary-600 font-display">
                                {vehicle.pricing?.currency || '$'} {(vehicle.pricing?.dailyRate || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-surface-500 font-medium uppercase tracking-wider">Per Day</div>
                            </div>
                          </div>

                          {/* Features Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-sm text-surface-700 font-medium">
                              <Users className="w-4 h-4 text-primary-500" />
                              <span>{vehicle.capacity?.passengers || vehicle.seatingCapacity || 0} Pass.</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-surface-700 font-medium">
                              <Fuel className="w-4 h-4 text-secondary-500" />
                              <span className="capitalize">{vehicle.fuelType || 'Petrol'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-surface-700 font-medium">
                              <Gauge className="w-4 h-4 text-accent-500" />
                              <span className="capitalize">{vehicle.transmission || 'Automatic'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-surface-700 font-medium">
                              <Shield className="w-4 h-4 text-green-500" />
                              <span>Insured</span>
                            </div>
                          </div>

                          {/* Detailed Features */}
                          <div>
                            <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Key Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {vehicle.features && Object.values(vehicle.features).some(f => f) ? (
                                Object.entries(vehicle.features)
                                  .filter(([_, enabled]) => enabled)
                                  .slice(0, 5)
                                  .map(([feature, _]) => (
                                    <span key={feature} className="px-3 py-1 bg-surface-100 text-surface-600 rounded-lg text-xs font-medium border border-surface-200 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-primary-500" />
                                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </span>
                                  ))
                              ) : (
                                <span className="text-surface-400 text-sm italic">Standard features included</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-surface-100">
                          <div className="text-left sm:hidden mr-auto">
                            <div className="text-2xl font-bold text-primary-600">
                              {vehicle.pricing?.currency || '$'} {(vehicle.pricing?.dailyRate || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-surface-500 font-medium uppercase tracking-wider">Per Day</div>
                          </div>

                          <button
                            onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                            className="px-6 py-3 text-surface-600 hover:text-primary-600 font-semibold transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => navigate(`/booking?vehicle=${vehicle._id}&pickup=${pickupDate}&dropoff=${dropoffDate}`)}
                            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                          >
                            Book Now <ArrowRight className="w-4 h-4" />
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
      </div>
    </div>
  )
}

export default Vehicles