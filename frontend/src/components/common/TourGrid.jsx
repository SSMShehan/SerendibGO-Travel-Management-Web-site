import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  Search,
  Filter,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useChatbot } from '../../context/ChatbotContext';
import Badge from './Badge';
import PriceDisplay from './PriceDisplay';

const TourGrid = ({ 
  tours = [], 
  columns = 3, 
  showBadges = true,
  className = '',
  onTourClick = null,
  ...props 
}) => {
  const { openChatbot } = useChatbot();
  
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  };
  
  const handleTourClick = (tour) => {
    if (onTourClick) {
      onTourClick(tour);
    } else {
      // Default behavior - navigate to tour details
      window.location.href = `/tours/${tour._id || tour.id}`;
    }
  };
  
  const handleAISearch = () => {
    openChatbot({ 
      user: null,
      initialMessage: "Help me find the perfect tour for my Sri Lankan adventure!"
    });
  };
  
  if (!tours || tours.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your search criteria or explore our AI assistant</p>
        <button
          onClick={handleAISearch}
          className="btn btn-primary"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Ask AI Assistant
        </button>
      </div>
    );
  }
  
  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`} {...props}>
      {tours.map((tour) => (
        <div
          key={tour._id || tour.id}
          className="tour-card group cursor-pointer"
          onClick={() => handleTourClick(tour)}
        >
          {/* Tour Image */}
          <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
            {tour.image ? (
              <img
                src={tour.image}
                alt={tour.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-white/50" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Badges */}
            {showBadges && (
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {tour.isBestSeller && (
                  <Badge variant="best-seller">Best Seller</Badge>
                )}
                {tour.isHotTrip && (
                  <Badge variant="hot-trip">Hot Trip</Badge>
                )}
                {tour.isFeatured && (
                  <Badge variant="featured">Featured</Badge>
                )}
                {tour.isNew && (
                  <Badge variant="new">New</Badge>
                )}
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAISearch();
                }}
                className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                title="Ask AI about this tour"
              >
                <MessageCircle className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Tour Content */}
          <div className="p-6">
            {/* Title and Location */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {tour.title}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="line-clamp-1">
                  {typeof tour.location === 'object' && tour.location?.name 
                    ? tour.location.name 
                    : typeof tour.destination === 'object' && tour.destination?.name
                    ? tour.destination.name
                    : tour.location || tour.destination || 'Sri Lanka'}
                </span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {tour.description || tour.shortDescription || 'Discover the beauty of Sri Lanka with this amazing tour experience.'}
            </p>
            
            {/* Tour Details */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{tour.duration || tour.durationDays ? `${tour.durationDays} Day${tour.durationDays > 1 ? 's' : ''}` : '1 Day'}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>Max {tour.maxGroupSize || tour.groupSize || tour.maxParticipants || 12}</span>
              </div>
            </div>
            
            {/* Rating and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  {tour.averageRating || tour.rating?.average || tour.rating || 4.9}
                </span>
                <span className="text-sm text-gray-500">
                  ({tour.reviewCount || tour.reviews?.length || tour.totalReviews || 128} reviews)
                </span>
              </div>
              
              <PriceDisplay
                originalPrice={tour.originalPrice || tour.priceBeforeDiscount}
                discountedPrice={tour.price || tour.discountedPrice || tour.currentPrice}
                currency={tour.currency || 'LKR'}
                size="md"
              />
            </div>
            
            {/* Action Button */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  From {tour.startDate ? new Date(tour.startDate).toLocaleDateString() : 'Any time'}
                </span>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TourGrid;
