import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CreditCard,
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Download,
  Share
} from 'lucide-react';
import { 
  getEarningsLabel, 
  getStatusLabel, 
  getPayoutStatusLabel,
  getPayoutMethodLabel,
  getStatusColor,
  getPayoutStatusColor,
  getEarningsTypeColor,
  formatCurrency,
  formatAmount,
  EARNINGS_TYPES,
  EARNINGS_STATUS,
  PAYOUT_STATUS
} from '../../constants/earnings/types';
import { formatDateTime, getRelativeTime } from '../../utils/date/dateUtils';

const EarningsCard = ({ 
  earning, 
  onView, 
  onDownload,
  onShare,
  showActions = true,
  compact = false
}) => {
  const getEarningsIcon = (type) => {
    const icons = {
      [EARNINGS_TYPES.BOOKING_REVENUE]: DollarSign,
      [EARNINGS_TYPES.COMMISSION]: CreditCard,
      [EARNINGS_TYPES.BONUS]: Banknote,
      [EARNINGS_TYPES.REFUND]: TrendingDown,
      [EARNINGS_TYPES.ADJUSTMENT]: TrendingUp,
      [EARNINGS_TYPES.PENALTY]: XCircle,
      [EARNINGS_TYPES.PROMOTION]: TrendingUp,
      [EARNINGS_TYPES.TAX]: AlertCircle
    };
    return icons[type] || DollarSign;
  };

  const getStatusIcon = (status) => {
    const icons = {
      [EARNINGS_STATUS.PENDING]: Clock,
      [EARNINGS_STATUS.PROCESSING]: Clock,
      [EARNINGS_STATUS.COMPLETED]: CheckCircle,
      [EARNINGS_STATUS.FAILED]: XCircle,
      [EARNINGS_STATUS.CANCELLED]: XCircle,
      [EARNINGS_STATUS.ON_HOLD]: AlertCircle
    };
    return icons[status] || Clock;
  };

  const getPayoutStatusIcon = (status) => {
    const icons = {
      [PAYOUT_STATUS.PENDING]: Clock,
      [PAYOUT_STATUS.PROCESSING]: Clock,
      [PAYOUT_STATUS.COMPLETED]: CheckCircle,
      [PAYOUT_STATUS.FAILED]: XCircle,
      [PAYOUT_STATUS.CANCELLED]: XCircle,
      [PAYOUT_STATUS.SCHEDULED]: Calendar
    };
    return icons[status] || Clock;
  };

  const isPositive = earning.amount >= 0;
  const isPayout = earning.type === 'payout';

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getEarningsTypeColor(earning.type)}`}>
            {React.createElement(getEarningsIcon(earning.type), { 
              className: "w-4 h-4" 
            })}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getEarningsLabel(earning.type)}
            </p>
            <p className="text-xs text-gray-500">
              {getRelativeTime(earning.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatCurrency(earning.amount)}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isPayout ? getPayoutStatusColor(earning.status) : getStatusColor(earning.status)
          }`}>
            {isPayout ? getPayoutStatusLabel(earning.status) : getStatusLabel(earning.status)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${getEarningsTypeColor(earning.type)}`}>
            {React.createElement(getEarningsIcon(earning.type), { 
              className: "w-6 h-6" 
            })}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {getEarningsLabel(earning.type)}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isPayout ? getPayoutStatusColor(earning.status) : getStatusColor(earning.status)
              }`}>
                {React.createElement(
                  isPayout ? getPayoutStatusIcon(earning.status) : getStatusIcon(earning.status), 
                  { className: "w-3 h-3 mr-1" }
                )}
                {isPayout ? getPayoutStatusLabel(earning.status) : getStatusLabel(earning.status)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-medium">Amount:</span>
                <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(earning.amount)}
                </span>
              </div>
              
              {earning.description && (
                <div className="flex items-center">
                  <span className="font-medium">Description:</span>
                  <span className="ml-2">{earning.description}</span>
                </div>
              )}
              
              {earning.bookingId && (
                <div className="flex items-center">
                  <span className="font-medium">Booking ID:</span>
                  <span className="ml-2 font-mono text-xs">{earning.bookingId}</span>
                </div>
              )}
              
              {earning.hotelId && (
                <div className="flex items-center">
                  <span className="font-medium">Hotel ID:</span>
                  <span className="ml-2 font-mono text-xs">{earning.hotelId}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <span className="font-medium">Date:</span>
                <span className="ml-2">{formatDateTime(earning.createdAt)}</span>
              </div>
              
              {earning.processedAt && (
                <div className="flex items-center">
                  <span className="font-medium">Processed:</span>
                  <span className="ml-2">{formatDateTime(earning.processedAt)}</span>
                </div>
              )}
              
              {earning.payoutMethod && (
                <div className="flex items-center">
                  <span className="font-medium">Payout Method:</span>
                  <span className="ml-2">{getPayoutMethodLabel(earning.payoutMethod)}</span>
                </div>
              )}
            </div>

            {/* Additional Details */}
            {(earning.commission || earning.fees || earning.taxes) && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Breakdown</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  {earning.commission && (
                    <div className="flex justify-between">
                      <span>Commission:</span>
                      <span>-{formatCurrency(earning.commission)}</span>
                    </div>
                  )}
                  {earning.fees && (
                    <div className="flex justify-between">
                      <span>Fees:</span>
                      <span>-{formatCurrency(earning.fees)}</span>
                    </div>
                  )}
                  {earning.taxes && (
                    <div className="flex justify-between">
                      <span>Taxes:</span>
                      <span>-{formatCurrency(earning.taxes)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-gray-900 pt-1 border-t">
                    <span>Net Amount:</span>
                    <span>{formatCurrency(earning.netAmount || earning.amount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {earning.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Error:</span> {earning.error}
                </p>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            {onView && (
              <button
                onClick={() => onView(earning)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            
            {onDownload && (
              <button
                onClick={() => onDownload(earning)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            
            {onShare && (
              <button
                onClick={() => onShare(earning)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Share"
              >
                <Share className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsCard;
