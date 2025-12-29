import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import GlassCard from '../components/common/GlassCard'
import {
  MapPin,
  Star,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  XCircle,
  Minus,
  Plus,
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  Shield,
  Award,
  BookOpen
} from 'lucide-react'
import { useTour } from '../context/TourContext'

const TourDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { setCurrentTour } = useTour()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: '',
    duration: '',
    groupSize: 1,
    specialRequests: ''
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [dateError, setDateError] = useState('')

  useEffect(() => {
    if (id) fetchTour()
  }, [id])

  const fetchTour = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/tours/${id}`)
      if (response.data.success) {
        setTour(response.data.data)
        setCurrentTour(response.data.data)
      } else {
        setError('Tour not found')
      }
    } catch (err) {
      console.error('Error fetching tour:', err)
      setError('Failed to load tour details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated || !user) {
      toast.error('Please login to book a tour')
      navigate('/login')
      return
    }
    if (!bookingData.date || !bookingData.groupSize) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!validateTourDate(bookingData.date)) {
      toast.error(dateError || 'Please select a valid tour date')
      return
    }

    try {
      setBookingLoading(true)
      const startDate = new Date(bookingData.date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + (tour.duration || 1))

      const bookingPayload = {
        tourId: tour._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupSize: parseInt(bookingData.groupSize),
        specialRequests: bookingData.specialRequests || ''
      }

      const response = await api.post('/bookings', bookingPayload)

      if (response.data.success) {
        const booking = response.data.data
        const totalAmount = tour.price * bookingData.groupSize

        navigate('/payment', {
          state: {
            bookingId: booking._id,
            bookingType: 'tour',
            amount: totalAmount,
            currency: 'USD',
            tourName: tour.title,
            tourDescription: tour.description,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            groupSize: bookingData.groupSize,
            duration: tour.duration,
            bookingReference: booking.bookingReference
          }
        })
        setShowBookingModal(false)
        setBookingData({ date: '', duration: '', groupSize: 1, specialRequests: '' })
        toast.success('Booking created successfully! Redirecting to payment...')
      } else {
        toast.error(response.data.message || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating tour booking:', error)
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.')
        navigate('/login')
      } else {
        toast.error(error.response?.data?.message || 'Failed to create booking.')
      }
    } finally {
      setBookingLoading(false)
    }
  }

  const validateTourDate = (dateString) => {
    if (!dateString) {
      setDateError('Please select a tour date')
      return false
    }
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      setDateError('Tour date cannot be in the past')
      return false
    }
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    if (selectedDate > oneYearFromNow) {
      setDateError('Tour date cannot be more than 1 year in advance')
      return false
    }
    setDateError('')
    return true
  }

  const handleDateChange = (e) => {
    const dateValue = e.target.value
    setBookingData({ ...bookingData, date: dateValue })
    validateTourDate(dateValue)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % tour.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + tour.images.length) % tour.images.length)
  }

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
  if (error || !tour) return <div className="min-h-screen flex justify-center items-center text-red-500">{error || 'Tour not found'}</div>

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] lg:h-[70vh]">
        {tour.images && tour.images.length > 0 && (
          <img
            src={typeof tour.images[currentImageIndex] === 'string' ? tour.images[currentImageIndex] : tour.images[currentImageIndex]?.url}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent opacity-90"></div>

        {/* Navigation & Actions */}
        <div className="absolute top-24 left-0 right-0 px-4 md:px-8 flex justify-between items-start z-10 max-w-7xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/tours')}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white flex items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tours
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-accent-500 text-accent-500' : ''}`} />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-500/80 backdrop-blur-md text-white rounded-full text-sm font-semibold capitalize">
                {tour.category}
              </span>
              <span className="px-3 py-1 bg-secondary-500/80 backdrop-blur-md text-white rounded-full text-sm font-semibold capitalize flex items-center gap-1">
                <Clock className="w-3 h-3" /> {tour.duration} Days
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 leading-tight">
              {tour.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span className="text-lg">{tour.location.name}, {tour.location.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary-400 fill-secondary-400" />
                <span className="text-lg font-bold">{tour.rating.average}</span>
                <span className="text-sm opacity-80">({tour.rating.count} reviews)</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image Gallery Controls */}
        {tour.images.length > 1 && (
          <div className="absolute bottom-12 right-8 flex gap-2">
            <button onClick={prevImage} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={nextImage} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20"><ChevronRight className="w-6 h-6" /></button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <GlassCard className="p-8">
              {/* Tabs */}
              <div className="flex border-b border-surface-200 mb-8 overflow-x-auto no-scrollbar">
                {['overview', 'itinerary', 'included', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-semibold capitalize whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-primary-600' : 'text-surface-500 hover:text-surface-700'
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" layoutId="activeTab" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      <p className="text-lg text-surface-600 leading-relaxed">{tour.description}</p>

                      <div>
                        <h3 className="text-xl font-bold font-display text-surface-900 mb-4">Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tour.highlights.map((highlight, i) => (
                            <div key={i} className="flex gap-3">
                              <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                              <span className="text-surface-600">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold font-display text-surface-900 mb-4">Good to Know</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-surface-50 rounded-xl border border-surface-100">
                            <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary-500" /> Best Time</h4>
                            <p className="text-surface-600 text-sm">{tour.seasonality.bestMonths.join(', ')}</p>
                          </div>
                          <div className="p-4 bg-surface-50 rounded-xl border border-surface-100">
                            <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-accent-500" /> Group Size</h4>
                            <p className="text-surface-600 text-sm">{tour.minParticipants} - {tour.maxParticipants} People</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'itinerary' && (
                    <div className="space-y-8 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-surface-200">
                      {tour.itinerary.map((day, i) => (
                        <div key={i} className="relative pl-12">
                          <div className="absolute left-0 top-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm font-bold text-primary-700 text-sm">
                            {day.day}
                          </div>
                          <div className="bg-surface-50 p-6 rounded-2xl border border-surface-100 mb-6">
                            <h3 className="text-lg font-bold text-surface-900 mb-2">{day.title}</h3>
                            <p className="text-surface-600 mb-4 text-sm">{day.description || 'Full day of activities including sightseeing and local experiences.'}</p>
                            <div className="flex flex-wrap gap-2">
                              {day.activities.map((act, j) => (
                                <span key={j} className="px-3 py-1 bg-white border border-surface-200 rounded-lg text-xs font-medium text-surface-600">
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'included' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2 text-lg"><CheckCircle2 className="w-5 h-5 text-primary-500" /> What's Included</h3>
                        <ul className="space-y-3">
                          {tour.included.map((item, i) => (
                            <li key={i} className="flex gap-3 text-surface-600 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2 text-lg"><XCircle className="w-5 h-5 text-red-500" /> Not Included</h3>
                        <ul className="space-y-3">
                          {tour.excluded.map((item, i) => (
                            <li key={i} className="flex gap-3 text-surface-600 text-sm">
                              <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {tour.reviews.map((review) => (
                        <div key={review.id} className="border-b border-surface-100 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-surface-200 rounded-full flex items-center justify-center font-bold text-surface-600">
                                {review.name[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-surface-900 text-sm">{review.name}</h4>
                                <div className="flex text-secondary-400">
                                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-surface-300'}`} />)}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-surface-400">{review.date}</span>
                          </div>
                          <p className="text-surface-600 text-sm pl-13">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </GlassCard>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <GlassCard className="p-6 border-primary-200 shadow-xl shadow-primary-900/5">
                <div className="mb-6 flex items-end gap-2">
                  {tour.originalPrice && (
                    <span className="text-surface-400 line-through mb-1">${tour.originalPrice}</span>
                  )}
                  <span className="text-4xl font-bold text-primary-600">${tour.price}</span>
                  <span className="text-surface-500 mb-2">/ person</span>
                </div>

                <div className="space-y-4 mb-6 text-sm text-surface-600">
                  <div className="flex justify-between py-2 border-b border-surface-100">
                    <span>Duration</span>
                    <span className="font-semibold text-surface-900">{tour.duration} Days</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-surface-100">
                    <span>Group Size</span>
                    <span className="font-semibold text-surface-900">Max {tour.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-surface-100">
                    <span>Type</span>
                    <span className="font-semibold text-surface-900 capitalize">{tour.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" /> Book Now
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-surface-400 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Free cancellation up to 24h before
                  </p>
                </div>
              </GlassCard>

              {/* Guide Info */}
              <GlassCard className="mt-4 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-200 overflow-hidden">
                  {/* Placeholder for guide image */}
                  <div className="w-full h-full flex items-center justify-center text-surface-400 font-bold text-xl">
                    {tour.guide ? tour.guide.firstName[0] : 'G'}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold">Your Guide</p>
                  <p className="font-bold text-surface-900">{tour.guide ? `${tour.guide.firstName} ${tour.guide.lastName}` : 'Professional Guide'}</p>
                </div>
              </GlassCard>
            </div>
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
                <div className="relative z-10 w-full flex items-center justify-between">
                  <div>
                    <p className="text-primary-100 font-medium text-xs uppercase tracking-wider mb-0.5">Book Your Adventure</p>
                    <h2 className="text-2xl font-bold font-display leading-none text-white line-clamp-1">{tour.title}</h2>
                  </div>
                </div>
                {/* Decorative Circles - Subtle */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              </div>

              {/* Form Body - 2 Columns Grid */}
              <form onSubmit={handleBookingSubmit} className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* LEFT COLUMN: Inputs */}
                  <div className="space-y-5">
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-surface-700">Select Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5 pointer-events-none" />
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingData.date}
                          onChange={handleDateChange}
                          className="w-full pl-11 pr-4 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all font-medium text-surface-900"
                        />
                      </div>
                      {dateError && <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1"><XCircle className="w-3 h-3" /> {dateError}</p>}
                    </div>

                    {/* Group Size */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-surface-700">Group Size</label>
                        <span className="text-xs text-surface-500">Max {tour.maxParticipants} guests</span>
                      </div>
                      <div className="flex items-center gap-4 p-2 rounded-xl border border-surface-200 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => setBookingData(p => ({ ...p, groupSize: Math.max(1, p.groupSize - 1) }))}
                          className="p-3 hover:bg-surface-100 rounded-lg text-surface-500 hover:text-primary-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="flex-1 text-center font-bold text-xl text-surface-900 font-display">
                          {bookingData.groupSize}
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingData(p => ({ ...p, groupSize: Math.min(tour.maxParticipants, p.groupSize + 1) }))}
                          className="p-3 hover:bg-surface-100 rounded-lg text-surface-500 hover:text-primary-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Special Requests & Total */}
                  <div className="space-y-5 flex flex-col justify-between h-full">
                    {/* Special Requests */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-surface-700">Special Requests <span className="text-surface-400 font-normal text-xs">(Optional)</span></label>
                      <textarea
                        rows="3"
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all text-surface-900 placeholder-surface-400 resize-none"
                        placeholder="Dietary requirements, etc."
                      ></textarea>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-surface-500 text-xs font-bold uppercase tracking-wider mb-0.5">Total Price</p>
                          <p className="text-xs text-surface-400">Includes taxes & fees</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-3xl font-bold text-surface-900 font-display">${(tour.price * bookingData.groupSize).toLocaleString()}</span>
                            <span className="text-surface-500 font-medium text-sm">USD</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {bookingLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-5 h-5" />
                            Proceed to Payment
                          </>
                        )}
                      </button>
                      <div className="mt-2 flex justify-center text-primary-600/80 gap-1.5">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Secure SSL Encryption</span>
                      </div>
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

export default TourDetails
