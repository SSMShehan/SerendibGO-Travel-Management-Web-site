import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Download,
  Upload,
  CreditCard,
  Banknote,
  Calculator,
  Target as TargetIcon,
  Activity as ActivityIcon,
  Users,
  Car,
  Wrench as WrenchIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const RevenueManagement = () => {
  const { user } = useAuth();
  const [revenueRecords, setRevenueRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: '',
    status: '',
    search: ''
  });
  const [stats, setStats] = useState({});
  const [calculateData, setCalculateData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  
  useEffect(() => {
    fetchRevenueRecords();
    fetchStats();
  }, [filters]);
  
  const fetchRevenueRecords = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/revenue?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setRevenueRecords(data.data.revenueRecords);
      }
      
    } catch (error) {
      console.error('Error fetching revenue records:', error);
      toast.error('Failed to load revenue records');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/revenue/stats', {
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
  
  const handleCalculateRevenue = async () => {
    try {
      const response = await fetch('/api/revenue/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          vehicleOwnerId: user.id,
          year: calculateData.year,
          month: calculateData.month
        })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Revenue calculated successfully!');
        setShowCalculateModal(false);
        fetchRevenueRecords();
      } else {
        toast.error(data.message || 'Failed to calculate revenue');
      }
    } catch (error) {
      console.error('Error calculating revenue:', error);
      toast.error('Failed to calculate revenue');
    }
  };
  
  const handleStatusUpdate = async (recordId, status, reason = '') => {
    try {
      const response = await fetch(`/api/revenue/${recordId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, reason })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success(`Revenue status updated to ${status}!`);
        fetchRevenueRecords();
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
      case 'draft': return <Clock className="w-5 h-5 text-gray-600" />;
      case 'review': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'paid': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'disputed': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
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
              <h1 className="text-3xl font-bold text-gray-900">Revenue Management</h1>
              <p className="text-lg text-gray-600 mt-2">
                Track and manage your vehicle revenue
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchRevenueRecords}
                className="btn btn-outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowCalculateModal(true)}
                className="btn btn-primary"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Revenue
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalNetRevenue || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TargetIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.averageBookingValue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search revenue..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <select
              className="select select-bordered w-full"
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            >
              <option value="">All Years</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              className="select select-bordered w-full"
              value={filters.month}
              onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
            
            <select
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="disputed">Disputed</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {revenueRecords.length} records
            </div>
          </div>
        </div>
        
        {/* Revenue Records List */}
        {revenueRecords.length > 0 ? (
          <div className="space-y-4">
            {revenueRecords.map((record) => (
              <div key={record._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getMonthName(record.period.month)} {record.period.year}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1">{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            Q{record.period.quarter}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Gross Revenue</div>
                          <div className="text-xs text-gray-500">{formatCurrency(record.revenue.grossRevenue)}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Net Revenue</div>
                          <div className="text-xs text-gray-500">{formatCurrency(record.revenue.netRevenue)}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Total Bookings</div>
                          <div className="text-xs text-gray-500">{record.metrics.totalBookings}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <TargetIcon className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Avg Booking Value</div>
                          <div className="text-xs text-gray-500">{formatCurrency(record.metrics.averageBookingValue)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Revenue Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Platform Commission</div>
                          <div className="text-xs text-gray-500">{formatCurrency(record.revenue.platformCommission)}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Driver Payments</div>
                          <div className="text-xs text-gray-500">{formatCurrency(record.revenue.driverPayments)}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <WrenchIcon className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Maintenance Costs</div>
                          <div className="text-xs text-gray-500">{formatCurrency(record.revenue.maintenanceCosts)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payout Information */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Banknote className="h-4 w-4 mr-1" />
                        <span>Pending: {formatCurrency(record.payout.pendingAmount)}</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Paid: {formatCurrency(record.payout.paidAmount)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Created: {formatDate(record.createdAt)}</span>
                      </div>
                    </div>
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
                    </div>
                    
                    {/* Action Buttons */}
                    {record.status === 'draft' && (
                      <button
                        onClick={() => handleStatusUpdate(record._id, 'review')}
                        className="btn btn-sm btn-warning"
                      >
                        Submit for Review
                      </button>
                    )}
                    
                    {record.status === 'review' && user.role === 'admin' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(record._id, 'approved')}
                          className="btn btn-sm btn-success"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(record._id, 'disputed')}
                          className="btn btn-sm btn-error"
                        >
                          Dispute
                        </button>
                      </div>
                    )}
                    
                    {record.status === 'approved' && user.role === 'admin' && (
                      <button
                        onClick={() => handleStatusUpdate(record._id, 'paid')}
                        className="btn btn-sm btn-primary"
                      >
                        Process Payout
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filters.search || filters.status
                ? 'No revenue records match your filters'
                : 'No revenue records yet'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status
                ? 'Try adjusting your search criteria or clear filters to see all records.'
                : 'Calculate your revenue to get started.'
              }
            </p>
            {(filters.search || filters.status) && (
              <button
                onClick={() => setFilters({ year: new Date().getFullYear(), month: '', status: '', search: '' })}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
        
        {/* Calculate Revenue Modal */}
        {showCalculateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Calculate Revenue</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={calculateData.year}
                    onChange={(e) => setCalculateData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={calculateData.month}
                    onChange={(e) => setCalculateData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{getMonthName(month)}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCalculateModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCalculateRevenue}
                  className="btn btn-primary"
                >
                  Calculate Revenue
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Revenue Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Revenue Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Revenue:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.revenue.grossRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Commission:</span>
                      <span className="font-medium">-{formatCurrency(selectedRecord.revenue.platformCommission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Driver Payments:</span>
                      <span className="font-medium">-{formatCurrency(selectedRecord.revenue.driverPayments)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maintenance Costs:</span>
                      <span className="font-medium">-{formatCurrency(selectedRecord.revenue.maintenanceCosts)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-semibold">Net Revenue:</span>
                      <span className="font-bold text-green-600">{formatCurrency(selectedRecord.revenue.netRevenue)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-medium">{selectedRecord.metrics.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Bookings:</span>
                      <span className="font-medium">{selectedRecord.metrics.completedBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Booking Value:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.metrics.averageBookingValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Satisfaction:</span>
                      <span className="font-medium">{selectedRecord.metrics.customerSatisfaction?.toFixed(1) || 'N/A'}/5</span>
                    </div>
                  </div>
                </div>
              </div>
              
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

export default RevenueManagement;
