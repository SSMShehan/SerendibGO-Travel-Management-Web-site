import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import tripService from '../../services/vehicles/tripService';
import { 
  Car, 
  Save, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  X,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const VehicleEdit = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine the correct dashboard path based on user role
  const getDashboardPath = () => {
    if (user.role === 'driver') {
      return '/driver/dashboard';
    } else if (user.role === 'vehicle_owner') {
      return '/vehicle-owner/dashboard';
    }
    return '/dashboard';
  };
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [addingUrlImage, setAddingUrlImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vehicleType: '',
    fuelType: '',
    transmission: '',
    engineCapacity: '',
    mileage: '',
    seatingCapacity: '',
    pricing: {
      baseRate: '',
      perKmRate: '',
      hourlyRate: '',
      dailyRate: '',
      currency: 'LKR'
    }
  });
  
  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);
  
  const fetchVehicle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching vehicle with ID:', vehicleId);
      const response = await tripService.vehicleService.getVehicleById(vehicleId);
      console.log('Vehicle API response:', response);
      
      if (response.success === true) {
        const vehicleData = response.data;
        console.log('Vehicle data received:', vehicleData);
        setVehicle(vehicleData);
        setImages(vehicleData.images || []);
        setFormData({
          name: vehicleData.name || '',
          description: vehicleData.description || '',
          make: vehicleData.make || '',
          model: vehicleData.model || '',
          year: vehicleData.year || '',
          color: vehicleData.color || '',
          licensePlate: vehicleData.licensePlate || '',
          vehicleType: vehicleData.vehicleType || '',
          fuelType: vehicleData.fuelType || '',
          transmission: vehicleData.transmission || '',
          engineCapacity: vehicleData.engineCapacity || '',
          mileage: vehicleData.mileage || '',
          seatingCapacity: vehicleData.seatingCapacity || '',
          pricing: {
            baseRate: vehicleData.pricing?.baseRate || '',
            perKmRate: vehicleData.pricing?.perKmRate || '',
            hourlyRate: vehicleData.pricing?.hourlyRate || '',
            dailyRate: vehicleData.pricing?.dailyRate || '',
            currency: vehicleData.pricing?.currency || 'LKR'
          }
        });
        toast.success('Vehicle details loaded successfully');
      } else {
        console.error('API returned success: false');
        setError('Failed to load vehicle details');
        toast.error('Failed to load vehicle details');
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
        toast.error('Request timed out. Please try again.');
      } else if (error.response?.status === 404) {
        setError('Vehicle not found.');
        toast.error('Vehicle not found.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to edit this vehicle.');
        toast.error('Access denied.');
      } else {
        setError('Failed to load vehicle details. Please try again.');
        toast.error('Failed to load vehicle details.');
      }
      
      // Auto-retry for timeout errors (max 2 retries)
      if (error.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`Retrying fetchVehicle (attempt ${retryCount + 1}/2)...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchVehicle();
        }, 2000); // Wait 2 seconds before retry
      }
    } finally {
      setLoading(false);
    }
  };
  
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
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
      
      const response = await tripService.vehicleService.uploadVehicleImages(vehicleId, formData);
      if (response.success) {
        setImages(prev => [...prev, ...response.data.images]);
        toast.success('Images uploaded successfully!');
      } else {
        toast.error('Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };
  
  const handleImageDelete = async (imageId) => {
    try {
      const response = await tripService.vehicleService.deleteVehicleImage(vehicleId, imageId);
      if (response.success) {
        setImages(prev => prev.filter(img => img._id !== imageId));
        toast.success('Image deleted successfully!');
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleAddImageByUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setAddingUrlImage(true);
    try {
      // Create a temporary image object to add to the list
      const newImage = {
        url: imageUrl.trim(),
        caption: '',
        isPrimary: images.length === 0, // Make first image primary
        _id: `temp_${Date.now()}` // Temporary ID
      };

      setImages(prev => [...prev, newImage]);
      setImageUrl('');
      toast.success('Image added successfully!');
    } catch (error) {
      console.error('Error adding image by URL:', error);
      toast.error('Failed to add image');
    } finally {
      setAddingUrlImage(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Clean images data - remove temporary IDs for URL images
      const cleanedImages = images.map(image => {
        if (image._id && image._id.startsWith('temp_')) {
          // Remove the temporary _id for URL images
          const { _id, ...imageWithoutId } = image;
          return imageWithoutId;
        }
        return image;
      });

      // Include images in the form data
      const submitData = {
        ...formData,
        images: cleanedImages
      };

      const response = await tripService.vehicleService.updateVehicle(vehicleId, submitData);
      if (response.success) {
        toast.success('Vehicle updated successfully!');
        navigate(`/driver/vehicles/${vehicleId}`);
      } else {
        toast.error('Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading vehicle...</h3>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-4 space-x-3">
            <button
              onClick={() => {
                setError(null);
                setRetryCount(0);
                fetchVehicle();
              }}
              className="btn btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(getDashboardPath())}
              className="btn btn-ghost"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/driver/vehicles/${vehicleId}`)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Vehicle Details
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Vehicle</h1>
              <p className="mt-2 text-gray-600">
                {vehicle?.make} {vehicle?.model} ({vehicle?.year})
              </p>
            </div>
          </div>
        </div>
        
        {/* Edit Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Plate</label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Vehicle Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="SUV">SUV</option>
                    <option value="Bus">Bus</option>
                    <option value="Minibus">Minibus</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => handleInputChange('transmission', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Transmission</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seating Capacity</label>
                  <input
                    type="number"
                    value={formData.seatingCapacity}
                    onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Rate (LKR)</label>
                  <input
                    type="number"
                    value={formData.pricing.baseRate}
                    onChange={(e) => handleInputChange('pricing.baseRate', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Per KM Rate (LKR)</label>
                  <input
                    type="number"
                    value={formData.pricing.perKmRate}
                    onChange={(e) => handleInputChange('pricing.perKmRate', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hourly Rate (LKR)</label>
                  <input
                    type="number"
                    value={formData.pricing.hourlyRate}
                    onChange={(e) => handleInputChange('pricing.hourlyRate', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Daily Rate (LKR)</label>
                  <input
                    type="number"
                    value={formData.pricing.dailyRate}
                    onChange={(e) => handleInputChange('pricing.dailyRate', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Vehicle Images */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Images</h3>
              
              {/* Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImages}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploadingImages ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading images...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Add Image by URL */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Image by URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={addingUrlImage}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageByUrl}
                    disabled={addingUrlImage || !imageUrl.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {addingUrlImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter a direct link to an image (JPG, PNG, GIF)
                </p>
              </div>
              
              {/* Image Gallery */}
              {images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={image._id || index} className="relative group">
                        <img
                          src={image.url || image}
                          alt={`Vehicle ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => handleImageDelete(image._id || index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {images.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-sm">No images uploaded yet</p>
                  <p className="text-xs">Upload images to showcase your vehicle</p>
                </div>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/driver/vehicles/${vehicleId}`)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleEdit;
