import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  Users,
  Headphones,
  Home,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const GuideSupport = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('contact')
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await api.post('/support/tickets', {
        subject: formData.subject,
        description: formData.message,
        category: formData.category,
        priority: formData.priority
      })
      
      if (response.data.success) {
        setIsSubmitting(false)
        setSubmitted(true)
        setFormData({ subject: '', category: '', priority: 'medium', message: '' })
      } else {
        throw new Error(response.data.message || 'Failed to submit support ticket')
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error)
      setIsSubmitting(false)
      alert('Failed to submit support ticket. Please try again.')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support', icon: Headphones }
  ]

  const handleTabClick = (tabId) => {
    if (tabId === 'overview') {
      navigate('/guide/dashboard')
    } else if (tabId === 'notifications') {
      navigate('/guide-notifications')
    } else if (tabId === 'profile') {
      navigate('/guide/dashboard', { state: { activeTab: 'profile' } })
    } else if (tabId === 'services') {
      navigate('/guide/dashboard', { state: { activeTab: 'services' } })
    } else if (tabId === 'pricing') {
      navigate('/guide/dashboard', { state: { activeTab: 'pricing' } })
    } else if (tabId === 'availability') {
      navigate('/guide/dashboard', { state: { activeTab: 'availability' } })
    } else if (tabId === 'stats') {
      navigate('/guide/dashboard', { state: { activeTab: 'stats' } })
    }
  }

  const tabs = [
    { id: 'contact', label: 'Contact Support', icon: MessageSquare },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'resources', label: 'Resources', icon: FileText }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen])

  const faqItems = [
    {
      question: "How do I update my guide profile?",
      answer: "You can update your profile by going to the Profile tab in your dashboard. Make sure to keep your information current and accurate."
    },
    {
      question: "How do I set my availability?",
      answer: "Use the Availability tab in your dashboard to set your working days and times. This helps tourists know when you're available."
    },
    {
      question: "How do I receive bookings?",
      answer: "When tourists book your services, you'll receive notifications. You can view and manage all bookings in your dashboard."
    },
    {
      question: "What if I need to cancel a booking?",
      answer: "Contact the tourist directly or reach out to our support team. We recommend giving as much notice as possible."
    },
    {
      question: "How do I get paid?",
      answer: "Payments are processed through our platform. You'll receive payments within 3-5 business days after completing a tour."
    }
  ]

  const resources = [
    {
      title: "Guide Best Practices",
      description: "Learn how to provide excellent service to tourists",
      icon: Users,
      link: "#"
    },
    {
      title: "Safety Guidelines",
      description: "Important safety information for tour guides",
      icon: AlertCircle,
      link: "#"
    },
    {
      title: "Marketing Tips",
      description: "How to attract more tourists to your services",
      icon: FileText,
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Customer Support</h1>
                <p className="text-slate-600">Get help and support for your guide services</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{user?.firstName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/guide/dashboard', { state: { activeTab: 'profile' } })
                        setIsProfileDropdownOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        navigate('/guide-notifications')
                        setIsProfileDropdownOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Bell className="h-4 w-4 mr-3" />
                      Notifications
                    </button>
                    <button
                      onClick={() => {
                        navigate('/guide/dashboard')
                        setIsProfileDropdownOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Home className="h-4 w-4 mr-3" />
                      Dashboard
                    </button>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsProfileDropdownOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-8">
              <nav className="space-y-2">
                {navigationTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        tab.id === 'support'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Support Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
              <div className="flex flex-wrap gap-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Support Content */}
              <div className="lg:col-span-2">
                {/* Contact Support Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-8">
                    {submitted ? (
                      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                        <p className="text-slate-600 mb-6">
                          Thank you for contacting us. We'll get back to you within 24 hours.
                        </p>
                        <button
                          onClick={() => setSubmitted(false)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold"
                        >
                          Send Another Message
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                        <div className="flex items-center mb-6">
                          <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
                          <h2 className="text-2xl font-bold text-slate-900">Contact Support</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Subject
                              </label>
                              <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Brief description of your issue"
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Category
                              </label>
                              <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                required
                              >
                                <option value="">Select a category</option>
                                <option value="profile">Profile Issues</option>
                                <option value="booking">Booking Problems</option>
                                <option value="payment">Payment Issues</option>
                                <option value="technical">Technical Support</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Priority
                            </label>
                            <select
                              name="priority"
                              value={formData.priority}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                              <option value="low">Low - General inquiry</option>
                              <option value="medium">Medium - Need assistance</option>
                              <option value="high">High - Urgent issue</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Message
                            </label>
                            <textarea
                              name="message"
                              value={formData.message}
                              onChange={handleInputChange}
                              rows="6"
                              placeholder="Please provide detailed information about your issue..."
                              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 font-semibold disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Message
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                    <div className="flex items-center mb-6">
                      <HelpCircle className="h-6 w-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
                    </div>
                    
                    <div className="space-y-6">
                      {faqItems.map((item, index) => (
                        <div key={index} className="border border-slate-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {item.question}
                          </h3>
                          <p className="text-slate-600">
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                    <div className="flex items-center mb-6">
                      <FileText className="h-6 w-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold text-slate-900">Helpful Resources</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {resources.map((resource, index) => {
                        const Icon = resource.icon
                        return (
                          <div key={index} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <Icon className="h-5 w-5 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900">
                                {resource.title}
                              </h3>
                            </div>
                            <p className="text-slate-600 mb-4">
                              {resource.description}
                            </p>
                            <a
                              href={resource.link}
                              className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Learn More →
                            </a>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Contact Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-8">
                  <div className="flex items-center mb-6">
                    <Headphones className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-slate-900">Quick Contact</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="font-medium">Phone</span>
                      </div>
                      <p className="text-slate-800 font-semibold">+94 11 234 5678</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="font-medium">Email</span>
                      </div>
                      <p className="text-slate-800 font-semibold">support@serendibgo.com</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-medium">Working Hours</span>
                      </div>
                      <p className="text-slate-800 font-semibold">Mon-Fri 9AM-6PM</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                    <h4 className="font-semibold mb-2">Need Immediate Help?</h4>
                    <p className="text-sm opacity-90 mb-3">
                      Our support team is here to help you with any questions or issues.
                    </p>
                    <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuideSupport