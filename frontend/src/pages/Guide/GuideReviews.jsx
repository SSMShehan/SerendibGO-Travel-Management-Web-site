import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const GuideReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/guides/reviews/${user.id}`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const replyToReview = async (reviewId, reply) => {
    try {
      await api.post(`/guides/reviews/${reviewId}/reply`, { reply });
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error replying to review:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reviews & Ratings</h1>

      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-gray-600">Average Rating</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.totalReviews}
            </div>
            <p className="text-gray-600">Total Reviews</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.ratingDistribution[5] + stats.ratingDistribution[4]}
            </div>
            <p className="text-gray-600">Positive Reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating];
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center mb-2">
                <span className="w-8 text-sm text-gray-600">{rating}</span>
                <div className="flex mx-2">
                  {renderStars(1)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-12 text-sm text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Reviews</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {reviews.map((review, index) => (
            <div key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <img
                      src={review.userAvatar || '/default-avatar.png'}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {review.tourName && (
                    <p className="text-sm text-blue-600 mb-3">
                      Tour: {review.tourName}
                    </p>
                  )}

                  {/* Reply Section */}
                  {review.reply ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <img
                          src={user.avatar || '/default-avatar.png'}
                          alt="Your reply"
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span className="font-semibold text-gray-900">Your Reply</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatDate(review.replyDate)}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.reply}</p>
                    </div>
                  ) : (
                    <ReplyForm reviewId={review.id} onReply={replyToReview} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">Complete tours to start receiving reviews from travelers.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Reply Form Component
const ReplyForm = ({ reviewId, onReply }) => {
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(reviewId, reply);
      setReply('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex space-x-2">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to this review..."
          rows={2}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <button
          type="submit"
          disabled={!reply.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Sending...' : 'Reply'}
        </button>
      </div>
    </form>
  );
};

export default GuideReviews;
