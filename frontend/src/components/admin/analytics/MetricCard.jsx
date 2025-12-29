import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Star,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const MetricCard = ({ 
  title,
  value,
  change,
  changeType = 'percentage', // percentage, number, currency
  trend = 'neutral', // up, down, neutral
  icon: Icon,
  color = 'blue',
  loading = false,
  className = '',
  subtitle,
  prefix = '',
  suffix = '',
  formatValue = true
}) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      purple: 'text-purple-600 bg-purple-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      pink: 'text-pink-600 bg-pink-100',
      gray: 'text-gray-600 bg-gray-100'
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (trendDirection) => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trendDirection) => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatChangeValue = (changeValue, type) => {
    if (changeValue === null || changeValue === undefined) return 'N/A';
    
    switch (type) {
      case 'currency':
        return `Rs. ${Math.abs(changeValue).toLocaleString()}`;
      case 'number':
        return Math.abs(changeValue).toLocaleString();
      case 'percentage':
      default:
        return `${Math.abs(changeValue)}%`;
    }
  };

  const formatMainValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    
    if (!formatValue) return val;
    
    if (typeof val === 'number') {
      if (changeType === 'currency') {
        return `Rs. ${val.toLocaleString()}`;
      }
      return val.toLocaleString();
    }
    
    return val;
  };

  const colorClasses = getColorClasses(color);
  const trendColor = getTrendColor(trend);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {Icon && (
              <div className={`p-2 rounded-full ${colorClasses}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                `${prefix}${formatMainValue(value)}${suffix}`
              )}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          {change !== null && change !== undefined && !loading && (
            <div className="flex items-center">
              {getTrendIcon(trend)}
              <span className={`text-sm font-medium ml-1 ${trendColor}`}>
                {formatChangeValue(change, changeType)}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Predefined metric card variants
export const RevenueMetricCard = ({ value, change, trend, loading, ...props }) => (
  <MetricCard
    title="Total Revenue"
    value={value}
    change={change}
    trend={trend}
    changeType="currency"
    icon={DollarSign}
    color="green"
    loading={loading}
    {...props}
  />
);

export const UsersMetricCard = ({ value, change, trend, loading, ...props }) => (
  <MetricCard
    title="Total Users"
    value={value}
    change={change}
    trend={trend}
    changeType="number"
    icon={Users}
    color="blue"
    loading={loading}
    {...props}
  />
);

export const HotelsMetricCard = ({ value, change, trend, loading, ...props }) => (
  <MetricCard
    title="Total Hotels"
    value={value}
    change={change}
    trend={trend}
    changeType="number"
    icon={Building2}
    color="purple"
    loading={loading}
    {...props}
  />
);

export const BookingsMetricCard = ({ value, change, trend, loading, ...props }) => (
  <MetricCard
    title="Total Bookings"
    value={value}
    change={change}
    trend={trend}
    changeType="number"
    icon={Calendar}
    color="indigo"
    loading={loading}
    {...props}
  />
);

export const RatingMetricCard = ({ value, change, trend, loading, ...props }) => (
  <MetricCard
    title="Average Rating"
    value={value}
    change={change}
    trend={trend}
    changeType="number"
    icon={Star}
    color="yellow"
    loading={loading}
    suffix="/5"
    formatValue={false}
    {...props}
  />
);

export const ActivityMetricCard = ({ value, change, trend, loading, ...props }) => (
  <MetricCard
    title="Active Users"
    value={value}
    change={change}
    trend={trend}
    changeType="number"
    icon={Activity}
    color="pink"
    loading={loading}
    {...props}
  />
);

export default MetricCard;
