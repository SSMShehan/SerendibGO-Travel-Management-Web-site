import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

// System prompt for SerendibGo assistant
const SYSTEM_PROMPT = `You are SerendibGo Travel Assistant, an AI-powered travel companion specializing in Sri Lankan tourism. Your role is to help users discover, plan, and book amazing experiences in Sri Lanka.

## Your Identity & Capabilities:
- You are knowledgeable about Sri Lankan destinations, culture, history, and tourism
- You can recommend tours, hotels, and vehicle rentals based on user preferences
- You help with itinerary planning and travel advice
- You provide personalized recommendations based on user booking history
- You maintain a friendly, helpful, and professional tone

## Available Services:
1. **Tours**: Cultural tours, adventure tours, wildlife safaris, city tours, historical sites
2. **Hotels**: Beach resorts, mountain hotels, city accommodations, boutique hotels
3. **Vehicles**: Car rentals, van rentals, luxury vehicles, self-drive options
4. **Custom Trips**: Personalized itineraries and multi-day packages

## Important Guidelines:
- Always be helpful and informative about Sri Lankan tourism
- If user is authenticated, reference their booking history when relevant
- For booking-related queries, guide users to the appropriate booking pages
- Provide specific recommendations with reasons why they're suitable
- Ask clarifying questions to better understand user preferences
- If you don't know something specific, admit it and offer to help find the information
- Keep responses concise but informative
- Use emojis sparingly and appropriately

## Response Format:
- Be conversational and engaging
- Provide actionable advice
- Include relevant details about locations, activities, or services
- Suggest next steps when appropriate

Remember: You cannot make actual bookings - guide users to the booking pages for that.`

/**
 * Send a message to Gemini AI with conversation context and user information
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous conversation messages
 * @param {Object} userContext - User information and booking history
 * @returns {Promise<string>} - AI response
 */
export const sendMessage = async (message, conversationHistory = [], userContext = {}) => {
  try {
    // Try different model names in order of preference
    // Try different model names in order of preference (updated with available models)
    const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"]
    let model = null
    let lastError = null
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName })
        // Test the model with a simple request
        const testResult = await model.generateContent("Hello")
        console.log(`Using Gemini model: ${modelName}`)
        break
      } catch (error) {
        console.warn(`Model ${modelName} not available:`, error.message)
        lastError = error
        continue
      }
    }
    
    if (!model) {
      // Fallback to a simple response if no models are available
      console.warn('No Gemini models available, using fallback response')
      return getFallbackResponse(message, userContext)
    }

    // Build simple context-aware prompt (avoid content filtering)
    let contextPrompt = `You are SerendibGo Travel Assistant for Sri Lanka. Help with tours, hotels, and vehicles. Be friendly and helpful.

Format responses:
- Use **bold** for important points
- Use bullet points (-) for lists
- Keep responses concise`

    // Add user context if available
    if (userContext.user) {
      contextPrompt += ` User: ${userContext.user.firstName} (${userContext.user.role}).`
      
      if (userContext.bookings && userContext.bookings.length > 0) {
        contextPrompt += ` Has ${userContext.bookings.length} bookings.`
      }
    } else {
      contextPrompt += ` User not logged in.`
    }

    // Add real site data if available
    if (userContext.siteData) {
      const { tours, hotels, vehicles, totalTours, totalHotels, totalVehicles } = userContext.siteData
      
      contextPrompt += `\n\n## Current Site Data:\n`
      contextPrompt += `- Available Tours: ${totalTours}\n`
      contextPrompt += `- Available Hotels: ${totalHotels}\n`
      contextPrompt += `- Available Vehicles: ${totalVehicles}\n`
      
      if (tours.length > 0) {
        contextPrompt += `\nFeatured Tours:\n`
        tours.forEach(tour => {
          contextPrompt += `- ${tour.title}: ${tour.description?.substring(0, 100)}... (Price: ${tour.price || 'Contact for pricing'})\n`
        })
      }
      
      if (hotels.length > 0) {
        contextPrompt += `\nFeatured Hotels:\n`
        hotels.forEach(hotel => {
          contextPrompt += `- ${hotel.name}: ${hotel.description?.substring(0, 100)}... (Location: ${hotel.location?.city || 'Sri Lanka'})\n`
        })
      }
      
      if (vehicles.length > 0) {
        contextPrompt += `\nFeatured Vehicles:\n`
        vehicles.forEach(vehicle => {
          contextPrompt += `- ${vehicle.name || `${vehicle.make} ${vehicle.model}`}: ${vehicle.description?.substring(0, 100)}... (Type: ${vehicle.vehicleType})\n`
        })
      }
      
      contextPrompt += `\nYou can recommend specific tours, hotels, and vehicles from this data. Always mention that users can book through the website.`
    }

    // Format conversation history for Gemini (exclude initial bot message, limit to last 3 messages)
    const recentHistory = conversationHistory
      .filter(msg => msg.id !== 1) // Exclude the initial welcome message
      .slice(-3) // Only keep last 3 messages to avoid token limits
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text.substring(0, 200) }] // Limit each message to 200 chars
      }))

    // Ensure proper conversation flow (alternating user/model)
    const validHistory = []
    for (let i = 0; i < recentHistory.length; i++) {
      const msg = recentHistory[i]
      if (i === 0 && msg.role === 'model') {
        // Skip if first message is from model
        continue
      }
      validHistory.push(msg)
    }

    // Debug logging
    console.log('Conversation history for Gemini:', {
      original: conversationHistory.length,
      filtered: recentHistory.length,
      valid: validHistory.length,
      validHistory: validHistory
    })

    // Generate response
    try {
      // Try simple generateContent first (without chat history)
      if (validHistory.length === 0) {
        console.log('Using simple generateContent (no history)')
        const result = await model.generateContent({
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
            topP: 0.8,
            topK: 40
          }
        })
        const response = await result.response
        const text = response.text()

        console.log('Gemini Simple Response Debug:', {
          hasResponse: !!response,
          hasText: !!text,
          textLength: text?.length || 0,
          textPreview: text?.substring(0, 100) || 'No text',
          responseObject: response,
          candidates: response?.candidates
        })

        if (!text || text.trim().length === 0) {
          const finishReason = response?.candidates?.[0]?.finishReason
          console.warn(`Gemini returned empty response - finish reason: ${finishReason}`)
          console.warn('Response details:', {
            finishReason: finishReason,
            safetyRatings: response?.candidates?.[0]?.safetyRatings
          })
          
          if (finishReason === 'MAX_TOKENS') {
            console.warn('Response was truncated due to token limit, using fallback')
          }
          
          return getFallbackResponse(message, userContext)
        }

        return text
      } else {
        // Use chat with history
        console.log('Using chat with history')
        const chat = model.startChat({
          history: validHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1500,
          },
        })

        const result = await chat.sendMessage(message)
        const response = await result.response
        const text = response.text()

        console.log('Gemini Chat Response Debug:', {
          hasResponse: !!response,
          hasText: !!text,
          textLength: text?.length || 0,
          textPreview: text?.substring(0, 100) || 'No text',
          responseObject: response,
          candidates: response?.candidates
        })

        if (!text || text.trim().length === 0) {
          const finishReason = response?.candidates?.[0]?.finishReason
          console.warn(`Gemini returned empty response - finish reason: ${finishReason}`)
          console.warn('Response details:', {
            finishReason: finishReason,
            safetyRatings: response?.candidates?.[0]?.safetyRatings
          })
          
          if (finishReason === 'MAX_TOKENS') {
            console.warn('Response was truncated due to token limit, using fallback')
          }
          
          return getFallbackResponse(message, userContext)
        }

        return text
      }
    } catch (apiError) {
      console.warn('Gemini API call failed, using fallback response:', apiError.message)
      return getFallbackResponse(message, userContext)
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error)
    console.warn('Using fallback response due to API error')
    return getFallbackResponse(message, userContext)
  }
}

/**
 * Get a quick response for common queries without full conversation context
 * @param {string} message - User's message
 * @returns {Promise<string>} - AI response
 */
export const getQuickResponse = async (message) => {
  try {
    // Try different model names in order of preference
    // Try different model names in order of preference (updated with available models)
    const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"]
    let model = null
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName })
        await model.generateContent("Hello")
        break
      } catch (error) {
        continue
      }
    }
    
    if (!model) {
      // Fallback to a simple response if no models are available
      console.warn('No Gemini models available for quick response, using fallback')
      return getFallbackResponse(message, {})
    }
    
    const prompt = `${SYSTEM_PROMPT}\n\nUser Question: ${message}\n\nProvide a helpful response:`
    
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return text
    } catch (apiError) {
      console.warn('Gemini API call failed for quick response, using fallback:', apiError.message)
      return getFallbackResponse(message, {})
    }
  } catch (error) {
    console.error('Error getting quick response:', error)
    console.warn('Using fallback response due to error')
    return getFallbackResponse(message, {})
  }
}

/**
 * Validate if the Gemini API key is properly configured
 * @returns {Promise<boolean>} - True if API key is valid
 */
export const validateApiKey = async () => {
  try {
    // Try different model names in order of preference
    // Try different model names in order of preference (updated with available models)
    const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"]
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        await model.generateContent("Hello")
        console.log(`API key validated with model: ${modelName}`)
        return true
      } catch (error) {
        console.warn(`Model ${modelName} not available for validation:`, error.message)
        continue
      }
    }
    
    return false
  } catch (error) {
    console.error('API key validation failed:', error)
    return false
  }
}

/**
 * Fallback response when Gemini API is not available
 * @param {string} message - User's message
 * @param {Object} userContext - User context
 * @returns {string} - Fallback response
 */
const getFallbackResponse = (message, userContext = {}) => {
  console.log('Using intelligent fallback response for:', message)
  const lowerMessage = message.toLowerCase()
  
  // Simple keyword-based responses
  if (lowerMessage.includes('tour') || lowerMessage.includes('visit')) {
    return `I'd be happy to help you with tour recommendations! Sri Lanka offers amazing experiences like:
    
🏛️ **Cultural Tours**: Visit ancient cities like Anuradhapura and Polonnaruwa
🏔️ **Hill Country**: Explore tea plantations in Nuwara Eliya and Ella
🐘 **Wildlife**: Go on safari in Yala or Wilpattu National Parks
🏖️ **Beach**: Relax on beautiful beaches in Mirissa, Unawatuna, or Arugam Bay

You can browse our available tours on the Tours page. Would you like me to help you find something specific?`
  }
  
  if (lowerMessage.includes('hotel') || lowerMessage.includes('accommodation')) {
    return `Looking for accommodation in Sri Lanka? We have great options:

🏨 **Luxury Hotels**: 5-star resorts with world-class amenities
🏡 **Boutique Hotels**: Unique properties with local charm
🏖️ **Beach Resorts**: Perfect for coastal getaways
🏔️ **Mountain Hotels**: Cool climate retreats in hill country

Check out our Hotels page to see available properties and make bookings. What type of accommodation are you looking for?`
  }
  
  if (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || lowerMessage.includes('rent')) {
    return `Need a vehicle for your Sri Lankan adventure? We offer:

🚗 **Cars**: Perfect for city tours and short trips
🚐 **Vans**: Great for families and groups
🚙 **SUVs**: Ideal for hill country and off-road adventures
🚕 **Luxury Vehicles**: Premium options for special occasions

Visit our Vehicles page to see available rentals and book your perfect ride. Where are you planning to travel?`
  }
  
  if (lowerMessage.includes('booking') || lowerMessage.includes('book')) {
    return `I can help you with bookings! Here's what you can do:

📅 **Tours**: Book guided tours and experiences
🏨 **Hotels**: Reserve accommodation
🚗 **Vehicles**: Rent cars, vans, or SUVs
🎯 **Custom Trips**: Create personalized itineraries

${userContext.user ? `Since you're logged in as ${userContext.user.firstName}, you can view your bookings in "My Bookings".` : 'Please log in to access your bookings and get personalized recommendations.'}

What would you like to book today?`
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return `Hello! I'm your SerendibGo assistant. I can help you with:

🇱🇰 **Sri Lankan Tourism**: Discover amazing destinations
🎯 **Tour Recommendations**: Find perfect experiences
🏨 **Hotel Bookings**: Reserve accommodation
🚗 **Vehicle Rentals**: Get transportation
📋 **Itinerary Planning**: Plan your perfect trip

${userContext.user ? `Welcome back, ${userContext.user.firstName}!` : 'Please log in for personalized recommendations.'}

What can I help you with today?`
  }
  
  // Default response
  return `Thank you for your message! I'm here to help you discover amazing experiences in Sri Lanka.

I can assist you with:
• Tour recommendations and bookings
• Hotel and accommodation options  
• Vehicle rentals and transportation
• Custom trip planning
• General travel advice

${userContext.user ? `Since you're logged in, I can provide personalized recommendations based on your preferences.` : 'Please log in to get personalized recommendations and access your booking history.'}

What would you like to know about Sri Lankan tourism?`
}

/**
 * Check available models for the API key
 * @returns {Promise<Array>} - List of available models
 */
export const getAvailableModels = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${import.meta.env.VITE_GEMINI_API_KEY}`)
    const data = await response.json()
    return data.models || []
  } catch (error) {
    console.warn('Failed to fetch available models:', error.message)
    return []
  }
}
