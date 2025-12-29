import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotel } from '../../context/hotels/HotelContext';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Waves,
  Utensils,
  Dumbbell,
  Sparkles,
  X,
  Plus,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditHotel = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { currentHotel, hotelActions } = useHotel();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      district: '',
      postalCode: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    category: '',
    starRating: 3,
    amenities: [],
    policies: {
      checkIn: '14:00',
      checkOut: '11:00',
      cancellation: '',
      petPolicy: '',
      smokingPolicy: ''
    },
    images: [],
    status: 'draft'
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [newImageUrl, setNewImageUrl] = useState('');

  const amenityOptions = [
    { id: 'wifi', label: 'Free WiFi', icon: Wifi },
    { id: 'parking', label: 'Free Parking', icon: Car },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils },
    { id: 'pool', label: 'Swimming Pool', icon: Waves },
    { id: 'gym', label: 'Fitness Center', icon: Dumbbell },
    { id: 'spa', label: 'Spa & Wellness', icon: Sparkles },
    { id: 'ac', label: 'Air Conditioning', icon: Wind },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'coffee', label: 'Coffee/Tea Maker', icon: Coffee }
  ];

  const categoryOptions = [
    'Beach Hotel',
    'Hill Station Hotel',
    'City Hotel',
    'Resort',
    'Boutique Hotel',
    'Business Hotel',
    'Eco Hotel',
    'Heritage Hotel'
  ];

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        await hotelActions.getHotel(hotelId);
      } catch (error) {
        console.error('Error fetching hotel:', error);
        toast.error('Failed to fetch hotel details');
        navigate('/hotel-owner/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchHotel();
    }
  }, [hotelId]);

  useEffect(() => {
    if (currentHotel) {
      // Convert amenities object to array
      const amenitiesArray = currentHotel.amenities 
        ? Object.keys(currentHotel.amenities).filter(key => currentHotel.amenities[key] === true)
        : [];

      setFormData({
        name: currentHotel.name || '',
        description: currentHotel.description || '',
        location: {
          address: currentHotel.location?.address || '',
          city: currentHotel.location?.city || '',
          district: currentHotel.location?.district || '',
          postalCode: currentHotel.location?.postalCode || '',
          coordinates: {
            latitude: currentHotel.location?.coordinates?.latitude || '',
            longitude: currentHotel.location?.coordinates?.longitude || ''
          }
        },
        contact: {
          phone: currentHotel.contact?.phone || '',
          email: currentHotel.contact?.email || '',
          website: currentHotel.contact?.website || ''
        },
        category: currentHotel.category || '',
        starRating: currentHotel.starRating || 3,
        amenities: amenitiesArray,
        policies: {
          checkIn: currentHotel.policies?.checkIn || '14:00',
          checkOut: currentHotel.policies?.checkOut || '11:00',
          cancellation: currentHotel.policies?.cancellation || '',
          petPolicy: currentHotel.policies?.petPolicy || '',
          smokingPolicy: currentHotel.policies?.smokingPolicy || ''
        },
        images: currentHotel.images || [],
        status: currentHotel.status || 'draft'
      });
    }
  }, [currentHotel]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (field.includes('location.coordinates.')) {
      const coordField = field.split('.').pop();
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            [coordField]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: newImageUrl.trim(), isPrimary: prev.images.length === 0 }]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Hotel name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.location.address.trim()) errors['location.address'] = 'Address is required';
    if (!formData.location.city.trim()) errors['location.city'] = 'City is required';
    if (!formData.contact.phone.trim()) errors['contact.phone'] = 'Phone number is required';
    if (!formData.contact.email.trim()) errors['contact.email'] = 'Email is required';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.images.length === 0) errors.images = 'At least one image is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setSaving(true);
      
      // Convert amenities array back to object for backend
      const amenitiesObject = {};
      amenityOptions.forEach(amenity => {
        amenitiesObject[amenity.id] = formData.amenities.includes(amenity.id);
      });
      
      const updateData = {
        ...formData,
        amenities: amenitiesObject
      };
      
      await hotelActions.updateHotel(hotelId, updateData);
      toast.success('Hotel updated successfully');
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast.error('Failed to update hotel');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting for approval');
      return;
    }

    try {
      setSubmitting(true);
      
      // Convert amenities array back to object for backend
      const amenitiesObject = {};
      amenityOptions.forEach(amenity => {
        amenitiesObject[amenity.id] = formData.amenities.includes(amenity.id);
      });
      
      const submissionData = {
        ...formData,
        amenities: amenitiesObject,
        status: 'pending'
      };
      await hotelActions.updateHotel(hotelId, submissionData);
      toast.success('Hotel submitted for approval successfully');
      navigate('/hotel-owner/dashboard');
    } catch (error) {
      console.error('Error submitting hotel:', error);
      toast.error('Failed to submit hotel for approval');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      suspended: { color: 'bg-orange-100 text-orange-800', label: 'Suspended' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/hotel-owner/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Hotel</h1>
                <p className="text-gray-600 mt-1">
                  {currentHotel?.name} - {getStatusBadge(currentHotel?.status)}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/hotels/${hotelId}`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter hotel name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Star Rating
                </label>
                <select
                  value={formData.starRating}
                  onChange={(e) => handleInputChange('starRating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your hotel..."
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors['location.address'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full address"
                />
                {validationErrors['location.address'] && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors['location.address']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors['location.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {validationErrors['location.city'] && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors['location.city']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={formData.location.district}
                  onChange={(e) => handleInputChange('location.district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.location.postalCode}
                  onChange={(e) => handleInputChange('location.postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors['contact.phone'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {validationErrors['contact.phone'] && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors['contact.phone']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors['contact.email'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {validationErrors['contact.email'] && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors['contact.email']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.contact.website}
                  onChange={(e) => handleInputChange('contact.website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenityOptions.map(amenity => {
                const IconComponent = amenity.icon;
                return (
                  <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity.id)}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{amenity.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Policies */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={formData.policies.checkIn}
                  onChange={(e) => handleInputChange('policies.checkIn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={formData.policies.checkOut}
                  onChange={(e) => handleInputChange('policies.checkOut', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <textarea
                  value={formData.policies.cancellation}
                  onChange={(e) => handleInputChange('policies.cancellation', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your cancellation policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Policy
                </label>
                <textarea
                  value={formData.policies.petPolicy}
                  onChange={(e) => handleInputChange('policies.petPolicy', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your pet policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smoking Policy
                </label>
                <textarea
                  value={formData.policies.smokingPolicy}
                  onChange={(e) => handleInputChange('policies.smokingPolicy', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your smoking policy..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
            
            {/* Add Image */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image URL"
                />
                <button
                  onClick={addImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              {validationErrors.images && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.images}</p>
              )}
            </div>

            {/* Image Gallery */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Hotel ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        {!image.isPrimary && (
                          <button
                            onClick={() => setPrimaryImage(index)}
                            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit for Approval */}
          {formData.status === 'draft' && (
            <div className="border-t pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Ready to Submit for Approval?</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Make sure all information is complete and accurate. Once submitted, an administrator will review your hotel before it becomes available for bookings.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSubmitForApproval}
                disabled={submitting}
                className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
              </button>
            </div>
          )}

          {/* Status Messages */}
          {formData.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Pending Approval</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your hotel has been submitted for approval. An administrator will review it and notify you of the decision.
                  </p>
                </div>
              </div>
            </div>
          )}

          {formData.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Approved</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your hotel has been approved and is now available for bookings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {formData.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Rejected</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Your hotel submission was rejected. Please review the feedback and make necessary changes before resubmitting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditHotel;
