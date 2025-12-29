import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Bed, 
  DollarSign,
  Clock,
  Star,
  Share2,
  Printer
} from 'lucide-react';
import { hotelAPI, roomAPI, bookingAPI, hotelUtils } from '../../../services/hotels/hotelService';
import toast from 'react-hot-toast';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

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
      
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking information');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Generate PDF content
    const content = `
      Booking Confirmation
      ===================
      
      Booking ID: ${bookingId}
      Hotel: ${hotel.name}
      Room: ${room.name}
      Check-in: ${hotelUtils.formatDate(booking.checkIn)}
      Check-out: ${hotelUtils.formatDate(booking.checkOut)}
      Guests: ${booking.guests.adults} adults, ${booking.guests.children} children
      Total: Rs. ${booking.pricing.total.toLocaleString()}
      
      Thank you for choosing SerendibGo!
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-confirmation-${bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Booking confirmation downloaded');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Hotel Booking',
          text: `I've booked ${room.name} at ${hotel.name} for ${hotelUtils.formatDate(booking.checkIn)} to ${hotelUtils.formatDate(booking.checkOut)}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Booking link copied to clipboard');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Booking Confirmed!</h1>
                <p className="text-sm text-gray-600">Booking ID: {bookingId}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Confirmation Card */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600">
              Your hotel booking has been confirmed. You will receive a confirmation email shortly.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hotel Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{hotel.location.address}, {hotel.location.city}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-1" />
                  <span>{hotel.contact.phone}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>{hotel.contact.email}</span>
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{room.name}</h4>
                  <p className="text-sm text-gray-600">{room.description}</p>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{room.bedConfiguration.join(', ')}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{room.maxOccupancy.adults} adults, {room.maxOccupancy.children} children</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dates and Guests */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Check-in</div>
                  <div className="font-medium">{hotelUtils.formatDate(booking.checkIn)}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Check-out</div>
                  <div className="font-medium">{hotelUtils.formatDate(booking.checkOut)}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Guests</div>
                  <div className="font-medium">
                    {booking.guests.adults} adults, {booking.guests.children} children
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-medium">
                    {booking.pricing.totalNights} night{booking.pricing.totalNights !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Room ({booking.pricing.totalNights} night{booking.pricing.totalNights !== 1 ? 's' : ''})</span>
                <span>Rs. {booking.pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes (12%)</span>
                <span>Rs. {booking.pricing.taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee (5%)</span>
                <span>Rs. {booking.pricing.serviceFee.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span className="text-green-600">Rs. {booking.pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
              <p className="text-gray-600">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Guest Information */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Guest Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600">Name</div>
              <div className="font-medium">
                {booking.guestInfo.firstName} {booking.guestInfo.lastName}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium">{booking.guestInfo.email}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Phone</div>
              <div className="font-medium">{booking.guestInfo.phone}</div>
            </div>
            
            {booking.guestInfo.nationality && (
              <div>
                <div className="text-sm text-gray-600">Nationality</div>
                <div className="font-medium">{booking.guestInfo.nationality}</div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>You will receive a confirmation email with all booking details</div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>Contact the hotel directly if you have any special requests</div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>Arrive at the hotel on your check-in date</div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>Enjoy your stay in Sri Lanka!</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Bookings
          </button>
          <button
            onClick={() => navigate('/hotels')}
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Book Another Hotel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
