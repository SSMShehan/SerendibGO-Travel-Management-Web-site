import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { driverService } from '../../services/vehicles/tripService';
import { 
  User, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Car,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const DriverRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    // Personal Information
    personalInfo: {
      dateOfBirth: '',
      gender: '',
      nationality: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      }
    },
    
    // License Information
    license: {
      licenseNumber: '',
      licenseType: '',
      issueDate: '',
      expiryDate: '',
      issuingAuthority: '',
      licenseClass: '',
      restrictions: [],
      endorsements: []
    },
    
    // Vehicle Types and Experience
    vehicleTypes: [{
      vehicleType: '',
      experience: 0,
      isPreferred: false
    }],
    
    // Service Areas
    serviceAreas: [{
      city: '',
      district: '',
      radius: 50,
      isActive: true
    }],
    
    // Financial Information
    financial: {
      baseRate: 0,
      currency: 'LKR',
      paymentMethod: 'bank_transfer'
    },
    
    // Terms and Conditions
    termsAccepted: false,
    privacyPolicyAccepted: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Driver License', icon: CreditCard },
    { id: 3, title: 'Vehicle Experience', icon: Car },
    { id: 4, title: 'Service Areas', icon: MapPin },
    { id: 5, title: 'Financial Details', icon: Shield },
    { id: 6, title: 'Review & Submit', icon: CheckCircle }
  ];
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: type === 'checkbox' ? checked : value
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
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };
  
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.personalInfo.dateOfBirth) newErrors['personalInfo.dateOfBirth'] = 'Date of birth is required';
        if (!formData.personalInfo.gender) newErrors['personalInfo.gender'] = 'Gender is required';
        if (!formData.personalInfo.nationality) newErrors['personalInfo.nationality'] = 'Nationality is required';
        if (!formData.personalInfo.emergencyContact.name) newErrors['personalInfo.emergencyContact.name'] = 'Emergency contact name is required';
        if (!formData.personalInfo.emergencyContact.phone) newErrors['personalInfo.emergencyContact.phone'] = 'Emergency contact phone is required';
        break;
        
      case 2:
        if (!formData.license.licenseNumber) newErrors['license.licenseNumber'] = 'License number is required';
        if (!formData.license.licenseType) newErrors['license.licenseType'] = 'License type is required';
        if (!formData.license.issueDate) newErrors['license.issueDate'] = 'Issue date is required';
        if (!formData.license.expiryDate) newErrors['license.expiryDate'] = 'Expiry date is required';
        if (!formData.license.issuingAuthority) newErrors['license.issuingAuthority'] = 'Issuing authority is required';
        if (!formData.license.licenseClass) newErrors['license.licenseClass'] = 'License class is required';
        break;
        
      case 3:
        if (!formData.vehicleTypes[0]?.vehicleType) newErrors['vehicleTypes'] = 'At least one vehicle type is required';
        break;
        
      case 4:
        if (!formData.serviceAreas[0]?.city) newErrors['serviceAreas'] = 'At least one service area is required';
        break;
        
      case 5:
        if (!formData.financial.baseRate || formData.financial.baseRate <= 0) newErrors['financial.baseRate'] = 'Base rate must be greater than 0';
        break;
        
      case 6:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        if (!formData.privacyPolicyAccepted) newErrors.privacyPolicyAccepted = 'You must accept the privacy policy';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await driverService.registerDriver(formData);
      
      if (result.status === 'success') {
        toast.success('Driver registration submitted successfully!');
        // Refresh user context to get updated role
        window.location.reload();
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Registration</h1>
          <p className="text-lg text-gray-600 mt-2">
            Join our driver network and start earning
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
  
  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="personalInfo.dateOfBirth"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['personalInfo.dateOfBirth'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['personalInfo.dateOfBirth'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalInfo.dateOfBirth']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="personalInfo.gender"
                  value={formData.personalInfo.gender}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['personalInfo.gender'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors['personalInfo.gender'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalInfo.gender']}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality *
              </label>
              <input
                type="text"
                name="personalInfo.nationality"
                value={formData.personalInfo.nationality}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['personalInfo.nationality'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Sri Lankan"
              />
              {errors['personalInfo.nationality'] && (
                <p className="text-red-500 text-sm mt-1">{errors['personalInfo.nationality']}</p>
              )}
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="personalInfo.emergencyContact.name"
                    value={formData.personalInfo.emergencyContact.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['personalInfo.emergencyContact.name'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Emergency contact name"
                  />
                  {errors['personalInfo.emergencyContact.name'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['personalInfo.emergencyContact.name']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    name="personalInfo.emergencyContact.relationship"
                    value={formData.personalInfo.emergencyContact.relationship}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['personalInfo.emergencyContact.relationship'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                  {errors['personalInfo.emergencyContact.relationship'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['personalInfo.emergencyContact.relationship']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="personalInfo.emergencyContact.phone"
                    value={formData.personalInfo.emergencyContact.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['personalInfo.emergencyContact.phone'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Emergency contact phone"
                  />
                  {errors['personalInfo.emergencyContact.phone'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['personalInfo.emergencyContact.phone']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="personalInfo.emergencyContact.email"
                    value={formData.personalInfo.emergencyContact.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Emergency contact email"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Driver License Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="license.licenseNumber"
                  value={formData.license.licenseNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['license.licenseNumber'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter license number"
                />
                {errors['license.licenseNumber'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['license.licenseNumber']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Type *
                </label>
                <select
                  name="license.licenseType"
                  value={formData.license.licenseType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['license.licenseType'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select License Type</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                  <option value="H">H</option>
                  <option value="J">J</option>
                  <option value="K">K</option>
                  <option value="L">L</option>
                </select>
                {errors['license.licenseType'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['license.licenseType']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  name="license.issueDate"
                  value={formData.license.issueDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['license.issueDate'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['license.issueDate'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['license.issueDate']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="license.expiryDate"
                  value={formData.license.expiryDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['license.expiryDate'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['license.expiryDate'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['license.expiryDate']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuing Authority *
                </label>
                <input
                  type="text"
                  name="license.issuingAuthority"
                  value={formData.license.issuingAuthority}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['license.issuingAuthority'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Department of Motor Traffic"
                />
                {errors['license.issuingAuthority'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['license.issuingAuthority']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Class *
                </label>
                <select
                  name="license.licenseClass"
                  value={formData.license.licenseClass}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['license.licenseClass'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select License Class</option>
                  <option value="Light Vehicle">Light Vehicle</option>
                  <option value="Heavy Vehicle">Heavy Vehicle</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Bus">Bus</option>
                  <option value="Truck">Truck</option>
                </select>
                {errors['license.licenseClass'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['license.licenseClass']}</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Experience</h2>
            
            <div className="space-y-4">
              {formData.vehicleTypes.map((vehicleType, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type *
                      </label>
                      <select
                        name={`vehicleTypes.${index}.vehicleType`}
                        value={vehicleType.vehicleType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="coupe">Coupe</option>
                        <option value="convertible">Convertible</option>
                        <option value="wagon">Wagon</option>
                        <option value="pickup">Pickup</option>
                        <option value="van">Van</option>
                        <option value="minivan">Minivan</option>
                        <option value="truck">Truck</option>
                        <option value="bus">Bus</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="bicycle">Bicycle</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (Years) *
                      </label>
                      <input
                        type="number"
                        name={`vehicleTypes.${index}.experience`}
                        value={vehicleType.experience}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Years of experience"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name={`vehicleTypes.${index}.isPreferred`}
                        checked={vehicleType.isPreferred}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Preferred Vehicle Type
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {errors.vehicleTypes && (
              <p className="text-red-500 text-sm">{errors.vehicleTypes}</p>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Areas</h2>
            
            <div className="space-y-4">
              {formData.serviceAreas.map((area, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name={`serviceAreas.${index}.city`}
                        value={area.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District *
                      </label>
                      <input
                        type="text"
                        name={`serviceAreas.${index}.district`}
                        value={area.district}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter district"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Radius (km)
                      </label>
                      <input
                        type="number"
                        name={`serviceAreas.${index}.radius`}
                        value={area.radius}
                        onChange={handleInputChange}
                        min="1"
                        max="200"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {errors.serviceAreas && (
              <p className="text-red-500 text-sm">{errors.serviceAreas}</p>
            )}
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Rate (per trip) *
                </label>
                <input
                  type="number"
                  name="financial.baseRate"
                  value={formData.financial.baseRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['financial.baseRate'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter base rate"
                />
                {errors['financial.baseRate'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['financial.baseRate']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="financial.currency"
                  value={formData.financial.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Payment Method
              </label>
              <select
                name="financial.paymentMethod"
                value={formData.financial.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="mobile_payment">Mobile Payment</option>
              </select>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                <p className="text-sm text-gray-600">
                  Date of Birth: {formData.personalInfo.dateOfBirth}<br/>
                  Gender: {formData.personalInfo.gender}<br/>
                  Nationality: {formData.personalInfo.nationality}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">License Information</h3>
                <p className="text-sm text-gray-600">
                  License Number: {formData.license.licenseNumber}<br/>
                  License Type: {formData.license.licenseType}<br/>
                  License Class: {formData.license.licenseClass}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Service Areas</h3>
                <p className="text-sm text-gray-600">
                  {formData.serviceAreas.map((area, index) => (
                    <span key={index}>
                      {area.city}, {area.district} ({area.radius}km radius)
                      {index < formData.serviceAreas.length - 1 && <br/>}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <label className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Terms and Conditions
                  </a>{' '}
                  and understand my responsibilities as a driver.
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-500 text-sm">{errors.termsAccepted}</p>
              )}
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="privacyPolicyAccepted"
                  checked={formData.privacyPolicyAccepted}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <label className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>{' '}
                  and consent to the processing of my personal data.
                </label>
              </div>
              {errors.privacyPolicyAccepted && (
                <p className="text-red-500 text-sm">{errors.privacyPolicyAccepted}</p>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  }
};

export default DriverRegistration;
