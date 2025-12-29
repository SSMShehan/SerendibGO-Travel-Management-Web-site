import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Users, MapPin, ArrowRight, Home, Download, Mail, FileText, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import GlassCard from '../components/common/GlassCard';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, message, bookingData } = location.state || {};
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // If accessed directly without state, redirect home
  if (!bookingId && !message) {
    const timer = setTimeout(() => navigate('/'), 3000);
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Access Denied</h2>
          <p className="text-surface-600">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const response = await fetch(`/api/bookings/${bookingId}/download-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-confirmation-${bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('PDF downloaded successfully!');
      } else {
        throw new Error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      const response = await fetch(`/api/bookings/${bookingId}/send-confirmation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Confirmation email sent successfully!');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-12 relative overflow-hidden flex items-center justify-center">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-primary-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-md w-full px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 text-center border-t-4 border-t-emerald-500">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              className="mx-auto h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner"
            >
              <Check className="h-12 w-12 text-emerald-600 stroke-[3px]" />
            </motion.div>

            <h2 className="text-3xl font-bold font-display text-surface-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-surface-600 mb-8">
              {message || 'Your booking has been confirmed and payment processed successfully.'}
            </p>

            <div className="bg-surface-50 rounded-xl p-4 mb-8 border border-surface-200 text-left">
              <h3 className="text-sm font-bold text-surface-900 mb-3 flex items-center uppercase tracking-wider">
                Booking Details
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-surface-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">Booking ID</span>
                  </div>
                  <span className="text-sm font-mono font-medium text-surface-900">{bookingId}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-surface-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Status</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="flex flex-col items-center justify-center px-4 py-3 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 hover:border-surface-300 transition-all text-surface-700 font-medium text-sm group"
                >
                  <Download className="h-5 w-5 mb-1 text-primary-600 group-hover:-translate-y-0.5 transition-transform" />
                  {downloadingPDF ? 'Downloading...' : 'Download PDF'}
                </button>

                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="flex flex-col items-center justify-center px-4 py-3 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 hover:border-surface-300 transition-all text-surface-700 font-medium text-sm group"
                >
                  <Mail className="h-5 w-5 mb-1 text-primary-600 group-hover:-translate-y-0.5 transition-transform" />
                  {sendingEmail ? 'Sending...' : 'Email Receipt'}
                </button>
              </div>

              <button
                onClick={() => navigate('/my-bookings')}
                className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                View My Bookings
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-transparent text-surface-600 hover:text-surface-900 font-bold transition-all flex items-center justify-center"
              >
                <Home className="h-5 w-5 mr-2" />
                Return to Home
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
