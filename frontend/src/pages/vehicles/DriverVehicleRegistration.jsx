import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import tripService from '../../services/vehicles/tripService';
import { 
  Car, 
  Upload, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const DriverVehicleRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; // Simplified to 2 steps

  // Check if user has driver role
  useEffect(() => {
    if (user && user.role !== 'driver') {
      toast.error('You need to complete your driver registration first before registering a vehicle.');
      navigate('/driver/register');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    // Basic Information
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    color: '',
    licensePlate: '',
    vin: '',
    
    // Vehicle Details
    vehicleType: 'Car',
    fuelType: 'petrol',
    transmission: 'manual',
    engineCapacity: '',
    mileage: '',
    seatingCapacity: '4',
    
    // Features
    features: {
      airConditioning: false,
      wifi: false,
      gps: false,
      musicSystem: false,
      chargingPorts: false,
      wheelchairAccessible: false,
      childSeat: false
    },
    
    // Location
    location: {
      city: 'Colombo',
      district: 'Colombo',
      coordinates: {
        latitude: 6.9271,
        longitude: 79.8612
      }
    },
    
    // Pricing
    pricing: {
      baseRate: '',
      perKmRate: '',
      hourlyRate: '',
      dailyRate: '',
      currency: 'LKR'
    },
    
    // Documents
    documents: {
      registration: '',
      insurance: '',
      fitness: '',
      revenue: ''
    },
    
    // Description
    description: ''
  });

  // Separate state for image URLs to fix the handling
  const [imageUrls, setImageUrls] = useState({
    front: '',
    side: '',
    interior: ''
  });

  const vehicleTypes = [
    { value: 'Car', label: 'Car' },
    { value: 'Van', label: 'Van' },
    { value: 'Tuk-tuk', label: 'Tuk-tuk' },
    { value: 'Bus', label: 'Bus' },
    { value: 'Minibus', label: 'Minibus' },
    { value: 'Motorcycle', label: 'Motorcycle' }
  ];

  const fuelTypes = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'electric', label: 'Electric' }
  ];

  const features = [
    { key: 'airConditioning', label: 'Air Conditioning' },
    { key: 'wifi', label: 'WiFi' },
    { key: 'gps', label: 'GPS Navigation' },
    { key: 'musicSystem', label: 'Music System' },
    { key: 'chargingPorts', label: 'Charging Ports' },
    { key: 'wheelchairAccessible', label: 'Wheelchair Accessible' },
    { key: 'childSeat', label: 'Child Seat' }
  ];

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

  const handleFeatureToggle = (featureKey) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey]
      }
    }));
  };

  const handleFileUpload = (documentType, url) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: url
      }
    }));
  };

  const handleImageUpload = (imageType, url) => {
    setImageUrls(prev => ({
      ...prev,
      [imageType]: url
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.make || !formData.model || !formData.licensePlate) {
        toast.error('Please fill in all required fields (Make, Model, License Plate)');
        setLoading(false);
        return;
      }

      // Process form data to convert empty strings to proper values
      const processedData = {
        ...formData,
        year: formData.year && formData.year !== '' ? parseInt(formData.year) : new Date().getFullYear(),
        engineCapacity: formData.engineCapacity || '',
        mileage: formData.mileage && formData.mileage !== '' ? parseInt(formData.mileage) : 0,
        seatingCapacity: formData.seatingCapacity && formData.seatingCapacity !== '' ? parseInt(formData.seatingCapacity) : 4,
        pricing: {
          ...formData.pricing,
          baseRate: formData.pricing.baseRate && formData.pricing.baseRate !== '' ? parseInt(formData.pricing.baseRate) : 0,
          perKmRate: formData.pricing.perKmRate && formData.pricing.perKmRate !== '' ? parseFloat(formData.pricing.perKmRate) : 0,
          hourlyRate: formData.pricing.hourlyRate && formData.pricing.hourlyRate !== '' ? parseInt(formData.pricing.hourlyRate) : 0,
          dailyRate: formData.pricing.dailyRate && formData.pricing.dailyRate !== '' ? parseInt(formData.pricing.dailyRate) : 0
        }
      };

      // Add documents and images as URLs to the processed data
      const finalData = {
        ...processedData,
        documents: formData.documents,
        images: Object.values(imageUrls).filter(url => url.trim() !== '')
      };

      // Submit to backend
      console.log('Submitting vehicle data:', finalData);
      console.log('Features being sent:', finalData.features);
      console.log('Images being sent:', finalData.images);
      await tripService.vehicleService.registerVehicle(finalData);
      
      toast.success('Vehicle registered successfully! It will be reviewed by our team.');
      navigate('/driver/dashboard');
    } catch (error) {
      console.error('Error registering vehicle:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error('You need to complete your driver registration first before registering a vehicle.');
        navigate('/driver/register');
      } else if (error.response?.status === 400 && error.response?.data?.message === 'Validation failed') {
        // Show validation errors
        const errors = error.response.data.errors || [];
        const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
      } else {
        toast.error(`Failed to register vehicle: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-semibold text-base-content mb-6 flex items-center">
              <Car className="w-6 h-6 mr-2" />
              Vehicle Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Make *</span>
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="input input-bordered"
                  placeholder="Toyota"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Model *</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="input input-bordered"
                  placeholder="Camry"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Year</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="input input-bordered"
                  placeholder="2024"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Color</span>
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="input input-bordered"
                  placeholder="White"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">License Plate *</span>
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  className="input input-bordered"
                  placeholder="ABC-1234"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vehicle Type</span>
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className="select select-bordered"
                >
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Fuel Type</span>
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  className="select select-bordered"
                >
                  {fuelTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Seating Capacity</span>
                </label>
                <input
                  type="number"
                  value={formData.seatingCapacity}
                  onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                  className="input input-bordered"
                  placeholder="4"
                  min="1"
                  max="50"
                />
              </div>
            </div>

            {/* Features */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-base-content mb-4">Vehicle Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map(feature => (
                  <label key={feature.key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features[feature.key] || false}
                      onChange={() => handleFeatureToggle(feature.key)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-semibold text-base-content mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              Pricing & Images
            </h2>
            
            {/* Pricing */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-base-content mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Daily Rate (LKR)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.dailyRate}
                    onChange={(e) => handleInputChange('pricing.dailyRate', e.target.value)}
                    className="input input-bordered"
                    placeholder="5000"
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Hourly Rate (LKR)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.hourlyRate}
                    onChange={(e) => handleInputChange('pricing.hourlyRate', e.target.value)}
                    className="input input-bordered"
                    placeholder="500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Images */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-base-content mb-4">Vehicle Images</h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Front View Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={imageUrls.front}
                    onChange={(e) => handleImageUpload('front', e.target.value)}
                    className="input input-bordered"
                    placeholder="https://example.com/vehicle-front.jpg"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Side View Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={imageUrls.side}
                    onChange={(e) => handleImageUpload('side', e.target.value)}
                    className="input input-bordered"
                    placeholder="https://example.com/vehicle-side.jpg"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Interior Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={imageUrls.interior}
                    onChange={(e) => handleImageUpload('interior', e.target.value)}
                    className="input input-bordered"
                    placeholder="https://example.com/vehicle-interior.jpg"
                  />
                </div>
              </div>
              <p className="text-sm text-base-content/70 mt-2">
                Add URLs for images showing different angles of your vehicle
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-base-content mb-4">Description</h3>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="Describe your vehicle, its condition, and any special features..."
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Add Your Vehicle</h1>
          <p className="text-base-content/70">Add your vehicle to our platform and start earning.</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-base-content">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-base-content/70">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`btn ${currentStep === 1 ? 'btn-disabled' : 'btn-ghost'}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-success"
              >
                <Shield className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-info/10 border border-info/20 rounded-lg p-6">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-info mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-info mb-2">Review Process</h3>
              <p className="text-base-content/70">
                Your vehicle will be reviewed by our staff team within 24-48 hours. 
                You'll receive an email notification once the review is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverVehicleRegistration;