import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVehicle } from '../../context/vehicles/VehicleContext';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Copy,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Car
} from 'lucide-react';
import toast from 'react-hot-toast';

const VehiclePricingManagement = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicleActions } = useVehicle();
  
  const [vehicle, setVehicle] = useState(null);
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    pricingType: '',
    isActive: '',
    search: ''
  });
  
  // Pricing rule form data
  const [pricingData, setPricingData] = useState({
    pricingType: 'standard',
    name: '',
    description: '',
    basePricing: {
      hourlyRate: 0,
      dailyRate: 0,
      weeklyRate: 0,
      monthlyRate: 0,
      perKmRate: 0,
      minimumCharge: 0,
      currency: 'USD'
    },
    dynamicPricing: {
      enabled: false,
      factors: []
    },
    seasonalPricing: {
      enabled: false,
      seasons: []
    },
    timeBasedPricing: {
      enabled: false,
      timeSlots: []
    },
    distancePricing: {
      enabled: false,
      tiers: []
    },
    eventPricing: {
      enabled: false,
      events: []
    },
    discounts: [],
    surcharges: [],
    isActive: true,
    priority: 1
  });
  
  useEffect(() => {
    if (vehicleId) {
      fetchVehicleAndPricing();
    }
  }, [vehicleId]);
  
  const fetchVehicleAndPricing = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicle details
      const vehicleData = await vehicleActions.getVehicleById(vehicleId);
      if (vehicleData) {
        setVehicle(vehicleData);
      }
      
      // Fetch pricing rules
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setPricingRules(data.data.pricingRules);
      }
      
    } catch (error) {
      console.error('Error fetching vehicle and pricing:', error);
      toast.error('Failed to load vehicle pricing');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load pricing analytics');
    }
  };
  
  const handleCreatePricingRule = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(pricingData)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Pricing rule created successfully!');
        setShowCreateModal(false);
        fetchVehicleAndPricing();
        resetPricingForm();
      } else {
        toast.error(data.message || 'Failed to create pricing rule');
      }
    } catch (error) {
      console.error('Error creating pricing rule:', error);
      toast.error('Failed to create pricing rule');
    }
  };
  
  const handleUpdatePricingRule = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing/${editingRule._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(pricingData)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Pricing rule updated successfully!');
        setShowEditModal(false);
        setEditingRule(null);
        fetchVehicleAndPricing();
        resetPricingForm();
      } else {
        toast.error(data.message || 'Failed to update pricing rule');
      }
    } catch (error) {
      console.error('Error updating pricing rule:', error);
      toast.error('Failed to update pricing rule');
    }
  };
  
  const handleDeletePricingRule = async (ruleId, ruleName) => {
    if (window.confirm(`Are you sure you want to delete "${ruleName}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}/pricing/${ruleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          toast.success('Pricing rule deleted successfully!');
          fetchVehicleAndPricing();
        } else {
          toast.error(data.message || 'Failed to delete pricing rule');
        }
      } catch (error) {
        console.error('Error deleting pricing rule:', error);
        toast.error('Failed to delete pricing rule');
      }
    }
  };
  
  const handleTogglePricingRule = async (ruleId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing/${ruleId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success(data.message);
        fetchVehicleAndPricing();
      } else {
        toast.error(data.message || 'Failed to toggle pricing rule');
      }
    } catch (error) {
      console.error('Error toggling pricing rule:', error);
      toast.error('Failed to toggle pricing rule');
    }
  };
  
  const handleDuplicatePricingRule = async (ruleId, ruleName) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing/${ruleId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: `${ruleName} (Copy)` })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Pricing rule duplicated successfully!');
        fetchVehicleAndPricing();
      } else {
        toast.error(data.message || 'Failed to duplicate pricing rule');
      }
    } catch (error) {
      console.error('Error duplicating pricing rule:', error);
      toast.error('Failed to duplicate pricing rule');
    }
  };
  
  const resetPricingForm = () => {
    setPricingData({
      pricingType: 'standard',
      name: '',
      description: '',
      basePricing: {
        hourlyRate: 0,
        dailyRate: 0,
        weeklyRate: 0,
        monthlyRate: 0,
        perKmRate: 0,
        minimumCharge: 0,
        currency: 'USD'
      },
      dynamicPricing: {
        enabled: false,
        factors: []
      },
      seasonalPricing: {
        enabled: false,
        seasons: []
      },
      timeBasedPricing: {
        enabled: false,
        timeSlots: []
      },
      distancePricing: {
        enabled: false,
        tiers: []
      },
      eventPricing: {
        enabled: false,
        events: []
      },
      discounts: [],
      surcharges: [],
      isActive: true,
      priority: 1
    });
  };
  
  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setPricingData(rule);
    setShowEditModal(true);
  };
  
  const getFilteredRules = () => {
    let filtered = pricingRules;
    
    if (filters.pricingType) {
      filtered = filtered.filter(rule => rule.pricingType === filters.pricingType);
    }
    
    if (filters.isActive !== '') {
      filtered = filtered.filter(rule => rule.isActive === (filters.isActive === 'true'));
    }
    
    if (filters.search) {
      filtered = filtered.filter(rule => 
        rule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        rule.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const getPricingTypeIcon = (type) => {
    switch (type) {
      case 'standard': return <DollarSign className="w-5 h-5" />;
      case 'dynamic': return <TrendingUp className="w-5 h-5" />;
      case 'seasonal': return <Calendar className="w-5 h-5" />;
      case 'event': return <Star className="w-5 h-5" />;
      case 'custom': return <Settings className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };
  
  const getPricingTypeColor = (type) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'dynamic': return 'bg-green-100 text-green-800';
      case 'seasonal': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
              {vehicle && (
                <p className="text-lg text-gray-600 mt-2">
                  {vehicle.name} - {vehicle.make} {vehicle.model}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/vehicle-owner/vehicles/${vehicleId}`)}
                className="btn btn-outline"
              >
                <Car className="w-4 h-4 mr-2" />
                Back to Vehicle
              </button>
              <button
                onClick={fetchVehicleAndPricing}
                className="btn btn-outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => {
                  fetchAnalytics();
                  setShowAnalyticsModal(true);
                }}
                className="btn btn-secondary"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Pricing Rule
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search pricing rules..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.pricingType}
              onChange={(e) => setFilters(prev => ({ ...prev, pricingType: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="standard">Standard</option>
              <option value="dynamic">Dynamic</option>
              <option value="seasonal">Seasonal</option>
              <option value="event">Event</option>
              <option value="custom">Custom</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {getFilteredRules().length} of {pricingRules.length} rules
            </div>
          </div>
        </div>
        
        {/* Pricing Rules List */}
        {getFilteredRules().length > 0 ? (
          <div className="space-y-4">
            {getFilteredRules().map((rule) => (
              <div key={rule._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${getPricingTypeColor(rule.pricingType)}`}>
                        {getPricingTypeIcon(rule.pricingType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPricingTypeColor(rule.pricingType)}`}>
                            {rule.pricingType.charAt(0).toUpperCase() + rule.pricingType.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-sm text-gray-500">Priority: {rule.priority}</span>
                        </div>
                      </div>
                    </div>
                    
                    {rule.description && (
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {rule.basePricing.hourlyRate > 0 ? `${rule.basePricing.currency} ${rule.basePricing.hourlyRate}/hr` : 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {rule.basePricing.dailyRate > 0 ? `${rule.basePricing.currency} ${rule.basePricing.dailyRate}/day` : 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {rule.basePricing.perKmRate > 0 ? `${rule.basePricing.currency} ${rule.basePricing.perKmRate}/km` : 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Min: {rule.basePricing.minimumCharge > 0 ? `${rule.basePricing.currency} ${rule.basePricing.minimumCharge}` : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Advanced Features */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rule.seasonalPricing.enabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Calendar className="w-3 h-3 mr-1" />
                          Seasonal
                        </span>
                      )}
                      {rule.timeBasedPricing.enabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Time-based
                        </span>
                      )}
                      {rule.dynamicPricing.enabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Dynamic
                        </span>
                      )}
                      {rule.eventPricing.enabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Event
                        </span>
                      )}
                      {rule.discounts.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          {rule.discounts.length} Discounts
                        </span>
                      )}
                      {rule.surcharges.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {rule.surcharges.length} Surcharges
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="btn btn-sm btn-outline"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicatePricingRule(rule._id, rule.name)}
                        className="btn btn-sm btn-outline"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTogglePricingRule(rule._id)}
                        className={`btn btn-sm ${rule.isActive ? 'btn-warning' : 'btn-success'}`}
                      >
                        {rule.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeletePricingRule(rule._id, rule.name)}
                        className="btn btn-sm btn-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filters.search || filters.pricingType || filters.isActive !== ''
                ? 'No pricing rules match your filters'
                : 'No pricing rules yet'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.pricingType || filters.isActive !== ''
                ? 'Try adjusting your search criteria or clear filters to see all rules.'
                : 'Get started by creating your first pricing rule.'
              }
            </p>
            {(filters.search || filters.pricingType || filters.isActive !== '') && (
              <button
                onClick={() => setFilters({ pricingType: '', isActive: '', search: '' })}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
            {!filters.search && !filters.pricingType && filters.isActive === '' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Pricing Rule
              </button>
            )}
          </div>
        )}
        
        {/* Create Pricing Rule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create Pricing Rule</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      value={pricingData.name}
                      onChange={(e) => setPricingData(prev => ({ ...prev, name: e.target.value }))}
                      className="input input-bordered w-full"
                      placeholder="Standard Pricing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pricing Type
                    </label>
                    <select
                      value={pricingData.pricingType}
                      onChange={(e) => setPricingData(prev => ({ ...prev, pricingType: e.target.value }))}
                      className="select select-bordered w-full"
                    >
                      <option value="standard">Standard</option>
                      <option value="dynamic">Dynamic</option>
                      <option value="seasonal">Seasonal</option>
                      <option value="event">Event</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={pricingData.description}
                    onChange={(e) => setPricingData(prev => ({ ...prev, description: e.target.value }))}
                    className="textarea textarea-bordered w-full"
                    rows="3"
                    placeholder="Describe this pricing rule..."
                  />
                </div>
                
                <div className="divider">Base Pricing</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <input
                      type="number"
                      value={pricingData.basePricing.hourlyRate}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, hourlyRate: parseFloat(e.target.value) || 0 }
                      }))}
                      className="input input-bordered w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Rate
                    </label>
                    <input
                      type="number"
                      value={pricingData.basePricing.dailyRate}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, dailyRate: parseFloat(e.target.value) || 0 }
                      }))}
                      className="input input-bordered w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per KM Rate
                    </label>
                    <input
                      type="number"
                      value={pricingData.basePricing.perKmRate}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, perKmRate: parseFloat(e.target.value) || 0 }
                      }))}
                      className="input input-bordered w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Charge
                    </label>
                    <input
                      type="number"
                      value={pricingData.basePricing.minimumCharge}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, minimumCharge: parseFloat(e.target.value) || 0 }
                      }))}
                      className="input input-bordered w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={pricingData.basePricing.currency}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, currency: e.target.value }
                      }))}
                      className="select select-bordered w-full"
                    >
                      <option value="USD">USD</option>
                      <option value="LKR">LKR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={pricingData.priority}
                      onChange={(e) => setPricingData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                      className="input input-bordered w-full"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={pricingData.isActive}
                      onChange={(e) => setPricingData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="checkbox checkbox-primary mr-2"
                    />
                    <span className="label-text">Active</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetPricingForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePricingRule}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Pricing Rule Modal */}
        {showEditModal && editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Edit Pricing Rule</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      value={pricingData.name}
                      onChange={(e) => setPricingData(prev => ({ ...prev, name: e.target.value }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pricing Type
                    </label>
                    <select
                      value={pricingData.pricingType}
                      onChange={(e) => setPricingData(prev => ({ ...prev, pricingType: e.target.value }))}
                      className="select select-bordered w-full"
                    >
                      <option value="standard">Standard</option>
                      <option value="dynamic">Dynamic</option>
                      <option value="seasonal">Seasonal</option>
                      <option value="event">Event</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={pricingData.description}
                    onChange={(e) => setPricingData(prev => ({ ...prev, description: e.target.value }))}
                    className="textarea textarea-bordered w-full"
                    rows="3"
                  />
                </div>
                
                <div className="divider">Base Pricing</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <input
                      type="number"
                      value={pricingData.basePricing.hourlyRate}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, hourlyRate: parseFloat(e.target.value) || 0 }
                      }))}
                      className="input input-bordered w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Rate
                    </label>
                    <input
                      type="number"
                      value={pricingData.basePricing.dailyRate}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, dailyRate: parseFloat(e.target.value) || 0 }
                      }))}
                      className="input input-bordered w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per KM Rate
                    </label>
                    <input
                      type="number"
                      value={pricingData.basePricing.perKmRate}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, perKmRate: parseFloat(e.target.value) || 0 }
                      }))}
                      className="input input-bordered w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Charge
                    </label>
                    <input
                      type="number"
                      value={pricingData.basePricing.minimumCharge}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, minimumCharge: parseFloat(e.target.value) || 0 }
                      }))}
                      className="input input-bordered w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={pricingData.basePricing.currency}
                      onChange={(e) => setPricingData(prev => ({
                        ...prev,
                        basePricing: { ...prev.basePricing, currency: e.target.value }
                      }))}
                      className="select select-bordered w-full"
                    >
                      <option value="USD">USD</option>
                      <option value="LKR">LKR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={pricingData.priority}
                      onChange={(e) => setPricingData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                      className="input input-bordered w-full"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={pricingData.isActive}
                      onChange={(e) => setPricingData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="checkbox checkbox-primary mr-2"
                    />
                    <span className="label-text">Active</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRule(null);
                    resetPricingForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePricingRule}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Rule
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Modal */}
        {showAnalyticsModal && analytics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Pricing Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Pricing Rules Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Rules:</span>
                      <span className="font-semibold">{analytics.totalRules}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Rules:</span>
                      <span className="font-semibold text-green-600">{analytics.activeRules}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Inactive Rules:</span>
                      <span className="font-semibold text-red-600">{analytics.totalRules - analytics.activeRules}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Pricing Types</h4>
                  <div className="space-y-2">
                    {analytics.pricingStats.map((stat) => (
                      <div key={stat._id} className="flex justify-between">
                        <span className="text-sm text-gray-600 capitalize">{stat._id}:</span>
                        <span className="font-semibold">{stat.count} ({stat.activeCount} active)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Priority Distribution</h4>
                <div className="space-y-2">
                  {analytics.priorityStats.map((stat) => (
                    <div key={stat._id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Priority {stat._id}:</span>
                      <span className="font-semibold">{stat.count} rules</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclePricingManagement;
