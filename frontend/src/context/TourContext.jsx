import React, { createContext, useContext, useReducer } from 'react'

const TourContext = createContext()

const initialState = {
  tours: [],
  featuredTours: [],
  searchResults: [],
  currentTour: null,
  filters: {
    category: '',
    priceRange: [0, 10000],
    duration: '',
    difficulty: '',
    location: '',
  },
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTours: 0,
  },
}

const tourReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    case 'SET_TOURS':
      return {
        ...state,
        tours: action.payload,
        isLoading: false,
        error: null,
      }
    case 'SET_FEATURED_TOURS':
      return {
        ...state,
        featuredTours: action.payload,
      }
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        isLoading: false,
        error: null,
      }
    case 'SET_CURRENT_TOUR':
      return {
        ...state,
        currentTour: action.payload,
        isLoading: false,
        error: null,
      }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      }
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
      }
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

export const TourProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tourReducer, initialState)

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setTours = (tours) => {
    dispatch({ type: 'SET_TOURS', payload: tours })
  }

  const setFeaturedTours = (tours) => {
    dispatch({ type: 'SET_FEATURED_TOURS', payload: tours })
  }

  const setSearchResults = (results) => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results })
  }

  const setCurrentTour = (tour) => {
    dispatch({ type: 'SET_CURRENT_TOUR', payload: tour })
  }

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }

  const setPagination = (pagination) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination })
  }

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    setLoading,
    setTours,
    setFeaturedTours,
    setSearchResults,
    setCurrentTour,
    setFilters,
    clearFilters,
    setPagination,
    setError,
    clearError,
  }

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  )
}

export const useTour = () => {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}
