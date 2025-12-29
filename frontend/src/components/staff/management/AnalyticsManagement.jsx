// Staff Analytics & Monitoring Component
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Star,
  Activity,
  Target,
  Award,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Info,
  Shield,
  Zap,
  Monitor,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  Thermometer,
  Gauge,
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  Star as StarIcon,
  Activity as ActivityIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Globe as GlobeIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Eye as EyeIcon,
  Download as DownloadIcon,
  RefreshCw as RefreshCwIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  ExternalLink as ExternalLinkIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  Zap as ZapIcon,
  Monitor as MonitorIcon,
  Server as ServerIcon,
  Database as DatabaseIcon,
  Cpu as CpuIcon,
  HardDrive as HardDriveIcon,
  Wifi as WifiIcon,
  Signal as SignalIcon,
  Battery as BatteryIcon,
  Thermometer as ThermometerIcon,
  Gauge as GaugeIcon
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import staffService from '../../../services/staff/staffService';
import toast from 'react-hot-toast';

const AnalyticsManagement = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({});
  const [userAnalytics, setUserAnalytics] = useState({});
  const [bookingAnalytics, setBookingAnalytics] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [monitoringData, setMonitoringData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    period: '30d',
    type: 'all'
  });

  // Fetch analytics overview
  const fetchAnalyticsOverview = async () => {
    setLoading(true);
    try {
      const data = await staffService.getAnalyticsOverview(filters.period);
      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Fetch analytics overview error:', error);
      toast.error(error.message || 'Failed to fetch analytics overview');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user analytics
  const fetchUserAnalytics = async () => {
    try {
      const data = await staffService.getUserAnalytics(filters.period);
      setUserAnalytics(data.data);
    } catch (error) {
      console.error('Fetch user analytics error:', error);
      toast.error(error.message || 'Failed to fetch user analytics');
    }
  };

  // Fetch booking analytics
  const fetchBookingAnalytics = async () => {
    try {
      const data = await staffService.getBookingAnalytics(filters.period);
      setBookingAnalytics(data.data);
    } catch (error) {
      console.error('Fetch booking analytics error:', error);
      toast.error(error.message || 'Failed to fetch booking analytics');
    }
  };

  // Fetch performance metrics
  const fetchPerformanceMetrics = async () => {
    try {
      const data = await staffService.getPerformanceMetrics(filters.period);
      setPerformanceMetrics(data.data);
    } catch (error) {
      console.error('Fetch performance metrics error:', error);
      toast.error(error.message || 'Failed to fetch performance metrics');
    }
  };

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      const data = await staffService.getMonitoringData();
      setMonitoringData(data.data);
    } catch (error) {
      console.error('Fetch monitoring data error:', error);
      toast.error(error.message || 'Failed to fetch monitoring data');
    }
  };

  useEffect(() => {
    fetchAnalyticsOverview();
    fetchUserAnalytics();
    fetchBookingAnalytics();
    fetchPerformanceMetrics();
    fetchMonitoringData();
  }, [filters]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'monitoring', label: 'Monitoring', icon: Activity }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend) => {
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics & Monitoring</h2>
          <p className="text-slate-600">Comprehensive platform insights and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              fetchAnalyticsOverview();
              fetchUserAnalytics();
              fetchBookingAnalytics();
              fetchPerformanceMetrics();
              fetchMonitoringData();
            }}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="users">Users</option>
                <option value="bookings">Bookings</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Metric</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Metrics</option>
                <option value="growth">Growth</option>
                <option value="engagement">Engagement</option>
                <option value="conversion">Conversion</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Users</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.users?.total || 0}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12.5%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.bookings?.total || 0}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +8.3%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">
                        LKR {analyticsData.bookings?.revenue?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +15.2%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Avg Rating</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.performance?.customerSatisfaction || 0}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +0.3
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">User Growth</h3>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">Chart visualization would go here</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trends</h3>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">Chart visualization would go here</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Destinations */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Destinations</h3>
                <div className="space-y-3">
                  {analyticsData.geography?.topDestinations?.slice(0, 5).map((destination, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{destination._id}</p>
                          <p className="text-sm text-slate-600">{destination.count} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{destination.count}</p>
                        <p className="text-sm text-slate-600">bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Users</p>
                      <p className="text-2xl font-bold text-slate-900">{userAnalytics.stats?.total || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">New Users</p>
                      <p className="text-2xl font-bold text-green-600">{userAnalytics.stats?.new || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Users</p>
                      <p className="text-2xl font-bold text-orange-600">{userAnalytics.stats?.active || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Verified Users</p>
                      <p className="text-2xl font-bold text-purple-600">{userAnalytics.stats?.verified || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Roles Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">User Roles Distribution</h3>
                <div className="space-y-3">
                  {userAnalytics.stats?.byRole?.map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 capitalize">{role._id.replace('_', ' ')}</p>
                          <p className="text-sm text-slate-600">{role.count} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{role.count}</p>
                        <p className="text-sm text-slate-600">users</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Booking Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-slate-900">{bookingAnalytics.stats?.total || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">{bookingAnalytics.stats?.confirmed || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Completed</p>
                      <p className="text-2xl font-bold text-purple-600">{bookingAnalytics.stats?.completed || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Cancelled</p>
                      <p className="text-2xl font-bold text-red-600">{bookingAnalytics.stats?.cancelled || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">
                        LKR {bookingAnalytics.revenue?.total?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Recent Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">
                        LKR {bookingAnalytics.revenue?.recent?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Avg Order Value</p>
                      <p className="text-2xl font-bold text-purple-600">
                        LKR {bookingAnalytics.revenue?.average?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular Tours */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Popular Tours</h3>
                <div className="space-y-3">
                  {bookingAnalytics.popularTours?.slice(0, 5).map((tour, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{tour.title}</p>
                          <p className="text-sm text-slate-600">{tour.count} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">LKR {tour.revenue?.toLocaleString()}</p>
                        <p className="text-sm text-slate-600">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {(performanceMetrics.business?.conversionRate * 100)?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Customer Satisfaction</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {performanceMetrics.business?.customerSatisfaction || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Retention Rate</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {(performanceMetrics.business?.retentionRate * 100)?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Churn Rate</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {(performanceMetrics.business?.churnRate * 100)?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">System Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Uptime</span>
                      <span className="text-sm font-bold text-green-600">
                        {performanceMetrics.system?.uptime}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${performanceMetrics.system?.uptime}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Response Time</span>
                      <span className="text-sm font-bold text-blue-600">
                        {performanceMetrics.system?.responseTime}ms
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Error Rate</span>
                      <span className="text-sm font-bold text-red-600">
                        {(performanceMetrics.system?.errorRate * 100)?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${performanceMetrics.system?.errorRate * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Throughput</span>
                      <span className="text-sm font-bold text-purple-600">
                        {performanceMetrics.system?.throughput} req/min
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: '80%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              {/* System Health */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(monitoringData.systemHealth?.status)}`}>
                    {monitoringData.systemHealth?.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Server className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Uptime</p>
                    <p className="text-2xl font-bold text-green-600">
                      {monitoringData.systemHealth?.uptime}%
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {monitoringData.systemHealth?.responseTime}ms
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Error Rate</p>
                    <p className="text-2xl font-bold text-red-600">
                      {(monitoringData.systemHealth?.errorRate * 100)?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Users */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Current Users</p>
                      <p className="text-2xl font-bold text-slate-900">{monitoringData.activeUsers?.current || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Today's Users</p>
                      <p className="text-2xl font-bold text-blue-600">{monitoringData.activeUsers?.today || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Peak Users</p>
                      <p className="text-2xl font-bold text-purple-600">{monitoringData.activeUsers?.peak || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">New Bookings</p>
                        <p className="text-sm text-slate-600">Last hour</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {monitoringData.recentActivity?.newBookings || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">New Users</p>
                        <p className="text-sm text-slate-600">Last hour</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {monitoringData.recentActivity?.newUsers || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Support Tickets</p>
                        <p className="text-sm text-slate-600">New tickets</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {monitoringData.recentActivity?.supportTickets || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManagement;
