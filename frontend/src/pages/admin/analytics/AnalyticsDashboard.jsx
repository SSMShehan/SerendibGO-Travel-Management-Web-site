import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Calendar, 
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import ChartCard from '../../../components/admin/analytics/ChartCard';
import MetricCard, { 
  RevenueMetricCard, 
  UsersMetricCard, 
  HotelsMetricCard, 
  BookingsMetricCard,
  RatingMetricCard,
  ActivityMetricCard
} from '../../../components/admin/analytics/MetricCard';
import analyticsService from '../../../services/admin/analytics/analyticsService';
import toast from 'react-hot-toast';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({});
  const [userAnalytics, setUserAnalytics] = useState({});
  const [hotelAnalytics, setHotelAnalytics] = useState({});
  const [bookingAnalytics, setBookingAnalytics] = useState({});
  const [financialAnalytics, setFinancialAnalytics] = useState({});
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const params = { dateRange };
      
      // Fetch all analytics data in parallel
      const [
        overviewResponse,
        userResponse,
        hotelResponse,
        bookingResponse,
        financialResponse
      ] = await Promise.all([
        analyticsService.getPlatformOverview(params),
        analyticsService.getUserAnalytics(params),
        analyticsService.getHotelAnalytics(params),
        analyticsService.getBookingAnalytics(params),
        analyticsService.getFinancialAnalytics(params)
      ]);

      setOverviewData(overviewResponse.data);
      setUserAnalytics(userResponse.data);
      setHotelAnalytics(hotelResponse.data);
      setBookingAnalytics(bookingResponse.data);
      setFinancialAnalytics(financialResponse.data);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = async (type) => {
    try {
      const response = await analyticsService.exportAnalytics(type, { dateRange });
      
      // Create download link
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics data');
    }
  };

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600">Comprehensive platform analytics and insights</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={() => handleExport('overview')}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <RevenueMetricCard
            value={financialAnalytics.totalRevenue}
            change={financialAnalytics.revenueGrowth}
            trend={financialAnalytics.revenueGrowth >= 0 ? 'up' : 'down'}
            loading={loading}
          />
          
          <UsersMetricCard
            value={userAnalytics.totalUsers}
            change={userAnalytics.userGrowth}
            trend={userAnalytics.userGrowth >= 0 ? 'up' : 'down'}
            loading={loading}
          />
          
          <HotelsMetricCard
            value={hotelAnalytics.totalHotels}
            change={hotelAnalytics.hotelGrowth}
            trend={hotelAnalytics.hotelGrowth >= 0 ? 'up' : 'down'}
            loading={loading}
          />
          
          <BookingsMetricCard
            value={bookingAnalytics.totalBookings}
            change={bookingAnalytics.bookingGrowth}
            trend={bookingAnalytics.bookingGrowth >= 0 ? 'up' : 'down'}
            loading={loading}
          />
          
          <RatingMetricCard
            value={overviewData.averageRating}
            change={overviewData.ratingChange}
            trend={overviewData.ratingChange >= 0 ? 'up' : 'down'}
            loading={loading}
          />
          
          <ActivityMetricCard
            value={userAnalytics.activeUsers}
            change={userAnalytics.activityGrowth}
            trend={userAnalytics.activityGrowth >= 0 ? 'up' : 'down'}
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <ChartCard
            title="Revenue Trend"
            subtitle="Daily revenue over time"
            type="line"
            loading={loading}
            onRefresh={handleRefresh}
            onDownload={() => handleExport('revenue')}
          >
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Revenue chart will be rendered here</p>
                <p className="text-xs text-gray-400 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </ChartCard>

          {/* User Growth */}
          <ChartCard
            title="User Growth"
            subtitle="New user registrations"
            type="bar"
            loading={loading}
            onRefresh={handleRefresh}
            onDownload={() => handleExport('users')}
          >
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">User growth chart will be rendered here</p>
                <p className="text-xs text-gray-400 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </ChartCard>

          {/* Booking Sources */}
          <ChartCard
            title="Booking Sources"
            subtitle="Where bookings come from"
            type="pie"
            loading={loading}
            onRefresh={handleRefresh}
            onDownload={() => handleExport('sources')}
          >
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Booking sources chart will be rendered here</p>
                <p className="text-xs text-gray-400 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </ChartCard>

          {/* Hotel Performance */}
          <ChartCard
            title="Hotel Performance"
            subtitle="Top performing hotels"
            type="bar"
            loading={loading}
            onRefresh={handleRefresh}
            onDownload={() => handleExport('hotels')}
          >
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Hotel performance chart will be rendered here</p>
                <p className="text-xs text-gray-400 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performing Hotels */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Top Performing Hotels"
              subtitle="Revenue and booking metrics"
              type="bar"
              loading={loading}
              onRefresh={handleRefresh}
              onDownload={() => handleExport('top-hotels')}
            >
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Top hotels table will be rendered here</p>
                  <p className="text-xs text-gray-400 mt-1">Integration with data table needed</p>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">New hotel registered</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">Booking completed</p>
                          <p className="text-xs text-gray-500">5 minutes ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">Payment pending</p>
                          <p className="text-xs text-gray-500">10 minutes ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">Review submitted</p>
                          <p className="text-xs text-gray-500">15 minutes ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">Booking cancelled</p>
                          <p className="text-xs text-gray-500">20 minutes ago</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
