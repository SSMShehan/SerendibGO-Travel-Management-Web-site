import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Calendar,
  MapPin,
  Star,
  Users,
  Car,
  Building,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../services/api'
import GlassCard from '../components/common/GlassCard'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Real data from database
  const [dashboardData, setDashboardData] = useState({
    recentBookings: [],
    recommendations: [],
    stats: {
      totalBookings: 0,
      completedTrips: 0,
      totalSpent: 0,
      favoriteDestination: 'N/A'
    },
    upcomingTrips: []
  })

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    let bookingsResponse, toursResponse, hotelsResponse, vehiclesResponse

    try {
      setLoading(true)
      setError(null)

      // Fetch all dashboard data in parallel
      const responses = await Promise.all([
        api.get('/bookings/user'),
        api.get('/tours?isFeatured=true&limit=3'),
        api.get('/hotels?featured=true&limit=3'),
        api.get('/vehicles?featured=true&limit=3')
      ])

      // Destructure the responses
      bookingsResponse = responses[0]
      toursResponse = responses[1]
      hotelsResponse = responses[2]
      vehiclesResponse = responses[3]

      // Process bookings data
      const bookings = bookingsResponse.data.success ? bookingsResponse.data.data.bookings : []
      const recentBookings = bookings.slice(0, 3).map((booking, index) => ({
        id: booking._id || `booking-${index}`,
        type: booking.type || 'tour',
        title: booking.tour?.title || booking.hotel?.name || booking.vehicle?.name || 'Booking',
        date: booking.startDate || booking.checkInDate || booking.createdAt,
        status: booking.status || 'pending',
        price: booking.totalAmount || booking.pricing?.totalPrice || 0,
        image: booking.tour?.images?.[0]?.url ||
          booking.hotel?.images?.[0]?.url ||
          booking.vehicle?.images?.[0]?.url ||
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'
      }))

      // Process upcoming trips
      const upcomingTrips = bookings
        .filter(booking => {
          const tripDate = new Date(booking.startDate || booking.checkInDate)
          return tripDate > new Date() && (booking.status === 'confirmed' || booking.status === 'pending')
        })
        .slice(0, 2)
        .map((booking, index) => ({
          id: booking._id || `upcoming-${index}`,
          title: booking.tour?.title || booking.hotel?.name || booking.vehicle?.name || 'Trip',
          date: booking.startDate || booking.checkInDate,
          type: booking.type || 'tour',
          status: booking.status
        }))

      // Calculate statistics
      const stats = {
        totalBookings: bookings.length,
        completedTrips: bookings.filter(b => b.status === 'completed').length,
        totalSpent: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        favoriteDestination: getFavoriteDestination(bookings)
      }

      // Process recommendations
      const recommendations = []

      // Add featured tours
      if (toursResponse.data.success && toursResponse.data.data && toursResponse.data.data.tours) {
        toursResponse.data.data.tours.forEach(tour => {
          recommendations.push({
            id: `tour-${tour._id}`,
            title: tour.title,
            location: tour.location?.city || tour.destination,
            rating: tour.rating?.average || 4.5,
            price: tour.price || 0,
            image: tour.images?.[0]?.url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
            type: 'tour'
          })
        })
      }

      // Add featured hotels
      if (hotelsResponse.data.success && hotelsResponse.data.data && hotelsResponse.data.data.hotels) {
        hotelsResponse.data.data.hotels.forEach(hotel => {
          recommendations.push({
            id: `hotel-${hotel._id}`,
            title: hotel.name,
            location: hotel.location?.city || 'Sri Lanka',
            rating: hotel.rating?.average || 4.5,
            price: hotel.pricing?.averagePrice || hotel.priceRange?.min || 0,
            image: hotel.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
            type: 'hotel'
          })
        })
      }

      // Add featured vehicles
      if (vehiclesResponse.data.success && vehiclesResponse.data.data && vehiclesResponse.data.data.vehicles) {
        vehiclesResponse.data.data.vehicles.forEach(vehicle => {
          recommendations.push({
            id: `vehicle-${vehicle._id}`,
            title: vehicle.name || `${vehicle.make} ${vehicle.model}`,
            location: vehicle.location?.city || 'Sri Lanka',
            rating: vehicle.ratings?.overall || 4.5,
            price: vehicle.pricing?.dailyRate || 0,
            image: vehicle.images?.[0]?.url || 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=300&h=200&fit=crop',
            type: 'vehicle'
          })
        })
      }

      setDashboardData({
        recentBookings,
        recommendations: recommendations.slice(0, 3), // Limit to 3 recommendations
        stats,
        upcomingTrips
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')

      // Fallback to empty data
      setDashboardData({
        recentBookings: [],
        recommendations: [],
        stats: {
          totalBookings: 0,
          completedTrips: 0,
          totalSpent: 0,
          favoriteDestination: 'N/A'
        },
        upcomingTrips: []
      })
    } finally {
      setLoading(false)
    }
  }

  const getFavoriteDestination = (bookings) => {
    const destinations = {}
    bookings.forEach(booking => {
      const destination = booking.tour?.destination ||
        booking.hotel?.location?.city ||
        booking.vehicle?.location?.city ||
        'Unknown'
      destinations[destination] = (destinations[destination] || 0) + 1
    })

    const favorite = Object.keys(destinations).reduce((a, b) =>
      destinations[a] > destinations[b] ? a : b, 'N/A'
    )

    return favorite === 'Unknown' ? 'N/A' : favorite
  }

  useEffect(() => {
    // Redirect users to their appropriate dashboards
    if (user?.role === 'hotel_owner') {
      navigate('/hotel-owner', { replace: true })
    } else if (user?.role === 'admin') {
      navigate('/admin', { replace: true })
    } else if (user?.role === 'guide') {
      navigate('/guide', { replace: true })
    } else if (user?.role === 'driver') {
      navigate('/driver', { replace: true })
    } else if (user?.role === 'staff') {
      navigate('/staff', { replace: true })
    } else if (user?.role === 'vehicle_owner') {
      navigate('/vehicle-owner', { replace: true })
    }
  }, [user, navigate])

  // Show loading or redirect message for non-tourist users
  if (user?.role !== 'tourist') {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="mt-4 text-surface-600 font-medium">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-surface-100 text-surface-700 border-surface-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <AlertCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tour': return <MapPin className="h-4 w-4" />
      case 'hotel': return <Building className="h-4 w-4" />
      case 'vehicle': return <Car className="h-4 w-4" />
      case 'guide': return <Users className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-surface-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-surface-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-surface-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
          >
            Try Again
          </button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-12">
      {/* Header Background */}
      <div className="bg-surface-900 h-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-secondary-900 to-surface-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/bg-pattern.png)', backgroundSize: 'cover' }}></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-display font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h2>
            <p className="text-white/80 text-lg">
              Ready for your next Sri Lankan adventure?
            </p>
          </motion.div>
          <button
            onClick={fetchDashboardData}
            className="mt-4 md:mt-0 px-4 py-2 text-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Calendar, label: "Total Bookings", value: dashboardData.stats.totalBookings, color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: CheckCircle, label: "Completed Trips", value: dashboardData.stats.completedTrips, color: "text-green-500", bg: "bg-green-500/10" },
            { icon: TrendingUp, label: "Total Spent", value: `LKR ${dashboardData.stats.totalSpent.toLocaleString()}`, color: "text-purple-500", bg: "bg-purple-500/10" },
            { icon: Heart, label: "Favorite Place", value: dashboardData.stats.favoriteDestination, color: "text-rose-500", bg: "bg-rose-500/10" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6 h-full flex items-center backdrop-blur-xl bg-white/80 hover:bg-white transition-all duration-300 transform hover:-translate-y-1">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-surface-500">{stat.label}</p>
                  <p className="text-xl font-bold text-surface-900">{stat.value}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="h-full">
              <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-surface-900">Recent Bookings</h3>
                <Link to="/my-bookings" className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData.recentBookings.length > 0 ? (
                  dashboardData.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-4 p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors border border-surface-100">
                      <img
                        src={booking.image}
                        alt={booking.title}
                        className="w-16 h-16 rounded-lg object-cover shadow-sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="p-1 bg-surface-200 rounded text-surface-600">{getTypeIcon(booking.type)}</span>
                          <h4 className="font-bold text-surface-900">{booking.title}</h4>
                        </div>
                        <p className="text-sm text-surface-500">{new Date(booking.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </span>
                        <p className="text-sm font-bold text-surface-900 mt-1">LKR {booking.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-surface-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-surface-300" />
                    <p>No booking history found</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Actions & Upcoming Trips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <GlassCard>
              <div className="px-6 py-4 border-b border-surface-100">
                <h3 className="text-lg font-bold text-surface-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { to: '/tours', icon: MapPin, label: 'Book Tours', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
                    { to: '/hotels', icon: Building, label: 'Find Hotels', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' },
                    { to: '/vehicles', icon: Car, label: 'Rent Vehicle', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
                    { to: '/custom-trip', icon: Sparkles, label: 'Custom Trip', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' }
                  ].map((action, i) => (
                    <Link key={i} to={action.to} className={`flex flex-col items-center p-4 rounded-xl transition-colors ${action.bg}`}>
                      <action.icon className={`h-8 w-8 ${action.color} mb-2`} />
                      <span className={`text-xs font-bold ${action.color.replace('600', '900')}`}>{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Upcoming Trips */}
            <GlassCard>
              <div className="px-6 py-4 border-b border-surface-100">
                <h3 className="text-lg font-bold text-surface-900">Upcoming Trips</h3>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData.upcomingTrips.length > 0 ? (
                  dashboardData.upcomingTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
                      <div className="flex items-center space-x-3">
                        <span className="p-2 bg-white rounded-lg shadow-sm text-surface-600">{getTypeIcon(trip.type)}</span>
                        <div>
                          <h4 className="font-bold text-surface-900 text-sm">{trip.title}</h4>
                          <p className="text-xs text-surface-500">{new Date(trip.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(trip.status)}`}>
                        <span className="capitalize">{trip.status}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-surface-500">
                    <Clock className="h-10 w-10 mx-auto mb-3 text-surface-300" />
                    <p className="text-sm">No upcoming trips scheduled</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Recommendations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <GlassCard>
            <div className="px-6 py-4 border-b border-surface-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-surface-900">Recommended for You</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboardData.recommendations.length > 0 ? (
                  dashboardData.recommendations.map((item) => (
                    <div key={item.id} className="group cursor-pointer rounded-xl overflow-hidden bg-surface-50 hover:shadow-lg transition-all border border-surface-100">
                      <div className="h-48 overflow-hidden relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                          {item.type.toUpperCase()}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">{item.title}</h4>
                          <div className="flex items-center text-xs font-bold text-surface-900 bg-surface-200 px-1.5 py-0.5 rounded">
                            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                            {item.rating}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-surface-500 mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.location}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-200">
                          <span className="text-sm font-bold text-primary-600">LKR {item.price.toLocaleString()}</span>
                          <button className="text-xs font-bold text-surface-500 group-hover:text-primary-600 flex items-center transition-colors">
                            View <ArrowRight className="h-3 w-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-surface-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-surface-300" />
                    <p>No recommendations available right now</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
