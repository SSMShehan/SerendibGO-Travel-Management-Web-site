import React from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Clock,
  Shield,
  BarChart3
} from 'lucide-react';

const StaffStats = ({ stats, loading = false }) => {
  const statCards = [
    {
      title: 'Total Staff',
      value: stats.totalStaff || 0,
      icon: Users,
      color: 'blue',
      change: stats.recentStaff || 0,
      changeLabel: 'New this month'
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff || 0,
      icon: UserCheck,
      color: 'green',
      change: stats.activeStaff || 0,
      changeLabel: 'Currently active'
    },
    {
      title: 'Inactive Staff',
      value: stats.inactiveStaff || 0,
      icon: UserX,
      color: 'red',
      change: stats.inactiveStaff || 0,
      changeLabel: 'Currently inactive'
    },
    {
      title: 'Verified Staff',
      value: stats.verifiedStaff || 0,
      icon: Shield,
      color: 'purple',
      change: stats.verifiedStaff || 0,
      changeLabel: 'Email verified'
    },
    {
      title: 'Recent Hires',
      value: stats.recentStaff || 0,
      icon: UserPlus,
      color: 'yellow',
      change: stats.recentStaff || 0,
      changeLabel: 'Last 30 days'
    },
    {
      title: 'Avg Rating',
      value: stats.performance?.averageRating || 0,
      icon: BarChart3,
      color: 'indigo',
      change: stats.performance?.averageRating || 0,
      changeLabel: 'Staff performance'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200'
      },
      indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        border: 'border-indigo-200'
      }
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-3 bg-gray-200 rounded-full">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm border ${colorClasses.border} p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center">
                <div className={`p-3 ${colorClasses.bg} rounded-full`}>
                  <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.title === 'Avg Rating' 
                      ? stat.value ? stat.value.toFixed(1) : 'N/A'
                      : stat.value
                    }
                  </p>
                  {stat.change > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.changeLabel}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Active Staff</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.activeStaff || 0} ({stats.totalStaff ? Math.round((stats.activeStaff / stats.totalStaff) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: `${stats.totalStaff ? (stats.activeStaff / stats.totalStaff) * 100 : 0}%` 
                }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Inactive Staff</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.inactiveStaff || 0} ({stats.totalStaff ? Math.round((stats.inactiveStaff / stats.totalStaff) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ 
                  width: `${stats.totalStaff ? (stats.inactiveStaff / stats.totalStaff) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <UserPlus className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New Hires</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <span className="text-sm font-bold text-blue-600">
                +{stats.recentStaff || 0}
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Verified Accounts</p>
                <p className="text-xs text-gray-500">Email verified</p>
              </div>
              <span className="text-sm font-bold text-green-600">
                {stats.verifiedStaff || 0}
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full mr-3">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Avg Performance</p>
                <p className="text-xs text-gray-500">Staff rating</p>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {stats.performance?.averageRating ? stats.performance.averageRating.toFixed(1) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffStats;
