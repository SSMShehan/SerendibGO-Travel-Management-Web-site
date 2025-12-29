import React from 'react';
import { Calendar, User, Star, Info } from 'lucide-react';

const ReviewRequirements = ({ guideName }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-200 shadow-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="h-8 w-8 text-blue-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Want to Review {guideName}?</h3>
        
        <p className="text-blue-700 mb-6 font-medium">
          To write a review, you need to book and complete a tour with this guide first.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 rounded-2xl border border-blue-200">
            <Calendar className="h-6 w-6 text-blue-500" />
            <span className="text-blue-800 font-semibold">1. Book a tour with {guideName}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 rounded-2xl border border-blue-200">
            <User className="h-6 w-6 text-blue-500" />
            <span className="text-blue-800 font-semibold">2. Complete your tour experience</span>
          </div>
          
          <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 rounded-2xl border border-blue-200">
            <Star className="h-6 w-6 text-blue-500" />
            <span className="text-blue-800 font-semibold">3. Share your review and rating</span>
          </div>
        </div>
        
        <div className="bg-blue-100 rounded-2xl p-4 border border-blue-300">
          <p className="text-blue-800 font-medium text-sm">
            💡 <strong>Tip:</strong> Reviews help other travelers make informed decisions and help guides improve their services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewRequirements;

