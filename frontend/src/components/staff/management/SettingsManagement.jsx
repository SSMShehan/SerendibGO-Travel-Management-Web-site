// Staff Platform Configuration & Settings Component
import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Database,
  Server,
  Monitor,
  Bell,
  CreditCard,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Info,
  Edit,
  Trash,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Key,
  Wifi,
  HardDrive,
  Cpu,
  Memory,
  Activity,
  Zap,
  Target,
  Award,
  Star,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  Square,
  Copy,
  Share,
  Archive,
  Ban,
  Unlock,
  Lock as LockIcon,
  EyeOff as EyeOffIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Copy as CopyIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Ban as BanIcon,
  Unlock as UnlockIcon,
  Lock as LockIconIcon,
  EyeOff as EyeOffIconIcon,
  Send as SendIconIcon,
  Reply as ReplyIconIcon
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import staffService from '../../../services/staff/staffService';
import toast from 'react-hot-toast';

const SettingsManagement = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [platformSettings, setPlatformSettings] = useState({});
  const [staffProfile, setStaffProfile] = useState({});
  const [systemLogs, setSystemLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [backupData, setBackupData] = useState({
    type: 'full',
    description: ''
  });

  // Fetch platform settings
  const fetchPlatformSettings = async () => {
    setLoading(true);
    try {
      const data = await staffService.getPlatformSettings();
      setPlatformSettings(data.data);
    } catch (error) {
      console.error('Fetch platform settings error:', error);
      toast.error(error.message || 'Failed to fetch platform settings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff profile
  const fetchStaffProfile = async () => {
    try {
      const data = await staffService.getStaffProfile();
      setStaffProfile(data.data);
    } catch (error) {
      console.error('Fetch staff profile error:', error);
      toast.error(error.message || 'Failed to fetch staff profile');
    }
  };

  // Fetch system logs
  const fetchSystemLogs = async () => {
    try {
      const data = await staffService.getSystemLogs();
      setSystemLogs(data.data.logs);
    } catch (error) {
      console.error('Fetch system logs error:', error);
      toast.error(error.message || 'Failed to fetch system logs');
    }
  };

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      const data = await staffService.getSystemHealth();
      setSystemHealth(data.data);
    } catch (error) {
      console.error('Fetch system health error:', error);
      toast.error(error.message || 'Failed to fetch system health');
    }
  };

  useEffect(() => {
    fetchPlatformSettings();
    fetchStaffProfile();
    fetchSystemLogs();
    fetchSystemHealth();
  }, []);

  // Handle platform settings update
  const handlePlatformSettingsUpdate = async (category, settings) => {
    try {
      const data = await staffService.updatePlatformSettings(category, settings);
      toast.success(data.message);
      fetchPlatformSettings();
    } catch (error) {
      console.error('Update platform settings error:', error);
      toast.error(error.message || 'Failed to update platform settings');
    }
  };

  // Handle staff profile update
  const handleStaffProfileUpdate = async (profileData) => {
    try {
      const data = await staffService.updateStaffProfile(profileData);
      toast.success(data.message);
      fetchStaffProfile();
    } catch (error) {
      console.error('Update staff profile error:', error);
      toast.error(error.message || 'Failed to update staff profile');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      
      const data = await staffService.changeStaffPassword(passwordData);
      toast.success(data.message);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Failed to change password');
    }
  };

  // Handle system backup
  const handleSystemBackup = async () => {
    try {
      const data = await staffService.createSystemBackup(backupData);
      toast.success(data.message);
      setShowBackupModal(false);
      setBackupData({ type: 'full', description: '' });
    } catch (error) {
      console.error('Create backup error:', error);
      toast.error(error.message || 'Failed to create backup');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'platform', label: 'Platform', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Server },
    { id: 'logs', label: 'Logs', icon: FileText }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'valid': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'debug': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Settings & Configuration</h2>
          <p className="text-slate-600">Manage platform settings and system configuration</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              fetchPlatformSettings();
              fetchStaffProfile();
              fetchSystemLogs();
              fetchSystemHealth();
            }}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowBackupModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Backup
          </button>
        </div>
      </div>

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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input
                        type="text"
                        defaultValue={staffProfile.firstName || ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        defaultValue={staffProfile.lastName || ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={staffProfile.email || ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue={staffProfile.phone || ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => handleStaffProfileUpdate({})}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Account Security */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Password</p>
                        <p className="text-sm text-slate-600">Last changed 30 days ago</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Change
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-600">Add an extra layer of security</p>
                      </div>
                      <button className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Shield className="h-4 w-4 mr-1" />
                        Enable
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Login Sessions</p>
                        <p className="text-sm text-slate-600">Manage active sessions</p>
                      </div>
                      <button className="flex items-center px-3 py-1 text-slate-600 hover:text-slate-900 transition-colors">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Tab */}
          {activeTab === 'platform' && (
            <div className="space-y-6">
              {/* General Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Platform Name</label>
                    <input
                      type="text"
                      defaultValue={platformSettings.general?.platformName || ''}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Default Language</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="LKR">Sri Lankan Rupee (LKR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="Asia/Colombo">Asia/Colombo</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => handlePlatformSettingsUpdate('general', {})}
                  className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </button>
              </div>

              {/* Commission Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Commission Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Platform Commission (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={(platformSettings.commission?.platformCommission * 100) || 15}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Guide Commission (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={(platformSettings.commission?.guideCommission * 100) || 70}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hotel Commission (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={(platformSettings.commission?.hotelCommission * 100) || 75}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Commission (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={(platformSettings.commission?.vehicleCommission * 100) || 80}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handlePlatformSettingsUpdate('commission', {})}
                  className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Commission Settings
                </button>
              </div>

              {/* Feature Flags */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Feature Flags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Enable Reviews</p>
                      <p className="text-sm text-slate-600">Allow customers to leave reviews</p>
                    </div>
                    <input type="checkbox" defaultChecked={platformSettings.features?.enableReviews} className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Enable Chat</p>
                      <p className="text-sm text-slate-600">Enable customer chat feature</p>
                    </div>
                    <input type="checkbox" defaultChecked={platformSettings.features?.enableChat} className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Enable Live Tracking</p>
                      <p className="text-sm text-slate-600">Real-time location tracking</p>
                    </div>
                    <input type="checkbox" defaultChecked={platformSettings.features?.enableLiveTracking} className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Enable Dark Mode</p>
                      <p className="text-sm text-slate-600">Dark theme option</p>
                    </div>
                    <input type="checkbox" defaultChecked={platformSettings.features?.enableDarkMode} className="w-4 h-4 text-blue-600 rounded" />
                  </div>
                </div>
                <button
                  onClick={() => handlePlatformSettingsUpdate('features', {})}
                  className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Feature Settings
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password Minimum Length</label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      defaultValue={platformSettings.security?.passwordMinLength || 8}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      defaultValue={platformSettings.security?.sessionTimeout || 30}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      defaultValue={platformSettings.security?.maxLoginAttempts || 5}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      defaultValue={platformSettings.security?.lockoutDuration || 15}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked={platformSettings.security?.passwordRequireSpecial} className="w-4 h-4 text-blue-600 rounded mr-3" />
                    <span className="text-sm text-slate-700">Require special characters in passwords</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked={platformSettings.security?.passwordRequireNumbers} className="w-4 h-4 text-blue-600 rounded mr-3" />
                    <span className="text-sm text-slate-700">Require numbers in passwords</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked={platformSettings.security?.passwordRequireUppercase} className="w-4 h-4 text-blue-600 rounded mr-3" />
                    <span className="text-sm text-slate-700">Require uppercase letters in passwords</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked={platformSettings.security?.sslRequired} className="w-4 h-4 text-blue-600 rounded mr-3" />
                    <span className="text-sm text-slate-700">Require SSL for all connections</span>
                  </div>
                </div>
                <button
                  onClick={() => handlePlatformSettingsUpdate('security', {})}
                  className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* System Health */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Database</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.database?.status)}`}>
                          {systemHealth.database?.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Response Time:</span>
                        <span className="text-sm font-medium">{systemHealth.database?.responseTime}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Active Connections:</span>
                        <span className="text-sm font-medium">{systemHealth.database?.connections?.active}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Server</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.server?.status)}`}>
                          {systemHealth.server?.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">CPU Usage:</span>
                        <span className="text-sm font-medium">{systemHealth.server?.cpuUsage}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Memory Usage:</span>
                        <span className="text-sm font-medium">{systemHealth.server?.memoryUsage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* External Services */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">External Services</h3>
                <div className="space-y-3">
                  {Object.entries(systemHealth.services || {}).map(([service, data]) => (
                    <div key={service} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(data.status).includes('green') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <p className="font-medium text-slate-900 capitalize">{service.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm text-slate-600">{data.responseTime}ms response time</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                        {data.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* System Logs */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">System Logs</h3>
                  <div className="flex items-center space-x-2">
                    <select className="px-3 py-1 border border-slate-300 rounded-lg text-sm">
                      <option value="all">All Levels</option>
                      <option value="error">Error</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {systemLogs.map((log) => (
                    <div key={log._id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{log.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                          {log.userId && <span>User: {log.userId}</span>}
                          <span>IP: {log.ip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Create System Backup</h3>
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Backup Type</label>
                  <select
                    value={backupData.type}
                    onChange={(e) => setBackupData({ ...backupData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full">Full Backup</option>
                    <option value="incremental">Incremental Backup</option>
                    <option value="differential">Differential Backup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={backupData.description}
                    onChange={(e) => setBackupData({ ...backupData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional description..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSystemBackup}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManagement;
