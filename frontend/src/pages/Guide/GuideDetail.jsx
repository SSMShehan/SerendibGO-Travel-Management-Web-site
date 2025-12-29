import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Star,
  Clock,
  Users,
  Calendar,
  Phone,
  Mail,
  Award,
  Globe,
  Shield,
  CheckCircle,
  Zap,
  Crown,
  Sparkles,
  Eye,
  BookOpen,
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  Camera,
  Navigation,
  X,
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { guideService } from '../../services/guideService'
import { useAuth } from '../../context/AuthContext'
import ReviewForm from '../../components/reviews/ReviewForm'
import ReviewDisplay from '../../components/reviews/ReviewDisplay'
import ReviewRequirements from '../../components/reviews/ReviewRequirements'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../../components/common/GlassCard'
import toast from 'react-hot-toast'

const GuideDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookingData, setBookingData] = useState({
    date: '',
    duration: '',
    groupSize: 1,
    specialRequests: ''
  })
  const [showBookingCalendar, setShowBookingCalendar] = useState(false)
  const [selectedBookingDate, setSelectedBookingDate] = useState(new Date())
  const [userBookings, setUserBookings] = useState([])

  // Fetch guide data from API
  useEffect(() => {
    if (id) {
      fetchGuide()
    }

    // Listen for guide profile updates
    const handleGuideUpdate = (event) => {
      console.log('Guide profile updated, refreshing guide detail:', event.detail)
      if (event.detail.guideId === id) {
        fetchGuide()
      }
    }

    window.addEventListener('guideProfileUpdated', handleGuideUpdate)

    return () => {
      window.removeEventListener('guideProfileUpdated', handleGuideUpdate)
    }
  }, [id])

  // Close booking calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBookingCalendar && !event.target.closest('.booking-calendar-container')) {
        setShowBookingCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showBookingCalendar])

  const fetchGuide = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await guideService.getGuideById(id)
      setGuide(response.data)

      // If user is authenticated, fetch their bookings with this guide
      if (isAuthenticated && user) {
        await fetchUserBookings()
      }
    } catch (err) {
      console.error('Error fetching guide:', err)
      setError('Failed to load guide details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBookings = async () => {
    try {
      // Fetch user's bookings with this specific guide
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/bookings/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter bookings for this specific guide that are completed
          const guideBookings = data.data.bookings.filter(booking =>
            booking.guide &&
            (booking.guide._id === id || booking.guide === id) &&
            booking.status === 'completed'
          );
          setUserBookings(guideBookings);
        }
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      // Fallback to empty array if fetch fails
      setUserBookings([]);
    }
  }

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    // Refresh guide data to update review count and rating
    fetchGuide();
  }

  const handleReviewUpdate = () => {
    // Refresh guide data when reviews are updated
    fetchGuide();
  }

  const canUserReview = () => {
    if (!isAuthenticated || !user) return false;

    // Check if user has completed bookings with this guide
    return userBookings.some(booking =>
      booking.status === 'completed' &&
      (booking.guide === id || booking.guide?._id === id)
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Loading Guide Details...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-surface-200 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold font-display text-surface-900 mb-4">Error Loading Guide</h1>
          <p className="text-surface-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchGuide}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-bold"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/guides')}
              className="w-full px-6 py-3 bg-surface-600 text-white rounded-xl hover:bg-surface-700 transition-colors duration-200 font-bold"
            >
              Back to Guides
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-surface-200">
          <h1 className="text-3xl font-bold font-display text-surface-900 mb-4">Guide Not Found</h1>
          <p className="text-surface-600 mb-6">The guide you are looking for does not exist.</p>
          <button
            onClick={() => navigate('/guides')}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl hover:from-primary-700 hover:to-secondary-600 transition-all duration-300 font-bold"
          >
            Go Back to Guides
          </button>
        </div>
      </div>
    )
  }

  const handleBookGuide = () => {
    console.log('Book Guide button clicked');
    setShowBookingModal(true)
  }

  // Booking calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateInPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateBlocked = (date) => {
    if (!guide?.blockedDates) return false
    return guide.blockedDates.some(blockout =>
      new Date(blockout.date).toDateString() === date.toDateString()
    )
  }

  const isWorkingDay = (date) => {
    if (!guide?.workingDays) return true
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[date.getDay()]
    return guide.workingDays.includes(dayName)
  }

  const isDateAvailable = (date) => {
    return !isDateInPast(date) && !isDateBlocked(date) && isWorkingDay(date)
  }

  const handleBookingDateSelect = (day) => {
    const dateToSelect = new Date(selectedBookingDate.getFullYear(), selectedBookingDate.getMonth(), day)

    if (!isDateAvailable(dateToSelect)) {
      if (isDateInPast(dateToSelect)) {
        toast.error('Cannot select past dates')
      } else if (isDateBlocked(dateToSelect)) {
        toast.error('This date is not available (blocked by guide)')
      } else if (!isWorkingDay(dateToSelect)) {
        toast.error('Guide is not available on this day')
      }
      return
    }

    setBookingData(prev => ({
      ...prev,
      date: dateToSelect.toISOString().split('T')[0]
    }))
    setShowBookingCalendar(false)
  }

  const navigateBookingMonth = (direction) => {
    setSelectedBookingDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderBookingCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedBookingDate)
    const firstDay = getFirstDayOfMonth(selectedBookingDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedBookingDate.getFullYear(), selectedBookingDate.getMonth(), day)
      const isPast = isDateInPast(currentDate)
      const isBlocked = isDateBlocked(currentDate)
      const isWorking = isWorkingDay(currentDate)
      const isSelected = bookingData.date === currentDate.toISOString().split('T')[0]
      const isAvailable = isDateAvailable(currentDate)

      let buttonClass = 'h-10 w-10 rounded-lg text-sm font-bold transition-all duration-200 '

      if (isSelected) {
        buttonClass += 'bg-primary-500 text-white'
      } else if (isPast) {
        buttonClass += 'text-surface-300 cursor-not-allowed'
      } else if (isBlocked) {
        buttonClass += 'bg-red-50 text-red-400 cursor-not-allowed'
      } else if (!isWorking) {
        buttonClass += 'bg-yellow-50 text-yellow-600 cursor-not-allowed'
      } else if (isAvailable) {
        buttonClass += 'text-surface-700 hover:bg-primary-50 hover:text-primary-600'
      }

      days.push(
        <button
          key={day}
          onClick={() => handleBookingDateSelect(day)}
          disabled={!isAvailable}
          className={buttonClass}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const formatBookingDate = (dateString) => {
    if (!dateString) return 'Select a date'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()

    if (!guide) {
      toast.error('Please select a guide first')
      return
    }

    try {
      // Calculate start and end dates based on duration
      const startDate = new Date(bookingData.date)
      let endDate = new Date(startDate)

      switch (bookingData.duration) {
        case 'half-day':
          endDate.setHours(startDate.getHours() + 4) // 4 hours
          break
        case 'full-day':
          endDate.setDate(startDate.getDate() + 1) // Next day
          break
        case 'multi-day':
          endDate.setDate(startDate.getDate() + 3) // 3 days
          break
        default:
          endDate.setDate(startDate.getDate() + 1)
      }

      const bookingDataToSubmit = {
        guideId: guide.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: bookingData.duration,
        groupSize: parseInt(bookingData.groupSize),
        specialRequests: bookingData.specialRequests || ''
      }

      console.log('Submitting guide booking:', bookingDataToSubmit)

      const response = await guideService.createGuideBooking(bookingDataToSubmit)

      // Calculate duration in days for pricing
      const durationMs = new Date(endDate) - new Date(startDate);
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      const totalAmount = guide.profile.pricePerDay * parseInt(bookingData.groupSize) * durationDays;

      setLoading(false);
      setShowBookingModal(false);

      // Navigate to payment page with booking details
      navigate('/payment', {
        state: {
          bookingId: response.data._id,
          amount: totalAmount,
          currency: 'USD',
          guideDetails: {
            id: guide._id,
            name: `${guide.firstName} ${guide.lastName}`,
            image: guide.avatar || `https://ui-avatars.com/api/?name=${guide.firstName}+${guide.lastName}&background=0D8ABC&color=fff`,
            location: guide.profile?.city || 'Sri Lanka',
            duration: `${durationDays} days`,
            startDate: startDate,
            guests: bookingData.groupSize,
            pricePerDay: guide.profile.pricePerDay
          },
          type: 'guide'
        }
      });

    } catch (error) {
      console.error('Error submitting guide booking:', error)
      toast.error('Failed to submit booking request. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-200/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/guides')}
            className="flex items-center text-surface-600 hover:text-primary-600 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Guides
          </button>
          <GlassCard className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-lg shadow-primary-500/20 text-white text-5xl font-bold font-display">
                  {guide.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-center lg:text-left flex-1">
                <h1 className="text-4xl md:text-5xl font-bold font-display text-surface-900 mb-3">{guide.name}</h1>
                <div className="flex items-center justify-center lg:justify-start mb-4 space-x-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="ml-2 text-lg font-bold text-surface-900">{guide.rating}</span>
                    <span className="ml-2 text-surface-500 text-sm font-medium">({guide.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center bg-primary-50 px-3 py-1 rounded-full border border-primary-100 text-primary-700 font-medium">
                    <MapPin className="h-4 w-4 mr-1" />
                    {guide.location}
                  </div>
                </div>
                <p className="text-lg text-surface-600 max-w-2xl lg:max-w-none mx-auto lg:mx-0 leading-relaxed">{guide.description}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <GlassCard className="p-8">
            <div className="flex items-center mb-5">
              <BookOpen className="h-7 w-7 text-primary-600 mr-4" />
              <h2 className="text-2xl font-bold font-display text-surface-900">About {guide.name}</h2>
            </div>
            <p className="text-surface-700 leading-relaxed text-lg font-medium">{guide.bio}</p>
          </GlassCard>

          {/* Highlights Section */}
          <GlassCard className="p-8">
            <div className="flex items-center mb-5">
              <Zap className="h-7 w-7 text-secondary-500 mr-4" />
              <h2 className="text-2xl font-bold font-display text-surface-900">Key Highlights</h2>
            </div>
            <div className="space-y-4">
              {guide.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center p-4 bg-surface-50 rounded-2xl border border-surface-100 hover:border-secondary-200 hover:bg-secondary-50/20 transition-all">
                  <CheckCircle className="h-6 w-6 text-secondary-500 mr-4 flex-shrink-0" />
                  <span className="text-surface-700 font-semibold text-lg">{highlight}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Specialties Section */}
          <GlassCard className="p-8">
            <div className="flex items-center mb-5">
              <Award className="h-7 w-7 text-primary-600 mr-4" />
              <h2 className="text-2xl font-bold font-display text-surface-900">Specialties</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {guide.specialties.map((specialty) => (
                <span key={specialty} className="px-5 py-2 bg-primary-50 text-primary-700 rounded-full font-bold border border-primary-100 shadow-sm">
                  {specialty}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Languages Section */}
          <GlassCard className="p-8">
            <div className="flex items-center mb-5">
              <Globe className="h-7 w-7 text-primary-600 mr-4" />
              <h2 className="text-2xl font-bold font-display text-surface-900">Languages</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {guide.languages.map((lang) => (
                <span key={lang} className="px-5 py-2 bg-surface-50 text-surface-700 rounded-full font-bold border border-surface-200 shadow-sm">
                  {lang}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Contact & Socials */}
          <GlassCard className="p-8">
            <div className="flex items-center mb-5">
              <MessageCircle className="h-7 w-7 text-primary-600 mr-4" />
              <h2 className="text-2xl font-bold font-display text-surface-900">Connect with {guide.name}</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-200 font-bold shadow-lg shadow-primary-500/20">
                <Phone className="h-5 w-5 mr-2" /> Call
              </button>
              <button className="flex items-center px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-bold shadow-lg shadow-red-500/20">
                <Mail className="h-5 w-5 mr-2" /> Email
              </button>
              <button className="flex items-center px-6 py-3 bg-surface-800 text-white rounded-xl hover:bg-surface-900 transition-colors duration-200 font-bold shadow-lg shadow-surface-800/20">
                <Share2 className="h-5 w-5 mr-2" /> Share Profile
              </button>
            </div>
          </GlassCard>

          {/* Reviews Section */}
          <div className="space-y-6">
            {/* Reviews Display */}
            <ReviewDisplay
              guideId={guide.id}
              onReviewUpdate={handleReviewUpdate}
            />
          </div>
        </div>

        {/* Sidebar - Booking & Quick Info */}
        <div className="lg:col-span-1 relative z-30">
          <div className="sticky top-24">
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold font-display text-primary-600 mb-2">$ {guide.price.toLocaleString()}</div>
                <div className="text-surface-500 font-bold uppercase tracking-wide text-xs">per day</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-surface-50 rounded-xl border border-surface-100">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary-500 mr-3" />
                    <span className="text-surface-600 font-medium">Experience</span>
                  </div>
                  <span className="font-bold text-surface-900">{guide.experience} years</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-surface-50 rounded-xl border border-surface-100">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary-500 mr-3" />
                    <span className="text-surface-600 font-medium">Location</span>
                  </div>
                  <span className="font-bold text-surface-900">{guide.location}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-surface-50 rounded-xl border border-surface-100">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-secondary-500 mr-3" />
                    <span className="text-surface-600 font-medium">Tours Completed</span>
                  </div>
                  <span className="font-bold text-surface-900">{guide.completedTours}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-surface-50 rounded-xl border border-surface-100">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-surface-600 font-medium">Response Time</span>
                  </div>
                  <span className="font-bold text-surface-900">{guide.responseTime}</span>
                </div>
              </div>

              <button
                onClick={handleBookGuide}
                className="relative z-50 w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-300 font-bold text-lg shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center transform cursor-pointer"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book This Guide
              </button>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Booking Modal (Landscape Redesign) */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 text-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="fixed inset-0 bg-surface-900/70 backdrop-blur-sm transition-opacity"
            />

            {/* Modal Content - WIDER & SHORTER */}
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
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md shadow-lg flex items-center justify-center text-2xl font-display font-bold text-white shrink-0">
                    {guide.name.charAt(0)}
                  </div>
                  <div className="text-white">
                    <p className="text-primary-100 font-medium text-xs uppercase tracking-wider mb-0.5">Book Your Guide</p>
                    <h2 className="text-2xl font-bold font-display leading-none">{guide.name}</h2>
                  </div>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              </div>

              {/* Form Body - 2 Columns */}
              <form onSubmit={handleBookingSubmit} className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* LEFT COLUMN: Trip Details */}
                  <div className="space-y-4">
                    {/* Date & Duration Group */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-surface-700">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 w-4 h-4 pointer-events-none" />
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={bookingData.date}
                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                            className="w-full pl-9 pr-2 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all font-medium text-sm text-surface-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-surface-700">Duration</label>
                        <div className="relative">
                          <select
                            required
                            value={bookingData.duration}
                            onChange={(e) => setBookingData({ ...bookingData, duration: e.target.value })}
                            className="w-full px-3 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all font-medium text-sm text-surface-900 appearance-none cursor-pointer"
                          >
                            <option value="">Select...</option>
                            <option value="half-day">Half Day (4h)</option>
                            <option value="full-day">Full Day (8h)</option>
                            <option value="multi-day">Multi Day</option>
                          </select>
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4 rotate-90 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Group Size */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-surface-700">Group Size</label>
                      <div className="flex items-center gap-4 p-2 rounded-xl border border-surface-200 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => setBookingData(p => ({ ...p, groupSize: Math.max(1, p.groupSize - 1) }))}
                          className="p-3 hover:bg-surface-100 rounded-lg text-surface-500 hover:text-primary-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="flex-1 text-center font-bold text-xl text-surface-900 font-display">
                          {bookingData.groupSize} <span className="text-sm font-medium text-surface-500 font-sans">Guests</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingData(p => ({ ...p, groupSize: Math.min(20, p.groupSize + 1) }))}
                          className="p-3 hover:bg-surface-100 rounded-lg text-surface-500 hover:text-primary-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Cost Calculation Preview */}
                    <div className="bg-primary-50 rounded-xl p-3 border border-primary-100 flex justify-between items-center text-sm">
                      <span className="text-surface-700">Rate per person</span>
                      <span className="font-bold text-primary-700">LKR {guide.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Requests & Action */}
                  <div className="space-y-5 flex flex-col justify-between h-full">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-surface-700">Special Request <span className="text-surface-400 font-normal text-xs">(Optional)</span></label>
                      <textarea
                        rows="4"
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all text-surface-900 placeholder-surface-400 resize-none"
                        placeholder="Dietary requirements, accessibility, etc."
                      ></textarea>
                    </div>

                    <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-surface-500 text-xs font-bold uppercase tracking-wider mb-0.5">Estimated Total</p>
                          <p className="text-xs text-surface-400">All taxes included</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-surface-900 font-display">LKR {(guide.price * bookingData.groupSize).toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Processing...' : (
                          <>
                            <BookOpen className="w-5 h-5" />
                            Request Booking
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GuideDetail
