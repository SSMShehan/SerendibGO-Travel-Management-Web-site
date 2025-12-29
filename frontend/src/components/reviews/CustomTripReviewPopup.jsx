import React, { useState, useEffect } from 'react';
import { Star, X, Edit3, Trash2, User, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import customTripReviewService from '../../services/customTripReviewService';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../common/GlassCard';

const CustomTripReviewPopup = ({
  customTripId,
  customTripData,
  onClose,
  onSubmit,
  onEditReview,
  onDeleteReview
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditPopup, setShowEditPopup] = useState(false);

  // Form state for inline review form
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || ''
  });

  // Edit Form state
  const [editFormData, setEditFormData] = useState({
    rating: 0,
    comment: ''
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [canReview, setCanReview] = useState(true);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
    checkReviewEligibility();
  }, [customTripId, sortBy, currentPage]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }));
    }
  }, [user]);

  const checkReviewEligibility = async () => {
    try {
      const response = await customTripReviewService.canReviewCustomTrip(customTripId);
      if (response.success) {
        setCanReview(response.data.canReview);
        if (response.data.hasExistingReview) {
          setExistingReview(response.data.existingReview);
          setFormData(prev => ({
            ...prev,
            rating: response.data.existingReview.rating,
            comment: response.data.existingReview.comment
          }));
        }
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await customTripReviewService.getCustomTripReviews(customTripId, {
        page: currentPage,
        limit: 5,
        sortBy
      });

      if (response.success) {
        setReviews(response.data.reviews);
        setRatingStats(response.data.ratingStats);
        setRatingDistribution(response.data.ratingDistribution);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.rating || formData.rating === 0) newErrors.rating = 'Please select a rating';
    if (!formData.comment.trim()) newErrors.comment = 'Please write a review';
    else if (formData.comment.trim().length < 10) newErrors.comment = 'Review must be at least 10 characters long';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditFormData({
      rating: review.rating || 0,
      comment: review.comment || ''
    });
    setShowEditPopup(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await customTripReviewService.deleteReview(reviewId);
        toast.success('Review deleted successfully');
        fetchReviews();
        checkReviewEligibility();
        if (onDeleteReview) onDeleteReview(reviewId);
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
      }
    }
  };

  const handleInlineFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        customTripId,
        rating: formData.rating,
        comment: formData.comment.trim(),
        tripDetails: {
          destination: customTripData?.destination || customTripData?.location,
          duration: typeof customTripData?.duration === 'string' ?
            (customTripData.duration === 'multi-day' ? 7 : 1) :
            customTripData?.duration || 1,
          groupSize: customTripData?.groupSize || 1,
          startDate: customTripData?.startDate,
          endDate: customTripData?.endDate
        }
      };

      if (existingReview) {
        await customTripReviewService.updateReview(existingReview.id, {
          rating: formData.rating,
          comment: formData.comment.trim()
        });
        toast.success('Review updated successfully!');
      } else {
        await customTripReviewService.createReview(reviewData);
        toast.success('Review submitted successfully!');
      }

      fetchReviews();
      checkReviewEligibility();
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      setSubmitting(true);
      await customTripReviewService.updateReview(editingReview._id || editingReview.id, {
        rating: editFormData.rating,
        comment: editFormData.comment
      });
      toast.success('Review updated successfully!');
      setEditingReview(null);
      setShowEditPopup(false);
      fetchReviews();
      checkReviewEligibility();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null, hovered = 0, size = 'md') => {
    const sizeClass = size === 'lg' ? 'w-8 h-8' : size === 'xl' ? 'w-10 h-10' : 'w-4 h-4';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            className={`${sizeClass} ${interactive ? "cursor-pointer hover:scale-110 transition-transform duration-150" : "cursor-default"} focus:outline-none`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
            disabled={!interactive}
          >
            <Star
              className={`${sizeClass} ${star <= (hovered || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-surface-300'
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getEntityName = () => {
    return customTripData?.title || `Custom Trip to ${customTripData?.destination || 'Sri Lanka'}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-surface-200/50">
            <h2 className="text-2xl font-bold font-display text-surface-900">
              Review {getEntityName()}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Reviews and Statistics */}
              <div className="space-y-6">
                {/* Rating Distribution */}
                <div className="bg-surface-50/50 rounded-xl p-6 border border-surface-200/50">
                  <h3 className="font-semibold text-surface-900 mb-4">Rating Distribution</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 w-16">
                          <span className="text-sm font-medium text-surface-700">
                            {rating === 5 ? 'FIVE' : rating === 4 ? 'FOUR' : rating === 3 ? 'THREE' : rating === 2 ? 'TWO' : 'ONE'}
                          </span>
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-surface-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${ratingStats?.totalReviews > 0 ? (ratingDistribution[rating] / ratingStats.totalReviews) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-surface-600 w-12 text-right">
                          {ratingDistribution[rating] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Feedbacks */}
                <div>
                  <h3 className="font-bold text-surface-900 mb-4">Recent Feedbacks</h3>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-surface-600 mt-2">Loading reviews...</p>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 text-surface-500 bg-surface-50/50 rounded-xl border border-surface-200/50 border-dashed">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-surface-300" />
                        <p>No reviews yet. Be the first to review!</p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div key={review._id || review.id} className="bg-white/50 border border-surface-200/50 rounded-xl p-4 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                              {review.user?.avatar ? (
                                <img
                                  src={review.user.avatar}
                                  alt={review.user.firstName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-primary-600 font-bold text-sm">
                                  {review.user?.firstName?.charAt(0)}{review.user?.lastName?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-surface-900">
                                    {review.user?.firstName} {review.user?.lastName}
                                  </h4>
                                  {renderStars(review.rating, false, null, 0, 'sm')}
                                </div>
                                {(user && review.user && (review.user._id === user._id || review.user.id === user.id)) && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleEditReview(review)}
                                      className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors"
                                      title="Edit review"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReview(review._id || review.id)}
                                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                      title="Delete review"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-surface-600 text-sm">{review.comment}</p>
                              <p className="text-xs text-surface-400 mt-1">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Review Modal Overlay */}
              {showEditPopup && editingReview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
                  <GlassCard className="w-full max-w-md mx-4 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-surface-900">Edit Review</h3>
                      <button
                        onClick={() => {
                          setShowEditPopup(false);
                          setEditingReview(null);
                        }}
                        className="p-2 rounded-full hover:bg-surface-100 text-surface-400 hover:text-surface-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          Your Rating *
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditFormData(prev => ({ ...prev, rating: star }))}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 ${star <= editFormData.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-surface-300'
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-surface-700 mb-2">
                          Your Review *
                        </label>
                        <textarea
                          value={editFormData.comment}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, comment: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          rows={4}
                          placeholder="Share your experience..."
                          required
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditPopup(false);
                            setEditingReview(null);
                          }}
                          className="flex-1 px-4 py-2 text-surface-700 bg-surface-100 border border-surface-200 rounded-xl hover:bg-surface-200 font-bold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || editFormData.rating === 0 || !editFormData.comment.trim()}
                          className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-xl hover:bg-primary-700 font-bold shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Updating...' : 'Update Review'}
                        </button>
                      </div>
                    </form>
                  </GlassCard>
                </div>
              )}

              {/* Right Column - Overall Rating and Add Review Form */}
              <div className="space-y-6">
                {/* Overall Rating */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 text-center border border-yellow-200 shadow-sm">
                  <div className="text-5xl font-bold text-yellow-500 mb-3">
                    {ratingStats?.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="mb-3 flex justify-center">
                    {renderStars(Math.round(ratingStats?.averageRating || 0), false, null, 0, 'xl')}
                  </div>
                  <div className="text-surface-600 font-medium">
                    {ratingStats?.totalReviews || 0} Rating{(ratingStats?.totalReviews || 0) !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Add/Edit Review Form */}
                <div className="bg-surface-50/50 rounded-xl p-6 border border-surface-200/50">
                  <h3 className="font-bold text-surface-900 mb-4">
                    {existingReview ? 'Edit Your Review' : 'Add a Review'}
                  </h3>
                  <form onSubmit={handleInlineFormSubmit} className="space-y-4">
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-bold text-surface-700 mb-2">
                        {existingReview ? 'Update Your Rating' : 'Add Your Rating'} *
                      </label>
                      <div className="flex items-center space-x-1">
                        {renderStars(formData.rating, true, (rating) => {
                          setFormData(prev => ({ ...prev, rating }));
                          if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
                        }, hoveredRating, 'lg')}
                      </div>
                      {errors.rating && (
                        <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                      )}
                    </div>

                    {/* Name - Read Only */}
                    <div>
                      <label className="block text-sm font-bold text-surface-700 mb-2">
                        Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="text"
                          value={formData.name}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-surface-100 text-surface-600 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Email - Read Only */}
                    <div>
                      <label className="block text-sm font-bold text-surface-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="email"
                          value={formData.email}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-surface-100 text-surface-600 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-bold text-surface-700 mb-2">
                        {existingReview ? 'Update Your Review' : 'Write Your Review'} *
                      </label>
                      <textarea
                        value={formData.comment}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, comment: e.target.value }));
                          if (errors.comment) setErrors(prev => ({ ...prev, comment: '' }));
                        }}
                        placeholder={existingReview ? "Update your experience with this custom trip..." : "Share your experience with this custom trip..."}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${errors.comment ? 'border-red-300' : 'border-surface-200'
                          }`}
                        required
                      />
                      {errors.comment && (
                        <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                      )}
                      <p className="mt-1 text-xs text-surface-500">
                        {formData.comment.length}/500 characters (minimum 10)
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-primary-700 hover:scale-[1.02] transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {submitting
                        ? (existingReview ? 'Updating...' : 'Submitting...')
                        : (existingReview ? 'Update Review' : 'Submit Review')
                      }
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CustomTripReviewPopup;
