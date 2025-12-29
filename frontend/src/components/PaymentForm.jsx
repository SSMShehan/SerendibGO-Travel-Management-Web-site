import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { CreditCard, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';
import paymentService from '../services/payments/paymentService';

const PaymentForm = ({ bookingData, onPaymentSuccess, onPaymentError, onRetry }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug the bookingData received
  console.log('PaymentForm received bookingData:', {
    bookingId: bookingData?.bookingId,
    isGuestPayment: bookingData?.isGuestPayment,
    clientSecret: bookingData?.clientSecret,
    allKeys: Object.keys(bookingData || {}),
    fullData: bookingData
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !bookingData.clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if payment intent is still in a valid state
      console.log('Attempting to confirm payment with clientSecret:', bookingData.clientSecret);

      // Confirm payment with Stripe using the existing clientSecret
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        bookingData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: bookingData.customerName || 'Customer',
              email: bookingData.customerEmail || '',
            },
          }
        }
      );

      if (stripeError) {
        console.error('Stripe error:', stripeError);

        // If payment intent is in unexpected state, suggest retry
        if (stripeError.code === 'payment_intent_unexpected_state') {
          setError('Payment session expired. Please refresh the page and try again.');
          toast.error('Payment session expired. Please refresh the page and try again.');
        } else {
          setError(stripeError.message);
          toast.error(`Payment failed: ${stripeError.message}`);
        }
        onPaymentError?.(stripeError);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        try {
          console.log('Payment succeeded, confirming payment...', {
            paymentIntentId: paymentIntent.id,
            isGuestPayment: bookingData.isGuestPayment,
            bookingId: bookingData.bookingId,
            bookingDataKeys: Object.keys(bookingData)
          });

          // Use the isGuestPayment flag to determine which endpoint to use
          if (bookingData.isGuestPayment) {
            console.log('Confirming guest payment:', paymentIntent.id);
            await paymentService.confirmGuestPayment(paymentIntent.id);
          } else {
            console.log('Confirming authenticated payment:', paymentIntent.id);
            await paymentService.confirmPayment(paymentIntent.id);
          }

          console.log('Payment confirmation successful!');
          toast.success('Payment successful!');
          onPaymentSuccess?.(paymentIntent);
        } catch (confirmError) {
          console.error('Payment confirmation error:', confirmError);
          console.error('Confirmation error details:', {
            status: confirmError.response?.status,
            data: confirmError.response?.data,
            message: confirmError.message
          });
          toast.error('Payment succeeded but confirmation failed. Please contact support.');
          onPaymentError?.(confirmError);
        }
      } else {
        setError('Payment was not successful');
        toast.error('Payment was not successful');
        onPaymentError?.(new Error('Payment not succeeded'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      onPaymentError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b', // surface-800
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        '::placeholder': {
          color: '#94a3b8', // surface-400
        },
        iconColor: '#0ea5e9', // primary-500
      },
      invalid: {
        color: '#ef4444', // red-500
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <div className="w-full">
      {/* Container removed to allow parent to control styling */}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-surface-700 mb-2">
            Card Information
          </label>
          <div className="p-4 border border-surface-200 rounded-xl bg-surface-50 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="flex items-start p-4 bg-red-50/50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-700 text-sm font-medium">{error}</span>
              {error.includes('Payment session expired') && onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-bold underline"
                >
                  Click here to create a new session
                </button>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading || !bookingData.clientSecret}
          className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${loading || !stripe || !bookingData.clientSecret
              ? 'bg-surface-300 text-surface-500 cursor-not-allowed shadow-none hover:translate-y-0'
              : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-primary-500/30'
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Secure Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Pay {bookingData.currency} {bookingData.amount.toLocaleString()}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
