import React, { useState } from 'react';
import { Star, Send, X, AlertCircle, CheckCircle } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../common/GlassCard';

const ReviewForm = ({ guideId, tourId, bookingId, onReviewSubmitted, onCancel }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
    setError('');
  };

  const handleRatingHover = (hoveredRating) => {
    setHoveredRating(hoveredRating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reviewData = {
        tourId,
        guideId,
        bookingId,
        rating,
        comment: comment.trim()
      };

      await reviewService.createReview(reviewData);

      setSuccess('Review submitted successfully!');
      setTimeout(() => {
        onReviewSubmitted();
      }, 1500);

    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => handleRatingHover(i)}
          onMouseLeave={handleRatingLeave}
          className={`p-1 transition-all duration-200 focus:outline-none transform ${i <= displayRating
            ? 'scale-110'
            : 'hover:scale-110'
            }`}
        >
          <Star
            className={`h-8 w-8 ${i <= displayRating
              ? 'text-yellow-400 fill-current'
              : 'text-surface-300'
              }`}
          />
        </button>
      );
    }

    return stars;
  };

  const getRatingText = (rating) => {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[rating] || '';
  };

  if (success) {
    return (
      <GlassCard className="p-8 text-center bg-green-50/50 border-green-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold font-display text-green-800 mb-2">Review Submitted!</h3>
        <p className="text-green-600">{success}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-2xl font-bold font-display text-surface-900">Write a Review</h3>
          <p className="text-surface-600 text-sm">Share your experience with this service</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-500 hover:text-surface-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Rating & Guidelines */}
          <div className="space-y-6">
            {/* Rating Section */}
            <div className="bg-surface-50/50 p-6 rounded-2xl border border-surface-200/50">
              <label className="block text-sm font-bold text-surface-700 mb-3">
                Rate your experience *
              </label>
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <div className="flex items-center space-x-2">
                  {renderStars()}
                </div>
                <div className="h-6">
                  {(hoveredRating > 0 || rating > 0) && (
                    <span className="text-lg font-bold text-primary-600 animate-fadeIn">
                      {getRatingText(hoveredRating || rating)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500 text-center">
                  Click on a star to rate from 1 (Poor) to 5 (Excellent)
                </p>
              </div>
            </div>

            {/* Review Guidelines - Compact Version */}
            <div className="p-5 bg-primary-50/50 border border-primary-100 rounded-2xl hidden lg:block">
              <h4 className="font-bold text-primary-800 mb-2 flex items-center text-sm">
                <div className="w-1 h-4 bg-primary-500 rounded-full mr-2"></div>
                Review Guidelines
              </h4>
              <ul className="text-xs text-primary-700 space-y-1.5 ml-3">
                <li className="flex items-start"><span className="mr-2">•</span> Be honest and constructive</li>
                <li className="flex items-start"><span className="mr-2">•</span> Focus on your actual experience</li>
                <li className="flex items-start"><span className="mr-2">•</span> Avoid inappropriate language</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Comment & Actions */}
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-bold text-surface-700 mb-3">
                Write your review *
              </label>
              <div className="flex-1 relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others about your experience. What did you like? What could be improved?"
                  className="w-full h-full min-h-[200px] px-4 py-4 border border-surface-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 font-medium resize-none shadow-inner text-surface-700 leading-relaxed"
                  maxLength="1000"
                />
                <div className="absolute bottom-3 right-3 text-xs font-bold text-surface-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm border border-surface-100">
                  {comment.length}/1000
                </div>
              </div>
              <p className="text-xs text-surface-400 mt-2 ml-1">
                Minimum 10 characters required
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-red-700 font-bold text-sm">{error}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-3 mt-6 pt-4 border-t border-surface-100">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-surface-300 text-surface-700 rounded-xl hover:bg-surface-50 hover:border-surface-400 transition-all duration-300 font-bold text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !rating || !comment.trim() || comment.trim().length < 10}
                className="flex-[2] px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </GlassCard>
  );
};

export default ReviewForm;
