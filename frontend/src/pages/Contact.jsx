import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Headphones,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import GlassCard from '../components/common/GlassCard'

const Contact = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || user?.firstName || '',
    email: user?.email || '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium'
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Your message has been sent successfully! We\'ll get back to you soon.')
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: ''
      }))
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const supportCategories = [
    { value: 'general', label: 'General Inquiry', icon: Info },
    { value: 'booking', label: 'Booking Support', icon: MessageSquare },
    { value: 'payment', label: 'Payment Issues', icon: AlertCircle },
    { value: 'technical', label: 'Technical Support', icon: Headphones },
    { value: 'feedback', label: 'Feedback', icon: CheckCircle }
  ]

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: "+94 11 234 5678",
      subContent: "Mon-Fri 9AM-6PM (LKT)",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: Mail,
      title: "Email",
      content: "support@serendibgo.com",
      subContent: "We respond within 24 hours",
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      icon: MapPin,
      title: "Address",
      content: "123 Colombo Street",
      subContent: "Colombo 03, Sri Lanka",
      color: "text-rose-500",
      bg: "bg-rose-50"
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon - Fri: 9:00 AM - 6:00 PM",
      subContent: "Sat: 9:00 AM - 1:00 PM, Sun: Closed",
      color: "text-amber-500",
      bg: "bg-amber-50"
    }
  ]

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-200/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary-200/20 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-surface-900 mb-6 font-display">
            Contact <span className="text-primary-600">Support</span>
          </h1>
          <p className="text-xl text-surface-600 max-w-2xl mx-auto font-sans leading-relaxed">
            We're here to help! Get in touch with our support team for any questions or assistance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information & FAQ */}
          <div className="lg:col-span-1 space-y-8">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-surface-900 mb-8 font-display">Get in Touch</h2>

              <div className="space-y-8">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 group"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-surface-900 mb-1">{item.title}</h3>
                      <p className="text-surface-700 font-medium">{item.content}</p>
                      <p className="text-sm text-surface-500">{item.subContent}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* FAQ Section */}
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-surface-900 mb-6 font-display">Quick Help</h2>
              <div className="space-y-6">
                {[
                  { q: "How do I book a tour?", a: "Browse our tours, select your preferred dates, and complete the booking process." },
                  { q: "Can I cancel my booking?", a: "Yes, you can cancel up to 24 hours before your tour for a full refund." },
                  { q: "What payment methods do you accept?", a: "We accept credit cards, debit cards, and bank transfers." }
                ].map((faq, i) => (
                  <div key={i} className="pb-4 border-b border-surface-200/50 last:border-0 last:pb-0">
                    <h3 className="font-bold text-surface-900 mb-2">{faq.q}</h3>
                    <p className="text-sm text-surface-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8 h-full">
              <h2 className="text-2xl font-bold text-surface-900 mb-8 font-display">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-surface-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-surface-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-surface-700 mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none appearance-none"
                      >
                        {supportCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-surface-700 mb-2">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none appearance-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of your inquiry"
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Please provide detailed information about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 hover:scale-[1.02] transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 font-bold text-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
