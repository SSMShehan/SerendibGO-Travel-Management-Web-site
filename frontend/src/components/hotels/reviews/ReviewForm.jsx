import React, { useState } from 'react';
import { 
  Star, 
  Camera, 
  X, 
  AlertCircle, 
  CheckCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import StarRating from './StarRating';
import { RATING_CATEGORIES, RATING_LABELS } from '../../../constants/hotels/reviews';
import reviewService from '../../../services/hotels/reviewService';
import toast from 'react-hot-toast';

const ReviewForm = ({ 
  hotelId, 
  bookingId, 
  onReviewSubmitted, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    rating: {
      overall: 0,
      cleanliness: 0,
      location: 0,
      service: 0,
      value: 0,
      amenities: 0
    },
    content: '',
    photos: [],
    tags: []
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      rating: {
        ...prev.rating,
        [category]: rating
      }
    }));
    
    // Auto-calculate overall rating
    if (category !== 'overall') {
      const categories = Object.values(RATING_CATEGORIES).filter(cat => cat !== 'overall');
      const validRatings = categories.filter(cat => 
        cat === category ? rating > 0 : prev.rating[cat] > 0
      );
      
      if (validRatings.length > 0) {
        const sum = validRatings.reduce((total, cat) => 
          total + (cat === category ? rating : prev.rating[cat]), 0
        );
        const overallRating = sum / validRatings.length;
        
        setFormData(prev => ({
          ...prev,
          rating: {
            ...prev.rating,
            overall: Math.round(overallRating * 2) / 2 // Round to nearest 0.5
          }
        }));
      }
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Photo size must be less than 5MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select image files only');
        return false;
      }
      return true;
    });

    if (validFiles.length + photoFiles.length > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }

    setPhotoFiles(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, {
          file,
          url: e.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.rating.overall === 0) {
      newErrors.overall = 'Please provide an overall rating';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Please write a review';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setSubmitting(true);

      // Create review
      const reviewData = {
        hotel: hotelId,
        booking: bookingId,
        rating: formData.rating,
        content: formData.content.trim(),
        tags: formData.tags
      };

      const response = await reviewService.createReview(reviewData);
      
      if (response.success) {
        // Upload photos if any
        if (photoFiles.length > 0) {
          try {
            await reviewService.uploadReviewPhotos(response.data.review._id, photoFiles);
          } catch (photoError) {
            console.error('Error uploading photos:', photoError);
            toast.error('Review created but photos failed to upload');
          }
        }
        
        toast.success('Review submitted successfully!');
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.review);
        }
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingDescription = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Very Good';
    if (rating >= 2.5) return 'Good';
    if (rating >= 1.5) return 'Fair';
    if (rating >= 0.5) return 'Poor';
    return 'Select Rating';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-3">
            <StarRating
              rating={formData.rating.overall}
              interactive
              onRatingChange={(rating) => handleRatingChange('overall', rating)}
              size="lg"
              showValue
            />
            <span className="text-sm text-gray-600">
              {getRatingDescription(formData.rating.overall)}
            </span>
          </div>
          {errors.overall && (
            <p className="text-red-500 text-sm mt-1">{errors.overall}</p>
          )}
        </div>

        {/* Detailed Ratings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Detailed Ratings
          </label>
          <div className="space-y-3">
            {Object.entries(RATING_CATEGORIES).map(([key, category]) => (
              category !== 'overall' && (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 w-24">
                    {RATING_LABELS[category]}
                  </span>
                  <StarRating
                    rating={formData.rating[category]}
                    interactive
                    onRatingChange={(rating) => handleRatingChange(category, rating)}
                    size="md"
                  />
                </div>
              )
            ))}
          </div>
        </div>

        {/* Review Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Share your experience with other travelers..."
            rows="6"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {formData.content.length}/500 characters
            </p>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload photos or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG up to 5MB each (max 10 photos)
              </span>
            </label>
          </div>
          
          {/* Photo Previews */}
          {photoPreviews.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-4 gap-2">
                {photoPreviews.map((preview, index) => (
                  <div key={preview.id} className="relative">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {['Clean', 'Comfortable', 'Great Location', 'Friendly Staff', 'Good Value', 'Noisy', 'Poor Service'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    tags: prev.tags.includes(tag)
                      ? prev.tags.filter(t => t !== tag)
                      : [...prev.tags, tag]
                  }));
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.tags.includes(tag)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
