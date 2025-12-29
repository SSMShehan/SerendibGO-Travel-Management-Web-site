import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { hotelAPI, roomAPI, bookingAPI } from '../../services/hotels/hotelService';

// Initial state
const initialState = {
  // Hotels
  hotels: [],
  currentHotel: null,
  myHotels: [],
  pendingHotels: [],
  hotelsLoading: false,
  hotelsError: null,
  
  // Rooms
  rooms: [],
  currentRoom: null,
  roomsLoading: false,
  roomsError: null,
  
  // Bookings
  bookings: [],
  currentBooking: null,
  myBookings: [],
  hotelBookings: [],
  bookingsLoading: false,
  bookingsError: null,
  
  // Filters and search
  filters: {
    city: '',
    district: '',
    category: '',
    starRating: '',
    minPrice: '',
    maxPrice: '',
    amenities: [],
    area: '',
    search: ''
  },
  
  // Pagination
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  },
  
  // UI state
  selectedDates: {
    checkIn: null,
    checkOut: null
  },
  selectedOccupancy: {
    adults: 1,
    children: 0,
    infants: 0
  }
};

// Action types
const actionTypes = {
  // Hotels
  SET_HOTELS_LOADING: 'SET_HOTELS_LOADING',
  SET_HOTELS_SUCCESS: 'SET_HOTELS_SUCCESS',
  SET_HOTELS_ERROR: 'SET_HOTELS_ERROR',
  SET_CURRENT_HOTEL: 'SET_CURRENT_HOTEL',
  SET_MY_HOTELS: 'SET_MY_HOTELS',
  SET_PENDING_HOTELS: 'SET_PENDING_HOTELS',
  ADD_HOTEL: 'ADD_HOTEL',
  UPDATE_HOTEL: 'UPDATE_HOTEL',
  DELETE_HOTEL: 'DELETE_HOTEL',
  
  // Rooms
  SET_ROOMS_LOADING: 'SET_ROOMS_LOADING',
  SET_ROOMS_SUCCESS: 'SET_ROOMS_SUCCESS',
  SET_ROOMS_ERROR: 'SET_ROOMS_ERROR',
  SET_CURRENT_ROOM: 'SET_CURRENT_ROOM',
  ADD_ROOM: 'ADD_ROOM',
  UPDATE_ROOM: 'UPDATE_ROOM',
  DELETE_ROOM: 'DELETE_ROOM',
  
  // Bookings
  SET_BOOKINGS_LOADING: 'SET_BOOKINGS_LOADING',
  SET_BOOKINGS_SUCCESS: 'SET_BOOKINGS_SUCCESS',
  SET_BOOKINGS_ERROR: 'SET_BOOKINGS_ERROR',
  SET_CURRENT_BOOKING: 'SET_CURRENT_BOOKING',
  SET_MY_BOOKINGS: 'SET_MY_BOOKINGS',
  SET_HOTEL_BOOKINGS: 'SET_HOTEL_BOOKINGS',
  ADD_BOOKING: 'ADD_BOOKING',
  UPDATE_BOOKING: 'UPDATE_BOOKING',
  CANCEL_BOOKING: 'CANCEL_BOOKING',
  
  // Filters and search
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_SELECTED_DATES: 'SET_SELECTED_DATES',
  SET_SELECTED_OCCUPANCY: 'SET_SELECTED_OCCUPANCY',
  
  // Clear state
  CLEAR_HOTELS: 'CLEAR_HOTELS',
  CLEAR_ROOMS: 'CLEAR_ROOMS',
  CLEAR_BOOKINGS: 'CLEAR_BOOKINGS',
  CLEAR_ALL: 'CLEAR_ALL'
};

// Reducer
const hotelReducer = (state, action) => {
  switch (action.type) {
    // Hotels
    case actionTypes.SET_HOTELS_LOADING:
      return { ...state, hotelsLoading: true, hotelsError: null };
    
    case actionTypes.SET_HOTELS_SUCCESS:
      return {
        ...state,
        hotelsLoading: false,
        hotels: action.payload.hotels,
        pagination: action.payload.pagination || state.pagination
      };
    
    case actionTypes.SET_HOTELS_ERROR:
      return {
        ...state,
        hotelsLoading: false,
        hotelsError: action.payload
      };
    
    case actionTypes.SET_CURRENT_HOTEL:
      return { ...state, currentHotel: action.payload };
    
    case actionTypes.SET_MY_HOTELS:
      return { ...state, myHotels: action.payload };
    
    case actionTypes.SET_PENDING_HOTELS:
      return { ...state, pendingHotels: action.payload };
    
    case actionTypes.ADD_HOTEL:
      return { ...state, myHotels: [...state.myHotels, action.payload] };
    
    case actionTypes.UPDATE_HOTEL:
      return {
        ...state,
        myHotels: state.myHotels.map(hotel =>
          hotel._id === action.payload._id ? action.payload : hotel
        ),
        currentHotel: state.currentHotel?._id === action.payload._id ? action.payload : state.currentHotel
      };
    
    case actionTypes.DELETE_HOTEL:
      return {
        ...state,
        myHotels: state.myHotels.filter(hotel => hotel._id !== action.payload)
      };
    
    // Rooms
    case actionTypes.SET_ROOMS_LOADING:
      return { ...state, roomsLoading: true, roomsError: null };
    
    case actionTypes.SET_ROOMS_SUCCESS:
      return {
        ...state,
        roomsLoading: false,
        rooms: action.payload
      };
    
    case actionTypes.SET_ROOMS_ERROR:
      return {
        ...state,
        roomsLoading: false,
        roomsError: action.payload
      };
    
    case actionTypes.SET_CURRENT_ROOM:
      return { ...state, currentRoom: action.payload };
    
    case actionTypes.ADD_ROOM:
      return { ...state, rooms: [...state.rooms, action.payload] };
    
    case actionTypes.UPDATE_ROOM:
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room._id === action.payload._id ? action.payload : room
        ),
        currentRoom: state.currentRoom?._id === action.payload._id ? action.payload : state.currentRoom
      };
    
    case actionTypes.DELETE_ROOM:
      return {
        ...state,
        rooms: state.rooms.filter(room => room._id !== action.payload)
      };
    
    // Bookings
    case actionTypes.SET_BOOKINGS_LOADING:
      return { ...state, bookingsLoading: true, bookingsError: null };
    
    case actionTypes.SET_BOOKINGS_SUCCESS:
      return {
        ...state,
        bookingsLoading: false,
        bookings: action.payload
      };
    
    case actionTypes.SET_BOOKINGS_ERROR:
      return {
        ...state,
        bookingsLoading: false,
        bookingsError: action.payload
      };
    
    case actionTypes.SET_CURRENT_BOOKING:
      return { ...state, currentBooking: action.payload };
    
    case actionTypes.SET_MY_BOOKINGS:
      return { ...state, myBookings: action.payload };
    
    case actionTypes.SET_HOTEL_BOOKINGS:
      return { ...state, hotelBookings: action.payload };
    
    case actionTypes.ADD_BOOKING:
      return { ...state, myBookings: [...state.myBookings, action.payload] };
    
    case actionTypes.UPDATE_BOOKING:
      return {
        ...state,
        myBookings: state.myBookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        ),
        currentBooking: state.currentBooking?._id === action.payload._id ? action.payload : state.currentBooking
      };
    
    case actionTypes.CANCEL_BOOKING:
      return {
        ...state,
        myBookings: state.myBookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        ),
        currentBooking: state.currentBooking?._id === action.payload._id ? action.payload : state.currentBooking
      };
    
    // Filters and search
    case actionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case actionTypes.CLEAR_FILTERS:
      return { ...state, filters: initialState.filters };
    
    case actionTypes.SET_PAGINATION:
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    
    case actionTypes.SET_SELECTED_DATES:
      return { ...state, selectedDates: action.payload };
    
    case actionTypes.SET_SELECTED_OCCUPANCY:
      return { ...state, selectedOccupancy: action.payload };
    
    // Clear state
    case actionTypes.CLEAR_HOTELS:
      return { ...state, hotels: [], currentHotel: null, myHotels: [] };
    
    case actionTypes.CLEAR_ROOMS:
      return { ...state, rooms: [], currentRoom: null };
    
    case actionTypes.CLEAR_BOOKINGS:
      return { ...state, bookings: [], currentBooking: null, myBookings: [] };
    
    case actionTypes.CLEAR_ALL:
      return initialState;
    
    default:
      return state;
  }
};

// Context
const HotelContext = createContext();

// Provider component
export const HotelProvider = ({ children }) => {
  const [state, dispatch] = useReducer(hotelReducer, initialState);

  // Hotel actions
  const hotelActions = {
    // Get hotels
    getHotels: async (params = {}) => {
      dispatch({ type: actionTypes.SET_HOTELS_LOADING });
      try {
        const response = await hotelAPI.getHotels({ ...state.filters, ...params });
        dispatch({
          type: actionTypes.SET_HOTELS_SUCCESS,
          payload: response.data
        });
        return response.data;
      } catch (error) {
        dispatch({
          type: actionTypes.SET_HOTELS_ERROR,
          payload: error.response?.data?.message || 'Failed to fetch hotels'
        });
        throw error;
      }
    },

    // Get single hotel
    getHotel: async (id) => {
      try {
        const response = await hotelAPI.getHotel(id);
        dispatch({
          type: actionTypes.SET_CURRENT_HOTEL,
          payload: response.data.hotel
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create hotel
    createHotel: async (hotelData) => {
      try {
        const response = await hotelAPI.createHotel(hotelData);
        dispatch({
          type: actionTypes.ADD_HOTEL,
          payload: response.data.hotel
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update hotel
    updateHotel: async (id, hotelData) => {
      try {
        const response = await hotelAPI.updateHotel(id, hotelData);
        dispatch({
          type: actionTypes.UPDATE_HOTEL,
          payload: response.data.hotel
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete hotel
    deleteHotel: async (id) => {
      try {
        await hotelAPI.deleteHotel(id);
        dispatch({
          type: actionTypes.DELETE_HOTEL,
          payload: id
        });
      } catch (error) {
        throw error;
      }
    },

    // Get my hotels
    getMyHotels: async () => {
      try {
        const response = await hotelAPI.getMyHotels();
        dispatch({
          type: actionTypes.SET_MY_HOTELS,
          payload: response.data.hotels
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get pending hotels (admin)
    getPendingHotels: async () => {
      try {
        const response = await hotelAPI.getPendingHotels();
        dispatch({
          type: actionTypes.SET_PENDING_HOTELS,
          payload: response.data.hotels
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Approve hotel (admin)
    approveHotel: async (id, status, rejectionReason = '') => {
      try {
        const response = await hotelAPI.approveHotel(id, status, rejectionReason);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  };

  // Room actions
  const roomActions = {
    // Get rooms
    getRooms: async (hotelId, params = {}) => {
      dispatch({ type: actionTypes.SET_ROOMS_LOADING });
      try {
        const response = await roomAPI.getRooms(hotelId, params);
        dispatch({
          type: actionTypes.SET_ROOMS_SUCCESS,
          payload: response.data.rooms
        });
        return response.data;
      } catch (error) {
        dispatch({
          type: actionTypes.SET_ROOMS_ERROR,
          payload: error.response?.data?.message || 'Failed to fetch rooms'
        });
        throw error;
      }
    },

    // Get single room
    getRoom: async (id) => {
      try {
        const response = await roomAPI.getRoom(id);
        dispatch({
          type: actionTypes.SET_CURRENT_ROOM,
          payload: response.data.room
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create room
    createRoom: async (hotelId, roomData) => {
      try {
        const response = await roomAPI.createRoom(hotelId, roomData);
        dispatch({
          type: actionTypes.ADD_ROOM,
          payload: response.data.room
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update room
    updateRoom: async (id, roomData) => {
      try {
        const response = await roomAPI.updateRoom(id, roomData);
        dispatch({
          type: actionTypes.UPDATE_ROOM,
          payload: response.data.room
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete room
    deleteRoom: async (id) => {
      try {
        await roomAPI.deleteRoom(id);
        dispatch({
          type: actionTypes.DELETE_ROOM,
          payload: id
        });
      } catch (error) {
        throw error;
      }
    }
  };

  // Booking actions
  const bookingActions = {
    // Create booking
    createBooking: async (bookingData) => {
      dispatch({ type: actionTypes.SET_BOOKINGS_LOADING });
      try {
        const response = await bookingAPI.createBooking(bookingData);
        dispatch({
          type: actionTypes.ADD_BOOKING,
          payload: response.data.booking
        });
        return response.data;
      } catch (error) {
        dispatch({
          type: actionTypes.SET_BOOKINGS_ERROR,
          payload: error.response?.data?.message || 'Failed to create booking'
        });
        throw error;
      }
    },

    // Get my bookings
    getMyBookings: async (params = {}) => {
      try {
        const response = await bookingAPI.getMyBookings(params);
        dispatch({
          type: actionTypes.SET_MY_BOOKINGS,
          payload: response.data.bookings
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get single booking
    getBooking: async (id) => {
      try {
        const response = await bookingAPI.getBooking(id);
        dispatch({
          type: actionTypes.SET_CURRENT_BOOKING,
          payload: response.data.booking
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update booking
    updateBooking: async (id, bookingData) => {
      try {
        const response = await bookingAPI.updateBooking(id, bookingData);
        dispatch({
          type: actionTypes.UPDATE_BOOKING,
          payload: response.data.booking
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Cancel booking
    cancelBooking: async (id, reason = '') => {
      try {
        const response = await bookingAPI.cancelBooking(id, reason);
        dispatch({
          type: actionTypes.CANCEL_BOOKING,
          payload: response.data.booking
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get hotel bookings
    getHotelBookings: async (hotelId, params = {}) => {
      try {
        const response = await bookingAPI.getHotelBookings(hotelId, params);
        dispatch({
          type: actionTypes.SET_HOTEL_BOOKINGS,
          payload: response.data.bookings
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  };

  // Filter and search actions
  const filterActions = {
    setFilters: (filters) => {
      dispatch({
        type: actionTypes.SET_FILTERS,
        payload: filters
      });
    },

    clearFilters: () => {
      dispatch({ type: actionTypes.CLEAR_FILTERS });
    },

    setPagination: (pagination) => {
      dispatch({
        type: actionTypes.SET_PAGINATION,
        payload: pagination
      });
    },

    setSelectedDates: (dates) => {
      dispatch({
        type: actionTypes.SET_SELECTED_DATES,
        payload: dates
      });
    },

    setSelectedOccupancy: (occupancy) => {
      dispatch({
        type: actionTypes.SET_SELECTED_OCCUPANCY,
        payload: occupancy
      });
    }
  };

  // Clear actions
  const clearActions = {
    clearHotels: () => {
      dispatch({ type: actionTypes.CLEAR_HOTELS });
    },

    clearRooms: () => {
      dispatch({ type: actionTypes.CLEAR_ROOMS });
    },

    clearBookings: () => {
      dispatch({ type: actionTypes.CLEAR_BOOKINGS });
    },

    clearAll: () => {
      dispatch({ type: actionTypes.CLEAR_ALL });
    }
  };

  const value = {
    // State
    ...state,
    
    // Actions
    hotelActions,
    roomActions,
    bookingActions,
    filterActions,
    clearActions
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
};

// Custom hook to use hotel context
export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};

export default HotelContext;
