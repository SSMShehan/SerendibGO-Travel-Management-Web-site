import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Search,
  Filter,
  Heart,
  Clock,
  Award,
  ChevronDown,
  Sparkles,
  Zap,
  Eye,
  BookOpen,
  Mountain,
  Palmtree,
  Landmark,
  Camera,
  Coffee,
  Waves,
  Music
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTour } from '../context/TourContext'
import api from '../services/api'
import GlassCard from '../components/common/GlassCard'

const Tours = () => {
  const {
    tours,
    isLoading,
    error,
    setTours,
    setLoading,
    setError,
    clearFilters
  } = useTour()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { value: 'adventure', label: 'Adventure', icon: Mountain },
    { value: 'cultural', label: 'Cultural', icon: Landmark },
    { value: 'nature', label: 'Nature', icon: Palmtree },
    { value: 'beach', label: 'Beach', icon: Waves },
    { value: 'wildlife', label: 'Wildlife', icon: Camera },
    { value: 'religious', label: 'Religious', icon: Sparkles },
    { value: 'historical', label: 'Historical', icon: Landmark },
    { value: 'culinary', label: 'Culinary', icon: Coffee }
  ]

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/tours')
      if (response.data.success) {
        setTours(response.data.data)
      } else {
        setError('Failed to fetch tours')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load tours. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tour.shortDescription && tour.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(tour.category)
    const matchesPrice = tour.price >= priceRange[0] && tour.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  })

  const sortedTours = [...filteredTours].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'rating': return b.rating.average - a.rating.average
      case 'duration': return a.duration - b.duration
      case 'newest': return new Date(b.createdAt) - new Date(a.createdAt)
      default: return b.isFeatured - a.isFeatured
    }
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  const handleCategoryToggle = (categoryValue) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryValue)) {
        return prev.filter(c => c !== categoryValue)
      } else {
        return [...prev, categoryValue]
      }
    })
  }

  const TourCard = ({ tour }) => {
    // Find the category object to get the icon. If not found, default to generic icon or null.
    const categoryObj = categories.find(c => c.value === tour.category);
    const CategoryIcon = categoryObj ? categoryObj.icon : Sparkles; // Default icon
    const categoryLabel = categoryObj ? categoryObj.label : tour.category;

    return (
      <motion.div variants={itemVariants} layoutId={tour._id} className="h-full">
        <GlassCard className="group h-full flex flex-col hover:border-primary-300/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden p-0">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* Badges */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
              {tour.isFeatured && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-secondary-500 to-amber-500 text-white text-xs font-bold shadow-lg flex items-center gap-1 backdrop-blur-md">
                  <Award className="w-3 h-3" /> FEATURED
                </span>
              )}
              {tour.originalPrice && (
                <span className="px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold shadow-lg backdrop-blur-md">
                  -{Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)}%
                </span>
              )}
            </div>

            <button className="absolute top-4 left-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors group/heart">
              <Heart className="w-5 h-5 group-hover/heart:fill-red-500 group-hover/heart:text-red-500 transition-colors" />
            </button>

            {tour.images && tour.images.length > 0 ? (
              <img
                src={typeof tour.images[0] === 'string' ? tour.images[0] : tour.images[0]?.url}
                alt={tour.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />
            ) : (
              <div className="w-full h-full bg-surface-200 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-surface-400" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

            <div className="absolute bottom-4 left-4">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                <CategoryIcon className="w-3 h-3 mr-1.5" />
                {categoryLabel}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-grow bg-white/40 backdrop-blur-sm group-hover:bg-white/60 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-display font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                {tour.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-secondary-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold ml-1 text-surface-900">{tour.rating.average}</span>
              </div>
              <span className="text-xs text-surface-500">({tour.rating.count || 24} reviews)</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-surface-600 mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>{tour.duration} Days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary-500" />
                <span>Max {tour.maxParticipants}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="truncate max-w-[80px]">{tour.location.city}</span>
              </div>
            </div>

            <p className="text-surface-600 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
              {tour.shortDescription}
            </p>

            <div className="mt-auto pt-4 border-t border-surface-200/60 flex items-end justify-between">
              <div>
                <span className="text-xs text-surface-500 font-medium uppercase tracking-wider block mb-0.5">Starting from</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-primary-700">${tour.price}</span>
                  {tour.originalPrice && (
                    <span className="text-sm text-surface-400 line-through">${tour.originalPrice}</span>
                  )}
                </div>
              </div>

              <Link
                to={`/tours/${tour._id}`}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/20 font-bold flex items-center gap-2 transform active:scale-95"
              >
                Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-200/20 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Hero Section */}
      <div
        className="relative h-[40vh] min-h-[400px] flex items-center justify-center bg-fixed bg-cover bg-center z-10"
        style={{ backgroundImage: 'url(/traditional-stilt-fishermen-sri-lanka.jpg)' }}
      >
        <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-[1px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-bold uppercase tracking-wider mb-4">
              Discover Sri Lanka
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg">
              Unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-amber-300">Journeys</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
              Explore ancient ruins, pristine beaches, and lush rainforests with our expert-guided tours.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">

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
                placeholder="Search destinations, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="relative min-w-[180px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-4 bg-white/40 border border-white/30 rounded-xl text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 shadow-sm cursor-pointer hover:border-white/50 transition-all backdrop-blur-sm"
                >
                  <option value="featured">✨ Featured First</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💰 Price: High to Low</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="newest">🆕 Newest Added</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-surface-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
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
                <div className="pt-6 border-t border-surface-200">
                  <h4 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4">Categories</h4>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(category => {
                      const isSelected = selectedCategories.includes(category.value);
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.value}
                          onClick={() => handleCategoryToggle(category.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${isSelected
                            ? 'bg-primary-100 text-primary-800 border border-primary-200'
                            : 'bg-surface-50 text-surface-600 border border-surface-200 hover:bg-surface-100'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          {category.label}
                        </button>
                      )
                    })}
                  </div>

                  <h4 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 mt-6">Price Range</h4>
                  <div className="flex items-center gap-4 max-w-md">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    />
                    <div className="whitespace-nowrap font-bold text-primary-700">
                      Up to ${priceRange[1]}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-surface-900">
            {isLoading ? 'Searching...' : `${sortedTours.length} Adventures Found`}
          </h2>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-white/50 rounded-3xl animate-pulse border border-white/20 shadow-sm" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Try Again</button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {sortedTours.map((tour, index) => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && sortedTours.length === 0 && (
          <GlassCard className="text-center py-20">
            <div className="inline-flex justify-center items-center w-24 h-24 bg-surface-100 rounded-full mb-6">
              <Search className="w-10 h-10 text-surface-400" />
            </div>
            <h3 className="text-2xl font-bold text-surface-900 mb-2">No tours found</h3>
            <p className="text-surface-600 mb-8 max-w-md mx-auto">
              We couldn't find any tours matching your current filters. Try adjusting your search criteria or clearing filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
            >
              Clear All Filters
            </button>
          </GlassCard>
        )}

      </div>
    </div>
  )
}

export default Tours
