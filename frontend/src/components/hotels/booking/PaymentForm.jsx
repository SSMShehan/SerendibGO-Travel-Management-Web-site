import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { PAYMENT_METHODS, getPaymentMethodIcon, getProcessingFee } from '../../../constants/payments/methods';
import paymentService from '../../../services/payments/paymentService';
import toast from 'react-hot-toast';

const PaymentForm = ({ 
  bookingData, 
  onPaymentSuccess, 
  onPaymentError,
  onCancel 
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    saveCard: false
  });
  const [mobilePaymentData, setMobilePaymentData] = useState({
    provider: 'm_cash',
    phoneNumber: '',
    pin: ''
  });
  const [bankTransferData, setBankTransferData] = useState({
    bankName: '',
    accountNumber: '',
    reference: ''
  });
  const [errors, setErrors] = useState({});

  const processingFee = getProcessingFee(selectedMethod, bookingData.total);
  const totalAmount = bookingData.total + processingFee;

  const validateCardData = () => {
    const newErrors = {};

    if (!cardData.number.trim()) {
      newErrors.number = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardData.number.replace(/\s/g, ''))) {
      newErrors.number = 'Invalid card number';
    }

    if (!cardData.expiry.trim()) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = 'Invalid expiry date (MM/YY)';
    }

    if (!cardData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!cardData.name.trim()) {
      newErrors.name = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMobilePaymentData = () => {
    const newErrors = {};

    if (!mobilePaymentData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{9}$/.test(mobilePaymentData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }

    if (!mobilePaymentData.pin.trim()) {
      newErrors.pin = 'PIN is required';
    } else if (!/^\d{4,6}$/.test(mobilePaymentData.pin)) {
      newErrors.pin = 'Invalid PIN';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBankTransferData = () => {
    const newErrors = {};

    if (!bankTransferData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!bankTransferData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardSubmit = async () => {
    if (!validateCardData()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setProcessing(true);

      const paymentData = {
        method: 'card',
        amount: totalAmount,
        currency: 'LKR',
        card: {
          number: cardData.number,
          expiry: cardData.expiry,
          cvv: cardData.cvv,
          name: cardData.name
        },
        saveCard: cardData.saveCard,
        bookingId: bookingData.bookingId
      };

      const response = await paymentService.processPayment(paymentData);
      
      if (response.success) {
        toast.success('Payment processed successfully!');
        onPaymentSuccess(response.payment);
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleMobilePaymentSubmit = async () => {
    if (!validateMobilePaymentData()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setProcessing(true);

      const response = await paymentService.processMobilePayment(
        mobilePaymentData.provider,
        totalAmount,
        mobilePaymentData.phoneNumber,
        bookingData.bookingId
      );

      if (response.success) {
        toast.success('Mobile payment initiated! Please confirm on your phone.');
        onPaymentSuccess(response.payment);
      } else {
        throw new Error(response.message || 'Mobile payment failed');
      }
    } catch (error) {
      console.error('Mobile payment error:', error);
      toast.error(error.response?.data?.message || 'Mobile payment failed');
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBankTransferSubmit = async () => {
    if (!validateBankTransferData()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setProcessing(true);

      const response = await paymentService.processBankTransfer({
        amount: totalAmount,
        currency: 'LKR',
        bankName: bankTransferData.bankName,
        accountNumber: bankTransferData.accountNumber,
        reference: bankTransferData.reference,
        bookingId: bookingData.bookingId
      });

      if (response.success) {
        toast.success('Bank transfer details sent! Please complete the transfer.');
        onPaymentSuccess(response.payment);
      } else {
        throw new Error(response.message || 'Bank transfer failed');
      }
    } catch (error) {
      console.error('Bank transfer error:', error);
      toast.error(error.response?.data?.message || 'Bank transfer failed');
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCashPaymentSubmit = async () => {
    try {
      setProcessing(true);

      const response = await paymentService.processCashPayment(
        totalAmount,
        bookingData.bookingId,
        'Cash payment on arrival'
      );

      if (response.success) {
        toast.success('Cash payment option selected! Please pay on arrival.');
        onPaymentSuccess(response.payment);
      } else {
        throw new Error(response.message || 'Cash payment setup failed');
      }
    } catch (error) {
      console.error('Cash payment error:', error);
      toast.error(error.response?.data?.message || 'Cash payment setup failed');
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    switch (selectedMethod) {
      case 'card':
        handleCardSubmit();
        break;
      case 'mobile_payment':
        handleMobilePaymentSubmit();
        break;
      case 'bank_transfer':
        handleBankTransferSubmit();
        break;
      case 'cash':
        handleCashPaymentSubmit();
        break;
      default:
        toast.error('Please select a payment method');
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Lock className="w-4 h-4 mr-1" />
            Secure Payment
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Room Total</span>
              <span>Rs. {bookingData.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee</span>
              <span>Rs. {processingFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total Amount</span>
              <span>Rs. {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
              <button
                key={key}
                onClick={() => setSelectedMethod(key)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedMethod === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <method.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{method.label}</div>
                    <div className="text-xs text-gray-500">{method.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Payment Form */}
          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Card Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.number ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.number && (
                  <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                    placeholder="MM/YY"
                    maxLength="5"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expiry ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.expiry && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                    placeholder="123"
                    maxLength="4"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData({...cardData, name: e.target.value})}
                  placeholder="John Doe"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={cardData.saveCard}
                  onChange={(e) => setCardData({...cardData, saveCard: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
                  Save card for future payments
                </label>
              </div>
            </div>
          )}

          {/* Mobile Payment Form */}
          {selectedMethod === 'mobile_payment' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Mobile Payment</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  value={mobilePaymentData.provider}
                  onChange={(e) => setMobilePaymentData({...mobilePaymentData, provider: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="m_cash">mCash</option>
                  <option value="frimi">FriMi</option>
                  <option value="ez_cash">eZ Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={mobilePaymentData.phoneNumber}
                  onChange={(e) => setMobilePaymentData({...mobilePaymentData, phoneNumber: e.target.value.replace(/\D/g, '')})}
                  placeholder="771234567"
                  maxLength="9"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN
                </label>
                <input
                  type="password"
                  value={mobilePaymentData.pin}
                  onChange={(e) => setMobilePaymentData({...mobilePaymentData, pin: e.target.value.replace(/\D/g, '')})}
                  placeholder="Enter your PIN"
                  maxLength="6"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.pin ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pin && (
                  <p className="text-red-500 text-sm mt-1">{errors.pin}</p>
                )}
              </div>
            </div>
          )}

          {/* Bank Transfer Form */}
          {selectedMethod === 'bank_transfer' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Bank Transfer Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankTransferData.bankName}
                  onChange={(e) => setBankTransferData({...bankTransferData, bankName: e.target.value})}
                  placeholder="Commercial Bank of Ceylon"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bankName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bankName && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankTransferData.accountNumber}
                  onChange={(e) => setBankTransferData({...bankTransferData, accountNumber: e.target.value})}
                  placeholder="1234567890"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference (Optional)
                </label>
                <input
                  type="text"
                  value={bankTransferData.reference}
                  onChange={(e) => setBankTransferData({...bankTransferData, reference: e.target.value})}
                  placeholder="Booking reference"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Cash Payment */}
          {selectedMethod === 'cash' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Cash Payment</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Pay on Arrival</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      You will pay the total amount of Rs. {totalAmount.toLocaleString()} when you arrive at the hotel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : `Pay Rs. ${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
