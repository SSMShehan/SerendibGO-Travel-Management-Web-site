import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench as WrenchIcon,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  Plus,
  Edit,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  Car,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Star,
  TrendingUp,
  BarChart3,
  Activity as ActivityIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const MaintenanceTracking = () => {
  const { user } = useAuth();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    maintenanceType: '',
    search: ''
  });
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    fetchMaintenanceRecords();
    fetchStats();
  }, [filters]);
  
  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/maintenance?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setMaintenanceRecords(data.data.maintenanceRecords);
      }
      
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/maintenance/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const handleStatusUpdate = async (recordId, status, reason = '') => {
    try {
      const response = await fetch(`/api/maintenance/${recordId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, reason })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success(`Maintenance status updated to ${status}!`);
        fetchMaintenanceRecords();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'in_progress': return <Play className="w-5 h-5 text-orange-600" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'on_hold': return <Pause className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
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
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Tracking</h1>
              <p className="text-lg text-gray-600 mt-2">
                Track and manage vehicle maintenance records
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchMaintenanceRecords}
                className="btn btn-outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Maintenance
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMaintenance || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedMaintenance || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingMaintenance || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalCost || 0)}
                </p>
              </div>
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
                placeholder="Search maintenance..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <select
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="on_hold">On Hold</option>
            </select>
            
            <select
              className="select select-bordered w-full"
              value={filters.maintenanceType}
              onChange={(e) => setFilters(prev => ({ ...prev, maintenanceType: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="routine">Routine</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="emergency">Emergency</option>
              <option value="recall">Recall</option>
              <option value="upgrade">Upgrade</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {maintenanceRecords.length} records
            </div>
          </div>
        </div>
        
        {/* Maintenance Records List */}
        {maintenanceRecords.length > 0 ? (
          <div className="space-y-4">
            {maintenanceRecords.map((record) => (
              <div key={record._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <WrenchIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.maintenanceReference}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1">{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            {record.maintenanceType}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <Car className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{record.vehicle?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{record.vehicle?.make} {record.vehicle?.model}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Scheduled: {formatDate(record.scheduledDate)}</div>
                          <div className="text-xs text-gray-500">
                            {record.actualStartDate ? `Started: ${formatDate(record.actualStartDate)}` : 'Not started'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{record.serviceProvider.name}</div>
                          <div className="text-xs text-gray-500">{record.serviceProvider.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{formatCurrency(record.costs.totalCost, record.costs.currency)}</div>
                          <div className="text-xs text-gray-500">
                            {record.costs.paymentStatus} • {record.costs.paymentMethod}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Maintenance Items */}
                    {record.maintenanceItems && record.maintenanceItems.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Maintenance Items:</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.maintenanceItems.slice(0, 3).map((item, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.itemName} ({item.category})
                            </span>
                          ))}
                          {record.maintenanceItems.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{record.maintenanceItems.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Quality Rating */}
                    {record.qualityRating && (
                      <div className="flex items-center mb-4">
                        <span className="text-sm text-gray-600 mr-2">Quality Rating:</span>
                        <div className="flex items-center">
                          {renderStars(record.qualityRating)}
                          <span className="ml-1 text-sm text-gray-600">({record.qualityRating}/5)</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDetailsModal(true);
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="btn btn-sm btn-outline">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Action Buttons */}
                    {record.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusUpdate(record._id, 'in_progress')}
                        className="btn btn-sm btn-success"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </button>
                    )}
                    
                    {record.status === 'in_progress' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(record._id, 'completed')}
                          className="btn btn-sm btn-primary"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(record._id, 'on_hold')}
                          className="btn btn-sm btn-warning"
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Hold
                        </button>
                      </div>
                    )}
                    
                    {record.status === 'on_hold' && (
                      <button
                        onClick={() => handleStatusUpdate(record._id, 'in_progress')}
                        className="btn btn-sm btn-success"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <WrenchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filters.search || filters.status
                ? 'No maintenance records match your filters'
                : 'No maintenance records yet'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status
                ? 'Try adjusting your search criteria or clear filters to see all records.'
                : 'Your maintenance records will appear here.'
              }
            </p>
            {(filters.search || filters.status) && (
              <button
                onClick={() => setFilters({ status: '', maintenanceType: '', search: '' })}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
        
        {/* Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Maintenance Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <WrenchIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedRecord.maintenanceReference}</div>
                        <div className="text-gray-500">{selectedRecord.maintenanceType}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedRecord.vehicle?.name}</div>
                        <div className="text-gray-500">{selectedRecord.vehicle?.make} {selectedRecord.vehicle?.model}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">Scheduled: {formatDate(selectedRecord.scheduledDate)}</div>
                        <div className="text-gray-500">
                          {selectedRecord.actualStartDate ? `Started: ${formatDate(selectedRecord.actualStartDate)}` : 'Not started'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Service Provider & Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedRecord.serviceProvider.name}</div>
                        <div className="text-gray-500">{selectedRecord.serviceProvider.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedRecord.serviceProvider.contactInfo?.phone || 'N/A'}</div>
                        <div className="text-gray-500">{selectedRecord.serviceProvider.contactInfo?.email || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{formatCurrency(selectedRecord.costs.totalCost, selectedRecord.costs.currency)}</div>
                        <div className="text-gray-500">
                          {selectedRecord.costs.paymentStatus} • {selectedRecord.costs.paymentMethod}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Maintenance Items */}
              {selectedRecord.maintenanceItems && selectedRecord.maintenanceItems.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Maintenance Items</h4>
                  <div className="space-y-2">
                    {selectedRecord.maintenanceItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.itemName}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {item.category} • {item.priority} priority
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.actualCost || item.estimatedCost)}</div>
                          <div className="text-xs text-gray-500">{item.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
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

export default MaintenanceTracking;
