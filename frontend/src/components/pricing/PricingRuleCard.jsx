import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  Settings, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Play, 
  Pause,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Percent,
  Hash
} from 'lucide-react';
import { 
  getPricingLabel, 
  getPricingModelLabel, 
  getStatusLabel, 
  getPriorityLabel,
  getStatusColor,
  getPriorityColor,
  formatPrice,
  isPricingActive,
  PRICING_MODELS,
  PRICING_STATUS
} from '../../constants/pricing/types';
import { formatDateTime, getRelativeTime } from '../../utils/date/dateUtils';

const PricingRuleCard = ({ 
  rule, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onActivate,
  onDeactivate,
  showActions = true,
  compact = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getModelIcon = (model) => {
    const icons = {
      [PRICING_MODELS.FIXED]: Hash,
      [PRICING_MODELS.DYNAMIC]: TrendingUp,
      [PRICING_MODELS.TIERED]: Settings,
      [PRICING_MODELS.PERCENTAGE]: Percent,
      [PRICING_MODELS.SURCHARGE]: TrendingUp,
      [PRICING_MODELS.DISCOUNT]: TrendingDown
    };
    return icons[model] || DollarSign;
  };

  const getStatusIcon = (status) => {
    const icons = {
      [PRICING_STATUS.ACTIVE]: CheckCircle,
      [PRICING_STATUS.INACTIVE]: XCircle,
      [PRICING_STATUS.DRAFT]: Clock,
      [PRICING_STATUS.SCHEDULED]: Calendar,
      [PRICING_STATUS.EXPIRED]: XCircle,
      [PRICING_STATUS.SUSPENDED]: AlertCircle
    };
    return icons[status] || Clock;
  };

  const handleAction = (action) => {
    switch (action) {
      case 'edit':
        if (onEdit) onEdit(rule);
        break;
      case 'delete':
        if (onDelete) onDelete(rule);
        break;
      case 'duplicate':
        if (onDuplicate) onDuplicate(rule);
        break;
      case 'activate':
        if (onActivate) onActivate(rule);
        break;
      case 'deactivate':
        if (onDeactivate) onDeactivate(rule);
        break;
      default:
        break;
    }
    setShowMenu(false);
  };

  const isActive = isPricingActive(rule);
  const ModelIcon = getModelIcon(rule.model);
  const StatusIcon = getStatusIcon(rule.status);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getStatusColor(rule.status)}`}>
            <ModelIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {rule.name}
            </p>
            <p className="text-xs text-gray-500">
              {getPricingLabel(rule.type)} • {formatPrice(rule.value, rule.currency)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {getStatusLabel(rule.status)}
          </span>
          
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleAction('edit')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4 mr-3" />
                      Edit Rule
                    </button>
                    <button
                      onClick={() => handleAction('duplicate')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Copy className="w-4 h-4 mr-3" />
                      Duplicate
                    </button>
                    {rule.status === PRICING_STATUS.ACTIVE ? (
                      <button
                        onClick={() => handleAction('deactivate')}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <Pause className="w-4 h-4 mr-3" />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('activate')}
                        className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                      >
                        <Play className="w-4 h-4 mr-3" />
                        Activate
                      </button>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => handleAction('delete')}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${getStatusColor(rule.status)}`}>
            <ModelIcon className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {rule.name}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {getStatusLabel(rule.status)}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                {getPriorityLabel(rule.priority)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium">Type:</span>
                <span className="ml-2">{getPricingLabel(rule.type)}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">Model:</span>
                <span className="ml-2">{getPricingModelLabel(rule.model)}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">Value:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {formatPrice(rule.value, rule.currency)}
                </span>
              </div>
              
              {rule.description && (
                <div className="flex items-center">
                  <span className="font-medium">Description:</span>
                  <span className="ml-2">{rule.description}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <span className="font-medium">Period:</span>
                <span className="ml-2">
                  {formatDateTime(rule.startDate)} - {formatDateTime(rule.endDate)}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">Created:</span>
                <span className="ml-2">{getRelativeTime(rule.createdAt)}</span>
              </div>
            </div>

            {/* Conditions */}
            {rule.conditions && rule.conditions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Conditions:</p>
                <div className="flex flex-wrap gap-1">
                  {rule.conditions.slice(0, 3).map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {condition}
                    </span>
                  ))}
                  {rule.conditions.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                      +{rule.conditions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Impact Preview */}
            {rule.impact && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Expected Impact</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Revenue Change:</span>
                    <span className={`ml-2 font-medium ${
                      rule.impact.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {rule.impact.revenueChange >= 0 ? '+' : ''}{rule.impact.revenueChange}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Booking Change:</span>
                    <span className={`ml-2 font-medium ${
                      rule.impact.bookingChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {rule.impact.bookingChange >= 0 ? '+' : ''}{rule.impact.bookingChange}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleAction('edit')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit Rule
                  </button>
                  <button
                    onClick={() => handleAction('duplicate')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Copy className="w-4 h-4 mr-3" />
                    Duplicate
                  </button>
                  {rule.status === PRICING_STATUS.ACTIVE ? (
                    <button
                      onClick={() => handleAction('deactivate')}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Pause className="w-4 h-4 mr-3" />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('activate')}
                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <Play className="w-4 h-4 mr-3" />
                      Activate
                    </button>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={() => handleAction('delete')}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Rule
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingRuleCard;
