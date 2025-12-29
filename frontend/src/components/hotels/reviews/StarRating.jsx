import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange,
  showValue = false,
  showDescription = false,
  className = ''
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const getRatingDescription = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Very Good';
    if (rating >= 2.5) return 'Good';
    if (rating >= 1.5) return 'Fair';
    return 'Poor';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (index) => {
    const starRating = index + 1;
    const isFilled = starRating <= rating;
    const isHalfFilled = starRating - 0.5 <= rating && starRating > rating;
    
    return (
      <button
        key={index}
        type="button"
        onClick={() => handleStarClick(starRating)}
        disabled={!interactive}
        className={`${sizes[size]} ${
          interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
        } transition-transform duration-150`}
      >
        <Star
          className={`${sizes[size]} ${
            isFilled
              ? 'text-yellow-400 fill-current'
              : isHalfFilled
              ? 'text-yellow-400 fill-current opacity-50'
              : 'text-gray-300'
          }`}
        />
      </button>
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
      
      {showValue && (
        <span className={`text-sm font-medium ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </span>
      )}
      
      {showDescription && (
        <span className="text-sm text-gray-600 ml-2">
          {getRatingDescription(rating)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
