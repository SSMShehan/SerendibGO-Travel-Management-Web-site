import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart,
  Activity,
  Download,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

const ChartCard = ({ 
  title, 
  subtitle,
  children, 
  loading = false,
  error = null,
  onRefresh,
  onDownload,
  onSettings,
  showControls = true,
  className = '',
  type = 'line' // line, bar, pie, area
}) => {
  const getChartIcon = (chartType) => {
    const icons = {
      line: LineChart,
      bar: BarChart3,
      pie: PieChart,
      area: Activity
    };
    return icons[chartType] || LineChart;
  };

  const ChartIcon = getChartIcon(type);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
              
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              
              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm text-red-600 mb-2">Failed to load chart data</p>
              <p className="text-xs text-gray-500">{error}</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-64">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
