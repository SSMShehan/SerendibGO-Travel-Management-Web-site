import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, 
  Upload, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  FileText,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const VehicleOwnerRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    
    // Driver Information
    driverLicense: {
      number: '',
      expiryDate: '',
      document: null
    },
    
    // Vehicle Ownership Proof
    ownershipProof: {
      document: null,
      documentType: 'registration'
    },
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    
    // Bank Information (for payments)
    bankDetails: {
      accountNumber: '',
      bankName: '',
      branchName: '',
      accountHolderName: ''
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
    { id: 3, title: 'Ownership Proof', icon: FileText },
    { id: 4, title: 'Emergency Contact', icon: Phone },
    { id: 5, title: 'Bank Details', icon: CreditCard },
    { id: 6, title: 'Review & Submit', icon: CheckCircle }
  ];
  
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: file
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: file
        }));
      }
    }
  };
  
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        break;
        
      case 2:
        if (!formData.driverLicense.number.trim()) newErrors['driverLicense.number'] = 'Driver license number is required';
        if (!formData.driverLicense.expiryDate) newErrors['driverLicense.expiryDate'] = 'Expiry date is required';
        if (!formData.driverLicense.document) newErrors['driverLicense.document'] = 'Driver license document is required';
        break;
        
      case 3:
        if (!formData.ownershipProof.document) newErrors['ownershipProof.document'] = 'Ownership proof document is required';
        break;
        
      case 4:
        if (!formData.emergencyContact.name.trim()) newErrors['emergencyContact.name'] = 'Emergency contact name is required';
        if (!formData.emergencyContact.phone.trim()) newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
        if (!formData.emergencyContact.relationship.trim()) newErrors['emergencyContact.relationship'] = 'Relationship is required';
        break;
        
      case 5:
        if (!formData.bankDetails.accountNumber.trim()) newErrors['bankDetails.accountNumber'] = 'Account number is required';
        if (!formData.bankDetails.bankName.trim()) newErrors['bankDetails.bankName'] = 'Bank name is required';
        if (!formData.bankDetails.branchName.trim()) newErrors['bankDetails.branchName'] = 'Branch name is required';
        if (!formData.bankDetails.accountHolderName.trim()) newErrors['bankDetails.accountHolderName'] = 'Account holder name is required';
        break;
        
      case 6:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        if (!formData.privacyPolicyAccepted) newErrors.privacyPolicyAccepted = 'You must accept the privacy policy';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key === 'driverLicense' || key === 'ownershipProof' || key === 'emergencyContact' || key === 'bankDetails') {
          Object.keys(formData[key]).forEach(subKey => {
            if (formData[key][subKey] instanceof File) {
              submitData.append(`${key}.${subKey}`, formData[key][subKey]);
            } else {
              submitData.append(`${key}.${subKey}`, formData[key][subKey]);
            }
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Submit to backend
      const response = await fetch('/api/vehicle-owners/register', {
        method: 'POST',
        body: submitData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        toast.success('Vehicle owner registration submitted successfully!');
        navigate('/vehicle-owner/dashboard');
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
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver License Number *
              </label>
              <input
                type="text"
                name="driverLicense.number"
                value={formData.driverLicense.number}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['driverLicense.number'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your driver license number"
              />
              {errors['driverLicense.number'] && <p className="text-red-500 text-sm mt-1">{errors['driverLicense.number']}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Expiry Date *
              </label>
              <input
                type="date"
                name="driverLicense.expiryDate"
                value={formData.driverLicense.expiryDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['driverLicense.expiryDate'] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors['driverLicense.expiryDate'] && <p className="text-red-500 text-sm mt-1">{errors['driverLicense.expiryDate']}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver License Document *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'driverLicense.document')}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="driverLicense"
                />
                <label htmlFor="driverLicense" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload driver license document
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                </label>
              </div>
              {formData.driverLicense.document && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ {formData.driverLicense.document.name}
                </p>
              )}
              {errors['driverLicense.document'] && <p className="text-red-500 text-sm mt-1">{errors['driverLicense.document']}</p>}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Ownership Proof *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'ownershipProof.document')}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="ownershipProof"
                />
                <label htmlFor="ownershipProof" className="cursor-pointer">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload vehicle ownership proof
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                </label>
              </div>
              {formData.ownershipProof.document && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ {formData.ownershipProof.document.name}
                </p>
              )}
              {errors['ownershipProof.document'] && <p className="text-red-500 text-sm mt-1">{errors['ownershipProof.document']}</p>}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Accepted Documents:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vehicle Registration Certificate</li>
                <li>• Vehicle Insurance Certificate</li>
                <li>• Vehicle Fitness Certificate</li>
                <li>• Any official document proving vehicle ownership</li>
              </ul>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['emergencyContact.name'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter emergency contact name"
              />
              {errors['emergencyContact.name'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.name']}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['emergencyContact.phone'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter emergency contact phone"
              />
              {errors['emergencyContact.phone'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.phone']}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['emergencyContact.relationship'] ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
              {errors['emergencyContact.relationship'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.relationship']}</p>}
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankDetails.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['bankDetails.bankName'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter bank name"
              />
              {errors['bankDetails.bankName'] && <p className="text-red-500 text-sm mt-1">{errors['bankDetails.bankName']}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                name="bankDetails.branchName"
                value={formData.bankDetails.branchName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['bankDetails.branchName'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter branch name"
              />
              {errors['bankDetails.branchName'] && <p className="text-red-500 text-sm mt-1">{errors['bankDetails.branchName']}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                name="bankDetails.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['bankDetails.accountNumber'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter account number"
              />
              {errors['bankDetails.accountNumber'] && <p className="text-red-500 text-sm mt-1">{errors['bankDetails.accountNumber']}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="bankDetails.accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['bankDetails.accountHolderName'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter account holder name"
              />
              {errors['bankDetails.accountHolderName'] && <p className="text-red-500 text-sm mt-1">{errors['bankDetails.accountHolderName']}</p>}
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  <p className="text-sm text-gray-600">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{formData.email}</p>
                  <p className="text-sm text-gray-600">{formData.phone}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Driver License</h4>
                  <p className="text-sm text-gray-600">
                    License: {formData.driverLicense.number}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expires: {formData.driverLicense.expiryDate}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Emergency Contact</h4>
                  <p className="text-sm text-gray-600">
                    {formData.emergencyContact.name} ({formData.emergencyContact.relationship})
                  </p>
                  <p className="text-sm text-gray-600">{formData.emergencyContact.phone}</p>
                </div>
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
                  I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link> and understand that my application will be reviewed by our team.
                </label>
              </div>
              {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted}</p>}
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="privacyPolicyAccepted"
                  checked={formData.privacyPolicyAccepted}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                />
                <label className="text-sm text-gray-700">
                  I agree to the <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and consent to the processing of my personal data.
                </label>
              </div>
              {errors.privacyPolicyAccepted && <p className="text-red-500 text-sm">{errors.privacyPolicyAccepted}</p>}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Car className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Vehicle Owner Registration</h1>
          </div>
          <p className="text-gray-600">
            Join SerendibGo as a vehicle owner and start earning with your vehicle
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${
                  currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Previous
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@serendibgo.com" className="text-blue-600 hover:underline">
              support@serendibgo.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VehicleOwnerRegistration;
