import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Filter, 
  Search, 
  SortAsc, 
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle
} from 'lucide-react';
import ReviewCard from '../../../components/hotels/reviews/ReviewCard';
import ReviewForm from '../../../components/hotels/reviews/ReviewForm';
import StarRating from '../../../components/hotels/reviews/StarRating';
import { 
  REVIEW_FILTERS, 
  REVIEW_FILTER_LABELS, 
  REVIEW_SORT_OPTIONS, 
  REVIEW_SORT_LABELS,
  formatRating,
  getRatingDescription,
  calculateOverallRating
} from '../../../constants/hotels/reviews';
import { hotelAPI } from '../../../services/hotels/hotelService';
import reviewService from '../../../services/hotels/reviewService';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const HotelReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filters, setFilters] = useState({
    filter: REVIEW_FILTERS.ALL,
    sort: REVIEW_SORT_OPTIONS.NEWEST,
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  useEffect(() => {
    fetchHotelDetails();
    fetchReviewStats();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [filters, pagination.current]);

  const fetchHotelDetails = async () => {
    try {
      const response = await hotelAPI.getHotel(id);
      setHotel(response.data.hotel);
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      toast.error('Failed to load hotel information');
      navigate('/hotels');
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await reviewService.getHotelReviewStats(id);
      setReviewStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        filter: filters.filter,
        sort: filters.sort,
        search: filters.search
      };
      
      const response = await reviewService.getHotelReviews(id, params);
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
    fetchReviewStats(); // Refresh stats
  };

  const handleReviewAction = (action, reviewId, data) => {
    // Update local state based on action
    setReviews(prev => prev.map(review => {
      if (review._id === reviewId) {
        switch (action) {
          case 'like':
            return {
              ...review,
              likes: (review.likes || 0) + 1,
              userLiked: true
            };
          case 'dislike':
            return {
              ...review,
              dislikes: (review.dislikes || 0) + 1,
              userDisliked: true
            };
          default:
            return review;
        }
      }
      return review;
    }));
  };

  const handleReply = (reviewId, reply) => {
    setReviews(prev => prev.map(review => {
      if (review._id === reviewId) {
        return { ...review, reply };
      }
      return review;
    }));
  };

  const getRatingDistribution = () => {
    if (!reviewStats) return [];
    
    const distribution = [];
    for (let i = 5; i >= 1; i--) {
      const count = reviewStats.ratingDistribution[i] || 0;
      const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
      distribution.push({ rating: i, count, percentage });
    }
    return distribution;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel not found</h2>
          <button
            onClick={() => navigate('/hotels')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Hotels
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
              <button
                onClick={() => navigate(`/hotels/${id}`)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Hotel
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Reviews & Ratings</h1>
                <p className="text-sm text-gray-600">{hotel.name}</p>
              </div>
            </div>
            
            {user && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Review
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-3">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filters.filter}
                    onChange={(e) => handleFilterChange('filter', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(REVIEW_FILTER_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(REVIEW_SORT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-6">
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    showActions={true}
                    onAction={handleReviewAction}
                    onReply={handleReply}
                    userRole={user?.role}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        page === pagination.current
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Overall Rating */}
              {reviewStats && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Overall Rating</h3>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatRating(reviewStats.averageRating)}
                    </div>
                    <StarRating rating={reviewStats.averageRating} size="lg" />
                    <p className="text-sm text-gray-600 mt-2">
                      {getRatingDescription(reviewStats.averageRating)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Rating Distribution */}
              {reviewStats && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
                  <div className="space-y-2">
                    {getRatingDistribution().map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 w-8">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Statistics */}
              {reviewStats && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Review Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="text-sm font-medium">{reviewStats.totalReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Verified Reviews</span>
                      <span className="text-sm font-medium">{reviewStats.verifiedReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reviews with Photos</span>
                      <span className="text-sm font-medium">{reviewStats.reviewsWithPhotos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="text-sm font-medium">{reviewStats.responseRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ReviewForm
                hotelId={id}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelReviews;
