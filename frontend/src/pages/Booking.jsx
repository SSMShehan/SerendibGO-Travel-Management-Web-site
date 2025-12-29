import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { Calendar, MapPin, Users, CheckCircle, Loader2, AlertCircle, Info, Clock, User, Mail, Phone, ArrowRight, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import GlassCard from '../components/common/GlassCard'

const Booking = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { tourId } = useParams() // Get tourId from URL params
  const { user, isAuthenticated } = useAuth()
  const vehicleId = searchParams.get('vehicle')

  const [vehicle, setVehicle] = useState(null)
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dateErrors, setDateErrors] = useState({
    startDate: '',
    endDate: ''
  })
  const [formData, setFormData] = useState({
    // Trip Details (for vehicles)
    pickupLocation: {
      address: '',
      city: '',
      district: ''
    },
    dropoffLocation: {
      address: '',
      city: '',
      district: ''
    },
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',

    // Tour Details (for tours)
    tourDate: '',
    participants: 1,

    // Passengers
    adults: 1,
    children: 0,
    infants: 0,

    // Guest Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',

    // Special Requests
    specialRequests: ''
  })

  // Fetch vehicle or tour details
  useEffect(() => {
    const fetchData = async () => {
      if (vehicleId) {
        // Fetch vehicle details
        try {
          const response = await api.get(`/vehicles/${vehicleId}`)
          setVehicle(response.data.data)
        } catch (error) {
          console.error('Error fetching vehicle:', error)
          toast.error('Failed to load vehicle details')
          navigate('/vehicles')
        } finally {
          setLoading(false)
        }
      } else if (tourId) {
        // Fetch tour details
        try {
          const response = await api.get(`/tours/${tourId}`)
          setTour(response.data.data)
        } catch (error) {
          console.error('Error fetching tour:', error)
          toast.error('Failed to load tour details')
          navigate('/tours')
        } finally {
          setLoading(false)
        }
      } else {
        toast.error('No vehicle or tour selected')
        navigate('/')
        return
      }
    }

    fetchData()
  }, [vehicleId, tourId, navigate])

  // Pre-fill user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [isAuthenticated, user])

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a vehicle')
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Validate vehicle booking dates
  const validateVehicleDates = (startDate, endDate) => {
    const errors = { startDate: '', endDate: '' }
    let isValid = true

    if (!startDate) {
      errors.startDate = 'Please select a start date'
      isValid = false
    } else {
      const start = new Date(startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start < today) {
        errors.startDate = 'Start date cannot be in the past'
        isValid = false
      }

      // Check if start date is more than 1 year in advance
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      if (start > oneYearFromNow) {
        errors.startDate = 'Start date cannot be more than 1 year in advance'
        isValid = false
      }
    }

    if (!endDate) {
      errors.endDate = 'Please select an end date'
      isValid = false
    } else {
      const end = new Date(endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (end < today) {
        errors.endDate = 'End date cannot be in the past'
        isValid = false
      }

      // Check if end date is more than 1 year in advance
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      if (end > oneYearFromNow) {
        errors.endDate = 'End date cannot be more than 1 year in advance'
        isValid = false
      }
    }

    // Check if end date is before start date
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (end < start) {
        errors.endDate = 'End date must be after start date'
        isValid = false
      }

      // Check if rental period is too long (more than 30 days)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 30) {
        errors.endDate = 'Rental period cannot exceed 30 days'
        isValid = false
      }
    }

    setDateErrors(errors)
    return isValid
  }

  // Handle date input changes with validation
  const handleDateChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Validate dates when both are present
    if (name === 'startDate') {
      validateVehicleDates(value, formData.endDate)
    } else if (name === 'endDate') {
      validateVehicleDates(formData.startDate, value)
    }
  }

  const calculatePrice = () => {
    if (vehicle?.pricing) {
      // Vehicle pricing calculation
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const hours = Math.ceil((endDate - startDate) / (1000 * 60 * 60))

      const basePrice = vehicle.pricing.basePrice || 0
      const hourlyRate = vehicle.pricing.hourlyRate || 0
      const dailyRate = vehicle.pricing.dailyRate || 0

      // Use daily rate if more than 8 hours, otherwise hourly
      const durationPrice = hours > 8 ? dailyRate : (hours * hourlyRate)
      const subtotal = basePrice + durationPrice
      const taxes = subtotal * 0.1 // 10% tax
      const serviceCharge = subtotal * 0.05 // 5% service charge

      return subtotal + taxes + serviceCharge
    } else if (tour?.price) {
      // Tour pricing calculation
      const basePrice = tour.price * parseInt(formData.participants)
      const taxes = basePrice * 0.1 // 10% tax
      const serviceCharge = basePrice * 0.05 // 5% service charge

      return basePrice + taxes + serviceCharge
    }

    return 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!vehicle && !tour) {
      toast.error('Vehicle or tour not found')
      return
    }

    // Validate vehicle dates if booking a vehicle
    if (vehicle && !validateVehicleDates(formData.startDate, formData.endDate)) {
      toast.error('Please fix the date errors before submitting')
      return
    }

    setSubmitting(true)

    try {
      let bookingData, response

      if (vehicle) {
        // Vehicle booking
        bookingData = {
          vehicle: vehicleId,
          tripDetails: {
            pickupLocation: formData.pickupLocation,
            dropoffLocation: formData.dropoffLocation,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            startTime: formData.startTime,
            endTime: formData.endTime
          },
          passengers: {
            adults: parseInt(formData.adults),
            children: parseInt(formData.children),
            infants: parseInt(formData.infants)
          },
          guestDetails: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          specialRequests: formData.specialRequests
        }

        response = await api.post('/vehicle-bookings', bookingData)
      } else if (tour) {
        // Tour booking
        bookingData = {
          tourId: tourId,
          startDate: new Date(formData.tourDate).toISOString(),
          endDate: new Date(formData.tourDate).toISOString(), // Same day for tours
          groupSize: parseInt(formData.participants),
          specialRequests: formData.specialRequests
        }

        response = await api.post('/bookings', bookingData)
      }

      if (response.data.status === 'success' || response.data.success === true) {
        const booking = response.data.data.booking || response.data.data
        const totalAmount = calculatePrice()

        console.log('=== BOOKING CREATED ===')
        console.log('Response data:', response.data)
        console.log('Booking object:', booking)
        console.log('Booking ID:', booking?._id)
        console.log('Total amount:', totalAmount)

        // Navigate to payment page
        navigate('/payment', {
          state: {
            bookingId: booking._id,
            bookingType: vehicle ? 'vehicle' : 'tour',
            amount: totalAmount,
            currency: 'USD',
            serviceName: vehicle ? (vehicle.make + ' ' + vehicle.model) : tour.title,
            serviceDescription: vehicle ? vehicle.description : tour.description,
            startDate: vehicle ? formData.startDate : formData.tourDate,
            endDate: vehicle ? formData.endDate : formData.tourDate,
            groupSize: vehicle ? (parseInt(formData.adults) + parseInt(formData.children) + parseInt(formData.infants)) : formData.participants,
            guestDetails: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone
            }
          }
        })
      } else {
        toast.error(response.data.message || 'Failed to create booking')
      }

    } catch (error) {
      console.error('Booking error:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <span className="ml-3 text-lg font-medium text-surface-600 font-display">Loading details...</span>
      </div>
    )
  }

  if (!vehicle && !tour) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">Service not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 py-12 relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-200/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-display text-surface-900 mb-3">
            {vehicle ? 'Confirm Your Vehicle' : 'Confirm Your Tour'}
          </h1>
          <p className="text-surface-600 max-w-2xl mx-auto">
            {vehicle ? 'Finalize your vehicle rental details below.' : 'You are just a few steps away from an amazing experience.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Booking Form (Left) */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Service Details */}
                <div>
                  <h3 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                    <Calendar className="h-6 w-6 mr-2 text-primary-500" />
                    {vehicle ? 'Rental Period' : 'Tour Date'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicle ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-surface-700 block">
                            Start Date
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleDateChange}
                              min={new Date().toISOString().split('T')[0]}
                              required
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium ${dateErrors.startDate
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-surface-200'
                                }`}
                            />
                            {dateErrors.startDate && (
                              <div className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {dateErrors.startDate}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-surface-700 block">
                            End Date
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleDateChange}
                              min={formData.startDate || new Date().toISOString().split('T')[0]}
                              required
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium ${dateErrors.endDate
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-surface-200'
                                }`}
                            />
                            {dateErrors.endDate && (
                              <div className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {dateErrors.endDate}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-surface-700 flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-primary-500" />
                            Start Time
                          </label>
                          <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-surface-700 flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-primary-500" />
                            End Time
                          </label>
                          <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-surface-700 block">
                          Select Date
                        </label>
                        <input
                          type="date"
                          name="tourDate"
                          value={formData.tourDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Pickup Location (for vehicles) or Participants (for tours) */}
                {vehicle ? (
                  <div>
                    <h3 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                      <MapPin className="h-6 w-6 mr-2 text-primary-500" />
                      Pickup Location
                    </h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-surface-700 block">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="pickupLocation.address"
                          value={formData.pickupLocation.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                          placeholder="e.g. 123 Main Street, Hotel Lobby"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-surface-700 block">
                            City
                          </label>
                          <input
                            type="text"
                            name="pickupLocation.city"
                            value={formData.pickupLocation.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                            placeholder="City"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-surface-700 block">
                            District
                          </label>
                          <input
                            type="text"
                            name="pickupLocation.district"
                            value={formData.pickupLocation.district}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                            placeholder="District"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                      <Users className="h-6 w-6 mr-2 text-primary-500" />
                      Participants
                    </h3>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-surface-700 block">
                        Number of People
                      </label>
                      <input
                        type="number"
                        name="participants"
                        value={formData.participants}
                        onChange={handleInputChange}
                        min="1"
                        max={tour?.maxParticipants || 20}
                        required
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                      />
                      <p className="text-xs text-surface-500 font-medium mt-1 pl-1">
                        Maximum allowed: {tour?.maxParticipants || 20}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dropoff Location (vehicles only) */}
                {vehicle && (
                  <div>
                    <h3 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                      <MapPin className="h-6 w-6 mr-2 text-secondary-500" />
                      Dropoff Location
                    </h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-surface-700 block">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="dropoffLocation.address"
                          value={formData.dropoffLocation.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                          placeholder="Enter dropoff address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-surface-700 block">
                            City
                          </label>
                          <input
                            type="text"
                            name="dropoffLocation.city"
                            value={formData.dropoffLocation.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                            placeholder="City"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-surface-700 block">
                            District
                          </label>
                          <input
                            type="text"
                            name="dropoffLocation.district"
                            value={formData.dropoffLocation.district}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                            placeholder="District"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Passengers (vehicles only) */}
                {vehicle && (
                  <div>
                    <h3 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                      <Users className="h-6 w-6 mr-2 text-primary-500" />
                      Passenger Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-surface-700 block">
                          Adults
                        </label>
                        <input
                          type="number"
                          name="adults"
                          value={formData.adults}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-surface-700 block">
                          Children
                        </label>
                        <input
                          type="number"
                          name="children"
                          value={formData.children}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-surface-700 block">
                          Infants
                        </label>
                        <input
                          type="number"
                          name="infants"
                          value={formData.infants}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Guest Details */}
                <div>
                  <h3 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                    <User className="h-6 w-6 mr-2 text-primary-500" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-surface-700 block">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-surface-700 block">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-surface-700 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-surface-700 block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-surface-50 hover:bg-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </GlassCard>
          </div>

          {/* Order Summary (Right/Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                  Booking Summary
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-lg text-primary-700 mb-1">
                      {vehicle ? vehicle.name : tour.title}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      {vehicle ? vehicle.vehicleType : tour.category}
                    </span>
                  </div>

                  {(vehicle?.images || tour?.images) && (vehicle?.images?.length > 0 || tour?.images?.length > 0) && (
                    <div className="aspect-video rounded-xl overflow-hidden bg-surface-200 shadow-sm">
                      <img
                        src={vehicle ? (vehicle.images[0].url || vehicle.images[0]) : (tour.images[0].url || tour.images[0])}
                        alt={vehicle ? vehicle.name : tour.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="border-t border-surface-100 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-surface-600">
                      <span className="text-sm font-medium">Subtotal</span>
                      <span className="text-sm font-bold">LKR {calculatePrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-surface-200">
                      <span className="text-lg font-bold text-surface-900">Total</span>
                      <span className="text-xl font-black text-primary-600 font-display">LKR {calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-300 font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>

              <div className="mt-4 flex items-center justify-center text-surface-500 text-sm">
                <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-500" />
                Secure Booking Process
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
