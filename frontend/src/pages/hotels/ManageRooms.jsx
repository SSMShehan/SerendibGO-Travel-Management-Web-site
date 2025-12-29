import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotel } from '../../context/hotels/HotelContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Bed, 
  Users, 
  DollarSign,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Waves,
  Utensils,
  Dumbbell,
  Sparkles,
  MapPin,
  Star,
  X,
  Image as ImageIcon,
  ExternalLink,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageRooms = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { 
    rooms, 
    currentHotel, 
    roomsLoading, 
    hotelActions,
    roomActions 
  } = useHotel();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    roomType: '',
    description: '',
    size: '',
    bedConfiguration: [],
    maxOccupancy: {
      adults: 2,
      children: 0,
      infants: 0
    },
    amenities: [],
    basePrice: '',
    currency: 'LKR',
    inventory: 1,
    isAvailable: true,
    images: []
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [newImageUrl, setNewImageUrl] = useState('');

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'airConditioning', label: 'Air Conditioning', icon: Wind },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'minibar', label: 'Mini Bar', icon: Coffee },
    { id: 'balcony', label: 'Balcony', icon: Waves },
    { id: 'oceanView', label: 'Ocean View', icon: Waves },
    { id: 'mountainView', label: 'Mountain View', icon: MapPin },
    { id: 'roomService', label: 'Room Service', icon: Utensils },
    { id: 'safe', label: 'Safe', icon: Sparkles },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'gym', label: 'Gym Access', icon: Dumbbell },
    { id: 'spa', label: 'Spa Access', icon: Sparkles }
  ];

  const bedTypeOptions = [
    'Single', 'Double', 'Queen', 'King', 'Twin', 'Sofa Bed', 'Bunk Bed'
  ];

  useEffect(() => {
    if (hotelId) {
      roomActions.getRooms(hotelId);
      hotelActions.getHotel(hotelId);
    }
  }, [hotelId]);

  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'roomType':
        if (!value || value.trim().length < 2) {
          errors.roomType = 'Room type must be at least 2 characters';
        } else if (value.length > 100) {
          errors.roomType = 'Room type cannot exceed 100 characters';
        } else {
          delete errors.roomType;
        }
        break;
        
      case 'description':
        if (!value || value.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters';
        } else if (value.length > 500) {
          errors.description = 'Description cannot exceed 500 characters';
        } else {
          delete errors.description;
        }
        break;
        
      case 'basePrice':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          errors.basePrice = 'Base price must be a positive number';
        } else {
          delete errors.basePrice;
        }
        break;
        
      case 'inventory':
        if (!value || isNaN(value) || parseInt(value) < 0) {
          errors.inventory = 'Inventory must be a non-negative number';
        } else {
          delete errors.inventory;
        }
        break;
        
      case 'maxOccupancy.adults':
        if (!value || isNaN(value) || parseInt(value) < 1) {
          errors['maxOccupancy.adults'] = 'At least 1 adult is required';
        } else {
          delete errors['maxOccupancy.adults'];
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    validateField(name, value);
  };

  const handleAmenityChange = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleBedTypeChange = (bedType) => {
    setFormData(prev => ({
      ...prev,
      bedConfiguration: prev.bedConfiguration.some(bed => bed.type === bedType)
        ? prev.bedConfiguration.filter(bed => bed.type !== bedType)
        : [...prev.bedConfiguration, { type: bedType, quantity: 1 }]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      roomType: '',
      description: '',
      size: '',
      bedConfiguration: [],
      maxOccupancy: {
        adults: 2,
        children: 0,
        infants: 0
      },
      amenities: [],
      basePrice: '',
      currency: 'LKR',
      inventory: 1,
      isAvailable: true,
      images: []
    });
    setValidationErrors({});
    setNewImageUrl('');
    setEditingRoom(null);
    setShowAddForm(false);
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      try {
        new URL(newImageUrl);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url: newImageUrl.trim(), isPrimary: prev.images.length === 0 }]
        }));
        setNewImageUrl('');
      } catch (error) {
        toast.error('Please enter a valid URL');
      }
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
      images: prev.images.map((image, i) => ({
        ...image,
        isPrimary: i === index
      }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'roomType', 'description', 'basePrice', 'inventory'];
    const errors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field} is required`;
      }
    });
    
    if (formData.bedConfiguration.length === 0) {
      errors.bedConfiguration = 'At least one bed type is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Convert amenities array to object format for backend
      const amenitiesObject = {};
      if (Array.isArray(formData.amenities)) {
        formData.amenities.forEach(amenity => {
          amenitiesObject[amenity] = true;
        });
      }

      // Filter out empty size values from bedConfiguration
      const filteredBedConfiguration = (formData.bedConfiguration || []).map(bed => {
        const { size, ...bedWithoutSize } = bed;
        return size && size.trim() !== '' ? bed : bedWithoutSize;
      });

      const roomData = {
        name: formData.name,
        description: formData.description,
        roomType: formData.roomType,
        size: formData.size ? parseFloat(formData.size) : undefined,
        bedConfiguration: filteredBedConfiguration,
        maxOccupancy: {
          adults: parseInt(formData.maxOccupancy.adults),
          children: parseInt(formData.maxOccupancy.children) || 0,
          infants: parseInt(formData.maxOccupancy.infants) || 0
        },
        pricing: {
          basePrice: parseFloat(formData.basePrice),
          currency: 'LKR'
        },
        availability: {
          totalRooms: parseInt(formData.inventory),
          availableRooms: parseInt(formData.inventory)
        },
        amenities: amenitiesObject,
        images: formData.images || [],
        isAvailable: formData.isAvailable
      };

      console.log('Sending room data:', roomData);

      if (editingRoom) {
        await roomActions.updateRoom(editingRoom._id, roomData);
        toast.success('Room updated successfully!');
      } else {
        await roomActions.createRoom(hotelId, roomData);
        toast.success('Room added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving room:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save room');
    }
  };

  const handleEdit = (room) => {
    // Convert amenities object to array of enabled amenities
    const amenitiesArray = [];
    if (room.amenities && typeof room.amenities === 'object') {
      Object.keys(room.amenities).forEach(key => {
        if (room.amenities[key] === true) {
          amenitiesArray.push(key);
        }
      });
    } else if (Array.isArray(room.amenities)) {
      amenitiesArray.push(...room.amenities);
    }

    setFormData({
      name: room.name || '',
      roomType: room.roomType,
      description: room.description || '',
      size: room.size || '',
      bedConfiguration: room.bedConfiguration || [],
      maxOccupancy: {
        adults: room.maxOccupancy?.adults || 2,
        children: room.maxOccupancy?.children || 0,
        infants: room.maxOccupancy?.infants || 0
      },
      amenities: amenitiesArray,
      basePrice: room.pricing?.basePrice?.toString() || '',
      currency: room.pricing?.currency || 'LKR',
      inventory: room.availability?.totalRooms?.toString() || '1',
      isAvailable: room.isAvailable !== false,
      images: room.images || []
    });
    setEditingRoom(room);
    setShowAddForm(true);
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await roomActions.deleteRoom(roomId);
        toast.success('Room deleted successfully!');
      } catch (error) {
        console.error('Error deleting room:', error);
        toast.error(error.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const renderAmenityIcon = (amenityId) => {
    const amenity = amenityOptions.find(a => a.id === amenityId);
    return amenity ? <amenity.icon className="w-4 h-4" /> : null;
  };

  if (roomsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Rooms</h1>
              <p className="mt-2 text-gray-600">
                {currentHotel ? `${currentHotel.name} - ${currentHotel.location?.city}` : 'Hotel Rooms'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/hotel-owner/dashboard`)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Room Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Room Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Deluxe Ocean View Room"
                    required
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      validationErrors.roomType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select room type</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Superior">Superior</option>
                    <option value="Executive">Executive</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                    <option value="Family Room">Family Room</option>
                    <option value="Twin Room">Twin Room</option>
                    <option value="Double Room">Double Room</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Dormitory">Dormitory</option>
                    <option value="Villa">Villa</option>
                    <option value="Bungalow">Bungalow</option>
                    <option value="Chalet">Chalet</option>
                    <option value="Cottage">Cottage</option>
                  </select>
                  {validationErrors.roomType && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.roomType}</p>
                  )}
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Size
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="e.g., 35 sqm"
                  />
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (LKR) *
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      validationErrors.basePrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="5000"
                    min="0"
                    step="100"
                    required
                  />
                  {validationErrors.basePrice && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.basePrice}</p>
                  )}
                </div>

                {/* Inventory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms *
                  </label>
                  <input
                    type="number"
                    name="inventory"
                    value={formData.inventory}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      validationErrors.inventory ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1"
                    min="0"
                    required
                  />
                  {validationErrors.inventory && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.inventory}</p>
                  )}
                </div>

                {/* Max Occupancy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Adults *
                  </label>
                  <input
                    type="number"
                    name="maxOccupancy.adults"
                    value={formData.maxOccupancy.adults}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      validationErrors['maxOccupancy.adults'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                    required
                  />
                  {validationErrors['maxOccupancy.adults'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['maxOccupancy.adults']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Children
                  </label>
                  <input
                    type="number"
                    name="maxOccupancy.children"
                    value={formData.maxOccupancy.children}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
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
                  placeholder="Describe the room features, view, and amenities..."
                  required
                />
                {validationErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                )}
              </div>

              {/* Bed Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bed Types *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {bedTypeOptions.map(bedType => (
                    <label key={bedType} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.bedConfiguration.some(bed => bed.type === bedType)}
                        onChange={() => handleBedTypeChange(bedType)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{bedType}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.bedConfiguration && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.bedConfiguration}</p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenityOptions.map(amenity => (
                    <label key={amenity.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity.id)}
                        onChange={() => handleAmenityChange(amenity.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <amenity.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Photos
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Add photos of this room type. You can use Unsplash images or any other image URLs.
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
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image.url}
                            alt={`Room photo ${index + 1}`}
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
                
                {formData.images.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No photos added yet</p>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Room is available for booking</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rooms List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Room Types</h2>
            <p className="text-gray-600 mt-1">
              {rooms.length} room type{rooms.length !== 1 ? 's' : ''} configured
            </p>
          </div>

          {rooms.length === 0 ? (
            <div className="p-12 text-center">
              <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms added yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first room type to begin accepting bookings.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Room</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rooms.map((room) => {
                // Get primary image or first image
                const primaryImage = room.images?.find(img => img.isPrimary) || room.images?.[0];
                
                return (
                  <div key={room._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      {/* Room Image */}
                      <div className="flex-shrink-0 mr-6">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                          {primaryImage ? (
                            <img
                              src={primaryImage.url}
                              alt={room.name || room.roomType}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Bed className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {room.images && room.images.length > 1 && (
                          <div className="mt-1 text-xs text-gray-500 text-center">
                            +{room.images.length - 1} more
                          </div>
                        )}
                      </div>

                      {/* Room Details */}
                      <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{room.roomType}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          room.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {room.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      {room.description && (
                        <p className="text-gray-600 mb-3">{room.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            LKR {room.basePrice?.toLocaleString()}/night
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {room.maxOccupancy?.adults} adults, {room.maxOccupancy?.children} children
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Bed className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {room.bedConfiguration && room.bedConfiguration.length > 0 
                              ? room.bedConfiguration.map(bed => `${bed.quantity}x ${bed.type}`).join(', ')
                              : 'Not specified'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {room.availability?.totalRooms || 0} room{(room.availability?.totalRooms || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {(() => {
                        // Convert amenities object to array for display
                        let amenitiesArray = [];
                        if (room.amenities && typeof room.amenities === 'object') {
                          amenitiesArray = Object.keys(room.amenities).filter(key => room.amenities[key] === true);
                        } else if (Array.isArray(room.amenities)) {
                          amenitiesArray = room.amenities;
                        }
                        
                        return amenitiesArray.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {amenitiesArray.slice(0, 6).map(amenity => (
                                <div key={amenity} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                                  {renderAmenityIcon(amenity)}
                                  <span className="text-gray-600">
                                    {amenityOptions.find(a => a.id === amenity)?.label || amenity}
                                  </span>
                                </div>
                              ))}
                              {amenitiesArray.length > 6 && (
                                <span className="text-xs text-gray-500">
                                  +{amenitiesArray.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/hotel-owner/rooms/${room._id}/availability`)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Manage availability"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit room"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRooms;
