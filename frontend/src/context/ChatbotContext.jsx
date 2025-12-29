import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { sendMessage } from '../services/geminiService'
import api from '../services/api'

const ChatbotContext = createContext()

const initialState = {
  messages: [
    {
      id: 1,
      text: "Hello! I'm your SerendibGo assistant. How can I help you discover amazing experiences in Sri Lanka today? 🇱🇰",
      sender: 'bot',
      timestamp: new Date()
    }
  ],
  isLoading: false,
  error: null,
  userBookings: [],
  isOpen: false
}

const chatbotReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isLoading: false,
        error: null
      }
    
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload
      }
    
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [initialState.messages[0]]
      }
    
    case 'SET_USER_BOOKINGS':
      return {
        ...state,
        userBookings: action.payload
      }
    
    case 'SET_OPEN':
      return {
        ...state,
        isOpen: action.payload
      }
    
    default:
      return state
  }
}

export const ChatbotProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatbotReducer, initialState)

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot-messages')
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        dispatch({ type: 'SET_MESSAGES', payload: messagesWithDates })
      } catch (error) {
        console.error('Error loading saved messages:', error)
      }
    }
  }, [])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (state.messages.length > 1) { // Don't save just the initial message
      localStorage.setItem('chatbot-messages', JSON.stringify(state.messages))
    }
  }, [state.messages])

  // Fetch user bookings when chatbot opens
  const fetchUserBookings = async () => {
    try {
      const response = await api.get('/bookings/user')
      if (response.data.success) {
        const bookings = response.data.data.bookings || []
        dispatch({ type: 'SET_USER_BOOKINGS', payload: bookings })
        return bookings
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      return []
    }
    return []
  }

  // Send message to AI and get response
  const sendMessageToAI = async (message, userContext = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      // Add user message to conversation
      const userMessage = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      }
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

      // Prepare conversation history for AI (last 10 messages)
      const recentHistory = state.messages.slice(-10)
      
      // Prepare user context with bookings
      const userBookings = userContext.bookings || state.userBookings
      const contextWithBookings = {
        ...userContext,
        bookings: userBookings
      }

      // Get AI response
      const aiResponse = await sendMessage(message, recentHistory, contextWithBookings)
      
      console.log('ChatbotContext Debug:', {
        message,
        aiResponse,
        responseLength: aiResponse?.length || 0,
        responseType: typeof aiResponse,
        hasResponse: !!aiResponse
      })

      // Add AI response to conversation
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }
      dispatch({ type: 'ADD_MESSAGE', payload: botMessage })

    } catch (error) {
      console.error('Error sending message to AI:', error)
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })
    }
  }

  // Clear conversation history
  const clearHistory = () => {
    dispatch({ type: 'CLEAR_MESSAGES' })
    localStorage.removeItem('chatbot-messages')
  }

  // Open chatbot and fetch user data if needed
  const openChatbot = async (userContext = {}) => {
    dispatch({ type: 'SET_OPEN', payload: true })
    
    // Fetch user bookings if user is authenticated
    if (userContext.user) {
      await fetchUserBookings()
    }
  }

  // Close chatbot
  const closeChatbot = () => {
    dispatch({ type: 'SET_OPEN', payload: false })
  }

  // Get conversation history for external use
  const getHistory = () => {
    return state.messages
  }

  // Get recent conversation context (last 5 messages)
  const getRecentContext = () => {
    return state.messages.slice(-5)
  }

  const value = {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    userBookings: state.userBookings,
    isOpen: state.isOpen,
    
    // Actions
    sendMessage: sendMessageToAI,
    clearHistory,
    openChatbot,
    closeChatbot,
    getHistory,
    getRecentContext,
    fetchUserBookings
  }

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  )
}

export const useChatbot = () => {
  const context = useContext(ChatbotContext)
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider')
  }
  return context
}
