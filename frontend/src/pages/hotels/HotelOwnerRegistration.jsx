import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/hotels/HotelContext';
import { hotelUtils } from '../../services/hotels/hotelService';
import { Plus, ExternalLink, Star, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

const HotelOwnerRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hotelActions } = useHotel();
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    shortDescription: '',
    
    // Location Information
    location: {
      address: '',
      city: '',
      district: '',
      coordinates: {
        latitude: '',
        longitude: ''
      },
      area: ''
    },
    
    // Contact Information
    contact: {
      phone: '',
      email: user?.email || '',
      website: '',
      emergencyContact: ''
    },
    
    // Hotel Category
    category: '',
    starRating: 3,
    
    // Amenities
    amenities: {
      wifi: false,
      airConditioning: false,
      hotWater: false,
      parking: false,
      restaurant: false,
      bar: false,
      pool: false,
      gym: false,
      spa: false,
      airportPickup: false,
      tourBooking: false,
      currencyExchange: false,
      laundryService: false,
      englishSpeakingStaff: false,
      localTransportation: false,
      safetyDepositBox: false,
      internationalAdapters: false,
      ayurveda: false,
      culturalShows: false,
      localCuisine: false,
      heritageExperience: false,
      wildlifeSafari: false,
      plantationTour: false
    },
    
    // Policies
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellationPolicy: '24 hours',
      petPolicy: 'Pets not allowed',
      childPolicy: 'Children welcome',
      smokingPolicy: 'Non-smoking'
    },
    
    // Images
    images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [newImageUrl, setNewImageUrl] = useState('');
  const totalSteps = 4;
  
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          errors.name = 'Hotel name must be at least 2 characters';
        } else if (value.length > 100) {
          errors.name = 'Hotel name cannot exceed 100 characters';
        } else {
          delete errors.name;
        }
        break;
        
      case 'description':
        if (!value || value.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters';
        } else if (value.length > 2000) {
          errors.description = 'Description cannot exceed 2000 characters';
        } else {
          delete errors.description;
        }
        break;
        
      case 'shortDescription':
        if (value && value.length > 300) {
          errors.shortDescription = 'Short description cannot exceed 300 characters';
        } else {
          delete errors.shortDescription;
        }
        break;
        
      case 'category':
        if (!value) {
          errors.category = 'Hotel category is required';
        } else {
          delete errors.category;
        }
        break;
        
      case 'location.address':
        if (!value || value.trim().length < 5) {
          errors['location.address'] = 'Address must be at least 5 characters';
        } else {
          delete errors['location.address'];
        }
        break;
        
      case 'location.city':
        if (!value) {
          errors['location.city'] = 'City is required';
        } else {
          delete errors['location.city'];
        }
        break;
        
      case 'location.district':
        if (!value) {
          errors['location.district'] = 'District is required';
        } else {
          delete errors['location.district'];
        }
        break;
        
      case 'location.coordinates.latitude':
        const lat = parseFloat(value);
        if (!value || isNaN(lat) || lat < 5.9 || lat > 9.8) {
          errors['location.coordinates.latitude'] = 'Invalid latitude for Sri Lanka (5.9 - 9.8)';
        } else {
          delete errors['location.coordinates.latitude'];
        }
        break;
        
      case 'location.coordinates.longitude':
        const lng = parseFloat(value);
        if (!value || isNaN(lng) || lng < 79.7 || lng > 81.9) {
          errors['location.coordinates.longitude'] = 'Invalid longitude for Sri Lanka (79.7 - 81.9)';
        } else {
          delete errors['location.coordinates.longitude'];
        }
        break;
        
      case 'contact.phone':
        if (!value || value.trim().length < 10) {
          errors['contact.phone'] = 'Phone number must be at least 10 characters';
        } else if (!/^[0-9+\-\s()]+$/.test(value)) {
          errors['contact.phone'] = 'Please enter a valid phone number';
        } else {
          delete errors['contact.phone'];
        }
        break;
        
      case 'contact.email':
        if (!value) {
          errors['contact.email'] = 'Email is required';
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
          errors['contact.email'] = 'Please enter a valid email address';
        } else {
          delete errors['contact.email'];
        }
        break;
        
      case 'contact.website':
        if (value && !/^https?:\/\/.+/.test(value)) {
          errors['contact.website'] = 'Website must start with http:// or https://';
        } else {
          delete errors['contact.website'];
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validate the field
    validateField(name, value);
    
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      
      if (grandchild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newImageUrl.trim()) {
      // Validate URL
      try {
        new URL(newImageUrl);
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), { url: newImageUrl.trim(), isPrimary: (prev.images || []).length === 0 }]
        }));
        setNewImageUrl('');
        toast.success('Image added successfully!');
      } catch (error) {
        toast.error('Please enter a valid URL');
      }
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).map((image, i) => ({
        ...image,
        isPrimary: i === index
      }))
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate all steps before submission
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setError('Please fix all validation errors before submitting');
      setLoading(false);
      return;
    }
    
    try {
      // Convert coordinates to numbers
      const hotelData = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            latitude: parseFloat(formData.location.coordinates.latitude),
            longitude: parseFloat(formData.location.coordinates.longitude)
          }
        }
      };
      
      console.log('Submitting hotel data:', hotelData);
      await hotelActions.createHotel(hotelData);
      navigate('/hotel-owner/dashboard');
    } catch (err) {
      console.error('Hotel creation error:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to create hotel';
      const validationErrors = err.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        const errorDetails = validationErrors.map(error => `${error.field}: ${error.message}`).join(', ');
        setError(`${errorMessage}. ${errorDetails}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.name || formData.name.trim().length < 2) {
          errors.name = 'Hotel name is required (min 2 characters)';
        }
        if (!formData.description || formData.description.trim().length < 10) {
          errors.description = 'Description is required (min 10 characters)';
        }
        if (!formData.category) {
          errors.category = 'Hotel category is required';
        }
        break;
        
      case 2:
        if (!formData.location.address || formData.location.address.trim().length < 5) {
          errors['location.address'] = 'Address is required (min 5 characters)';
        }
        if (!formData.location.city) {
          errors['location.city'] = 'City is required';
        }
        if (!formData.location.district) {
          errors['location.district'] = 'District is required';
        }
        if (!formData.location.coordinates.latitude || 
            isNaN(parseFloat(formData.location.coordinates.latitude)) ||
            parseFloat(formData.location.coordinates.latitude) < 5.9 ||
            parseFloat(formData.location.coordinates.latitude) > 9.8) {
          errors['location.coordinates.latitude'] = 'Valid latitude is required (5.9 - 9.8)';
        }
        if (!formData.location.coordinates.longitude || 
            isNaN(parseFloat(formData.location.coordinates.longitude)) ||
            parseFloat(formData.location.coordinates.longitude) < 79.7 ||
            parseFloat(formData.location.coordinates.longitude) > 81.9) {
          errors['location.coordinates.longitude'] = 'Valid longitude is required (79.7 - 81.9)';
        }
        break;
        
      case 3:
        if (!formData.contact.phone || formData.contact.phone.trim().length < 10) {
          errors['contact.phone'] = 'Phone number is required (min 10 characters)';
        }
        if (!formData.contact.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.contact.email)) {
          errors['contact.email'] = 'Valid email is required';
        }
        break;
        
      case 4:
        // Step 4 (amenities and policies) doesn't have required fields
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h3>
        <p className="text-gray-600">Tell us about your hotel</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hotel Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
            validationErrors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.name && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description
        </label>
        <input
          type="text"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
            validationErrors.shortDescription ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Brief description for listings"
        />
        {validationErrors.shortDescription && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.shortDescription}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
            validationErrors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.description && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hotel Category *
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
            validationErrors.category ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Select Category</option>
          <option value="Beach Resort">Beach Resort</option>
          <option value="Hill Station Hotel">Hill Station Hotel</option>
          <option value="Heritage Hotel">Heritage Hotel</option>
          <option value="Wildlife Lodge">Wildlife Lodge</option>
          <option value="Ayurveda Retreat">Ayurveda Retreat</option>
          <option value="Boutique Hotel">Boutique Hotel</option>
          <option value="Budget Hostel">Budget Hostel</option>
          <option value="Luxury Hotel">Luxury Hotel</option>
          <option value="Guest House">Guest House</option>
          <option value="Villa">Villa</option>
          <option value="Eco Lodge">Eco Lodge</option>
          <option value="Plantation Bungalow">Plantation Bungalow</option>
        </select>
        {validationErrors.category && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Star Rating
        </label>
        <select
          name="starRating"
          value={formData.starRating}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        >
          <option value={1}>1 Star</option>
          <option value={2}>2 Stars</option>
          <option value={3}>3 Stars</option>
          <option value={4}>4 Stars</option>
          <option value={5}>5 Stars</option>
        </select>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Information</h3>
        <p className="text-gray-600">Where is your hotel located?</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <input
          type="text"
          name="location.address"
          value={formData.location.address}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
            validationErrors['location.address'] ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors['location.address'] && (
          <p className="text-red-500 text-sm mt-1">{validationErrors['location.address']}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <select
            name="location.city"
            value={formData.location.city}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
              validationErrors['location.city'] ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select City</option>
            <option value="Colombo">Colombo</option>
            <option value="Kandy">Kandy</option>
            <option value="Galle">Galle</option>
            <option value="Negombo">Negombo</option>
            <option value="Bentota">Bentota</option>
            <option value="Hikkaduwa">Hikkaduwa</option>
            <option value="Unawatuna">Unawatuna</option>
            <option value="Mirissa">Mirissa</option>
            <option value="Weligama">Weligama</option>
            <option value="Tangalle">Tangalle</option>
            <option value="Arugam Bay">Arugam Bay</option>
            <option value="Nuwara Eliya">Nuwara Eliya</option>
            <option value="Ella">Ella</option>
            <option value="Bandarawela">Bandarawela</option>
            <option value="Haputale">Haputale</option>
            <option value="Sigiriya">Sigiriya</option>
            <option value="Dambulla">Dambulla</option>
            <option value="Anuradhapura">Anuradhapura</option>
            <option value="Polonnaruwa">Polonnaruwa</option>
            <option value="Trincomalee">Trincomalee</option>
            <option value="Batticaloa">Batticaloa</option>
            <option value="Jaffna">Jaffna</option>
            <option value="Kalpitiya">Kalpitiya</option>
            <option value="Chilaw">Chilaw</option>
            <option value="Puttalam">Puttalam</option>
          </select>
          {validationErrors['location.city'] && (
            <p className="text-red-500 text-sm mt-1">{validationErrors['location.city']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District *
          </label>
          <select
            name="location.district"
            value={formData.location.district}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
              validationErrors['location.district'] ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select District</option>
            <option value="Colombo">Colombo</option>
            <option value="Gampaha">Gampaha</option>
            <option value="Kalutara">Kalutara</option>
            <option value="Kandy">Kandy</option>
            <option value="Matale">Matale</option>
            <option value="Nuwara Eliya">Nuwara Eliya</option>
            <option value="Galle">Galle</option>
            <option value="Matara">Matara</option>
            <option value="Hambantota">Hambantota</option>
            <option value="Jaffna">Jaffna</option>
            <option value="Kilinochchi">Kilinochchi</option>
            <option value="Mannar">Mannar</option>
            <option value="Vavuniya">Vavuniya</option>
            <option value="Mullaitivu">Mullaitivu</option>
            <option value="Batticaloa">Batticaloa</option>
            <option value="Ampara">Ampara</option>
            <option value="Trincomalee">Trincomalee</option>
            <option value="Kurunegala">Kurunegala</option>
            <option value="Puttalam">Puttalam</option>
            <option value="Anuradhapura">Anuradhapura</option>
            <option value="Polonnaruwa">Polonnaruwa</option>
            <option value="Badulla">Badulla</option>
            <option value="Monaragala">Monaragala</option>
            <option value="Ratnapura">Ratnapura</option>
            <option value="Kegalle">Kegalle</option>
          </select>
          {validationErrors['location.district'] && (
            <p className="text-red-500 text-sm mt-1">{validationErrors['location.district']}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Area Type
        </label>
        <select
          name="location.area"
          value={formData.location.area}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        >
          <option value="">Select Area Type</option>
          <option value="Beach">Beach</option>
          <option value="Hill Country">Hill Country</option>
          <option value="Cultural Triangle">Cultural Triangle</option>
          <option value="Wildlife">Wildlife</option>
          <option value="City Center">City Center</option>
          <option value="Suburbs">Suburbs</option>
          <option value="Heritage Site">Heritage Site</option>
          <option value="National Park">National Park</option>
          <option value="Plantation">Plantation</option>
          <option value="Coastal">Coastal</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Latitude *
          </label>
            <input
              type="number"
              step="any"
              name="location.coordinates.latitude"
              value={formData.location.coordinates.latitude}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                validationErrors['location.coordinates.latitude'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 6.9271"
              required
            />
            {validationErrors['location.coordinates.latitude'] && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['location.coordinates.latitude']}</p>
            )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitude *
          </label>
            <input
              type="number"
              step="any"
              name="location.coordinates.longitude"
              value={formData.location.coordinates.longitude}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                validationErrors['location.coordinates.longitude'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 79.8612"
              required
            />
            {validationErrors['location.coordinates.longitude'] && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['location.coordinates.longitude']}</p>
            )}
        </div>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h3>
        <p className="text-gray-600">How can guests reach you?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="contact.phone"
            value={formData.contact.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
              validationErrors['contact.phone'] ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors['contact.phone'] && (
            <p className="text-red-500 text-sm mt-1">{validationErrors['contact.phone']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="contact.email"
            value={formData.contact.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
              validationErrors['contact.email'] ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors['contact.email'] && (
            <p className="text-red-500 text-sm mt-1">{validationErrors['contact.email']}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website
        </label>
        <input
          type="url"
          name="contact.website"
          value={formData.contact.website}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
            validationErrors['contact.website'] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://yourhotel.com"
        />
        {validationErrors['contact.website'] && (
          <p className="text-red-500 text-sm mt-1">{validationErrors['contact.website']}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Emergency Contact
        </label>
        <input
          type="tel"
          name="contact.emergencyContact"
          value={formData.contact.emergencyContact}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        />
      </div>
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Amenities & Policies</h3>
        <p className="text-gray-600">What services do you offer?</p>
      </div>
      
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Basic Amenities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'wifi', 'airConditioning', 'hotWater', 'parking', 'restaurant', 'bar',
            'pool', 'gym', 'spa', 'airportPickup', 'tourBooking', 'currencyExchange',
            'laundryService', 'englishSpeakingStaff', 'localTransportation', 'safetyDepositBox',
            'internationalAdapters', 'ayurveda', 'culturalShows', 'localCuisine',
            'heritageExperience', 'wildlifeSafari', 'plantationTour'
          ].map(amenity => (
            <label key={amenity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name={`amenities.${amenity}`}
                checked={formData.amenities[amenity]}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {amenity.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Hotel Policies</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Time
            </label>
            <input
              type="time"
              name="policies.checkInTime"
              value={formData.policies.checkInTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Time
            </label>
            <input
              type="time"
              name="policies.checkOutTime"
              value={formData.policies.checkOutTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Policy
            </label>
            <select
              name="policies.cancellationPolicy"
              value={formData.policies.cancellationPolicy}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="Free cancellation">Free cancellation</option>
              <option value="24 hours">24 hours</option>
              <option value="48 hours">48 hours</option>
              <option value="7 days">7 days</option>
              <option value="14 days">14 days</option>
              <option value="Non-refundable">Non-refundable</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet Policy
            </label>
            <select
              name="policies.petPolicy"
              value={formData.policies.petPolicy}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="Pets allowed">Pets allowed</option>
              <option value="Pets not allowed">Pets not allowed</option>
              <option value="Pets allowed with fee">Pets allowed with fee</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child Policy
            </label>
            <input
              type="text"
              name="policies.childPolicy"
              value={formData.policies.childPolicy}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Smoking Policy
            </label>
            <select
              name="policies.smokingPolicy"
              value={formData.policies.smokingPolicy}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="Non-smoking">Non-smoking</option>
              <option value="Smoking allowed">Smoking allowed</option>
              <option value="Designated smoking areas">Designated smoking areas</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Hotel Photos */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Hotel Photos</h4>
        <p className="text-sm text-gray-600 mb-4">
          Add photos of your hotel. You can use Unsplash images or any other image URLs.
        </p>
        
        {/* Add Image URL */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tip: Use Unsplash URLs like https://images.unsplash.com/photo-1234567890/...
          </p>
        </div>
        
        {/* Image Gallery */}
        {formData.images && formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={`Hotel image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                    }}
                  />
                </div>
                
                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Primary
                  </div>
                )}
                
                {/* Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
                        title="Set as primary"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => window.open(image.url, '_blank')}
                      className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
                      title="View full size"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(!formData.images || formData.images.length === 0) && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No photos added yet</p>
            <p className="text-sm text-gray-500">
              Add some beautiful photos of your hotel to attract guests
            </p>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-10 w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Register Your Hotel</h1>
            <p className="text-lg text-gray-600">
              Join SerendibGo and start welcoming tourists to Sri Lanka
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                      step === currentStep
                        ? 'bg-blue-600 text-white shadow-lg'
                        : step < currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`w-12 h-1 mx-2 transition-colors duration-200 ${
                        step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600 font-medium">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} onKeyDown={(e) => {
            if (e.key === 'Enter' && currentStep < totalSteps) {
              e.preventDefault();
              nextStep(e);
            }
          }}>
            {renderCurrentStep()}
            
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
              >
                Previous
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors duration-200"
                >
                  {loading ? 'Creating Hotel...' : 'Create Hotel'}
                </button>
              )}
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-xs md:text-sm text-gray-600">
              Already have a hotel registered?{' '}
              <Link to="/hotel-owner/dashboard" className="text-blue-600 hover:text-blue-500">
                Go to Dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HotelOwnerRegistration;
