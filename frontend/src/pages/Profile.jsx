import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import tripService from '../services/vehicles/tripService';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  FileText,
  Edit3,
  Save,
  X,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Camera,
  Shield,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/common/GlassCard';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
  const [needsDriverCompletion, setNeedsDriverCompletion] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passportNumber: '',
    address: '',
    country: '',
    region: '',
    city: '',
    avatar: ''
  });

  // Driver profile completion form data
  const [driverFormData, setDriverFormData] = useState({
    personalInfo: {
      dateOfBirth: '',
      gender: '',
      nationality: '',
      emergencyContact: {
        name: '',
        relationship: 'friend',
        phone: '',
        email: ''
      }
    },
    license: {
      licenseNumber: '',
      licenseType: '',
      issueDate: '',
      expiryDate: '',
      issuingAuthority: 'Department of Motor Traffic',
      licenseClass: 'Light Vehicle'
    },
    vehicleTypes: [{
      vehicleType: '',
      experience: 0,
      isPreferred: true
    }],
    serviceAreas: [{
      city: '',
      district: '',
      radius: 50,
      isActive: true
    }],
    financial: {
      baseRate: 500,
      currency: 'LKR',
      paymentMethod: 'bank_transfer'
    }
  });

  const totalSteps = 6;

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        passportNumber: user.passportNumber || '',
        address: user.address || '',
        country: user.country || '',
        region: user.region || '',
        city: user.city || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'driver') {
      fetchDriverProfile();
    }
  }, [user]);

  const fetchDriverProfile = async () => {
    try {
      const response = await tripService.driverService.getDriverByUserId(user.id);
      if (response.status === 'success') {
        setDriverProfile(response.data.driver);
        // Check if driver profile needs completion
        if (response.data.driver.status === 'pending' &&
          (!response.data.driver.license?.licenseNumber ||
            response.data.driver.license?.licenseNumber === 'TBD')) {
          setNeedsDriverCompletion(true);
        }
      } else if (response.status === 'error' && response.data?.needsRegistration) {
        // Driver profile not found - user needs to register
        setDriverProfile(null);
        if (user?.role === 'driver') {
          setNeedsDriverCompletion(true);
        }
      }
    } catch (error) {
      // Only log unexpected errors (not 404s which are handled by the service)
      if (!error.suppressConsoleError && error.response?.status !== 404) {
        console.error('Error fetching driver profile:', error);
      }
      // If driver profile doesn't exist, show completion form
      if (user?.role === 'driver') {
        setNeedsDriverCompletion(true);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDriverInputChange = (section, field, value) => {
    setDriverFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedDriverInputChange = (section, subsection, field, value) => {
    setDriverFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverProfileSubmit = async () => {
    setLoading(true);
    try {
      console.log('Submitting driver profile data:', driverFormData);

      // If no driver profile exists, register as driver instead of updating
      if (!driverProfile) {
        const result = await tripService.driverService.registerDriver(driverFormData);
        if (result.status === 'success') {
          toast.success('Driver registration completed successfully!');
          setNeedsDriverCompletion(false);
          // Refresh the page to get updated user role
          window.location.reload();
        } else {
          toast.error(result.message || 'Failed to register as driver');
        }
      } else {
        // Update existing driver profile
        const result = await tripService.driverService.updateDriverProfile(user.id, driverFormData);
        if (result.status === 'success') {
          toast.success('Driver profile updated successfully!');
          setNeedsDriverCompletion(false);
          navigate('/driver/dashboard');
        } else if (result.status === 'error' && result.data?.needsRegistration) {
          // Driver profile was deleted or doesn't exist, register instead
          const registerResult = await tripService.driverService.registerDriver(driverFormData);
          if (registerResult.status === 'success') {
            toast.success('Driver registration completed successfully!');
            setNeedsDriverCompletion(false);
            window.location.reload();
          } else {
            toast.error(registerResult.message || 'Failed to register as driver');
          }
        } else {
          toast.error(result.message || 'Failed to update driver profile');
        }
      }
    } catch (error) {
      console.error('Error updating driver profile:', error);
      console.error('Error response:', error.response?.data);

      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error('Driver profile not found. Please try registering as a driver first.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to complete driver profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    });
    setIsEditing(false);
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

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', label: 'Admin' },
      staff: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', label: 'Staff' },
      driver: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', label: 'Driver' },
      guide: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', label: 'Guide' },
      hotel_owner: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', label: 'Hotel Owner' },
      vehicle_owner: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20', label: 'Vehicle Owner' },
      customer: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20', label: 'Customer' },
      tourist: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', label: 'Tourist' }
    };
    return badges[role] || badges.customer;
  };

  const roleStyle = getRoleBadge(user?.role);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // If driver needs to complete profile, show completion form
  if (needsDriverCompletion && user?.role === 'driver') {
    return (
      <div className="min-h-screen bg-surface-50 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent-500/10 to-primary-500/10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-display font-bold text-surface-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
              Complete Your Driver Profile
            </h1>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto">
              You're just a few steps away from accepting rides. Please provide your details below.
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-bold text-surface-700">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner border border-surface-100">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          {/* Form Steps */}
          <GlassCard className="p-8 backdrop-blur-xl border-white/50 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-surface-900 flex items-center border-b border-surface-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                        <User className="w-5 h-5" />
                      </div>
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700 group-focus-within:text-primary-600 transition-colors">Date of Birth</label>
                        <input
                          type="date"
                          value={driverFormData.personalInfo.dateOfBirth}
                          onChange={(e) => handleDriverInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm group-hover:border-primary-200"
                        />
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700 group-focus-within:text-primary-600 transition-colors">Gender</label>
                        <select
                          value={driverFormData.personalInfo.gender}
                          onChange={(e) => handleDriverInputChange('personalInfo', 'gender', e.target.value)}
                          className="select-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm group-hover:border-primary-200"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700 group-focus-within:text-primary-600 transition-colors">Nationality</label>
                        <input
                          type="text"
                          value={driverFormData.personalInfo.nationality}
                          onChange={(e) => handleDriverInputChange('personalInfo', 'nationality', e.target.value)}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm group-hover:border-primary-200"
                          placeholder="Sri Lankan"
                        />
                      </div>
                      <div className="col-span-full mt-4">
                        <h3 className="text-lg font-semibold text-surface-800 mb-4 bg-surface-100 p-2 rounded-lg inline-block px-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="form-control group">
                            <label className="label mb-2 block text-sm font-bold text-surface-700 group-focus-within:text-primary-600 transition-colors">Name</label>
                            <input
                              type="text"
                              value={driverFormData.personalInfo.emergencyContact.name}
                              onChange={(e) => handleNestedDriverInputChange('personalInfo', 'emergencyContact', 'name', e.target.value)}
                              className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                              placeholder="Contact Name"
                            />
                          </div>
                          <div className="form-control group">
                            <label className="label mb-2 block text-sm font-bold text-surface-700 group-focus-within:text-primary-600 transition-colors">Relationship</label>
                            <select
                              value={driverFormData.personalInfo.emergencyContact.relationship}
                              onChange={(e) => handleNestedDriverInputChange('personalInfo', 'emergencyContact', 'relationship', e.target.value)}
                              className="select-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                            >
                              <option value="">Select Relationship</option>
                              <option value="spouse">Spouse</option>
                              <option value="parent">Parent</option>
                              <option value="sibling">Sibling</option>
                              <option value="friend">Friend</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="form-control group">
                            <label className="label mb-2 block text-sm font-bold text-surface-700 group-focus-within:text-primary-600 transition-colors">Phone</label>
                            <input
                              type="tel"
                              value={driverFormData.personalInfo.emergencyContact.phone}
                              onChange={(e) => handleNestedDriverInputChange('personalInfo', 'emergencyContact', 'phone', e.target.value)}
                              className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                              placeholder="+94 77 123 4567"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: License Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-surface-900 flex items-center border-b border-surface-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      License Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">License Number</label>
                        <input
                          type="text"
                          value={driverFormData.license.licenseNumber}
                          onChange={(e) => handleDriverInputChange('license', 'licenseNumber', e.target.value)}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                          placeholder="B1234567"
                        />
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">License Type</label>
                        <select
                          value={driverFormData.license.licenseType}
                          onChange={(e) => handleDriverInputChange('license', 'licenseType', e.target.value)}
                          className="select-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                        >
                          <option value="">Select License Type</option>
                          <option value="A">A - Motorcycle</option>
                          <option value="B">B - Light Vehicle</option>
                          <option value="C">C - Heavy Vehicle</option>
                          <option value="D">D - Bus</option>
                        </select>
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">Issue Date</label>
                        <input
                          type="date"
                          value={driverFormData.license.issueDate}
                          onChange={(e) => handleDriverInputChange('license', 'issueDate', e.target.value)}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                        />
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">Expiry Date</label>
                        <input
                          type="date"
                          value={driverFormData.license.expiryDate}
                          onChange={(e) => handleDriverInputChange('license', 'expiryDate', e.target.value)}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                        />
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">Issuing Authority</label>
                        <input
                          type="text"
                          value={driverFormData.license.issuingAuthority}
                          onChange={(e) => handleDriverInputChange('license', 'issuingAuthority', e.target.value)}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                          placeholder="Department of Motor Traffic"
                        />
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">License Class</label>
                        <select
                          value={driverFormData.license.licenseClass}
                          onChange={(e) => handleDriverInputChange('license', 'licenseClass', e.target.value)}
                          className="select-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                        >
                          <option value="">Select License Class</option>
                          <option value="Light Vehicle">Light Vehicle</option>
                          <option value="Heavy Vehicle">Heavy Vehicle</option>
                          <option value="Motorcycle">Motorcycle</option>
                          <option value="Bus">Bus</option>
                          <option value="Truck">Truck</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Vehicle Experience */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-surface-900 flex items-center border-b border-surface-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                        <Car className="w-5 h-5" />
                      </div>
                      Vehicle Experience
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">Vehicle Type</label>
                        <select
                          value={driverFormData.vehicleTypes[0].vehicleType}
                          onChange={(e) => {
                            const newVehicleTypes = [...driverFormData.vehicleTypes];
                            newVehicleTypes[0].vehicleType = e.target.value;
                            setDriverFormData(prev => ({
                              ...prev,
                              vehicleTypes: newVehicleTypes
                            }));
                          }}
                          className="select-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                        >
                          <option value="">Select Vehicle Type</option>
                          <option value="sedan">Sedan</option>
                          <option value="suv">SUV</option>
                          <option value="hatchback">Hatchback</option>
                          <option value="van">Van</option>
                          <option value="bus">Bus</option>
                        </select>
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">Years of Experience</label>
                        <input
                          type="number"
                          min="0"
                          value={driverFormData.vehicleTypes[0].experience}
                          onChange={(e) => {
                            const newVehicleTypes = [...driverFormData.vehicleTypes];
                            newVehicleTypes[0].experience = parseInt(e.target.value) || 0;
                            setDriverFormData(prev => ({
                              ...prev,
                              vehicleTypes: newVehicleTypes
                            }));
                          }}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Service Areas */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-surface-900 flex items-center border-b border-surface-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                        <MapPin className="w-5 h-5" />
                      </div>
                      Service Areas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">City</label>
                        <input
                          type="text"
                          value={driverFormData.serviceAreas[0].city}
                          onChange={(e) => {
                            const newServiceAreas = [...driverFormData.serviceAreas];
                            newServiceAreas[0].city = e.target.value;
                            setDriverFormData(prev => ({
                              ...prev,
                              serviceAreas: newServiceAreas
                            }));
                          }}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                          placeholder="Colombo"
                        />
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">District</label>
                        <input
                          type="text"
                          value={driverFormData.serviceAreas[0].district}
                          onChange={(e) => {
                            const newServiceAreas = [...driverFormData.serviceAreas];
                            newServiceAreas[0].district = e.target.value;
                            setDriverFormData(prev => ({
                              ...prev,
                              serviceAreas: newServiceAreas
                            }));
                          }}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                          placeholder="Colombo"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Financial Information */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-surface-900 flex items-center border-b border-surface-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      Financial Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">Base Rate (LKR)</label>
                        <input
                          type="number"
                          min="100"
                          value={driverFormData.financial.baseRate}
                          onChange={(e) => handleDriverInputChange('financial', 'baseRate', parseInt(e.target.value) || 500)}
                          className="input-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                          placeholder="500"
                        />
                      </div>
                      <div className="form-control group">
                        <label className="label mb-2 block text-sm font-bold text-surface-700">Payment Method</label>
                        <select
                          value={driverFormData.financial.paymentMethod}
                          onChange={(e) => handleDriverInputChange('financial', 'paymentMethod', e.target.value)}
                          className="select-field w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cash">Cash</option>
                          <option value="mobile_payment">Mobile Payment</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Review */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-surface-900 flex items-center border-b border-surface-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      Review Your Information
                    </h2>
                    <div className="bg-surface-50/80 rounded-xl p-6 space-y-4 border border-surface-200">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="font-bold text-surface-900 border-b border-surface-100 pb-2 mb-2">Personal Information</h3>
                        <p className="text-sm text-surface-600">
                          DOB: {driverFormData.personalInfo.dateOfBirth} |
                          Gender: {driverFormData.personalInfo.gender} |
                          Nationality: {driverFormData.personalInfo.nationality}
                        </p>
                        <p className="text-sm text-surface-600">
                          Emergency: {driverFormData.personalInfo.emergencyContact.name} ({driverFormData.personalInfo.emergencyContact.relationship}) - {driverFormData.personalInfo.emergencyContact.phone}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="font-bold text-surface-900 border-b border-surface-100 pb-2 mb-2">License Information</h3>
                        <p className="text-sm text-surface-600">
                          License: {driverFormData.license.licenseNumber} ({driverFormData.license.licenseType})
                        </p>
                        <p className="text-sm text-surface-600">
                          Authority: {driverFormData.license.issuingAuthority} | Class: {driverFormData.license.licenseClass}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="font-bold text-surface-900 border-b border-surface-100 pb-2 mb-2">Vehicle Experience</h3>
                        <p className="text-sm text-surface-600">
                          {driverFormData.vehicleTypes[0].vehicleType} - {driverFormData.vehicleTypes[0].experience} years
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="font-bold text-surface-900 border-b border-surface-100 pb-2 mb-2">Service Areas</h3>
                        <p className="text-sm text-surface-600">
                          {driverFormData.serviceAreas[0].city}, {driverFormData.serviceAreas[0].district}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="font-bold text-surface-900 border-b border-surface-100 pb-2 mb-2">Financial</h3>
                        <p className="text-sm text-surface-600">
                          Base Rate: LKR {driverFormData.financial.baseRate} |
                          Payment: {driverFormData.financial.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-surface-100">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`btn flex items-center px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-50 cursor-not-allowed text-surface-400' : 'text-surface-700 hover:bg-surface-100'}`}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="btn bg-primary-600 text-white flex items-center px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:scale-105 transition-all"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleDriverProfileSubmit}
                  disabled={loading}
                  className="btn bg-green-600 text-white flex items-center px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-600/30 hover:bg-green-700 hover:scale-105 transition-all"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {loading ? 'Completing...' : 'Complete Profile'}
                </button>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Regular profile page for non-drivers or completed drivers
  return (
    <div className="min-h-screen bg-surface-50 relative pb-20">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 rounded-b-[50px] shadow-2xl overflow-hidden z-0">
        <div className="absolute inset-0 bg-[url('/patterns/tropical-leaf.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-10 -left-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left Sidebar - Profile Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <GlassCard className="p-0 overflow-hidden backdrop-blur-xl border-white/20 shadow-xl sticky top-24">
              {/* Cover Area */}
              <div className="h-32 bg-gradient-to-r from-surface-200 to-surface-300 relative">
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border} uppercase tracking-wider`}>
                  {roleStyle.label}
                </div>
              </div>

              {/* Avatar & Info */}
              <div className="px-6 pb-8 text-center -mt-16">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-surface-100 mx-auto">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-200 text-surface-400">
                        <User className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-surface-900 mt-4">{formData.firstName} {formData.lastName}</h2>
                <p className="text-surface-500 text-sm mb-6">{formData.email}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-surface-50 rounded-xl border border-surface-100">
                    <p className="text-xs text-surface-500 uppercase tracking-wide">Status</p>
                    <p className="text-surface-900 font-semibold flex items-center justify-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Active
                    </p>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl border border-surface-100">
                    <p className="text-xs text-surface-500 uppercase tracking-wide">Joined</p>
                    <p className="text-surface-900 font-semibold">2024</p>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full btn bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="btn bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn bg-surface-100 text-surface-700 py-3 rounded-xl font-bold hover:bg-surface-200 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Right Content - Details */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
            {/* Personal Details Card */}
            <GlassCard className="p-8 backdrop-blur-xl border-white/60 shadow-lg">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-surface-900">Personal Details</h3>
                  <p className="text-surface-500 text-sm">Manage your personal information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control group">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-4 rounded-xl border font-medium transition-all duration-200 outline-none
                        ${isEditing
                        ? 'bg-white border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
                        : 'bg-surface-50 border-transparent text-surface-600'}`}
                  />
                </div>

                <div className="form-control group">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-4 rounded-xl border font-medium transition-all duration-200 outline-none
                        ${isEditing
                        ? 'bg-white border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
                        : 'bg-surface-50 border-transparent text-surface-600'}`}
                  />
                </div>

                <div className="form-control group">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled={true}
                      className="w-full p-4 pl-12 rounded-xl border border-transparent bg-surface-50 text-surface-500 cursor-not-allowed font-medium"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="form-control group">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full p-4 pl-12 rounded-xl border font-medium transition-all duration-200 outline-none
                            ${isEditing
                          ? 'bg-white border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
                          : 'bg-surface-50 border-transparent text-surface-600'}`}
                    />
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isEditing ? 'text-primary-500' : 'text-surface-400'}`} />
                  </div>
                </div>

                <div className="form-control group">
                  <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">Passport Number</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Passport No."
                    className={`w-full p-4 rounded-xl border font-medium transition-all duration-200 outline-none
                        ${isEditing
                        ? 'bg-white border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
                        : 'bg-surface-50 border-transparent text-surface-600'}`}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-bold text-surface-900 mb-4 mt-2 border-b border-surface-100 pb-2">Location & Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control group md:col-span-2">
                      <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Street Address"
                        className={`w-full p-4 rounded-xl border font-medium transition-all duration-200 outline-none
                                ${isEditing
                            ? 'bg-white border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
                            : 'bg-surface-50 border-transparent text-surface-600'}`}
                      />
                    </div>
                    <div className="form-control group">
                      <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="City"
                        className={`w-full p-4 rounded-xl border font-medium transition-all duration-200 outline-none
                                ${isEditing
                            ? 'bg-white border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
                            : 'bg-surface-50 border-transparent text-surface-600'}`}
                      />
                    </div>
                    <div className="form-control group">
                      <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">Region / State</label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="State or Province"
                        className={`w-full p-4 rounded-xl border font-medium transition-all duration-200 outline-none
                                ${isEditing
                            ? 'bg-white border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
                            : 'bg-surface-50 border-transparent text-surface-600'}`}
                      />
                    </div>
                    <div className="form-control group">
                      <label className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-primary-600 transition-colors">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Country"
                        className={`w-full p-4 rounded-xl border font-medium transition-all duration-200 outline-none
                                ${isEditing
                            ? 'bg-white border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
                            : 'bg-surface-50 border-transparent text-surface-600'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Sections for specific roles */}
            {user?.role === 'driver' && driverProfile && (
              <GlassCard className="p-8 backdrop-blur-xl border-white/60 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center text-secondary-700 shadow-inner">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-surface-900">Driver Statistics</h3>
                      <p className="text-surface-500 text-sm">Performance and ratings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/driver/dashboard')}
                    className="text-primary-600 font-bold text-sm hover:text-primary-700 hover:underline"
                  >
                    View Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-surface-50 rounded-2xl text-center border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all">
                    <h4 className="text-3xl font-display font-bold text-surface-900 mb-1">
                      {driverProfile.rating || 'N/A'}
                    </h4>
                    <div className="flex items-center justify-center text-yellow-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-xs text-surface-500 uppercase font-bold">Rating</p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-2xl text-center border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all">
                    <h4 className="text-3xl font-display font-bold text-surface-900 mb-1">
                      {driverProfile.tripsCompleted || 0}
                    </h4>
                    <p className="text-xs text-surface-500 uppercase font-bold mt-2">Trips Done</p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-2xl text-center border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all">
                    <h4 className="text-3xl font-display font-bold text-surface-900 mb-1">
                      {driverProfile.license?.licenseClass || '-'}
                    </h4>
                    <p className="text-xs text-surface-500 uppercase font-bold mt-2">Class</p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-2xl text-center border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all">
                    <h4 className="text-3xl font-display font-bold text-surface-900 mb-1 truncate px-2">
                      {driverProfile.vehicleTypes?.[0]?.vehicleType || '-'}
                    </h4>
                    <p className="text-xs text-surface-500 uppercase font-bold mt-2">Vehicle</p>
                  </div>
                </div>
              </GlassCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-surface-900">Security</h3>
                </div>
                <p className="text-sm text-surface-600 leading-relaxed mb-4">Update your password and manage 2FA settings.</p>
                <span className="text-blue-600 text-sm font-bold flex items-center">Manage Security <ArrowRight className="w-4 h-4 ml-1" /></span>
              </GlassCard>

              <GlassCard className="p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-l-purple-500">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-surface-900">Bookings</h3>
                </div>
                <p className="text-sm text-surface-600 leading-relaxed mb-4">View your past and upcoming trip history.</p>
                <span className="text-purple-600 text-sm font-bold flex items-center">View History <ArrowRight className="w-4 h-4 ml-1" /></span>
              </GlassCard>
            </div>

          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;