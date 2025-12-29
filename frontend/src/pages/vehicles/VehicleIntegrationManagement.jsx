import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVehicle } from '../../context/vehicles/VehicleContext';
import {
  Link,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  RefreshCw,
  Play,
  Pause,
  TestTube,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Car,
  Globe,
  Zap as ZapIcon,
  Activity as ActivityIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const VehicleIntegrationManagement = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicleActions } = useVehicle();
  
  const [vehicle, setVehicle] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    platform: '',
    status: '',
    search: ''
  });
  
  // Integration form data
  const [integrationData, setIntegrationData] = useState({
    platform: '',
    platformName: '',
    integrationType: 'api',
    credentials: {
      apiKey: '',
      apiSecret: '',
      accessToken: '',
      refreshToken: '',
      webhookUrl: '',
      endpoint: '',
      username: '',
      password: ''
    },
    settings: {
      autoAccept: false,
      autoReject: false,
      minAdvanceBooking: 0,
      maxAdvanceBooking: 30,
      workingHours: {
        start: '',
        end: ''
      },
      workingDays: [],
      serviceAreas: [],
      pricingRules: {
        usePlatformPricing: false,
        markupPercentage: 0,
        markupAmount: 0,
        currency: 'USD'
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        webhookNotifications: false
      },
      syncSettings: {
        syncFrequency: 'realtime',
        syncBookings: true,
        syncAvailability: true,
        syncPricing: false,
        syncStatus: true
      }
    },
    status: 'pending'
  });
  
  useEffect(() => {
    if (vehicleId) {
      fetchVehicleAndIntegrations();
      fetchAvailablePlatforms();
    }
  }, [vehicleId]);
  
  const fetchVehicleAndIntegrations = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicle details
      const vehicleData = await vehicleActions.getVehicleById(vehicleId);
      if (vehicleData) {
        setVehicle(vehicleData);
      }
      
      // Fetch integrations
      const response = await fetch(`/api/vehicles/${vehicleId}/integrations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setIntegrations(data.data.integrations);
      }
      
    } catch (error) {
      console.error('Error fetching vehicle and integrations:', error);
      toast.error('Failed to load vehicle integrations');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailablePlatforms = async () => {
    try {
      const response = await fetch('/api/vehicles/integrations/platforms');
      const data = await response.json();
      if (data.status === 'success') {
        setPlatforms(data.data.platforms);
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
      toast.error('Failed to load available platforms');
    }
  };
  
  const fetchAnalytics = async (integrationId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/integrations/${integrationId}/analytics`, {
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
      toast.error('Failed to load integration analytics');
    }
  };
  
  const handleCreateIntegration = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(integrationData)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Integration created successfully!');
        setShowCreateModal(false);
        fetchVehicleAndIntegrations();
        resetIntegrationForm();
      } else {
        toast.error(data.message || 'Failed to create integration');
      }
    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error('Failed to create integration');
    }
  };
  
  const handleUpdateIntegration = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/integrations/${editingIntegration._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(integrationData)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Integration updated successfully!');
        setShowEditModal(false);
        setEditingIntegration(null);
        fetchVehicleAndIntegrations();
        resetIntegrationForm();
      } else {
        toast.error(data.message || 'Failed to update integration');
      }
    } catch (error) {
      console.error('Error updating integration:', error);
      toast.error('Failed to update integration');
    }
  };
  
  const handleDeleteIntegration = async (integrationId, platformName) => {
    if (window.confirm(`Are you sure you want to delete "${platformName}" integration? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}/integrations/${integrationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          toast.success('Integration deleted successfully!');
          fetchVehicleAndIntegrations();
        } else {
          toast.error(data.message || 'Failed to delete integration');
        }
      } catch (error) {
        console.error('Error deleting integration:', error);
        toast.error('Failed to delete integration');
      }
    }
  };
  
  const handleTestIntegration = async (integrationId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/integrations/${integrationId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Connection test successful!');
      } else {
        toast.error(data.message || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      toast.error('Failed to test integration');
    }
  };
  
  const handleSyncIntegration = async (integrationId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Integration synced successfully!');
        fetchVehicleAndIntegrations();
      } else {
        toast.error(data.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast.error('Failed to sync integration');
    }
  };
  
  const handleToggleIntegration = async (integrationId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/integrations/${integrationId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success(data.message);
        fetchVehicleAndIntegrations();
      } else {
        toast.error(data.message || 'Failed to toggle integration');
      }
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Failed to toggle integration');
    }
  };
  
  const resetIntegrationForm = () => {
    setIntegrationData({
      platform: '',
      platformName: '',
      integrationType: 'api',
      credentials: {
        apiKey: '',
        apiSecret: '',
        accessToken: '',
        refreshToken: '',
        webhookUrl: '',
        endpoint: '',
        username: '',
        password: ''
      },
      settings: {
        autoAccept: false,
        autoReject: false,
        minAdvanceBooking: 0,
        maxAdvanceBooking: 30,
        workingHours: {
          start: '',
          end: ''
        },
        workingDays: [],
        serviceAreas: [],
        pricingRules: {
          usePlatformPricing: false,
          markupPercentage: 0,
          markupAmount: 0,
          currency: 'USD'
        },
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          webhookNotifications: false
        },
        syncSettings: {
          syncFrequency: 'realtime',
          syncBookings: true,
          syncAvailability: true,
          syncPricing: false,
          syncStatus: true
        }
      },
      status: 'pending'
    });
  };
  
  const handleEditIntegration = (integration) => {
    setEditingIntegration(integration);
    setIntegrationData(integration);
    setShowEditModal(true);
  };
  
  const getFilteredIntegrations = () => {
    let filtered = integrations;
    
    if (filters.platform) {
      filtered = filtered.filter(integration => integration.platform === filters.platform);
    }
    
    if (filters.status) {
      filtered = filtered.filter(integration => integration.status === filters.status);
    }
    
    if (filters.search) {
      filtered = filtered.filter(integration => 
        integration.platformName.toLowerCase().includes(filters.search.toLowerCase()) ||
        integration.platform.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive': return <Pause className="w-5 h-5 text-gray-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'suspended': return <X className="w-5 h-5 text-red-600" />;
      default: return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-red-100 text-red-800';
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
              <h1 className="text-3xl font-bold text-gray-900">External Booking Integrations</h1>
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
                onClick={fetchVehicleAndIntegrations}
                className="btn btn-outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Integration
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search integrations..."
                className="input input-bordered w-full"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <select
              className="select select-bordered w-full"
              value={filters.platform}
              onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
            >
              <option value="">All Platforms</option>
              <option value="uber">Uber</option>
              <option value="lyft">Lyft</option>
              <option value="grab">Grab</option>
              <option value="ola">Ola</option>
              <option value="bolt">Bolt</option>
              <option value="custom">Custom</option>
            </select>
            
            <select
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <ActivityIcon className="h-4 w-4 mr-2" />
              {getFilteredIntegrations().length} of {integrations.length} integrations
            </div>
          </div>
        </div>
        
        {/* Integrations List */}
        {getFilteredIntegrations().length > 0 ? (
          <div className="space-y-4">
            {getFilteredIntegrations().map((integration) => (
              <div key={integration._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{integration.platformName}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                            {getStatusIcon(integration.status)}
                            <span className="ml-1">{integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}</span>
                          </span>
                          <span className="text-sm text-gray-500 capitalize">{integration.platform}</span>
                          <span className="text-sm text-gray-500">{integration.integrationType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {integration.statistics.totalRevenue > 0 ? `$${integration.statistics.totalRevenue}` : 'No revenue'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ActivityIcon className="h-4 w-4 mr-2" />
                        {integration.statistics.totalBookings} bookings
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {integration.successRate.toFixed(1)}% success rate
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : 'Never synced'}
                      </div>
                    </div>
                    
                    {/* Sync Status */}
                    <div className="mt-3 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        integration.syncStatus === 'success' ? 'bg-green-100 text-green-800' :
                        integration.syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                        integration.syncStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <ZapIcon className="w-3 h-3 mr-1" />
                        {integration.syncStatus === 'success' ? 'Synced' :
                         integration.syncStatus === 'error' ? 'Sync Error' :
                         integration.syncStatus === 'pending' ? 'Syncing' :
                         'Never Synced'}
                      </span>
                      {integration.needsSync && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Needs Sync
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditIntegration(integration)}
                        className="btn btn-sm btn-outline"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTestIntegration(integration._id)}
                        className="btn btn-sm btn-info"
                      >
                        <TestTube className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSyncIntegration(integration._id)}
                        className="btn btn-sm btn-secondary"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          fetchAnalytics(integration._id);
                          setShowAnalyticsModal(true);
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleIntegration(integration._id)}
                        className={`btn btn-sm ${integration.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                      >
                        {integration.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteIntegration(integration._id, integration.platformName)}
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
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filters.search || filters.platform || filters.status
                ? 'No integrations match your filters'
                : 'No integrations yet'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.platform || filters.status
                ? 'Try adjusting your search criteria or clear filters to see all integrations.'
                : 'Get started by connecting to external booking platforms.'
              }
            </p>
            {(filters.search || filters.platform || filters.status) && (
              <button
                onClick={() => setFilters({ platform: '', status: '', search: '' })}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
            {!filters.search && !filters.platform && !filters.status && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Integration
              </button>
            )}
          </div>
        )}
        
        {/* Create Integration Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create Integration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={integrationData.platform}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, platform: e.target.value }))}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select Platform</option>
                      {platforms.map(platform => (
                        <option key={platform.id} value={platform.id}>{platform.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={integrationData.platformName}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, platformName: e.target.value }))}
                      className="input input-bordered w-full"
                      placeholder="My Uber Integration"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Integration Type
                  </label>
                  <select
                    value={integrationData.integrationType}
                    onChange={(e) => setIntegrationData(prev => ({ ...prev, integrationType: e.target.value }))}
                    className="select select-bordered w-full"
                  >
                    <option value="api">API</option>
                    <option value="webhook">Webhook</option>
                    <option value="manual">Manual</option>
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                  </select>
                </div>
                
                <div className="divider">API Credentials</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={integrationData.credentials.apiKey}
                      onChange={(e) => setIntegrationData(prev => ({
                        ...prev,
                        credentials: { ...prev.credentials, apiKey: e.target.value }
                      }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Secret
                    </label>
                    <input
                      type="password"
                      value={integrationData.credentials.apiSecret}
                      onChange={(e) => setIntegrationData(prev => ({
                        ...prev,
                        credentials: { ...prev.credentials, apiSecret: e.target.value }
                      }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={integrationData.credentials.endpoint}
                    onChange={(e) => setIntegrationData(prev => ({
                      ...prev,
                      credentials: { ...prev.credentials, endpoint: e.target.value }
                    }))}
                    className="input input-bordered w-full"
                    placeholder="https://api.platform.com"
                  />
                </div>
                
                <div className="divider">Settings</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sync Frequency
                    </label>
                    <select
                      value={integrationData.settings.syncSettings.syncFrequency}
                      onChange={(e) => setIntegrationData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          syncSettings: { ...prev.settings.syncSettings, syncFrequency: e.target.value }
                        }
                      }))}
                      className="select select-bordered w-full"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="5min">Every 5 minutes</option>
                      <option value="15min">Every 15 minutes</option>
                      <option value="30min">Every 30 minutes</option>
                      <option value="1hour">Every hour</option>
                      <option value="manual">Manual only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={integrationData.settings.pricingRules.currency}
                      onChange={(e) => setIntegrationData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          pricingRules: { ...prev.settings.pricingRules, currency: e.target.value }
                        }
                      }))}
                      className="select select-bordered w-full"
                    >
                      <option value="USD">USD</option>
                      <option value="LKR">LKR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={integrationData.settings.autoAccept}
                      onChange={(e) => setIntegrationData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, autoAccept: e.target.checked }
                      }))}
                      className="checkbox checkbox-primary mr-2"
                    />
                    <span className="label-text">Auto-accept bookings</span>
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={integrationData.settings.syncSettings.syncBookings}
                      onChange={(e) => setIntegrationData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          syncSettings: { ...prev.settings.syncSettings, syncBookings: e.target.checked }
                        }
                      }))}
                      className="checkbox checkbox-primary mr-2"
                    />
                    <span className="label-text">Sync bookings</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetIntegrationForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIntegration}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Integration
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Modal */}
        {showAnalyticsModal && analytics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Integration Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Bookings:</span>
                      <span className="font-semibold">{analytics.performance.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate:</span>
                      <span className="font-semibold text-green-600">{analytics.performance.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Rating:</span>
                      <span className="font-semibold">{analytics.performance.averageRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Revenue</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Revenue:</span>
                      <span className="font-semibold">${analytics.revenue.totalRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Platform Commission:</span>
                      <span className="font-semibold text-red-600">${analytics.revenue.platformCommission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Revenue:</span>
                      <span className="font-semibold text-green-600">${analytics.revenue.netRevenue}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Sync Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Sync:</span>
                      <span className="font-semibold">
                        {analytics.syncStatus.lastSync ? new Date(analytics.syncStatus.lastSync).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`font-semibold ${
                        analytics.syncStatus.syncStatus === 'success' ? 'text-green-600' :
                        analytics.syncStatus.syncStatus === 'error' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {analytics.syncStatus.syncStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Needs Sync:</span>
                      <span className={`font-semibold ${analytics.syncStatus.needsSync ? 'text-orange-600' : 'text-green-600'}`}>
                        {analytics.syncStatus.needsSync ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
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

export default VehicleIntegrationManagement;
