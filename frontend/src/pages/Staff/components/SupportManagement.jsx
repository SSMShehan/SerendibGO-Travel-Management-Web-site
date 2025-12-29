import React, { useState, useEffect } from 'react'
import {
  Headphones,
  Search,
  Filter,
  Eye,
  XCircle,
  AlertCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash,
  RefreshCw,
  Download,
  Upload,
  Plus,
  BarChart3,
  TrendingUp,
  Clock,
  Shield,
  Globe,
  Camera,
  Settings,
  MessageSquare,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Archive,
  Ban,
  Unlock,
  Lock,
  EyeOff,
  Send,
  Reply,
  ExternalLink,
  Copy,
  Share,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Award,
  BookOpen,
  Languages,
  Briefcase,
  Target,
  Zap,
  Activity,
  UserCheck,
  Crown,
  FileText,
  CreditCard,
  Map,
  Navigation,
  Compass,
  User,
  MessageCircle,
  Bell,
  HelpCircle,
  Bug,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Tag,
  AtSign,
  Hash as HashIcon
} from 'lucide-react'

const SupportManagement = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyData, setReplyData] = useState({ ticketId: '', message: '', priority: 'medium' })
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: '',
    status: '',
    assignedTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pages: 0,
    limit: 10
  })

  // Statistics
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    highPriorityTickets: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0
  })

  // Mock data for support tickets
  const mockTickets = [
    {
      id: 1,
      ticketNumber: 'ST-2024-001',
      subject: 'Booking cancellation issue',
      description: 'I need to cancel my hotel booking but the system is not allowing me to do so. The cancellation button is not working.',
      category: 'Booking',
      priority: 'high',
      status: 'open',
      customer: {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 555 123 4567'
      },
      assignedTo: {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@serendibgo.com'
      },
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      lastResponse: '2024-01-20T14:45:00Z',
      responseTime: 4.25, // hours
      tags: ['booking', 'cancellation', 'technical'],
      attachments: [],
      satisfaction: null
    },
    {
      id: 2,
      ticketNumber: 'ST-2024-002',
      subject: 'Guide not responding to messages',
      description: 'I booked a guide for tomorrow but they are not responding to my messages. I need to confirm the meeting point.',
      category: 'Guide',
      priority: 'medium',
      status: 'in_progress',
      customer: {
        id: 2,
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1 555 234 5678'
      },
      assignedTo: {
        id: 2,
        name: 'Mike Chen',
        email: 'mike.chen@serendibgo.com'
      },
      createdAt: '2024-01-19T16:20:00Z',
      updatedAt: '2024-01-20T09:15:00Z',
      lastResponse: '2024-01-20T09:15:00Z',
      responseTime: 16.92, // hours
      tags: ['guide', 'communication', 'urgent'],
      attachments: [],
      satisfaction: null
    },
    {
      id: 3,
      ticketNumber: 'ST-2024-003',
      subject: 'Payment refund request',
      description: 'I paid for a tour but it was cancelled due to weather. I need a full refund to my credit card.',
      category: 'Payment',
      priority: 'high',
      status: 'resolved',
      customer: {
        id: 3,
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '+1 555 345 6789'
      },
      assignedTo: {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@serendibgo.com'
      },
      createdAt: '2024-01-18T11:45:00Z',
      updatedAt: '2024-01-19T15:30:00Z',
      lastResponse: '2024-01-19T15:30:00Z',
      responseTime: 27.75, // hours
      tags: ['payment', 'refund', 'cancellation'],
      attachments: [],
      satisfaction: 5
    },
    {
      id: 4,
      ticketNumber: 'ST-2024-004',
      subject: 'Website loading slowly',
      description: 'The website is taking too long to load, especially when searching for hotels. This is affecting my booking experience.',
      category: 'Technical',
      priority: 'medium',
      status: 'open',
      customer: {
        id: 4,
        name: 'Lisa Brown',
        email: 'lisa.brown@email.com',
        phone: '+1 555 456 7890'
      },
      assignedTo: null,
      createdAt: '2024-01-20T08:15:00Z',
      updatedAt: '2024-01-20T08:15:00Z',
      lastResponse: null,
      responseTime: null,
      tags: ['website', 'performance', 'technical'],
      attachments: [],
      satisfaction: null
    },
    {
      id: 5,
      ticketNumber: 'ST-2024-005',
      subject: 'Hotel room not as described',
      description: 'The hotel room I booked is completely different from what was shown in the photos. The room is much smaller and lacks amenities.',
      category: 'Hotel',
      priority: 'high',
      status: 'in_progress',
      customer: {
        id: 5,
        name: 'Robert Taylor',
        email: 'robert.taylor@email.com',
        phone: '+1 555 567 8901'
      },
      assignedTo: {
        id: 3,
        name: 'Emily Davis',
        email: 'emily.davis@serendibgo.com'
      },
      createdAt: '2024-01-19T20:30:00Z',
      updatedAt: '2024-01-20T12:00:00Z',
      lastResponse: '2024-01-20T12:00:00Z',
      responseTime: 15.5, // hours
      tags: ['hotel', 'quality', 'complaint'],
      attachments: [],
      satisfaction: null
    }
  ]

  useEffect(() => {
    loadTickets()
    loadStats()
  }, [filters, pagination.current])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      })

      const response = await fetch(`/api/staff/support/tickets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch support tickets')
      }

      const data = await response.json()
      
      if (data.success) {
        setTickets(data.data.tickets || [])
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination?.totalCount || 0,
          pages: data.data.pagination?.totalPages || 0
        }))
      } else {
        throw new Error(data.message || 'Failed to load tickets')
      }
    } catch (err) {
      setError('Failed to load support tickets: ' + err.message)
      console.error('Error loading tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const totalTickets = tickets.length
      const openTickets = tickets.filter(t => t.status === 'open').length
      const closedTickets = tickets.filter(t => t.status === 'resolved').length
      const highPriorityTickets = tickets.filter(t => t.priority === 'high').length
      const avgResponseTime = tickets
        .filter(t => t.responseTime)
        .reduce((sum, t) => sum + t.responseTime, 0) / tickets.filter(t => t.responseTime).length
      const customerSatisfaction = tickets
        .filter(t => t.satisfaction)
        .reduce((sum, t) => sum + t.satisfaction, 0) / tickets.filter(t => t.satisfaction).length
      
      setStats({
        totalTickets,
        openTickets,
        closedTickets,
        highPriorityTickets,
        averageResponseTime: Math.round(avgResponseTime * 100) / 100,
        customerSatisfaction: Math.round(customerSatisfaction * 100) / 100
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const handleReply = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`/api/staff/support/tickets/${replyData.ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: replyData.message,
          attachments: []
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send reply')
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Reply sent successfully')
        setShowReplyModal(false)
        setReplyData({ ticketId: '', message: '', priority: 'medium' })
        
        // Reload data
        loadTickets()
        loadStats()
      } else {
        throw new Error(data.message || 'Failed to send reply')
      }
    } catch (err) {
      setError('Failed to send reply: ' + err.message)
      console.error('Error sending reply:', err)
    }
  }

  const openReplyModal = (ticketId) => {
    setReplyData({ ticketId, message: '', priority: 'medium' })
    setShowReplyModal(true)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'closed': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <AlertCircle className="h-4 w-4" />
      case 'low': return <Info className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Booking': return <Calendar className="h-4 w-4" />
      case 'Guide': return <UserCheck className="h-4 w-4" />
      case 'Payment': return <CreditCard className="h-4 w-4" />
      case 'Technical': return <Bug className="h-4 w-4" />
      case 'Hotel': return <Shield className="h-4 w-4" />
      default: return <HelpCircle className="h-4 w-4" />
    }
  }

  const tabs = [
    { id: 'all', label: 'All Tickets', count: stats.totalTickets },
    { id: 'open', label: 'Open', count: stats.openTickets },
    { id: 'in_progress', label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length },
    { id: 'resolved', label: 'Resolved', count: stats.closedTickets }
  ]

  const filteredTickets = activeTab === 'all' 
    ? tickets 
    : activeTab === 'open' 
    ? tickets.filter(ticket => ticket.status === 'open')
    : tickets.filter(ticket => ticket.status === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Support Management</h2>
          <p className="text-slate-600">Manage customer support tickets and inquiries</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadTickets}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{stats.totalTickets}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Total Tickets</h3>
          <p className="text-sm text-slate-600">All support tickets</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{stats.openTickets}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Open Tickets</h3>
          <p className="text-sm text-slate-600">Awaiting response</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{stats.highPriorityTickets}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">High Priority</h3>
          <p className="text-sm text-slate-600">Urgent tickets</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{stats.averageResponseTime}h</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Avg Response</h3>
          <p className="text-sm text-slate-600">Response time</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Booking">Booking</option>
              <option value="Guide">Guide</option>
              <option value="Payment">Payment</option>
              <option value="Technical">Technical</option>
              <option value="Hotel">Hotel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading support tickets...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        {getCategoryIcon(ticket.category)}
                        <span className="text-white text-xs ml-1">{ticket.category}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{ticket.subject}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">#{ticket._id.slice(-8)}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {getPriorityIcon(ticket.priority)}
                            <span className="ml-1 capitalize">{ticket.priority}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <User className="h-4 w-4 mr-2" />
                        {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : 'Unknown User'}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {ticket.user?.email || 'No email'}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {ticket.responseTime ? `${ticket.responseTime}h` : 'No response'}
                      </div>
                    </div>

                    {ticket.assignedTo && (
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Assigned to: {ticket.assignedTo.name}
                        </div>
                      </div>
                    )}

                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-medium text-slate-700">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {ticket.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                          {ticket.tags.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                              +{ticket.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket)
                        setShowDetails(true)
                      }}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                      <button
                        onClick={() => openReplyModal(ticket._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Reply"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                    )}

                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <Headphones className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No tickets found</h3>
                <p className="text-slate-500">No support tickets match your current filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} tickets
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      pagination.current === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Reply to Ticket</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reply Message
              </label>
              <textarea
                value={replyData.message}
                onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Type your reply here..."
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Ticket Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Hash className="h-4 w-4 mr-3 text-slate-400" />
                        <span className="font-medium">Ticket Number:</span>
                        <span className="ml-2">{selectedTicket.ticketNumber}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-3 text-slate-400" />
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-3 text-slate-400" />
                        <span className="font-medium">Last Updated:</span>
                        <span className="ml-2">{new Date(selectedTicket.updatedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                          {getStatusIcon(selectedTicket.status)}
                          <span className="ml-1 capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                        </span>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                          {getPriorityIcon(selectedTicket.priority)}
                          <span className="ml-1 capitalize">{selectedTicket.priority}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Customer Information</h4>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="font-medium">{selectedTicket.customer.name}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{selectedTicket.customer.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{selectedTicket.customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {selectedTicket.assignedTo && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Assigned To</h4>
                      <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <UserCheck className="h-4 w-4 mr-2 text-blue-400" />
                          <span className="font-medium">{selectedTicket.assignedTo.name}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-blue-400" />
                          <span>{selectedTicket.assignedTo.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ticket Description and Tags */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Description</h4>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-600">{selectedTicket.description}</p>
                    </div>
                  </div>

                  {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Response Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="font-medium">Response Time:</span>
                        <span className="ml-2">{selectedTicket.responseTime ? `${selectedTicket.responseTime} hours` : 'No response yet'}</span>
                      </div>
                      {selectedTicket.lastResponse && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="font-medium">Last Response:</span>
                          <span className="ml-2">{new Date(selectedTicket.lastResponse).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedTicket.satisfaction && (
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="font-medium">Customer Satisfaction:</span>
                          <span className="ml-2">{selectedTicket.satisfaction}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      openReplyModal(selectedTicket._id)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-lg z-50">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg z-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportManagement
