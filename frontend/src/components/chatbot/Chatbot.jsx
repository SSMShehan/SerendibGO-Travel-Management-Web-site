import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { useChatbot } from '../../context/ChatbotContext'
import { useAuth } from '../../context/AuthContext'
import siteDataService from '../../services/siteDataService'

const Chatbot = () => {
  const { user } = useAuth()
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearHistory,
    isOpen,
    openChatbot,
    closeChatbot
  } = useChatbot()
  
  const [inputMessage, setInputMessage] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Debug: Log chatbot state
  console.log('Chatbot Debug:', { isOpen, user: !!user, messagesCount: messages.length })

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Check if user has scrolled up
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      setShowScrollButton(!isAtBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const message = inputMessage.trim()
    setInputMessage('')

    // Fetch real site data for AI context
    const siteData = await siteDataService.getSiteData()
    
    // Prepare user context with real data
    const userContext = {
      user: user,
      bookings: await siteDataService.getUserBookings(),
      siteData: siteData
    }

    // Send message to AI with real site data
    await sendMessage(message, userContext)
  }

  return (
    <>
      {/* Chat Button - Proper Size with Blinking Effect */}
      <button
        onClick={() => openChatbot({ user })}
        className="chatbot-button rounded-full text-white shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        style={{ 
          opacity: '1 !important',
          visibility: 'visible !important',
          display: isOpen ? 'none' : 'flex',
          position: 'fixed !important',
          bottom: '24px !important',
          right: '24px !important',
          zIndex: '9999 !important',
          backgroundColor: '#3b82f6 !important',
          border: '2px solid #ffffff !important',
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.6) !important',
          animation: 'chatbotPulse 2s ease-in-out infinite !important',
          width: '56px !important',
          height: '56px !important'
        }}
      >
        <MessageCircle className="w-6 h-6" style={{ 
          opacity: '1 !important', 
          visibility: 'visible !important',
          color: 'white !important'
        }} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-base-100 rounded-xl shadow-2xl border border-base-300 z-50 flex flex-col">
          {/* Header */}
          <div 
            className="chatbot-header bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between"
            style={{
              backgroundColor: '#2563eb !important',
              color: 'white !important',
              padding: '16px !important',
              borderRadius: '12px 12px 0 0 !important',
              display: 'flex !important',
              alignItems: 'center !important',
              justifyContent: 'space-between !important',
              minHeight: '60px !important'
            }}
          >
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" style={{ color: 'white !important' }} />
              <span className="font-semibold text-white" style={{ color: 'white !important', fontWeight: '600 !important' }}>
                SerendibGo Assistant
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearHistory}
                className="text-white hover:text-gray-200 text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                style={{ color: 'white !important' }}
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                onClick={closeChatbot}
                className="text-white hover:text-gray-200 p-1 rounded hover:bg-white/10 transition-colors"
                style={{ color: 'white !important' }}
              >
                <X className="w-5 h-5" style={{ color: 'white !important' }} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0 relative"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[280px] ${
                    message.sender === 'user'
                      ? 'user-message bg-blue-600 text-white p-4 rounded-2xl rounded-br-md shadow-lg border-2 border-blue-700'
                      : message.isError
                      ? 'bg-gradient-to-r from-error to-error-focus text-error-content p-4 rounded-2xl rounded-bl-md shadow-lg'
                      : 'bg-gradient-to-r from-base-200 to-base-300 text-base-content p-4 rounded-2xl rounded-bl-md shadow-md border border-base-300'
                  }`}
                  style={message.sender === 'user' ? {
                    backgroundColor: '#2563eb !important',
                    color: 'white !important',
                    borderColor: '#1d4ed8 !important'
                  } : {}}
                >
                  <div className="flex items-start space-x-3">
                    {message.sender === 'bot' && !message.isError && (
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    {message.sender === 'user' && (
                      <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-white" style={{ color: 'white !important' }} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p 
                        className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          message.sender === 'user' ? 'text-white' : ''
                        }`}
                        style={message.sender === 'user' ? { color: 'white !important' } : {}}
                      >
                        {message.text}
                      </p>
                      <span 
                        className={`text-xs mt-1 block ${
                          message.sender === 'user' ? 'text-white/80' : 'opacity-60'
                        }`}
                        style={message.sender === 'user' ? { color: 'rgba(255, 255, 255, 0.8) !important' } : {}}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-base-200 to-base-300 text-base-content p-4 rounded-2xl rounded-bl-md shadow-md border border-base-300 max-w-[280px]">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
            
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-10"
                title="Scroll to bottom"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-base-300 bg-base-50">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about tours, hotels, vehicles..."
                className="flex-1 input input-bordered input-sm bg-white text-gray-900 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4 hover:scale-105 transition-transform"
                disabled={!inputMessage.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
