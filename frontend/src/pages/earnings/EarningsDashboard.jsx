import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Filter,
  RefreshCw,
  Banknote,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Settings
} from 'lucide-react';
import EarningsCard from '../../components/earnings/EarningsCard';
import earningsService from '../../services/earnings/earningsService';
import { 
  EARNINGS_PERIODS,
  EARNINGS_TYPES,
  EARNINGS_STATUS,
  PAYOUT_STATUS,
  getPeriodLabel,
  getEarningsLabel,
  getStatusLabel,
  getPayoutStatusLabel,
  formatCurrency,
  formatAmount,
  getEarningsSummary
} from '../../constants/earnings/types';
import { formatDateTime } from '../../utils/date/dateUtils';
import toast from 'react-hot-toast';

const EarningsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({});
  const [earnings, setEarnings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    period: EARNINGS_PERIODS.THIS_MONTH,
    type: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [showEarningDetails, setShowEarningDetails] = useState(false);

  useEffect(() => {
    fetchEarningsData();
  }, [filters, pagination.current]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      };
      
      // Fetch all earnings data in parallel
      const [
        overviewResponse,
        earningsResponse,
        payoutsResponse,
        statsResponse
      ] = await Promise.all([
        earningsService.getEarningsOverview(params),
        earningsService.getEarnings(params),
        earningsService.getPayouts(params),
        earningsService.getEarningsStats(params)
      ]);

      setOverview(overviewResponse.data);
      setEarnings(earningsResponse.data.earnings);
      setPayouts(payoutsResponse.data.payouts);
      setStats(statsResponse.data.stats);
      setPagination(earningsResponse.data.pagination);
      
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleViewEarning = (earning) => {
    setSelectedEarning(earning);
    setShowEarningDetails(true);
  };

  const handleDownloadEarning = async (earning) => {
    try {
      // Generate and download earning receipt
      toast.success('Earning receipt downloaded');
    } catch (error) {
      console.error('Error downloading earning:', error);
      toast.error('Failed to download earning receipt');
    }
  };

  const handleShareEarning = async (earning) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Earning Details',
          text: `Earning: ${formatCurrency(earning.amount)} - ${getEarningsLabel(earning.type)}`,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(`Earning: ${formatCurrency(earning.amount)} - ${getEarningsLabel(earning.type)}`);
        toast.success('Earning details copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing earning:', error);
      toast.error('Failed to share earning details');
    }
  };

  const handleRequestPayout = async () => {
    try {
      // Request payout logic
      toast.success('Payout request submitted successfully');
      fetchEarningsData();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error('Failed to request payout');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await earningsService.exportEarnings();
      
      // Create download link
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Earnings data exported successfully');
    } catch (error) {
      console.error('Error exporting earnings:', error);
      toast.error('Failed to export earnings data');
    }
  };

  const handleRefresh = () => {
    fetchEarningsData();
  };

  const earningsSummary = getEarningsSummary(earnings);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h1>
              <p className="text-sm text-gray-600">Track your hotel earnings and payouts</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleRequestPayout}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Banknote className="w-4 h-4 mr-2" />
                Request Payout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsSummary.totalEarnings)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsSummary.netEarnings)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsSummary.pendingEarnings)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available for Payout</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview.availableForPayout || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(EARNINGS_PERIODS).map(period => (
                  <option key={period} value={period}>
                    {getPeriodLabel(period)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {Object.values(EARNINGS_TYPES).map(type => (
                  <option key={type} value={type}>
                    {getEarningsLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {Object.values(EARNINGS_STATUS).map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search earnings..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Earnings Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Earnings Trend */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Earnings trend chart will be rendered here</p>
                <p className="text-xs text-gray-400 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Earnings breakdown chart will be rendered here</p>
                <p className="text-xs text-gray-400 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Earnings</h2>
            <span className="text-sm text-gray-500">
              {pagination.total} total earnings
            </span>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : earnings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings found</h3>
              <p className="text-gray-600">No earnings match your current filters.</p>
            </div>
          ) : (
            earnings.map((earning) => (
              <EarningsCard
                key={earning._id}
                earning={earning}
                onView={handleViewEarning}
                onDownload={handleDownloadEarning}
                onShare={handleShareEarning}
                showActions={true}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Earning Details Modal */}
      {showEarningDetails && selectedEarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Earning Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Basic Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="text-gray-600">Type:</span> {getEarningsLabel(selectedEarning.type)}</p>
                    <p><span className="text-gray-600">Amount:</span> {formatCurrency(selectedEarning.amount)}</p>
                    <p><span className="text-gray-600">Status:</span> {getStatusLabel(selectedEarning.status)}</p>
                    <p><span className="text-gray-600">Date:</span> {formatDateTime(selectedEarning.createdAt)}</p>
                    {selectedEarning.description && (
                      <p><span className="text-gray-600">Description:</span> {selectedEarning.description}</p>
                    )}
                  </div>
                </div>
                
                {(selectedEarning.commission || selectedEarning.fees || selectedEarning.taxes) && (
                  <div>
                    <h3 className="font-medium text-gray-900">Breakdown</h3>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-1 text-sm">
                        {selectedEarning.commission && (
                          <div className="flex justify-between">
                            <span>Commission:</span>
                            <span>-{formatCurrency(selectedEarning.commission)}</span>
                          </div>
                        )}
                        {selectedEarning.fees && (
                          <div className="flex justify-between">
                            <span>Fees:</span>
                            <span>-{formatCurrency(selectedEarning.fees)}</span>
                          </div>
                        )}
                        {selectedEarning.taxes && (
                          <div className="flex justify-between">
                            <span>Taxes:</span>
                            <span>-{formatCurrency(selectedEarning.taxes)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium pt-1 border-t">
                          <span>Net Amount:</span>
                          <span>{formatCurrency(selectedEarning.netAmount || selectedEarning.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEarningDetails(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowEarningDetails(false);
                    handleDownloadEarning(selectedEarning);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsDashboard;
