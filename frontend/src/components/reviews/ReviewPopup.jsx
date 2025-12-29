import React, { useState, useEffect } from 'react';
import { Star, X, User, Mail, MessageSquare, ThumbsUp, ThumbsDown, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const ReviewPopup = ({
  isOpen,
  onClose,
  onSubmit,
  onEditReview,
  onDeleteReview,
  title = "Add a Review",
  entityType = "service", // "guide", "vehicle", "trip", "hotel"
  entityName = "",
  existingReviews = [],
  reviewStats = null,
  userInfo = null
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    name: userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : '',
    email: userInfo?.email || '',
    review: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    rating: 0,
    comment: ''
  });

  // Calculate rating distribution
  const calculateRatingDistribution = () => {
    // Use reviewStats if available (from backend), otherwise calculate from existingReviews
    if (reviewStats) {
      return {
        distribution: reviewStats.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        totalReviews: reviewStats.totalReviews || 0,
        averageRating: reviewStats.averageRating || 0
      };
    }

    // Fallback to calculating from existingReviews
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalReviews = 0;
    let totalRating = 0;

    // Ensure existingReviews is an array
    const reviews = Array.isArray(existingReviews) ? existingReviews : [];

    reviews.forEach(review => {
      const reviewRating = Math.round(review.rating || review.rating?.overall || 0);
      if (reviewRating >= 1 && reviewRating <= 5) {
        distribution[reviewRating]++;
        totalReviews++;
        totalRating += reviewRating;
      }
    });

    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    return {
      distribution,
      totalReviews,
      averageRating: parseFloat(averageRating)
    };
  };

  // Get recent reviews for display
  const getRecentReviews = () => {
    // Use reviewStats recent reviews if available
    if (reviewStats && reviewStats.recentReviews) {
      return reviewStats.recentReviews;
    }

    // Fallback to existingReviews
    const reviews = Array.isArray(existingReviews) ? existingReviews : [];
    return reviews
      .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
      .slice(0, 5);
  };

  const recentReviews = getRecentReviews();
  const { distribution, totalReviews, averageRating } = calculateRatingDistribution();

  // Handle edit review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditFormData({
      rating: review.rating || review.rating?.overall || 0,
      comment: review.comment || review.content || ''
    });
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      // Call the parent component's delete handler
      if (onDeleteReview) {
        await onDeleteReview(reviewId);
        toast.success('Review deleted successfully!');
      }
    } catch (error) {
      console.error('ReviewPopup: Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editingReview) return;

    try {
      setSubmitting(true);

      if (onEditReview) {
        await onEditReview(editingReview._id, editFormData);
        toast.success('Review updated successfully!');
        setEditingReview(null);
        setEditFormData({ rating: 0, comment: '' });
      }
    } catch (error) {
      console.error('ReviewPopup: Error updating review:', error);
      toast.error('Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!formData.review.trim()) {
      toast.error('Please write your review');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        rating,
        name: formData.name,
        email: formData.email,
        review: formData.review
      });

      // Reset form
      setRating(0);
      setFormData({
        name: userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : '',
        email: userInfo?.email || '',
        review: ''
      });

      toast.success('Review submitted successfully!');
      onClose();
    } catch (error) {
      console.error('ReviewPopup: Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const renderStars = (rating, size = 'md', interactive = false) => {
    const sizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-8 h-8',
      xxl: 'w-10 h-10'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${sizes[size]} ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } transition-transform duration-150 focus:outline-none`}
            onClick={interactive ? () => handleStarClick(star) : undefined}
            onMouseEnter={interactive ? () => handleStarHover(star) : undefined}
            onMouseLeave={interactive ? handleStarLeave : undefined}
            disabled={!interactive}
          >
            <Star
              className={`${sizes[size]} ${star <= (interactive ? (hoveredRating || rating) : rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-surface-300'
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating) => {
    const labels = {
      5: 'FIVE',
      4: 'FOUR',
      3: 'THREE',
      2: 'TWO',
      1: 'ONE'
    };
    return labels[rating] || '';
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-surface-200/50">
            <h2 className="text-2xl font-bold font-display text-surface-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Reviews Display */}
              <div className="space-y-6">
                {/* Rating Distribution */}
                <div className="bg-surface-50/50 rounded-xl p-6 border border-surface-200/50">
                  <h3 className="font-semibold text-surface-900 mb-4">Rating Distribution</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((starRating) => (
                      <div key={starRating} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 w-16">
                          <span className="text-sm font-medium text-surface-700">
                            {getRatingLabel(starRating)}
                          </span>
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-surface-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: totalReviews > 0
                                ? `${(distribution[starRating] / totalReviews) * 100}%`
                                : '0%'
                            }}
                          />
                        </div>
                        <span className="text-sm text-surface-600 w-12 text-right">
                          {formatCount(distribution[starRating])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div>
                  <h3 className="font-bold text-surface-900 mb-4">Recent Feedbacks</h3>
                  <div className="space-y-4">
                    {recentReviews.length > 0 ? (
                      recentReviews.slice(0, 3).map((review, index) => {
                        const isOwnReview = userInfo && review.user &&
                          (review.user._id === userInfo._id || review.user._id === userInfo.id);

                        return (
                          <div key={review._id || index} className="bg-white/50 border border-surface-200/50 rounded-xl p-4 shadow-sm">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                                {review.user?.avatar ? (
                                  <img
                                    src={review.user.avatar}
                                    alt={`${review.user.firstName} ${review.user.lastName}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-primary-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-surface-900">
                                      {review.user?.firstName} {review.user?.lastName}
                                    </h4>
                                    {renderStars(review.rating || review.rating?.overall || 0, 'sm')}
                                  </div>
                                  {isOwnReview && (
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleEditReview(review)}
                                        className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors"
                                        title="Edit review"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReview(review._id)}
                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                        title="Delete review"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-surface-600 text-sm">
                                  {review.comment || review.content || 'Great experience!'}
                                </p>
                                <p className="text-xs text-surface-400 mt-1">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-surface-500 bg-surface-50/50 rounded-xl border border-surface-200/50 border-dashed">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-surface-300" />
                        <p>No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Review Modal Overlay */}
              {editingReview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
                  <GlassCard className="w-full max-w-md mx-4 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-surface-900">Edit Review</h3>
                      <button
                        onClick={() => {
                          setEditingReview(null);
                          setEditFormData({ rating: 0, comment: '' });
                        }}
                        className="p-2 rounded-full hover:bg-surface-100 text-surface-400 hover:text-surface-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      {/* Rating */}
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

                      {/* Comment */}
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

                      {/* Submit Buttons */}
                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReview(null);
                            setEditFormData({ rating: 0, comment: '' });
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

              {/* Right Side - Review Form */}
              <div className="space-y-6">
                {/* Overall Rating Summary */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 text-center border border-yellow-200 shadow-sm">
                  <div className="text-5xl font-bold text-yellow-500 mb-3">
                    {averageRating}
                  </div>
                  <div className="mb-3 flex justify-center">
                    {renderStars(Math.round(averageRating), 'xxl')}
                  </div>
                  <div className="text-surface-600 font-medium">
                    {totalReviews} Rating{totalReviews !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Review Form */}
                <div className="bg-surface-50/50 rounded-xl p-6 border border-surface-200/50">
                  <h3 className="font-bold text-surface-900 mb-4">Add a Review</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating Input */}
                    <div>
                      <label className="block text-sm font-bold text-surface-700 mb-2">
                        Add Your Rating *
                      </label>
                      <div className="flex items-center space-x-1">
                        {renderStars(rating, 'lg', true)}
                        {rating > 0 && (
                          <span className="ml-2 text-sm font-medium text-surface-600">
                            {rating} star{rating !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-bold text-surface-700 mb-2">
                        Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-bold text-surface-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="JohnDoe@gmail.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-sm font-bold text-surface-700 mb-2">
                        Write Your Review *
                      </label>
                      <textarea
                        value={formData.review}
                        onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                        placeholder="Write here..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-primary-700 hover:scale-[1.02] transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
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

export default ReviewPopup;
