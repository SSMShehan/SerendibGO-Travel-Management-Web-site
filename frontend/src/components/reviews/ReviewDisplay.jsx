import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MoreVertical, Flag, Edit, Trash2, Calendar, User } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';

const ReviewDisplay = ({ guideId, onReviewUpdate }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [guideId, currentPage, filterRating, sortBy, sortOrder]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: 5,
        rating: filterRating,
        sortBy,
        sortOrder
      };

      const response = await reviewService.getGuideReviews(guideId, params);
      
      if (response.success) {
        setReviews(response.data.reviews);
        setStatistics(response.data.statistics);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId, helpful) => {
    try {
      await reviewService.markReviewHelpful(reviewId, helpful);
      // Refresh reviews to show updated counts
      fetchReviews();
    } catch (err) {
      console.error('Error marking review helpful:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      setShowDropdown(null);
      fetchReviews();
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const toggleReviewExpansion = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const renderRatingDistribution = () => {
    if (!statistics?.ratingDistribution) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const distribution = statistics.ratingDistribution.find(d => d._id === rating);
          const count = distribution ? distribution.count : 0;
          const percentage = statistics.totalReviews > 0 ? (count / statistics.totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-600 w-2">{rating}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-lg">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Reviews</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReviews}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Section */}
      {statistics && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-200 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Review Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {statistics.averageRating}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(statistics.averageRating))}
              </div>
              <p className="text-slate-600 font-medium">
                Based on {statistics.totalReviews} review{statistics.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 className="text-lg font-semibold text-slate-700 mb-4">Rating Distribution</h4>
              {renderRatingDistribution()}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h3 className="text-2xl font-bold text-slate-900">
            Reviews ({statistics?.totalReviews || 0})
          </h3>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center">
            <div className="text-slate-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Reviews Yet</h3>
            <p className="text-slate-600">Be the first to review this guide!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {review.user.firstName[0]}{review.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {review.user.firstName} {review.user.lastName}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-slate-500 text-sm">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Actions */}
                <div className="flex items-center space-x-2">
                  {/* Helpful Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMarkHelpful(review._id, true)}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{review.helpful}</span>
                    </button>
                    <button
                      onClick={() => handleMarkHelpful(review._id, false)}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm">{review.notHelpful}</span>
                    </button>
                  </div>

                  {/* More Options */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === review._id ? null : review._id)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-slate-500" />
                    </button>

                    {showDropdown === review._id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
                        <div className="py-2">
                          {user && user._id === review.user._id && (
                            <>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <Edit className="h-4 w-4 mr-3" />
                                Edit Review
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review._id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete Review
                              </button>
                            </>
                          )}
                          <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Flag className="h-4 w-4 mr-3" />
                            Report Review
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-slate-700 leading-relaxed">
                  {review.comment.length > 200 && !expandedReviews.has(review._id)
                    ? `${review.comment.substring(0, 200)}...`
                    : review.comment
                  }
                </p>
                {review.comment.length > 200 && (
                  <button
                    onClick={() => toggleReviewExpansion(review._id)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2"
                  >
                    {expandedReviews.has(review._id) ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>

              {/* Tour Information */}
              {review.tour && (
                <div className="flex items-center text-sm text-slate-500 bg-slate-50 rounded-xl p-3">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Reviewed for: {review.tour.title}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-xl ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewDisplay;

