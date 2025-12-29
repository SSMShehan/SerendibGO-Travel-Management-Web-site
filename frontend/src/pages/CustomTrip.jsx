import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Heart,
  Share2,
  Camera,
  Navigation,
  Utensils,
  Bed,
  Car,
  Plane,
  Mountain,
  Waves,
  TreePine,
  Building,
  Sparkles,
  Zap,
  Award,
  Shield,
  Info,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../components/common/GlassCard'
import toast from 'react-hot-toast'

const CustomTrip = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    destinations: [], // Array of custom destination strings
    startDate: '',
    endDate: '',
    groupSize: 1,
    budget: '',

    // Step 2: Preferences
    interests: [],
    accommodation: '',
    transport: [],
    activities: [],

    // Step 3: Details
    specialRequests: '',
    dietaryRequirements: '',
    accessibility: '',

    // Step 4: Contact
    name: '',
    email: '',
    phone: '',
    emergencyContact: ''
  })

  const [showInterests, setShowInterests] = useState(false)
  const [showActivities, setShowActivities] = useState(false)
  const [loading, setLoading] = useState(false)
  const [destinationInput, setDestinationInput] = useState('')

  const interests = [
    { id: 'culture', label: 'Culture & History', icon: Building },
    { id: 'nature', label: 'Nature & Wildlife', icon: TreePine },
    { id: 'adventure', label: 'Adventure Sports', icon: Mountain },
    { id: 'beach', label: 'Beach & Relaxation', icon: Waves },
    { id: 'food', label: 'Food & Cuisine', icon: Utensils },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'shopping', label: 'Shopping', icon: Building },
    { id: 'nightlife', label: 'Nightlife', icon: Sparkles }
  ]

  const activities = [
    { id: 'hiking', label: 'Hiking & Trekking', price: 50 },
    { id: 'diving', label: 'Scuba Diving', price: 120 },
    { id: 'safari', label: 'Wildlife Safari', price: 80 },
    { id: 'city-tour', label: 'City Tours', price: 30 },
    { id: 'cooking', label: 'Cooking Classes', price: 40 },
    { id: 'yoga', label: 'Yoga & Wellness', price: 35 },
    { id: 'water-sports', label: 'Water Sports', price: 60 },
    { id: 'cultural-show', label: 'Cultural Shows', price: 25 }
  ]

  const accommodationOptions = [
    { id: 'budget', label: 'Budget Hotels', price: 50, description: 'Clean and comfortable basic accommodation' },
    { id: 'mid-range', label: 'Mid-Range Hotels', price: 100, description: 'Good quality hotels with modern amenities' },
    { id: 'luxury', label: 'Luxury Hotels', price: 200, description: 'Premium hotels with exceptional service' },
    { id: 'resort', label: 'Resorts', price: 150, description: 'All-inclusive resort experience' },
    { id: 'homestay', label: 'Homestays', price: 30, description: 'Authentic local experience' }
  ]

  const transportOptions = [
    { id: 'bus', label: 'Public Bus', price: 5, icon: Car },
    { id: 'private-car', label: 'Private Car', price: 80, icon: Car },
    { id: 'train', label: 'Train', price: 15, icon: Car },
    { id: 'flight', label: 'Domestic Flight', price: 120, icon: Plane },
    { id: 'boat', label: 'Boat/Cruise', price: 40, icon: Waves }
  ]

  const handleAddDestination = () => {
    const destination = destinationInput.trim()
    if (destination && !formData.destinations.includes(destination)) {
      setFormData(prev => ({
        ...prev,
        destinations: [...prev.destinations, destination]
      }))
      setDestinationInput('')
    }
  }

  const handleRemoveDestination = (destinationToRemove) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.filter(dest => dest !== destinationToRemove)
    }))
  }

  const handleDestinationKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddDestination()
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Get minimum end date (start date + 1 day)
  const getMinEndDate = () => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate)
      startDate.setDate(startDate.getDate() + 1)
      return startDate.toISOString().split('T')[0]
    }
    return getTodayDate()
  }

  // Validate date selection
  const validateDates = () => {
    const today = new Date()
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (formData.startDate && startDate < today) {
      return 'Start date cannot be in the past'
    }
    if (formData.endDate && formData.startDate && endDate <= startDate) {
      return 'End date must be after start date'
    }
    return null
  }

  const handleInterestToggle = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const handleActivityToggle = (activityId) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activityId)
        ? prev.activities.filter(id => id !== activityId)
        : [...prev.activities, activityId]
    }))
  }

  const handleTransportToggle = (transportId) => {
    setFormData(prev => ({
      ...prev,
      transport: prev.transport.includes(transportId)
        ? prev.transport.filter(id => id !== transportId)
        : [...prev.transport, transportId]
    }))
  }

  const calculateEstimatedCost = () => {
    let total = 0

    // Accommodation cost
    const selectedAccommodation = accommodationOptions.find(acc => acc.id === formData.accommodation)
    if (selectedAccommodation) {
      const days = formData.startDate && formData.endDate
        ? Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))
        : 1
      total += selectedAccommodation.price * days * formData.groupSize
    }

    // Activity costs
    formData.activities.forEach(activityId => {
      const activity = activities.find(act => act.id === activityId)
      if (activity) {
        total += activity.price * formData.groupSize
      }
    })

    // Transport costs
    formData.transport.forEach(transportId => {
      const transport = transportOptions.find(trans => trans.id === transportId)
      if (transport) {
        total += transport.price * formData.groupSize
      }
    })

    return total
  }

  const nextStep = () => {
    // Validate required fields before moving to next step
    if (currentStep === 1) {
      // Step 1: Basic Info - validate dates and destinations
      if (!formData.startDate || !formData.endDate) {
        toast.error('Please select both start and end dates')
        return
      }

      if (!formData.destinations || formData.destinations.length === 0) {
        toast.error('Please add at least one destination')
        return
      }

      const dateError = validateDates()
      if (dateError) {
        toast.error(dateError)
        return
      }
    }

    if (currentStep === 2) {
      // Step 2: Preferences - validate budget
      if (!formData.budget || formData.budget.trim() === '') {
        toast.error('Please enter your budget')
        return
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Comprehensive validation before submission
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates')
      return
    }

    if (!formData.budget || formData.budget.trim() === '') {
      toast.error('Please enter your budget')
      return
    }

    if (!formData.destinations || formData.destinations.length === 0) {
      toast.error('Please add at least one destination')
      return
    }

    // Validate dates before submission
    const dateError = validateDates()
    if (dateError) {
      toast.error(dateError)
      return
    }

    setLoading(true)

    try {
      // Map destination names to enum values (simplified for demo, handle gracefully)
      const destinationMap = {
        'colombo': 'Colombo',
        'kandy': 'Kandy',
        'galle': 'Galle',
        // ... more mappings as needed
      }

      // Prepare the data for API submission
      const tripData = {
        destination: formData.destinations.length > 1 ? 'Multiple Cities' :
          (formData.destinations[0] || 'Sri Lanka'),
        destinations: formData.destinations, // Send the full array
        startDate: formData.startDate,
        endDate: formData.endDate,
        groupSize: formData.groupSize,
        budget: formData.budget,
        interests: formData.interests || [],
        accommodation: formData.accommodation,
        transport: formData.transport || [],
        activities: (formData.activities || []).map(activityId => {
          const activity = activities.find(act => act.id === activityId)
          return {
            id: activityId,
            label: activity?.label || activityId,
            price: activity?.price || 0
          }
        }),
        specialRequests: formData.specialRequests,
        dietaryRequirements: formData.dietaryRequirements,
        accessibility: formData.accessibility,
        contactInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          emergencyContact: formData.emergencyContact
        }
      }

      console.log('Submitting custom trip:', tripData)

      const response = await fetch('/api/custom-trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(tripData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Your custom trip request has been submitted successfully! We will contact you within 24 hours to discuss your personalized itinerary.')
        navigate('/my-bookings')
      } else {
        toast.error(data.message || 'Failed to submit custom trip request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting custom trip:', error)
      toast.error('An error occurred while submitting your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Tell us about your trip' },
    { id: 2, title: 'Preferences', description: 'What interests you?' },
    { id: 3, title: 'Details', description: 'Special requirements' },
    { id: 4, title: 'Contact', description: 'How to reach you' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-200/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-surface-900">
              Create Your <span className="text-primary-600">Custom Trip</span>
            </h1>
          </div>
          <p className="text-xl text-surface-600 max-w-3xl mx-auto leading-relaxed font-sans">
            Design your perfect Sri Lankan adventure with our personalized trip planning service.
            Tell us your preferences and we'll create a unique itinerary just for you.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center relative">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 z-10 ${currentStep >= step.id
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 border-transparent text-white shadow-lg'
                    : 'bg-white border-surface-300 text-surface-400'
                  }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{step.id}</span>
                  )}
                </div>
                <div className="ml-4 hidden sm:block">
                  <div className={`font-bold ${currentStep >= step.id ? 'text-surface-900' : 'text-surface-400'}`}>
                    {step.title}
                  </div>
                  <div className="text-sm text-surface-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block absolute left-12 w-[calc(100%_-_3rem)] h-0.5 top-6 -translate-y-1/2 transition-all duration-300 ${currentStep > step.id ? 'bg-primary-500' : 'bg-surface-200'
                    }`} style={{ width: '100px', left: '3rem' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <GlassCard className="overflow-hidden">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8"
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Basic Trip Information</h2>
                      <p className="text-surface-600">Let's start with the basics of your dream trip</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Destinations
                        </label>
                        <p className="text-sm text-surface-600 mb-4">Add the places you want to visit in Sri Lanka</p>

                        {/* Destination Input */}
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={destinationInput}
                            onChange={(e) => setDestinationInput(e.target.value)}
                            onKeyPress={handleDestinationKeyPress}
                            placeholder="Type destination name (e.g., Colombo, Kandy, Galle...)"
                            className="flex-1 px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddDestination}
                            disabled={!destinationInput.trim()}
                            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-surface-300 disabled:cursor-not-allowed transition-colors font-bold"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Selected Destinations */}
                        {formData.destinations.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-surface-600 font-bold">Selected destinations:</p>
                            <div className="flex flex-wrap gap-2">
                              {formData.destinations.map((destination, index) => (
                                <motion.span
                                  key={index}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100"
                                >
                                  <MapPin className="w-4 h-4" />
                                  {destination}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDestination(destination)}
                                    className="text-primary-500 hover:text-primary-700 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          min={getTodayDate()}
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          required
                        />
                        {formData.startDate && new Date(formData.startDate) < new Date() && (
                          <p className="text-red-500 text-sm mt-1 font-medium">Start date cannot be in the past</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          min={getMinEndDate()}
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          required
                        />
                        {formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate) && (
                          <p className="text-red-500 text-sm mt-1 font-medium">End date must be after start date</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          <Users className="w-4 h-4 inline mr-2" />
                          Group Size
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleInputChange('groupSize', Math.max(1, formData.groupSize - 1))}
                            className="p-3 border border-surface-200 rounded-xl hover:bg-surface-50 text-surface-700 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={formData.groupSize}
                            onChange={(e) => handleInputChange('groupSize', parseInt(e.target.value) || 1)}
                            min="1"
                            max="20"
                            className="flex-1 px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-surface-900 outline-none font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleInputChange('groupSize', Math.min(20, formData.groupSize + 1))}
                            className="p-3 border border-surface-200 rounded-xl hover:bg-surface-50 text-surface-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          <Star className="w-4 h-4 inline mr-2" />
                          Budget Range (USD)
                        </label>
                        <div className="relative">
                          <select
                            value={formData.budget}
                            onChange={(e) => handleInputChange('budget', e.target.value)}
                            className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-surface-900 outline-none appearance-none"
                            required
                          >
                            <option value="">Select budget range</option>
                            <option value="500-1000">$500 - $1,000</option>
                            <option value="1000-2000">$1,000 - $2,000</option>
                            <option value="2000-3000">$2,000 - $3,000</option>
                            <option value="3000-5000">$3,000 - $5,000</option>
                            <option value="5000+">$5,000+</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Preferences */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8"
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Your Preferences</h2>
                      <p className="text-surface-600">Help us understand what you're looking for</p>
                    </div>

                    {/* Interests */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-surface-900">Interests & Activities</h3>
                        <button
                          type="button"
                          onClick={() => setShowInterests(!showInterests)}
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold"
                        >
                          {showInterests ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {showInterests ? 'Hide' : 'Show'} Options
                        </button>
                      </div>

                      {showInterests && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-hidden"
                        >
                          {interests.map((interest) => (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => handleInterestToggle(interest.id)}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${formData.interests.includes(interest.id)
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-surface-200 bg-surface-50/50 text-surface-700 hover:border-primary-300 hover:bg-primary-50/30'
                                }`}
                            >
                              <interest.icon className="w-6 h-6 mb-2" />
                              <div className="text-sm font-bold">{interest.label}</div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Accommodation */}
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-surface-900 mb-4">Accommodation Preference</h3>
                      <div className="space-y-3">
                        {accommodationOptions.map((option) => (
                          <label key={option.id} className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-300 ${formData.accommodation === option.id
                              ? 'border-primary-500 bg-primary-50/30'
                              : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
                            }`}>
                            <input
                              type="radio"
                              name="accommodation"
                              value={option.id}
                              checked={formData.accommodation === option.id}
                              onChange={(e) => handleInputChange('accommodation', e.target.value)}
                              className="mt-1 w-4 h-4 text-primary-600 border-surface-300 focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-surface-900">{option.label}</div>
                                <div className="text-primary-600 font-bold">${option.price}/night</div>
                              </div>
                              <div className="text-sm text-surface-600 mt-1">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Transport */}
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-surface-900 mb-4">Transportation Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {transportOptions.map((option) => (
                          <label key={option.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-300 ${formData.transport.includes(option.id)
                              ? 'border-primary-500 bg-primary-50/30'
                              : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
                            }`}>
                            <input
                              type="checkbox"
                              checked={formData.transport.includes(option.id)}
                              onChange={() => handleTransportToggle(option.id)}
                              className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                            />
                            <option.icon className="w-5 h-5 text-surface-600" />
                            <div className="flex-1">
                              <div className="font-bold text-surface-900">{option.label}</div>
                              <div className="text-sm text-surface-600">${option.price}/person</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Activities */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-surface-900">Specific Activities</h3>
                        <button
                          type="button"
                          onClick={() => setShowActivities(!showActivities)}
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold"
                        >
                          {showActivities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {showActivities ? 'Hide' : 'Show'} Activities
                        </button>
                      </div>

                      {showActivities && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden"
                        >
                          {activities.map((activity) => (
                            <label key={activity.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-300 ${formData.activities.includes(activity.id)
                                ? 'border-primary-500 bg-primary-50/30'
                                : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
                              }`}>
                              <input
                                type="checkbox"
                                checked={formData.activities.includes(activity.id)}
                                onChange={() => handleActivityToggle(activity.id)}
                                className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                              />
                              <div className="flex-1">
                                <div className="font-bold text-surface-900">{activity.label}</div>
                                <div className="text-sm text-surface-600">${activity.price}/person</div>
                              </div>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8"
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Special Requirements</h2>
                      <p className="text-surface-600">Any special needs or requests for your trip?</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          <Info className="w-4 h-4 inline mr-2" />
                          Special Requests
                        </label>
                        <textarea
                          value={formData.specialRequests}
                          onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                          rows="4"
                          placeholder="Any special requests, celebrations, or specific experiences you'd like to include..."
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-surface-900 placeholder-surface-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          <Utensils className="w-4 h-4 inline mr-2" />
                          Dietary Requirements
                        </label>
                        <textarea
                          value={formData.dietaryRequirements}
                          onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                          rows="3"
                          placeholder="Any dietary restrictions, allergies, or food preferences..."
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-surface-900 placeholder-surface-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          <Shield className="w-4 h-4 inline mr-2" />
                          Accessibility Requirements
                        </label>
                        <textarea
                          value={formData.accessibility}
                          onChange={(e) => handleInputChange('accessibility', e.target.value)}
                          rows="3"
                          placeholder="Any mobility or accessibility requirements..."
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-surface-900 placeholder-surface-400 outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Contact */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8"
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Contact Information</h2>
                      <p className="text-surface-600">How can we reach you to discuss your custom trip?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-surface-900 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-surface-900 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-surface-900 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">Emergency Contact</label>
                        <input
                          type="text"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          placeholder="Name and phone number"
                          className="w-full px-4 py-3 bg-surface-50/50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-surface-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Trip Summary */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
                      <h3 className="text-lg font-bold text-surface-900 mb-4 font-display">Trip Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-surface-600">Destinations:</span>
                          <div className="ml-2 text-surface-900 mt-1">
                            {formData.destinations.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {formData.destinations.map((dest, index) => (
                                  <span key={index} className="px-2 py-1 bg-white text-primary-700 rounded-md text-xs font-medium border border-primary-100 shadow-sm">
                                    {dest}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-surface-500">Not specified</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-surface-600">Duration:</span>
                          <span className="ml-2 text-surface-900 font-bold block mt-1">
                            {formData.startDate && formData.endDate
                              ? Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + ' days'
                              : 'Not specified'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-surface-600">Group Size:</span>
                          <span className="ml-2 text-surface-900 font-bold block mt-1">{formData.groupSize} person(s)</span>
                        </div>
                        <div>
                          <span className="font-medium text-surface-600">Budget:</span>
                          <span className="ml-2 text-surface-900 font-bold block mt-1">{formData.budget}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-primary-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-surface-900">Estimated Cost:</span>
                          <span className="text-2xl font-bold text-primary-600 font-display">
                            ${calculateEstimatedCost().toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-surface-500 mt-1 italic">
                          *Final price may vary based on availability and specific requirements
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="px-8 py-6 bg-surface-50/50 border-t border-surface-200 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${currentStep === 1
                      ? 'text-surface-400 cursor-not-allowed opacity-50'
                      : 'text-surface-700 hover:bg-white hover:text-surface-900 hover:shadow-lg border border-transparent hover:border-surface-200'
                    }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-1"
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${loading
                        ? 'bg-surface-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:-translate-y-1'
                      }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-surface-900 mb-4">Why Choose Our Custom Trip Service?</h2>
            <p className="text-surface-600 text-lg">We make your dream trip a reality</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard className="text-center p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">Expert Planning</h3>
              <p className="text-surface-600 text-sm leading-relaxed">Our local experts create personalized itineraries based on your preferences and interests.</p>
            </GlassCard>

            <GlassCard className="text-center p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">24/7 Support</h3>
              <p className="text-surface-600 text-sm leading-relaxed">Round-the-clock assistance during your trip to ensure everything goes smoothly.</p>
            </GlassCard>

            <GlassCard className="text-center p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">Best Value</h3>
              <p className="text-surface-600 text-sm leading-relaxed">Get the most out of your budget with our local partnerships and insider knowledge.</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomTrip
