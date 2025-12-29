import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Clock,
  MapPin,
  Calendar,
  Users,
  Bed,
  DollarSign
} from 'lucide-react';
import PaymentForm from '../../../components/hotels/booking/PaymentForm';
import { hotelAPI, roomAPI, bookingAPI, hotelUtils } from '../../../services/hotels/hotelService';
import paymentService from '../../../services/payments/paymentService';
import toast from 'react-hot-toast';

const Payment = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to complete payment');
      navigate('/login');
      return;
    }

    fetchBookingDetails();
  }, [bookingId, user]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch booking details
      const bookingResponse = await bookingAPI.getBooking(bookingId);
      const bookingData = bookingResponse.data.booking;
      setBooking(bookingData);
      
      // Fetch hotel details
      const hotelResponse = await hotelAPI.getHotel(bookingData.hotel);
      setHotel(hotelResponse.data.hotel);
      
      // Fetch room details
      const roomResponse = await roomAPI.getRoom(bookingData.room);
      setRoom(roomResponse.data.room);
      
      // Check payment status
      const paymentResponse = await paymentService.getBookingPaymentStatus(bookingId);
      setPaymentStatus(paymentResponse.data.status);
      setPaymentDetails(paymentResponse.data.payment);
      
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking information');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (payment) => {
    setPaymentStatus('completed');
    setPaymentDetails(payment);
    toast.success('Payment completed successfully!');
    
    // Redirect to confirmation page after a short delay
    setTimeout(() => {
      navigate(`/booking-confirmation/${bookingId}`);
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentStatus('failed');
  };

  const handleCancel = () => {
    navigate(`/hotels/${booking.hotel}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking || !hotel || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h2>
          <button
            onClick={() => navigate('/my-bookings')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  // If payment is already completed
  if (paymentStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Completed!</h1>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => navigate(`/booking-confirmation/${bookingId}`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Booking Details
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Complete Payment</h1>
              <p className="text-sm text-gray-600">Booking ID: {bookingId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <PaymentForm
              bookingData={{
                bookingId: bookingId,
                total: booking.pricing.total,
                subtotal: booking.pricing.subtotal,
                taxes: booking.pricing.taxes,
                serviceFee: booking.pricing.serviceFee
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancel}
            />
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              {/* Hotel Info */}
              <div className="border-b pb-4 mb-4">
                <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{hotel.location.city}, {hotel.location.district}</span>
                </div>
              </div>

              {/* Room Info */}
              <div className="border-b pb-4 mb-4">
                <h4 className="font-medium text-gray-900">{room.name}</h4>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{room.bedConfiguration.join(', ')}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Check-in: {hotelUtils.formatDate(booking.checkIn)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Check-out: {hotelUtils.formatDate(booking.checkOut)}</span>
                </div>
              </div>

              {/* Guests */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    {booking.guests.adults} adults, {booking.guests.children} children
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Room ({booking.pricing.totalNights} night{booking.pricing.totalNights !== 1 ? 's' : ''})</span>
                  <span>Rs. {booking.pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes (12%)</span>
                  <span>Rs. {booking.pricing.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee (5%)</span>
                  <span>Rs. {booking.pricing.serviceFee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">Rs. {booking.pricing.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Special Requests</h5>
                  <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                </div>
              )}

              {/* Payment Status */}
              {paymentStatus === 'failed' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-700">Payment failed. Please try again.</span>
                  </div>
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-700">Payment is being processed...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
