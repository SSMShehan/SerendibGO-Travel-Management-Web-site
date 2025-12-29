import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, CreditCard, Sparkles, Eye, CheckCircle, XCircle, User, Building, Car, Phone, Star, MapPin as LocationIcon, Bed, AlertCircle, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { bookingAPI } from '../services/hotels/hotelService'
import { guideService } from '../services/guideService'
import { toast } from 'react-hot-toast'
import GlassCard from '../components/common/GlassCard'
import ReviewForm from '../components/reviews/ReviewForm'
import ReviewPopup from '../components/reviews/ReviewPopup'
import CustomTripReviewPopup from '../components/reviews/CustomTripReviewPopup'
import customTripReviewService from '../services/customTripReviewService'

const MyBookings = () => {
  const { user, isAuthenticated, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [customTrips, setCustomTrips] = useState([])
  const [vehicleBookings, setVehicleBookings] = useState([])
  const [guideBookings, setGuideBookings] = useState([])
  const [tourBookings, setTourBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('bookings')
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null)
  const [showReviewPopup, setShowReviewPopup] = useState(false)
  const [selectedBookingForPopup, setSelectedBookingForPopup] = useState(null)
  const [existingReviews, setExistingReviews] = useState([])
  const [reviewedBookings, setReviewedBookings] = useState(new Set())
  const [reviewStats, setReviewStats] = useState(null)
  const [showCustomTripReviewPopup, setShowCustomTripReviewPopup] = useState(false)
  const [selectedCustomTripForReview, setSelectedCustomTripForReview] = useState(null)

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchBookings()
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [user, isAuthenticated, navigate])

  useEffect(() => {
    if (bookings.length > 0 && isAuthenticated) {
      checkExistingReviews()
    }
  }, [bookings, isAuthenticated])

  useEffect(() => {
    const locationState = location.state
    if (locationState?.message) {
      toast.success(locationState.message)
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, navigate, location.pathname])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to view your bookings')
        return
      }

      // Fetch hotel bookings
      try {
        const hotelResponse = await bookingAPI.getMyBookings()
        if (hotelResponse.status === 'success') {
          setBookings(hotelResponse.data.bookings)
        }
      } catch (hotelError) {
        console.error('Hotel bookings error:', hotelError)
      }

      // Fetch custom trips, guide, and tour bookings
      try {
        const customResponse = await fetch('/api/bookings/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (customResponse.ok) {
          const customData = await customResponse.json()
          if (customData.success) {
            setCustomTrips(customData.data.bookings.filter(booking => booking.type === 'custom'))
            setGuideBookings(customData.data.bookings.filter(booking => booking.type === 'guide'))
            setTourBookings(customData.data.bookings.filter(booking => booking.type === 'tour'))
          }
        }
      } catch (customError) {
        console.error('Custom trips fetch error:', customError)
      }

      // Fetch vehicle bookings
      try {
        const vehicleResponse = await fetch('/api/vehicle-bookings/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json()
          if (vehicleData.status === 'success') {
            setVehicleBookings(vehicleData.data.bookings || [])
          }
        }
      } catch (vehicleError) {
        console.error('Vehicle bookings fetch error:', vehicleError)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return <CheckCircle className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const handleConfirmCustomTrip = async (trip) => {
    try {
      const response = await fetch(`/api/custom-trips/${trip.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        navigate('/payment', {
          state: {
            bookingId: data.data.booking._id,
            bookingType: 'custom-trip',
            amount: trip.totalAmount,
            currency: 'LKR',
            tripName: trip.destination,
            tripDescription: `Custom trip to ${trip.destination}`,
            startDate: trip.startDate,
            endDate: trip.endDate,
            groupSize: trip.groupSize,
            guideName: trip.guide?.name || 'TBD',
            interests: trip.interests?.join(', ') || '',
            accommodation: trip.accommodation || '',
            bookingReference: data.data.booking.bookingReference
          }
        })
      } else {
        toast.error(data.message || 'Failed to create booking for custom trip')
      }
    } catch (error) {
      console.error('Error creating custom trip booking:', error)
      toast.error('An error occurred while creating the booking')
    }
  }

  const handleConfirmHotelBooking = async (booking) => {
    navigate('/payment', {
      state: {
        bookingId: booking._id,
        bookingType: 'hotel',
        amount: booking.pricing?.totalPrice || 0,
        currency: booking.pricing?.currency || 'LKR',
        hotelName: booking.hotel?.name,
        roomName: booking.room?.name,
        checkIn: booking.checkInDate,
        checkOut: booking.checkOutDate,
        guests: booking.guests?.adults || 1,
        bookingReference: booking.bookingReference
      }
    })
  }

  const handleConfirmTourBooking = async (booking) => {
    navigate('/payment', {
      state: {
        bookingId: booking._id,
        bookingType: 'tour',
        amount: booking.totalAmount || 0,
        currency: 'LKR',
        tourName: booking.tour?.title || booking.title,
        tourDescription: booking.tour?.description || booking.description,
        startDate: booking.startDate,
        endDate: booking.endDate,
        groupSize: booking.groupSize,
        bookingReference: booking.bookingReference
      }
    })
  }

  const handleConfirmVehicleBooking = async (booking) => {
    navigate('/payment', {
      state: {
        bookingId: booking._id,
        bookingType: 'vehicle',
        amount: booking.pricing?.totalPrice || 0,
        currency: booking.pricing?.currency || 'LKR',
        vehicleName: booking.vehicle?.make + ' ' + booking.vehicle?.model,
        vehicleType: booking.vehicle?.type,
        pickupLocation: booking.tripDetails?.pickupLocation?.address,
        dropoffLocation: booking.tripDetails?.dropoffLocation?.address,
        pickupDateTime: booking.tripDetails?.startDate,
        bookingReference: booking.bookingReference
      }
    })
  }

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip)
    setShowDetailsModal(true)
  }

  const handleViewVehicleDetails = (booking) => {
    setSelectedTrip(booking)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedTrip(null)
  }

  const handleWriteReview = (booking) => {
    setSelectedBookingForReview(booking)
    setShowReviewForm(true)
  }

  const checkExistingReviews = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
      const authToken = token || localStorage.getItem('token');
      const reviewedSet = new Set();
      // Keep existing review check logic...
      // Simplified for brevity but assume full logic is here or imported
      // You can implement the full check logic similar to the original file
      // Check guide bookings
      for (const booking of guideBookings) {
        if (booking.guide && (booking.status === 'completed' || (booking.status === 'confirmed' && booking.paymentStatus === 'paid'))) {
          const guideId = booking.guide._id || booking.guide;
          const bookingId = booking._id || booking.id || booking.bookingId;
          try {
            const response = await fetch(`${API_BASE_URL}/reviews/check?user=${user._id}&guide=${guideId}&booking=${bookingId}&isActive=true`, {
              headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.data && data.data.length > 0) reviewedSet.add(bookingId);
            }
          } catch (error) { console.error('Error checking guide review:', error); }
        }
      }

      // Check hotel bookings
      for (const booking of bookings) {
        if (booking.hotel && (booking.bookingStatus === 'completed' || (booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'paid'))) {
          const hotelId = booking.hotel._id || booking.hotel;
          const bookingId = booking._id || booking.id || booking.bookingId;
          try {
            const response = await fetch(`${API_BASE_URL}/hotel-reviews?user=${user._id}&hotel=${hotelId}&booking=${bookingId}&isActive=true`, {
              headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.data && data.data.length > 0) reviewedSet.add(bookingId);
            }
          } catch (error) { console.error('Error checking hotel review:', error); }
        }
      }

      // Check custom trip bookings
      for (const trip of customTrips) {
        if (trip.guide && (trip.status === 'completed' || (trip.status === 'confirmed' && trip.paymentStatus === 'paid'))) {
          const guideId = trip.guide._id || trip.guide;
          const bookingId = trip._id || trip.id || trip.bookingId;
          try {
            const response = await fetch(`${API_BASE_URL}/reviews/check?user=${user._id}&guide=${guideId}&booking=${bookingId}&isActive=true`, {
              headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.data && data.data.length > 0) reviewedSet.add(bookingId);
            }
          } catch (error) { console.error('Error checking custom trip review:', error); }
        }
      }

      setReviewedBookings(reviewedSet);
    } catch (error) {
      console.error('MyBookings: Error checking existing reviews:', error);
    }
  };

  const handleWriteReviewPopup = async (booking) => {
    if (!isAuthenticated || !token) {
      toast.error('Please log in to write a review');
      navigate('/login');
      return;
    }
    setSelectedBookingForPopup(booking)
    setShowReviewPopup(true);
  };

  const handleCustomTripReviewPopup = async (trip) => {
    try {
      const canReviewResponse = await customTripReviewService.canReviewCustomTrip(trip.id);
      if (canReviewResponse.success && canReviewResponse.data.canReview) {
        setSelectedCustomTripForReview({
          id: trip.id,
          title: trip.title,
          destination: trip.location,
          duration: trip.customTripDetails?.duration || trip.duration,
          groupSize: trip.groupSize,
          startDate: trip.startDate,
          endDate: trip.endDate,
          ...trip
        });
        setShowCustomTripReviewPopup(true);
      } else {
        toast.error(canReviewResponse.data?.reason || 'You cannot review this custom trip');
      }
    } catch (error) {
      toast.error('Failed to check review eligibility');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-6 py-4 text-sm font-bold transition-colors duration-300 flex items-center space-x-2 ${activeTab === id ? 'text-primary-600' : 'text-surface-500 hover:text-surface-700'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count > 0 && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === id ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-surface-600'
          }`}>
          {count}
        </span>
      )}
      {activeTab === id && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
          initial={false}
        />
      )}
    </button>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-surface-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold text-surface-900 mb-4"
          >
            My Bookings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-surface-600"
          >
            Manage your tour bookings and custom trips
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-surface-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            <TabButton id="bookings" label="Hotels" icon={Bed} count={bookings.length} />
            <TabButton id="tours" label="Tours" icon={Calendar} count={tourBookings.length} />
            <TabButton id="custom" label="Custom Trips" icon={Sparkles} count={customTrips.length} />
            <TabButton id="vehicles" label="Vehicles" icon={Car} count={vehicleBookings.length} />
            <TabButton id="guides" label="Guides" icon={User} count={guideBookings.length} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Render Tab Content */}
            {activeTab === 'bookings' && (
              <BookingList
                items={bookings}
                type="hotel"
                emptyTitle="No hotel bookings yet"
                emptyDesc="Start by exploring our amazing hotels."
                browseLink="/hotels"
                browseText="Browse Hotels"
                renderItem={(booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    type="hotel"
                    title={booking.hotel?.name || 'Hotel Booking'}
                    subtitle={`${booking.room?.name || 'Room'} - ${booking.room?.roomType || 'Standard'}`}
                    details={[
                      { icon: Calendar, text: `${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}` },
                      { icon: MapPin, text: booking.hotel?.location?.city || 'Location' },
                      { icon: Users, text: `${booking.guests?.adults || 1} guests` }
                    ]}
                    status={booking.bookingStatus}
                    paymentStatus={booking.paymentStatus}
                    price={booking.pricing?.totalPrice}
                    currency={booking.pricing?.currency}
                    image={booking.hotel?.images?.[0]?.url}
                    onPay={() => handleConfirmHotelBooking(booking)}
                    onReview={() => handleWriteReviewPopup({ ...booking, type: 'hotel' })}
                    hasReviewed={reviewedBookings.has(booking._id)}
                    isAuthenticated={isAuthenticated}
                    user={user}
                  />
                )}
              />
            )}

            {activeTab === 'tours' && (
              <BookingList
                items={tourBookings}
                type="tour"
                emptyTitle="No tour bookings yet"
                emptyDesc="Start by exploring our amazing tours."
                browseLink="/tours"
                browseText="Browse Tours"
                renderItem={(booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    type="tour"
                    title={booking.title}
                    subtitle={booking.description}
                    details={[
                      { icon: Calendar, text: `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}` },
                      { icon: Users, text: `${booking.groupSize} people` },
                      { icon: MapPin, text: booking.location }
                    ]}
                    status={booking.status}
                    paymentStatus={booking.paymentStatus}
                    price={booking.totalAmount}
                    currency="USD"
                    onPay={() => handleConfirmTourBooking(booking)}
                    onReview={() => handleWriteReview(booking)}
                    onViewDetails={() => handleViewDetails(booking)}
                    hasReviewed={reviewedBookings.has(booking._id)}
                    isAuthenticated={isAuthenticated}
                    user={user}
                  />
                )}
              />
            )}

            {activeTab === 'custom' && (
              <BookingList
                items={customTrips}
                type="custom"
                emptyTitle="No custom trips yet"
                emptyDesc="Create your personalized Sri Lankan adventure."
                browseLink="/custom-trip"
                browseText="Create Custom Trip"
                renderItem={(trip) => (
                  <BookingCard
                    key={trip._id}
                    booking={trip}
                    type="custom"
                    title={trip.title}
                    subtitle={trip.destination ? `Trip to ${trip.destination}` : 'Custom Trip'}
                    details={[
                      { icon: Calendar, text: `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}` },
                      { icon: Users, text: `${trip.groupSize} people` },
                      { icon: MapPin, text: trip.location }
                    ]}
                    status={trip.status}
                    paymentStatus={trip.paymentStatus}
                    price={trip.totalAmount}
                    currency="LKR"
                    onPay={() => handleConfirmCustomTrip(trip)}
                    onReview={() => handleCustomTripReviewPopup(trip)}
                    onViewDetails={() => handleViewDetails(trip)}
                    hasReviewed={reviewedBookings.has(trip._id)}
                    isAuthenticated={isAuthenticated}
                    user={user}
                  />
                )}
              />
            )}

            {activeTab === 'vehicles' && (
              <BookingList
                items={vehicleBookings}
                type="vehicle"
                emptyTitle="No vehicle bookings yet"
                emptyDesc="Start by renting a vehicle for your adventure."
                browseLink="/vehicles"
                browseText="Browse Vehicles"
                renderItem={(booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    type="vehicle"
                    title={booking.vehicle?.name || 'Vehicle Booking'}
                    subtitle={`${booking.vehicle?.make} ${booking.vehicle?.model}`}
                    details={[
                      { icon: Calendar, text: `${formatDate(booking.tripDetails.startDate)} - ${formatDate(booking.tripDetails.endDate)}` },
                      { icon: MapPin, text: booking.tripDetails.pickupLocation.city },
                      { icon: Users, text: `${(booking.passengers?.adults || 0) + (booking.passengers?.children || 0)} passengers` }
                    ]}
                    status={booking.bookingStatus}
                    paymentStatus={booking.paymentStatus}
                    price={booking.pricing?.totalPrice}
                    currency={booking.pricing?.currency}
                    image={booking.vehicle?.images?.[0]?.url}
                    onPay={() => handleConfirmVehicleBooking(booking)}
                    onReview={() => handleWriteReviewPopup({ ...booking, type: 'vehicle' })}
                    onViewDetails={() => handleViewVehicleDetails(booking)}
                    hasReviewed={reviewedBookings.has(booking._id)}
                    isAuthenticated={isAuthenticated}
                    user={user}
                  />
                )}
              />
            )}

            {activeTab === 'guides' && (
              <BookingList
                items={guideBookings}
                type="guide"
                emptyTitle="No guide bookings yet"
                emptyDesc="Find a local expert for your trip."
                browseLink="/guides"
                browseText="Find Guides"
                renderItem={(booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    type="guide"
                    title={booking.guide ? `${booking.guide.firstName} ${booking.guide.lastName}` : 'Guide Booking'}
                    subtitle="Professional Guide Service"
                    details={[
                      { icon: Calendar, text: `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}` },
                      { icon: MapPin, text: booking.location || (booking.guide?.profile?.location) || 'Sri Lanka' }
                    ]}
                    status={booking.status}
                    paymentStatus={booking.paymentStatus}
                    price={booking.totalAmount}
                    currency="USD"
                    onPay={() => { }} // Guide booking might have different pay logic, or use generic
                    onReview={() => handleWriteReviewPopup({ ...booking, type: 'guide' })}
                    hasReviewed={reviewedBookings.has(booking._id)}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    image={booking.guide?.avatar || booking.guide?.profileImage}
                  />
                )}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals and Popups */}
      {showDetailsModal && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-surface-900">Booking Details</h2>
              <button onClick={closeDetailsModal} className="p-2 hover:bg-surface-100 rounded-full">
                <XCircle className="w-6 h-6 text-surface-500" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Simplified detail view, can be expanded based on type */}
              <pre className="p-4 bg-surface-50 rounded-lg overflow-auto text-xs">
                {JSON.stringify(selectedTrip, null, 2)}
              </pre>
            </div>
          </GlassCard>
        </div>
      )}

      {showReviewForm && selectedBookingForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <ReviewForm
              bookingId={selectedBookingForReview._id}
              guideId={selectedBookingForReview.guide?._id || selectedBookingForReview.guide}
              tourId={selectedBookingForReview.tour?._id || selectedBookingForReview.tour}
              onReviewSubmitted={() => {
                setShowReviewForm(false);
                setSelectedBookingForReview(null);
                fetchBookings();
                checkExistingReviews();
              }}
              onCancel={() => {
                setShowReviewForm(false);
                setSelectedBookingForReview(null);
              }}
            />
          </div>
        </div>
      )}

      {showReviewPopup && selectedBookingForPopup && (
        <ReviewPopup
          isOpen={showReviewPopup}
          onClose={() => setShowReviewPopup(false)}
          booking={selectedBookingForPopup}
          existingReviews={existingReviews}
          stats={reviewStats}
          user={user}
        />
      )}

      {showCustomTripReviewPopup && selectedCustomTripForReview && (
        <CustomTripReviewPopup
          isOpen={showCustomTripReviewPopup}
          onClose={() => setShowCustomTripReviewPopup(false)}
          trip={selectedCustomTripForReview}
          onSuccess={() => {
            fetchBookings();
            checkExistingReviews();
          }}
        />
      )}
    </div>
  )
}

// Reusable Components
const BookingList = ({ items, emptyTitle, emptyDesc, browseLink, browseText, renderItem }) => {
  if (items.length === 0) {
    return (
      <GlassCard className="text-center py-16">
        <Sparkles className="mx-auto h-16 w-16 text-surface-300 mb-4" />
        <h3 className="text-xl font-bold text-surface-900 mb-2">{emptyTitle}</h3>
        <p className="text-surface-600 mb-8">{emptyDesc}</p>
        <Link
          to={browseLink}
          className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
        >
          {browseText}
        </Link>
      </GlassCard>
    )
  }
  return (
    <div className="space-y-6">
      {items.map(renderItem)}
    </div>
  )
}

const BookingCard = ({
  booking, type, title, subtitle, details, status, paymentStatus, price, currency, image,
  onPay, onReview, onViewDetails, hasReviewed, isAuthenticated, user
}) => {
  const getStatusColor = (s) => {
    switch (s?.toLowerCase()) {
      case 'confirmed': case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-surface-100 text-surface-700 border-surface-200';
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <GlassCard className="p-6 transition-all hover:translate-y-[-2px] hover:shadow-xl">
      <div className="flex flex-col md:flex-row gap-6">
        {image && (
          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-surface-900">{title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${statusColor}`}>
                  {status}
                </span>
              </div>
              <p className="text-surface-600 font-medium">{subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">
                {currency} {price?.toLocaleString() || '0'}
              </p>
              {paymentStatus && (
                <span className={`inline-block mt-1 text-xs font-bold capitalize ${paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {paymentStatus}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm">
            {details.map((detail, idx) => (
              <div key={idx} className="flex items-center text-surface-600">
                <detail.icon className="w-4 h-4 mr-2 text-primary-500" />
                <span>{detail.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-surface-100 pt-4">
            {onViewDetails && (
              <button onClick={onViewDetails} className="px-4 py-2 text-sm font-bold text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors">
                View Details
              </button>
            )}

            {/* Payment Button */}
            {(status === 'confirmed' || status === 'approved') && paymentStatus !== 'paid' && (
              <button onClick={onPay} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-colors flex items-center">
                <CreditCard className="w-4 h-4 mr-2" /> Pay Now
              </button>
            )}

            {/* Review Button */}
            {(status === 'completed' || (status === 'confirmed' && paymentStatus === 'paid')) && isAuthenticated && !hasReviewed && (
              <button onClick={onReview} className="px-4 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-md transition-colors flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" /> Write Review
              </button>
            )}

            {/* Reviewed Badge */}
            {(status === 'completed' || (status === 'confirmed' && paymentStatus === 'paid')) && isAuthenticated && hasReviewed && (
              <div className="px-4 py-2 text-sm font-bold text-green-700 bg-green-100 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" /> Review Submitted
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default MyBookings
