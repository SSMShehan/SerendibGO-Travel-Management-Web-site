// Staff Support & Quality Control Component
import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  Reply,
  Flag,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Tag,
  FileText,
  Download,
  RefreshCw,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  ExternalLink,
  Info,
  Shield,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Camera,
  Upload as UploadIcon,
  Download as DownloadIcon,
  RefreshCw as RefreshCwIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Plus as PlusIcon,
  X as XIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  ExternalLink as ExternalLinkIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Copy as CopyIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Ban as BanIcon,
  Unlock as UnlockIcon,
  Lock as LockIcon,
  EyeOff as EyeOffIcon,
  Send as SendIcon,
  Reply as ReplyIcon
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import staffService from '../../../services/staff/staffService';
import toast from 'react-hot-toast';

const SupportManagement = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ticketStats, setTicketStats] = useState({});
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    rating: 'all',
    search: ''
  });

  // Fetch support tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await staffService.getSupportTickets(filters);
      setTickets(data.data.tickets);
      setTicketStats(data.data.stats);
    } catch (error) {
      console.error('Fetch tickets error:', error);
      toast.error(error.message || 'Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const data = await staffService.getReviews(filters);
      setReviews(data.data.reviews);
      setReviewStats(data.data.stats);
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast.error(error.message || 'Failed to fetch reviews');
    }
  };

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [filters, activeTab]);

  // Handle ticket update
  const handleTicketUpdate = async (ticketId, updateData) => {
    try {
      const data = await staffService.updateSupportTicket(ticketId, updateData);
      toast.success(data.message);
      fetchTickets();
    } catch (error) {
      console.error('Update ticket error:', error);
      toast.error(error.message || 'Failed to update ticket');
    }
  };

  // Handle ticket resolution
  const handleTicketResolution = async (ticketId, resolution) => {
    try {
      const data = await staffService.resolveSupportTicket(ticketId, resolution);
      toast.success(data.message);
      setShowTicketModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Resolve ticket error:', error);
      toast.error(error.message || 'Failed to resolve ticket');
    }
  };

  // Handle message addition
  const handleAddMessage = async (ticketId, message) => {
    try {
      const data = await staffService.addSupportMessage(ticketId, message);
      toast.success(data.message);
      fetchTickets();
    } catch (error) {
      console.error('Add message error:', error);
      toast.error(error.message || 'Failed to add message');
    }
  };

  // Handle review moderation
  const handleReviewModeration = async (reviewId, status, reason) => {
    try {
      const data = await staffService.moderateReview(reviewId, status, reason);
      toast.success(data.message);
      setShowReviewModal(false);
      fetchReviews();
    } catch (error) {
      console.error('Moderate review error:', error);
      toast.error(error.message || 'Failed to moderate review');
    }
  };

  // View ticket details
  const viewTicketDetails = async (ticketId) => {
    try {
      const data = await staffService.getSupportTicket(ticketId);
      setSelectedTicket(data.data);
      setShowTicketModal(true);
    } catch (error) {
      console.error('Get ticket details error:', error);
      toast.error('Failed to fetch ticket details');
    }
  };

  const tabs = [
    { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
    { id: 'reviews', label: 'Review Moderation', icon: Star }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return AlertCircle;
      case 'in_progress': return Clock;
      case 'resolved': return CheckCircle;
      case 'closed': return XCircle;
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return AlertCircle;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 5: return 'text-green-600';
      case 4: return 'text-green-500';
      case 3: return 'text-yellow-500';
      case 2: return 'text-orange-500';
      case 1: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Support & Quality Control</h2>
          <p className="text-slate-600">Manage customer support and review moderation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (activeTab === 'tickets') fetchTickets();
              else fetchReviews();
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
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Open Tickets</p>
              <p className="text-2xl font-bold text-red-600">{ticketStats.open || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{ticketStats.in_progress || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-600">{reviewStats.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Rating</p>
              <p className="text-2xl font-bold text-blue-600">
                {reviewStats.averageRating?.toFixed(1) || '0.0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search..."
                />
              </div>
            </div>

            {activeTab === 'tickets' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="booking">Booking</option>
                    <option value="payment">Payment</option>
                    <option value="service">Service</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'reviews' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </>
            )}
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
          {/* Support Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">No support tickets</h3>
                  <p className="text-slate-500">No tickets match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => {
                    const StatusIcon = getStatusIcon(ticket.status);
                    return (
                      <div
                        key={ticket._id}
                        className="p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(ticket.status)}`}>
                              <StatusIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                  {ticket.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{ticket.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {ticket.user.firstName} {ticket.user.lastName}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Tag className="h-4 w-4 mr-1" />
                                  {ticket.category}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewTicketDetails(ticket._id)}
                              className="flex items-center px-3 py-1 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            {ticket.status === 'open' && (
                              <button
                                onClick={() => handleTicketUpdate(ticket._id, { status: 'in_progress' })}
                                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Assign
                              </button>
                            )}
                            {ticket.status === 'in_progress' && (
                              <button
                                onClick={() => handleTicketResolution(ticket._id, 'Issue resolved')}
                                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">No reviews found</h3>
                  <p className="text-slate-500">No reviews match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const StatusIcon = getStatusIcon(review.status);
                    return (
                      <div
                        key={review._id}
                        className="p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(review.status)}`}>
                              <StatusIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-slate-900">{review.tour.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                                  {review.status}
                                </span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? getRatingColor(review.rating) : 'text-gray-300'
                                      }`}
                                      fill={i < review.rating ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{review.comment}</p>
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {review.user.firstName} {review.user.lastName}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  Guide: {review.tour.guide.firstName} {review.tour.guide.lastName}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setShowReviewModal(true);
                              }}
                              className="flex items-center px-3 py-1 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            {review.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleReviewModeration(review._id, 'approved', 'Review approved')}
                                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReviewModeration(review._id, 'rejected', 'Review rejected')}
                                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Support Ticket Details</h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Ticket Info */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Ticket Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Subject:</span>
                      <p className="text-slate-600">{selectedTicket.subject}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Status:</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Priority:</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Category:</span>
                      <p className="text-slate-600">{selectedTicket.category}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Name:</span>
                      <p className="text-slate-600">{selectedTicket.user.firstName} {selectedTicket.user.lastName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Email:</span>
                      <p className="text-slate-600">{selectedTicket.user.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Phone:</span>
                      <p className="text-slate-600">{selectedTicket.user.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Messages</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTicket.messages?.map((message) => (
                      <div key={message._id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-700">
                            {message.senderName}
                          </span>
                          <span className="text-sm text-slate-500">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Message */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Add Message</h4>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your message..."
                    />
                    <button
                      onClick={() => {
                        if (newMessage.trim()) {
                          handleAddMessage(selectedTicket._id, newMessage);
                          setNewMessage('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => {
                        handleTicketUpdate(selectedTicket._id, { status: 'in_progress' });
                        setShowTicketModal(false);
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Assign to Me
                    </button>
                  )}
                  
                  {selectedTicket.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        handleTicketResolution(selectedTicket._id, 'Issue resolved');
                        setShowTicketModal(false);
                      }}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Review Details</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Review Info */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Review Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Tour:</span>
                      <p className="text-slate-600">{selectedReview.tour.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Rating:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < selectedReview.rating ? getRatingColor(selectedReview.rating) : 'text-gray-300'
                            }`}
                            fill={i < selectedReview.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Status:</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReview.status)}`}>
                        {selectedReview.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Date:</span>
                      <p className="text-slate-600">{new Date(selectedReview.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Name:</span>
                      <p className="text-slate-600">{selectedReview.user.firstName} {selectedReview.user.lastName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Email:</span>
                      <p className="text-slate-600">{selectedReview.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Review Content</h4>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-slate-700">{selectedReview.comment}</p>
                  </div>
                </div>

                {/* Actions */}
                {selectedReview.status === 'pending' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        handleReviewModeration(selectedReview._id, 'approved', 'Review approved');
                        setShowReviewModal(false);
                      }}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve Review
                    </button>
                    <button
                      onClick={() => {
                        handleReviewModeration(selectedReview._id, 'rejected', 'Review rejected');
                        setShowReviewModal(false);
                      }}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagement;
