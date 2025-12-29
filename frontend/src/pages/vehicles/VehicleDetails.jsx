import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import tripService from '../../services/vehicles/tripService';
import {
  Car,
  Edit,
  Trash2,
  ArrowLeft,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Image as ImageIcon,
  Shield,
  Briefcase,
  Zap,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';

const VehicleDetails = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine the correct dashboard path based on user role
  const getDashboardPath = () => {
    if (user?.role === 'driver') {
      return '/driver/dashboard';
    } else if (user?.role === 'vehicle_owner') {
      return '/vehicle-owner/dashboard';
    }
    return '/vehicles'; // Default to vehicles list for public users
  };

  // Check if user can edit/delete this vehicle
  const canEditVehicle = () => {
    if (!user) return false;
    if (!vehicle) return false;

    // Get user ID - handle both _id and id fields
    const userId = user._id || user.id;
    if (!userId) return false;

    // Check if user is the owner of this specific vehicle
    // Handle both cases: owner as object with _id or owner as string ID
    let isOwner = false;

    if (vehicle.owner) {
      if (typeof vehicle.owner === 'object' && vehicle.owner._id) {
        // Owner is populated object
        isOwner = vehicle.owner._id.toString() === userId.toString();
      } else if (typeof vehicle.owner === 'string') {
        // Owner is just the ID string
        isOwner = vehicle.owner.toString() === userId.toString();
      }
    }

    // Allow editing if user is admin, staff, or the actual owner
    return user.role === 'admin' || user.role === 'staff' || isOwner;
  };

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await tripService.vehicleService.getVehicleById(vehicleId);

      if (response.success === true || response.success === 'success') {
        setVehicle(response.data);
      } else {
        setError('Failed to load vehicle details');
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError('Failed to load vehicle details');
      toast.error('Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${vehicle.name}"? This action cannot be undone.`)) {
      try {
        await tripService.vehicleService.deleteVehicle(vehicleId);
        toast.success('Vehicle deleted successfully!');
        navigate(getDashboardPath());
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
      active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
      suspended: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      maintenance: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${config.color}`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {status}
      </span>
    );
  };

  const formatPrice = (price, currency = 'LKR') => {
    if (price === undefined || price === null) {
      return `${currency} 0`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-surface-200 max-w-md">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h3 className="text-xl font-bold font-display text-surface-900 mb-2">Error loading vehicle</h3>
          <p className="text-surface-600 mb-6">{error || 'Vehicle not found'}</p>
          <button
            onClick={() => navigate(getDashboardPath())}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-200/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(getDashboardPath())}
            className="flex items-center text-surface-600 hover:text-primary-600 font-medium transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            {user?.role === 'driver' || user?.role === 'vehicle_owner' ? 'Back to Dashboard' : 'Back to Vehicles'}
          </button>

          <GlassCard className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold font-display text-surface-900">{vehicle.name}</h1>
                  {getStatusBadge(vehicle.status || 'pending')}
                </div>
                <div className="flex items-center text-surface-600 text-lg">
                  <Car className="w-5 h-5 mr-2 text-primary-500" />
                  <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                  <span className="mx-2 text-surface-400">•</span>
                  <span className="text-surface-500">{vehicle.year}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {canEditVehicle() ? (
                  <>
                    <button
                      onClick={() => {
                        if (user.role === 'admin' || user.role === 'staff') {
                          navigate(`/admin/vehicles/${vehicleId}/edit`);
                        } else if (user.role === 'driver') {
                          navigate(`/driver/vehicles/${vehicleId}/edit`);
                        } else if (user.role === 'vehicle_owner') {
                          navigate(`/vehicle-owner/vehicles/${vehicleId}/edit`);
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-surface-300 shadow-sm text-sm font-bold rounded-xl text-surface-700 bg-white hover:bg-surface-50 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Vehicle
                    </button>

                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate(`/booking?vehicle=${vehicleId}`)}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-300 font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-1"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-primary-500" />
                Vehicle Images
              </h2>

              {vehicle.images && vehicle.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="aspect-video rounded-2xl overflow-hidden bg-surface-100 shadow-inner">
                    <img
                      src={vehicle.images[selectedImageIndex]?.url}
                      alt={vehicle.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  {/* Thumbnails */}
                  {vehicle.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {vehicle.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-primary-500 ring-2 ring-primary-200 ring-offset-1' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                        >
                          <img
                            src={image.url}
                            alt={`${vehicle.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm">
                              Primary
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface-50 rounded-2xl border-2 border-dashed border-surface-200">
                  <ImageIcon className="mx-auto h-12 w-12 text-surface-300 mb-2" />
                  <h3 className="text-surface-900 font-bold">No images uploaded</h3>
                  <p className="text-sm text-surface-500">No images available for this vehicle yet.</p>
                </div>
              )}
            </GlassCard>

            {/* Description */}
            {vehicle.description && (
              <GlassCard className="p-8">
                <h2 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-primary-500" />
                  Description
                </h2>
                <div className="prose prose-blue max-w-none text-surface-600 leading-relaxed bg-surface-50/50 p-6 rounded-2xl border border-surface-100">
                  <p>{vehicle.description}</p>
                </div>
              </GlassCard>
            )}

            {/* Amenities */}
            <GlassCard className="p-8">
              <h2 className="text-xl font-bold font-display text-surface-900 mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-secondary-500" />
                Features & Amenities
              </h2>

              {vehicle.features ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(vehicle.features).map(([feature, available]) => (
                    <div
                      key={feature}
                      className={`flex items-center p-4 rounded-xl border transition-all ${available
                          ? 'bg-surface-50 border-surface-100 text-surface-900'
                          : 'bg-surface-50/30 border-transparent text-surface-400 opacity-60'
                        }`}
                    >
                      {available ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-surface-300 mr-3 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-surface-500 italic">No amenities information available</p>
              )}
            </GlassCard>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <GlassCard className="p-6 sticky top-24">
              <h3 className="text-lg font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                <Briefcase className="w-5 h-5 mr-2 text-primary-500" />
                Vehicle Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center text-surface-600">
                    <Car className="h-4 w-4 mr-2 text-surface-400 group-hover:text-primary-500 transition-colors" />
                    <span className="text-sm font-medium">Type</span>
                  </div>
                  <span className="text-sm font-bold text-surface-900 capitalize">{vehicle.vehicleType}</span>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center text-surface-600">
                    <Users className="h-4 w-4 mr-2 text-surface-400 group-hover:text-primary-500 transition-colors" />
                    <span className="text-sm font-medium">Capacity</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-surface-900 block">{vehicle.capacity?.passengers || 0} Passengers</span>
                    {vehicle.capacity?.luggage > 0 && <span className="text-xs text-surface-500 font-medium">{vehicle.capacity.luggage} Luggage</span>}
                  </div>
                </div>

                {vehicle.color && (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center text-surface-600">
                      <div className="h-4 w-4 rounded-full border border-surface-200 mr-2" style={{ backgroundColor: vehicle.color.toLowerCase() }}></div>
                      <span className="text-sm font-medium">Color</span>
                    </div>
                    <span className="text-sm font-bold text-surface-900 capitalize">{vehicle.color}</span>
                  </div>
                )}

                <div className="flex items-center justify-between group">
                  <div className="flex items-center text-surface-600">
                    <Shield className="h-4 w-4 mr-2 text-surface-400 group-hover:text-primary-500 transition-colors" />
                    <span className="text-sm font-medium">License</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-surface-900 bg-surface-100 px-2 py-1 rounded">{vehicle.licensePlate}</span>
                </div>
              </div>
            </GlassCard>

            {/* Pricing */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
                Pricing
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
                  <span className="text-sm font-medium text-surface-600">Base Price</span>
                  <span className="text-lg font-bold text-primary-600 font-display">
                    {formatPrice(vehicle.pricing?.basePrice, vehicle.pricing?.currency)}
                  </span>
                </div>

                {vehicle.pricing?.perKmRate > 0 && (
                  <div className="flex items-center justify-between border-b border-dashed border-surface-200 pb-2">
                    <span className="text-sm text-surface-600">Per KM</span>
                    <span className="text-sm font-bold text-surface-900">
                      {formatPrice(vehicle.pricing?.perKmRate, vehicle.pricing?.currency)}
                    </span>
                  </div>
                )}

                {vehicle.pricing?.hourlyRate > 0 && (
                  <div className="flex items-center justify-between border-b border-dashed border-surface-200 pb-2">
                    <span className="text-sm text-surface-600">Hourly Rate</span>
                    <span className="text-sm font-bold text-surface-900">
                      {formatPrice(vehicle.pricing?.hourlyRate, vehicle.pricing?.currency)}
                    </span>
                  </div>
                )}

                {vehicle.pricing?.dailyRate > 0 && (
                  <div className="flex items-center justify-between border-b border-dashed border-surface-200 pb-2">
                    <span className="text-sm text-surface-600">Daily Rate</span>
                    <span className="text-sm font-bold text-surface-900">
                      {formatPrice(vehicle.pricing?.dailyRate, vehicle.pricing?.currency)}
                    </span>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Availability */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                Availability
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-surface-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">Working Hours</p>
                    <p className="text-sm font-bold text-surface-900 bg-surface-50 px-3 py-1.5 rounded-lg inline-block text-center border border-surface-100">
                      {vehicle.availability?.workingHours?.start || 'N/A'} - {vehicle.availability?.workingHours?.end || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-surface-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">Working Days</p>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.availability?.workingDays?.map(day => (
                        <span key={day} className="text-xs font-bold bg-primary-50 text-primary-700 px-2 py-1 rounded border border-primary-100 capitalize">
                          {day}
                        </span>
                      )) || <span className="text-sm text-surface-500 italic">No specific days</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-surface-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">Minimum Notice</p>
                    <p className="text-sm font-medium text-surface-700">
                      {vehicle.availability?.minimumBookingNotice || 0} hours
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Statistics */}
            <GlassCard className="p-6 bg-gradient-to-br from-surface-50 to-white">
              <h3 className="text-lg font-bold font-display text-surface-900 mb-6 flex items-center border-b border-surface-100 pb-4">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Performance
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-surface-100 shadow-sm text-center">
                  <span className="text-xs text-surface-500 font-bold uppercase block mb-1">Trips</span>
                  <span className="text-xl font-black text-surface-900">{vehicle.stats?.totalTrips || 0}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-surface-100 shadow-sm text-center">
                  <span className="text-xs text-surface-500 font-bold uppercase block mb-1">Rating</span>
                  <div className="flex items-center justify-center text-xl font-black text-surface-900">
                    {vehicle.stats?.averageRating || 0}
                    <Star className="h-4 w-4 text-yellow-400 ml-1 fill-current" />
                  </div>
                </div>
                <div className="col-span-2 bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-xl border border-primary-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-primary-700 font-bold uppercase block">Earnings</span>
                    <span className="text-lg font-black text-primary-900">
                      {formatPrice(vehicle.stats?.totalEarnings || 0)}
                    </span>
                  </div>
                  <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Approval Details */}
            {vehicle.approvalDetails && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold font-display text-surface-900 mb-4">Approval Status</h3>

                <div className="space-y-3 text-sm">
                  {vehicle.approvalDetails.approvedAt && (
                    <div className="flex justify-between border-b border-surface-100 pb-2">
                      <span className="text-surface-600">Approved On</span>
                      <span className="font-medium text-surface-900">
                        {formatDate(vehicle.approvalDetails.approvedAt)}
                      </span>
                    </div>
                  )}

                  {vehicle.approvalDetails.rejectionReason && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-red-800 font-bold text-xs uppercase mb-1">Rejection Reason</p>
                      <p className="text-red-700">
                        {vehicle.approvalDetails.rejectionReason}
                      </p>
                    </div>
                  )}

                  {vehicle.approvalDetails.adminNotes && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-blue-800 font-bold text-xs uppercase mb-1">Admin Notes</p>
                      <p className="text-blue-700">
                        {vehicle.approvalDetails.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
