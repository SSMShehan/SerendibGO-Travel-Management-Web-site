import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Calendar,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Copy,
  Edit,
  Trash2,
  RefreshCw,
  Target,
  Award
} from 'lucide-react';
import PricingRuleCard from '../../components/pricing/PricingRuleCard';
import pricingService from '../../services/pricing/pricingService';
import { 
  PRICING_TYPES,
  PRICING_MODELS,
  PRICING_STATUS,
  PRICING_PRIORITY,
  getPricingLabel,
  getPricingModelLabel,
  getStatusLabel,
  getPriorityLabel,
  formatPrice,
  getPricingSummary
} from '../../constants/pricing/types';
import { formatDateTime } from '../../utils/date/dateUtils';
import toast from 'react-hot-toast';

const PricingManagement = () => {
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({});
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    model: '',
    status: '',
    priority: '',
    dateRange: '30d'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showRuleDetails, setShowRuleDetails] = useState(false);

  useEffect(() => {
    fetchPricingData();
  }, [filters, pagination.current]);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      };
      
      // Fetch all pricing data in parallel
      const [
        overviewResponse,
        rulesResponse,
        statsResponse
      ] = await Promise.all([
        pricingService.getPricingOverview(params),
        pricingService.getPricingRules(params),
        pricingService.getPricingStats(params)
      ]);

      setOverview(overviewResponse.data);
      setPricingRules(rulesResponse.data.rules);
      setStats(statsResponse.data.stats);
      setPagination(rulesResponse.data.pagination);
      
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast.error('Failed to load pricing data');
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

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setShowCreateForm(true);
  };

  const handleViewRule = (rule) => {
    setSelectedRule(rule);
    setShowRuleDetails(true);
  };

  const handleDeleteRule = async (rule) => {
    if (window.confirm(`Are you sure you want to delete "${rule.name}"?`)) {
      try {
        await pricingService.deletePricingRule(rule._id);
        toast.success('Pricing rule deleted successfully');
        fetchPricingData();
      } catch (error) {
        console.error('Error deleting pricing rule:', error);
        toast.error('Failed to delete pricing rule');
      }
    }
  };

  const handleDuplicateRule = async (rule) => {
    try {
      await pricingService.duplicatePricingRule(rule._id);
      toast.success('Pricing rule duplicated successfully');
      fetchPricingData();
    } catch (error) {
      console.error('Error duplicating pricing rule:', error);
      toast.error('Failed to duplicate pricing rule');
    }
  };

  const handleActivateRule = async (rule) => {
    try {
      await pricingService.activatePricingRule(rule._id);
      toast.success('Pricing rule activated successfully');
      fetchPricingData();
    } catch (error) {
      console.error('Error activating pricing rule:', error);
      toast.error('Failed to activate pricing rule');
    }
  };

  const handleDeactivateRule = async (rule) => {
    try {
      await pricingService.deactivatePricingRule(rule._id);
      toast.success('Pricing rule deactivated successfully');
      fetchPricingData();
    } catch (error) {
      console.error('Error deactivating pricing rule:', error);
      toast.error('Failed to deactivate pricing rule');
    }
  };

  const handleRuleCreated = () => {
    setShowCreateForm(false);
    setSelectedRule(null);
    fetchPricingData();
  };

  const handleExportData = async () => {
    try {
      const response = await pricingService.exportPricing();
      
      // Create download link
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-rules-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Pricing data exported successfully');
    } catch (error) {
      console.error('Error exporting pricing data:', error);
      toast.error('Failed to export pricing data');
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file import
      console.log('Import file:', file);
      toast.info('Import functionality coming soon');
    }
  };

  const handleRefresh = () => {
    fetchPricingData();
  };

  const pricingSummary = getPricingSummary(pricingRules);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
              <p className="text-sm text-gray-600">Manage room pricing rules and strategies</p>
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
              <label className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pricing Rule
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900">{pricingSummary.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">{pricingSummary.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{pricingSummary.scheduled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageImpact ? `+${stats.averageImpact}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {Object.values(PRICING_TYPES).map(type => (
                  <option key={type} value={type}>
                    {getPricingLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Models</option>
                {Object.values(PRICING_MODELS).map(model => (
                  <option key={model} value={model}>
                    {getPricingModelLabel(model)}
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
                {Object.values(PRICING_STATUS).map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {Object.values(PRICING_PRIORITY).map(priority => (
                  <option key={priority} value={priority}>
                    {getPriorityLabel(priority)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing Rules List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pricingRules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing rules found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first pricing rule.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Pricing Rule
              </button>
            </div>
          ) : (
            pricingRules.map((rule) => (
              <PricingRuleCard
                key={rule._id}
                rule={rule}
                onEdit={handleEditRule}
                onDelete={handleDeleteRule}
                onDuplicate={handleDuplicateRule}
                onActivate={handleActivateRule}
                onDeactivate={handleDeactivateRule}
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

      {/* Create/Edit Pricing Rule Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
              </h2>
              {/* Pricing rule form would go here */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRuleCreated}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedRule ? 'Update' : 'Create'} Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Rule Details Modal */}
      {showRuleDetails && selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pricing Rule Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Basic Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedRule.name}</p>
                    <p><span className="text-gray-600">Type:</span> {getPricingLabel(selectedRule.type)}</p>
                    <p><span className="text-gray-600">Model:</span> {getPricingModelLabel(selectedRule.model)}</p>
                    <p><span className="text-gray-600">Value:</span> {formatPrice(selectedRule.value, selectedRule.currency)}</p>
                    <p><span className="text-gray-600">Status:</span> {getStatusLabel(selectedRule.status)}</p>
                    <p><span className="text-gray-600">Priority:</span> {getPriorityLabel(selectedRule.priority)}</p>
                    <p><span className="text-gray-600">Created:</span> {formatDateTime(selectedRule.createdAt)}</p>
                  </div>
                </div>
                
                {selectedRule.description && (
                  <div>
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedRule.description}</p>
                    </div>
                  </div>
                )}
                
                {selectedRule.conditions && selectedRule.conditions.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">Conditions</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRule.conditions.map((condition, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowRuleDetails(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowRuleDetails(false);
                    handleEditRule(selectedRule);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagement;
