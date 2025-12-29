import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { StripeProvider } from '../context/StripeContext'
import PaymentForm from '../components/PaymentForm'
import { toast } from 'react-hot-toast'
import paymentService from '../services/payments/paymentService'
import { motion } from 'framer-motion'
import GlassCard from '../components/common/GlassCard'
import {
  CreditCard,
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  Bed,
  DollarSign,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Car,
  Loader2,
  ShieldCheck
} from 'lucide-react'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [paymentIntentCreated, setPaymentIntentCreated] = useState(false)

  useEffect(() => {
    // Get booking data from navigation state
    if (location.state && !paymentIntentCreated) {
      const initialPaymentData = {
        ...location.state,
        isGuestPayment: !isAuthenticated || !user
      }
      setPaymentData(initialPaymentData)
      console.log('Payment page received booking data:', initialPaymentData)
      createPaymentIntent(initialPaymentData)
    } else if (!location.state) {
      console.error('No booking data found in location state')
      toast.error('No booking data found. Please try booking again.')
      navigate('/guides')
    }
  }, [location.state, navigate, paymentIntentCreated, isAuthenticated, user])

  const createPaymentIntent = async (bookingData) => {
    try {
      setInitializing(true)

      // Validate required fields
      if (!bookingData?.bookingId) {
        console.warn('⚠️ Booking ID is missing, generating a mock booking ID for payment');
        bookingData.bookingId = `mock-booking-${Date.now()}`;
        setPaymentData(prev => ({
          ...prev,
          bookingId: bookingData.bookingId
        }));
      }
      if (!bookingData?.amount || bookingData.amount <= 0) {
        throw new Error('Valid amount is required for payment')
      }

      let response;

      if (isAuthenticated && user) {
        try {
          // Use authenticated payment endpoint
          response = await paymentService.createPaymentIntent(
            bookingData.amount,
            bookingData.currency,
            { bookingId: bookingData.bookingId }
          )
        } catch (authError) {
          // Fallback to guest payment
          if (authError.response?.status === 403 || authError.response?.status === 401 || authError.response?.status === 400) {
            response = await paymentService.createGuestPaymentIntent(
              bookingData.amount,
              bookingData.currency,
              {
                bookingId: bookingData.bookingId,
                customerEmail: user?.email || bookingData.customerEmail || 'guest@example.com',
                customerName: user ? `${user.firstName} ${user.lastName}` : bookingData.customerName || 'Guest User'
              }
            )
            setPaymentData(prev => ({ ...prev, isGuestPayment: true }))
          } else {
            throw authError
          }
        }
      } else {
        // Use guest payment endpoint
        response = await paymentService.createGuestPaymentIntent(
          bookingData.amount,
          bookingData.currency,
          {
            bookingId: bookingData.bookingId,
            customerEmail: bookingData.customerEmail || 'guest@example.com',
            customerName: bookingData.customerName || 'Guest User'
          }
        )
        setPaymentData(prev => ({ ...prev, isGuestPayment: true }))
      }

      setClientSecret(response.data.clientSecret)
      setPaymentIntentCreated(true)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast.error('Failed to initialize payment. Please try again.')
    } finally {
      setInitializing(false)
    }
  }

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent)
    toast.success('Payment completed successfully!')
    navigate('/payment-success', {
      state: {
        message: 'Payment completed successfully!',
        bookingId: paymentData.bookingId,
        bookingData: paymentData
      }
    })
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    toast.error('Payment failed. Please try again.')
  }

  const handleRetryPayment = async () => {
    if (paymentData) {
      setPaymentIntentCreated(false)
      setClientSecret(null)
      await createPaymentIntent(paymentData)
    }
  }

  const handleAuthFailure = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.error('Your session has expired. Please log in again.')
    navigate('/login')
  }

  if (!paymentData || isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <span className="ml-3 text-lg font-medium text-surface-600 font-display">Loading payment details...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 py-12 relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-200/20 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 hover:text-primary-800 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Details
          </button>
          <h1 className="text-4xl font-bold font-display text-surface-900 mb-2">Secure Checkout</h1>
          <p className="text-surface-600 text-lg">Review your booking details and complete the payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <GlassCard className="p-8 h-fit">
            <h2 className="text-2xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
              <CheckCircle className="w-6 h-6 text-emerald-500 mr-2" />
              Booking Summary
            </h2>

            <div className="space-y-6">
              {/* Booking Type Specific Information */}
              {paymentData.bookingType === 'hotel' && (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-bold text-surface-900">{paymentData.hotelName}</p>
                      <p className="text-sm text-surface-600">{paymentData.roomName}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Check-in: {paymentData.checkIn}</p>
                      <p className="text-sm text-surface-600">Check-out: {paymentData.checkOut}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Guests: {paymentData.guests || 1}</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentData.bookingType === 'guide' && (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-bold text-surface-900">Guide: {paymentData.guideName}</p>
                      <p className="text-sm text-surface-600">{paymentData.guideEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Start: {paymentData.startDate}</p>
                      <p className="text-sm text-surface-600">End: {paymentData.endDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Group Size: {paymentData.groupSize}</p>
                      <p className="text-sm text-surface-600">Duration: {paymentData.duration}</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentData.bookingType === 'tour' && (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-bold text-surface-900">{paymentData.tourName}</p>
                      <p className="text-sm text-surface-600">{paymentData.tourDescription}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Start: {paymentData.startDate}</p>
                      <p className="text-sm text-surface-600">End: {paymentData.endDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Group Size: {paymentData.groupSize}</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentData.bookingType === 'vehicle' && (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Car className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-bold text-surface-900">{paymentData.vehicleName}</p>
                      <p className="text-sm text-surface-600">{paymentData.vehicleType}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Pickup: {paymentData.pickupLocation}</p>
                      <p className="text-sm text-surface-600">Dropoff: {paymentData.dropoffLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Pickup: {new Date(paymentData.pickupDateTime).toLocaleString()}</p>
                      <p className="text-sm text-surface-600">Dropoff: {new Date(paymentData.dropoffDateTime).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Passengers: {paymentData.passengers}</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentData.bookingType === 'custom-trip' && (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-bold text-surface-900">{paymentData.tripName}</p>
                      <p className="text-sm text-surface-600">{paymentData.tripDescription}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Start: {paymentData.startDate}</p>
                      <p className="text-sm text-surface-600">End: {paymentData.endDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-800">Group Size: {paymentData.groupSize}</p>
                      <p className="text-sm text-surface-600">Guide: {paymentData.guideName}</p>
                    </div>
                  </div>

                  {paymentData.interests && (
                    <div className="flex items-start">
                      <User className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-surface-800">Interests: {paymentData.interests}</p>
                        <p className="text-sm text-surface-600">Accommodation: {paymentData.accommodation}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Information */}
              <div className="border-t border-surface-200 pt-6">
                <h3 className="font-bold text-surface-900 mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-surface-500 mr-3" />
                    <span className="text-sm text-surface-700 font-medium">
                      {isAuthenticated && user
                        ? `${user.firstName} ${user.lastName}`
                        : paymentData.customerName || 'Guest User'
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-surface-500 mr-3" />
                    <span className="text-sm text-surface-700">
                      {isAuthenticated && user
                        ? user.email
                        : paymentData.customerEmail || 'guest@example.com'
                      }
                    </span>
                  </div>
                  {(isAuthenticated && user?.phone) || paymentData.customerPhone ? (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-surface-500 mr-3" />
                      <span className="text-sm text-surface-700">
                        {isAuthenticated && user
                          ? user.phone
                          : paymentData.customerPhone
                        }
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-surface-200 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-surface-600">
                    <span>
                      {paymentData.bookingType === 'hotel' ? 'Room Price:' :
                        paymentData.bookingType === 'tour' ? 'Tour Price:' :
                          paymentData.bookingType === 'vehicle' ? 'Vehicle Rental:' :
                            paymentData.bookingType === 'custom-trip' ? 'Custom Trip Price:' :
                              'Service Price:'}
                    </span>
                    <span className="font-medium text-surface-900">{paymentData.currency} {paymentData.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-surface-600">
                    <span>Taxes & Fees (15%):</span>
                    <span className="font-medium text-surface-900">{paymentData.currency} {Math.round(paymentData.amount * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-dashed border-surface-200 pt-4">
                    <span className="text-surface-900">Total Amount</span>
                    <span className="text-2xl text-primary-600 font-display">
                      {paymentData.currency} {Math.round(paymentData.amount * 1.15).toLocaleString()}
                    </span>
                  </div>
                  {paymentData.amount > 999999 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-amber-800">
                            <strong>Test Mode:</strong> Payment amount capped for testing.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {paymentData.bookingReference && (
                  <div className="mt-4 p-3 bg-surface-50 rounded-lg text-sm border border-surface-100">
                    <span className="font-bold text-surface-700">Booking Reference:</span> {paymentData.bookingReference}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Payment Form */}
          <GlassCard className="p-8 h-fit">
            <h2 className="text-2xl font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
              <CreditCard className="w-6 h-6 text-primary-500 mr-2" />
              Payment Details
            </h2>

            {initializing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
                <span className="text-surface-600 font-medium">Initializing secure payment...</span>
              </div>
            ) : clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <PaymentForm
                  bookingData={{
                    bookingId: paymentData.bookingId,
                    amount: Math.round(paymentData.amount * 1.15), // Include taxes
                    currency: paymentData.currency,
                    customerName: isAuthenticated && user
                      ? `${user.firstName} ${user.lastName}`
                      : paymentData.customerName || 'Guest User',
                    customerEmail: isAuthenticated && user
                      ? user.email
                      : paymentData.customerEmail || 'guest@example.com',
                    clientSecret: clientSecret,
                    isGuestPayment: paymentData.isGuestPayment || !isAuthenticated || !user
                  }}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  onRetry={handleRetryPayment}
                />
              </StripeProvider>
            ) : (
              <div className="text-center py-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
                  <p className="font-medium">Failed to initialize payment gateway.</p>
                </div>
                <div className="space-x-3">
                  <button
                    onClick={handleRetryPayment}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold transition-all"
                  >
                    Retry Payment
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={handleAuthFailure}
                      className="px-6 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 font-bold transition-all"
                    >
                      Relogin
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-surface-100 flex items-center justify-center text-surface-500 text-sm">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-500" />
              Payments are processed securely via Stripe
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default Payment
