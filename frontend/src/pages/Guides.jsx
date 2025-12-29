import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, Clock, Users, Search, Filter, Calendar, Phone, Mail, Award, Globe, Heart, ChevronDown, X, Shield, CheckCircle, Zap, Crown, Sparkles, Eye, BookOpen, ArrowLeft, User, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { guideService } from '../services/guideService'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/common/GlassCard'

const Guides = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [bookingData, setBookingData] = useState({
    date: '',
    duration: '',
    groupSize: 1,
    specialRequests: ''
  })
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [showBookingCalendar, setShowBookingCalendar] = useState(false)
  const [selectedBookingDate, setSelectedBookingDate] = useState(new Date())

  // Fetch guides from API
  useEffect(() => {
    fetchGuides()

    // Listen for guide profile updates
    const handleGuideUpdate = (event) => {
      console.log('Guide profile updated, refreshing guides list:', event.detail)
      fetchGuides()
    }

    window.addEventListener('guideProfileUpdated', handleGuideUpdate)

    return () => {
      window.removeEventListener('guideProfileUpdated', handleGuideUpdate)
    }
  }, [])

  const fetchGuides = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        search: searchTerm,
        location: selectedLocation,
        specialty: selectedSpecialty,
        limit: 50 // Get more guides
      }
      const response = await guideService.getGuides(params)
      setGuides(response.data || [])
    } catch (err) {
      console.error('Error fetching guides:', err)
      setError('Failed to load guides. Please try again.')
      // Fallback to empty array
      setGuides([])
    } finally {
      setLoading(false)
    }
  }

  // Refetch guides when filters change
  useEffect(() => {
    if (!loading) {
      fetchGuides()
    }
  }, [searchTerm, selectedLocation, selectedSpecialty])

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

  const locations = ['All Locations', 'Colombo', 'Kandy', 'Galle', 'Anuradhapura', 'Trincomalee']
  const specialties = ['All Specialties', 'Cultural Tours', 'Historical Sites', 'Nature Tours', 'Wildlife', 'Food Tours', 'Religious Tours', 'Luxury Tours', 'Family Tours']

  const handleBookGuide = (guide) => {
    setSelectedGuide(guide)
    setShowBookingModal(true)
  }

  const handleViewDetails = (guide) => {
    navigate(`/guides/${guide.id}`)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()

    if (!selectedGuide) {
      alert('Please select a guide first')
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
        guideId: selectedGuide.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: bookingData.duration,
        groupSize: parseInt(bookingData.groupSize),
        specialRequests: bookingData.specialRequests || '',
        guestInfo: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone
        }
      }

      console.log('Submitting guide booking:', bookingDataToSubmit)

      // Use authenticated endpoint if user is logged in, otherwise use guest endpoint
      let response
      if (isAuthenticated && user) {
        console.log('User is authenticated, using authenticated booking endpoint')
        // For authenticated users, we don't need guestInfo in the request body
        const authenticatedBookingData = {
          guideId: bookingDataToSubmit.guideId,
          startDate: bookingDataToSubmit.startDate,
          endDate: bookingDataToSubmit.endDate,
          duration: bookingDataToSubmit.duration,
          groupSize: bookingDataToSubmit.groupSize,
          specialRequests: bookingDataToSubmit.specialRequests
        }
        response = await guideService.createGuideBooking(authenticatedBookingData)
      } else {
        console.log('User is not authenticated, using guest booking endpoint')
        response = await guideService.createGuestGuideBooking(bookingDataToSubmit)
      }

      if (response.success) {
        // Calculate total amount (base price per person per day)
        const basePricePerPersonPerDay = 50; // $50 per person per day
        const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalAmount = basePricePerPersonPerDay * parseInt(bookingData.groupSize) * daysDiff;

        // Navigate to payment page
        navigate('/payment', {
          state: {
            bookingId: response.data._id,
            bookingType: 'guide',
            amount: totalAmount,
            currency: 'USD',
            guideName: selectedGuide.firstName + ' ' + selectedGuide.lastName,
            guideEmail: selectedGuide.email,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            groupSize: bookingData.groupSize,
            duration: bookingData.duration,
            bookingReference: response.data.bookingReference
          }
        });

        setShowBookingModal(false)
        setBookingData({
          date: '',
          duration: '',
          groupSize: 1,
          specialRequests: ''
        })
        setGuestInfo({
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        })
      } else {
        alert('Failed to submit booking: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error submitting guide booking:', error)
      alert('Failed to submit booking request. Please try again.')
    }
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
    if (!selectedGuide?.blockedDates) return false
    return selectedGuide.blockedDates.some(blockout =>
      new Date(blockout.date).toDateString() === date.toDateString()
    )
  }

  const isWorkingDay = (date) => {
    if (!selectedGuide?.workingDays) return true
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[date.getDay()]
    return selectedGuide.workingDays.includes(dayName)
  }

  const isDateAvailable = (date) => {
    return !isDateInPast(date) && !isDateBlocked(date) && isWorkingDay(date)
  }

  const handleBookingDateSelect = (day) => {
    const dateToSelect = new Date(selectedBookingDate.getFullYear(), selectedBookingDate.getMonth(), day)

    if (!isDateAvailable(dateToSelect)) {
      if (isDateInPast(dateToSelect)) {
        alert('Cannot select past dates')
      } else if (isDateBlocked(dateToSelect)) {
        alert('This date is not available (blocked by guide)')
      } else if (!isWorkingDay(dateToSelect)) {
        alert('Guide is not available on this day')
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

      let buttonClass = 'h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 '

      if (isSelected) {
        buttonClass += 'bg-primary-500 text-white'
      } else if (isPast) {
        buttonClass += 'text-surface-300 cursor-not-allowed'
      } else if (isBlocked) {
        buttonClass += 'bg-red-100 text-red-500 cursor-not-allowed'
      } else if (!isWorking) {
        buttonClass += 'bg-secondary-100 text-secondary-600 cursor-not-allowed'
      } else if (isAvailable) {
        buttonClass += 'text-surface-700 hover:bg-primary-100 hover:text-primary-600'
      }

      days.push(
        <button
          key={day}
          onClick={() => handleBookingDateSelect(day)}
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

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden h-[50vh] flex items-center justify-center"
        style={{
          backgroundImage: 'url(/hero_guide.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-[2px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Crown className="h-5 w-5 text-secondary-400 mr-2" />
              <span className="text-white/90 font-medium">Premium Certified Guides</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Meet Your <br />
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Local Experts
              </span>
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Explore Sri Lanka with passionate guides who bring history and culture to life.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-8">
        <GlassCard className="p-6 mb-12 shadow-2xl border-white/20 bg-white/60 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-400 h-5 w-5 group-hover:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-white/40 border border-white/30 rounded-xl leading-5 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 transition-all duration-300 sm:text-sm backdrop-blur-sm"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all w-full md:w-auto justify-center ${showFilters ? 'bg-primary-600 text-white' : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'}`}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
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
                <div className="pt-6 border-t border-surface-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-surface-700">Location</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-400 h-5 w-5 group-hover:text-primary-500 transition-colors" />
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/40 border border-white/30 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 outline-none appearance-none transition-all backdrop-blur-sm text-surface-700"
                      >
                        {locations.map(location => <option key={location} value={location}>{location}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-surface-400 h-5 w-5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Specialty Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-surface-700">Specialty</label>
                    <div className="relative group">
                      <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-400 h-5 w-5 group-hover:text-primary-500 transition-colors" />
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/40 border border-white/30 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:bg-white/80 outline-none appearance-none transition-all backdrop-blur-sm text-surface-700"
                      >
                        {specialties.map(specialty => <option key={specialty} value={specialty}>{specialty}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-surface-400 h-5 w-5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Guides Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-display font-bold text-surface-900">Available Guides</h2>
          <span className="text-surface-500">{guides.length} guides found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-3xl p-8 animate-pulse shadow-lg h-96"></div>
            ))}
          </div>
        ) : guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleViewDetails(guide)}
                className="cursor-pointer group"
              >
                <GlassCard className="h-full flex flex-col hover:border-primary-200 transition-colors duration-300 bg-white/80 hover:bg-white/90 backdrop-blur-md">
                  <div className="p-8 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20">
                        {guide.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-right">
                        <span className="bg-secondary-100 text-secondary-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Certified</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-surface-900 mb-2 group-hover:text-primary-600 transition-colors">{guide.name}</h3>

                    <div className="flex items-center gap-4 text-sm text-surface-600 mb-6">
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 text-secondary-400 fill-current" /> {guide.rating}</div>
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary-500" /> {guide.location}</div>
                    </div>

                    <p className="text-surface-600 text-sm line-clamp-3 mb-6 bg-surface-50 p-4 rounded-xl border border-surface-100 italic">
                      "{guide.description}"
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {guide.languages.slice(0, 3).map(lang => (
                        <span key={lang} className="text-xs font-semibold px-3 py-1 bg-surface-100 text-surface-600 rounded-lg">{lang}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 border-t border-surface-100 mt-auto bg-surface-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-surface-500 uppercase font-bold tracking-wider">Starting from</p>
                        <p className="text-xl font-bold text-primary-600">${guide.price}<span className="text-sm font-normal text-surface-500">/day</span></p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBookGuide(guide); }}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all transform hover:-translate-y-0.5"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-50 rounded-3xl border border-surface-200">
            <Users className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">No guides found</h3>
            <p className="text-surface-500">Try adjusting your filters to find more guides.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl backdrop-blur-md border border-white/20">
                    {selectedGuide.name[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display">Book {selectedGuide.name}</h2>
                    <p className="text-primary-100 text-sm">Complete your reservation</p>
                  </div>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleBookingSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Date & Duration */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">Tour Date</label>
                        <div className="relative booking-calendar-container">
                          <button
                            type="button"
                            onClick={() => setShowBookingCalendar(!showBookingCalendar)}
                            className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-left flex justify-between items-center hover:border-primary-300 transition-colors"
                          >
                            <span className={bookingData.date ? 'text-surface-900 font-medium' : 'text-surface-400'}>{formatBookingDate(bookingData.date)}</span>
                            <Calendar className="w-5 h-5 text-surface-400" />
                          </button>
                          {showBookingCalendar && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-surface-200 rounded-xl shadow-xl z-20 p-4">
                              <div className="flex justify-between items-center mb-4">
                                <button type="button" onClick={() => navigateBookingMonth('prev')}><ChevronLeft className="w-5 h-5" /></button>
                                <span className="font-bold">{selectedBookingDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                <button type="button" onClick={() => navigateBookingMonth('next')}><ChevronRight className="w-5 h-5" /></button>
                              </div>
                              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 font-bold text-surface-400">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {renderBookingCalendar()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">Duration</label>
                        <select
                          value={bookingData.duration}
                          onChange={(e) => setBookingData({ ...bookingData, duration: e.target.value })}
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none"
                          required
                        >
                          <option value="">Select duration</option>
                          <option value="half-day">Half Day (4 hours)</option>
                          <option value="full-day">Full Day (8 hours)</option>
                          <option value="multi-day">Multi Day</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">Group Size</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={bookingData.groupSize}
                          onChange={(e) => setBookingData({ ...bookingData, groupSize: e.target.value })}
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Guest Info (Visible only if guest, but logic handled in submit) - Actually form layout: just generic fields */}
                    <div className="space-y-6">
                      {!isAuthenticated && (
                        <div className="bg-surface-50 p-6 rounded-2xl border border-surface-100">
                          <h4 className="font-bold text-surface-900 mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Guest Information</h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <input type="text" placeholder="First Name" value={guestInfo.firstName} onChange={e => setGuestInfo({ ...guestInfo, firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-200" required />
                              <input type="text" placeholder="Last Name" value={guestInfo.lastName} onChange={e => setGuestInfo({ ...guestInfo, lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-200" required />
                            </div>
                            <input type="email" placeholder="Email Address" value={guestInfo.email} onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-200" required />
                            <input type="tel" placeholder="Phone Number" value={guestInfo.phone} onChange={e => setGuestInfo({ ...guestInfo, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-surface-200" required />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">Special Requests</label>
                        <textarea
                          rows="4"
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                          placeholder="Tell us about any specific interests or requirements..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-surface-100">
                    <button
                      type="submit"
                      className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-1"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Guides
