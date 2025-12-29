import { Star, ThumbsUp, ThumbsDown, Flag, MessageCircle } from 'lucide-react';

export const RATING_CATEGORIES = {
  OVERALL: 'overall',
  CLEANLINESS: 'cleanliness',
  LOCATION: 'location',
  SERVICE: 'service',
  VALUE: 'value',
  AMENITIES: 'amenities'
};

export const RATING_LABELS = {
  [RATING_CATEGORIES.OVERALL]: 'Overall Rating',
  [RATING_CATEGORIES.CLEANLINESS]: 'Cleanliness',
  [RATING_CATEGORIES.LOCATION]: 'Location',
  [RATING_CATEGORIES.SERVICE]: 'Service',
  [RATING_CATEGORIES.VALUE]: 'Value for Money',
  [RATING_CATEGORIES.AMENITIES]: 'Amenities'
};

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged'
};

export const REVIEW_STATUS_COLORS = {
  [REVIEW_STATUS.PENDING]: 'yellow',
  [REVIEW_STATUS.APPROVED]: 'green',
  [REVIEW_STATUS.REJECTED]: 'red',
  [REVIEW_STATUS.FLAGGED]: 'orange'
};

export const REVIEW_STATUS_LABELS = {
  [REVIEW_STATUS.PENDING]: 'Pending Review',
  [REVIEW_STATUS.APPROVED]: 'Approved',
  [REVIEW_STATUS.REJECTED]: 'Rejected',
  [REVIEW_STATUS.FLAGGED]: 'Flagged for Review'
};

export const REVIEW_ACTIONS = {
  LIKE: 'like',
  DISLIKE: 'dislike',
  REPORT: 'report',
  REPLY: 'reply'
};

export const REVIEW_ACTION_ICONS = {
  [REVIEW_ACTIONS.LIKE]: ThumbsUp,
  [REVIEW_ACTIONS.DISLIKE]: ThumbsDown,
  [REVIEW_ACTIONS.REPORT]: Flag,
  [REVIEW_ACTIONS.REPLY]: MessageCircle
};

export const REVIEW_ACTION_LABELS = {
  [REVIEW_ACTIONS.LIKE]: 'Helpful',
  [REVIEW_ACTIONS.DISLIKE]: 'Not Helpful',
  [REVIEW_ACTIONS.REPORT]: 'Report',
  [REVIEW_ACTIONS.REPLY]: 'Reply'
};

export const REVIEW_FILTERS = {
  ALL: 'all',
  RECENT: 'recent',
  HIGHEST_RATED: 'highest_rated',
  LOWEST_RATED: 'lowest_rated',
  WITH_PHOTOS: 'with_photos',
  VERIFIED: 'verified'
};

export const REVIEW_FILTER_LABELS = {
  [REVIEW_FILTERS.ALL]: 'All Reviews',
  [REVIEW_FILTERS.RECENT]: 'Most Recent',
  [REVIEW_FILTERS.HIGHEST_RATED]: 'Highest Rated',
  [REVIEW_FILTERS.LOWEST_RATED]: 'Lowest Rated',
  [REVIEW_FILTERS.WITH_PHOTOS]: 'With Photos',
  [REVIEW_FILTERS.VERIFIED]: 'Verified Stays'
};

export const REVIEW_SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  HIGHEST_RATING: 'highest_rating',
  LOWEST_RATING: 'lowest_rating',
  MOST_HELPFUL: 'most_helpful'
};

export const REVIEW_SORT_LABELS = {
  [REVIEW_SORT_OPTIONS.NEWEST]: 'Newest First',
  [REVIEW_SORT_OPTIONS.OLDEST]: 'Oldest First',
  [REVIEW_SORT_OPTIONS.HIGHEST_RATING]: 'Highest Rating',
  [REVIEW_SORT_OPTIONS.LOWEST_RATING]: 'Lowest Rating',
  [REVIEW_SORT_OPTIONS.MOST_HELPFUL]: 'Most Helpful'
};

export const RATING_DESCRIPTIONS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

export const getRatingDescription = (rating) => {
  return RATING_DESCRIPTIONS[Math.round(rating)] || 'Not Rated';
};

export const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 2.5) return 'text-orange-600';
  return 'text-red-600';
};

export const getRatingBackgroundColor = (rating) => {
  if (rating >= 4.5) return 'bg-green-100';
  if (rating >= 3.5) return 'bg-yellow-100';
  if (rating >= 2.5) return 'bg-orange-100';
  return 'bg-red-100';
};

export const calculateOverallRating = (ratings) => {
  const categories = Object.values(RATING_CATEGORIES);
  const validRatings = categories.filter(category => ratings[category] > 0);
  
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((total, category) => total + ratings[category], 0);
  return sum / validRatings.length;
};

export const formatRating = (rating) => {
  return rating ? rating.toFixed(1) : '0.0';
};

export const getStarRating = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('full');
  }
  
  if (hasHalfStar) {
    stars.push('half');
  }
  
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push('empty');
  }
  
  return stars;
};
