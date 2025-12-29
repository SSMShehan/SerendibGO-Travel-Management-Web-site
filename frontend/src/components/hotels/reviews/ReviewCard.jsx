import React, { useState } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  MessageCircle, 
  MoreVertical,
  Calendar,
  User,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import StarRating from './StarRating';
import { 
  REVIEW_ACTIONS, 
  REVIEW_ACTION_ICONS, 
  REVIEW_ACTION_LABELS,
  getRatingDescription,
  formatRating
} from '../../../constants/hotels/reviews';
import reviewService from '../../../services/hotels/reviewService';
import toast from 'react-hot-toast';

const ReviewCard = ({ 
  review, 
  showHotelInfo = false, 
  showActions = true,
  onAction,
  onReply,
  userRole = 'tourist'
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const handleAction = async (action) => {
    if (actionLoading[action]) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [action]: true }));
      
      let response;
      switch (action) {
        case REVIEW_ACTIONS.LIKE:
        case REVIEW_ACTIONS.DISLIKE:
          response = await reviewService.rateReview(review._id, action);
          break;
        case REVIEW_ACTIONS.REPORT:
          response = await reviewService.reportReview(review._id, 'inappropriate');
          break;
        default:
          return;
      }
      
      if (response.success) {
        toast.success(`${REVIEW_ACTION_LABELS[action]} action completed`);
        if (onAction) {
          onAction(action, review._id, response.data);
        }
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${REVIEW_ACTION_LABELS[action].toLowerCase()}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      setSubmittingReply(true);
      const response = await reviewService.replyToReview(review._id, replyText);
      
      if (response.success) {
        toast.success('Reply posted successfully');
        setReplyText('');
        setShowReplyForm(false);
        if (onReply) {
          onReply(review._id, response.data);
        }
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Verified Stay' },
      flagged: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Flagged' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Pending' }
    };
    
    const config = statusConfig[status];
    if (!config) return null;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900">
                {review.user?.firstName} {review.user?.lastName}
              </h4>
              {review.verified && getStatusBadge('verified')}
              {review.status === 'flagged' && getStatusBadge('flagged')}
              {review.status === 'pending' && getStatusBadge('pending')}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(review.createdAt)}</span>
              {review.booking && (
                <>
                  <span>•</span>
                  <span>Stayed {formatDate(review.booking.checkIn)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Hotel Info (if applicable) */}
      {showHotelInfo && review.hotel && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900">{review.hotel.name}</h5>
          <p className="text-sm text-gray-600">{review.hotel.location.city}</p>
        </div>
      )}

      {/* Rating */}
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <StarRating rating={review.rating.overall} size="md" showValue />
          <span className="text-sm text-gray-600">
            {getRatingDescription(review.rating.overall)}
          </span>
        </div>
        
        {/* Detailed Ratings */}
        {review.rating && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(review.rating).map(([category, rating]) => (
              category !== 'overall' && (
                <div key={category} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{category}</span>
                  <div className="flex items-center space-x-1">
                    <StarRating rating={rating} size="sm" />
                    <span className="text-gray-500">{formatRating(rating)}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{review.content}</p>
      </div>

      {/* Review Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{review.photos.length} photo{review.photos.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {review.photos.slice(0, 6).map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`Review photo ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  // Open photo in modal or lightbox
                  console.log('Open photo:', photo.url);
                }}
              />
            ))}
            {review.photos.length > 6 && (
              <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-600">
                +{review.photos.length - 6} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleAction(REVIEW_ACTIONS.LIKE)}
              disabled={actionLoading[REVIEW_ACTIONS.LIKE]}
              className={`flex items-center space-x-1 text-sm ${
                review.userLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              } transition-colors`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{review.likes || 0}</span>
            </button>
            
            <button
              onClick={() => handleAction(REVIEW_ACTIONS.DISLIKE)}
              disabled={actionLoading[REVIEW_ACTIONS.DISLIKE]}
              className={`flex items-center space-x-1 text-sm ${
                review.userDisliked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              } transition-colors`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{review.dislikes || 0}</span>
            </button>
            
            <button
              onClick={() => handleAction(REVIEW_ACTIONS.REPORT)}
              disabled={actionLoading[REVIEW_ACTIONS.REPORT]}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
          
          {userRole === 'hotel_owner' && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          )}
        </div>
      )}

      {/* Hotel Owner Reply */}
      {review.reply && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-center space-x-2 mb-2">
            <h5 className="font-medium text-blue-900">Hotel Response</h5>
            <span className="text-xs text-blue-600">
              {formatDate(review.reply.createdAt)}
            </span>
          </div>
          <p className="text-blue-800">{review.reply.content}</p>
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Reply to Review</h5>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleReply}
              disabled={submittingReply || !replyText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submittingReply ? 'Posting...' : 'Post Reply'}
            </button>
            <button
              onClick={() => {
                setShowReplyForm(false);
                setReplyText('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
