import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Clock,
  Gauge as SpeedometerIcon,
  Compass,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Square as StopIcon,
  RefreshCw,
  Target as TargetIcon,
  MapPin as RouteIcon,
  Car,
  User
} from 'lucide-react';
import { gpsService } from '../../services/vehicles/gpsService';
import toast from 'react-hot-toast';

const GPSTracking = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);
  
  useEffect(() => {
    fetchTripDetails();
    return () => {
      if (watchIdRef.current) {
        gpsService.stopWatchingLocation(watchIdRef.current);
      }
    };
  }, [tripId]);
  
  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setTrip(data.data.trip);
        if (data.data.trip.tracking?.trackingHistory) {
          setTrackingHistory(data.data.trip.tracking.trackingHistory);
        }
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setError('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };
  
  const startTracking = async () => {
    try {
      const location = await gpsService.getCurrentLocation();
      setCurrentLocation(location);
      
      // Start watching location changes
      watchIdRef.current = gpsService.watchLocation(
        (position) => {
          setCurrentLocation(position);
          updateTripTracking(position);
        },
        (error) => {
          console.error('Location tracking error:', error);
          toast.error('Location tracking failed');
        }
      );
      
      setIsTracking(true);
      toast.success('GPS tracking started');
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast.error('Failed to start GPS tracking');
    }
  };
  
  const stopTracking = () => {
    if (watchIdRef.current) {
      gpsService.stopWatchingLocation(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    toast.success('GPS tracking stopped');
  };
  
  const updateTripTracking = async (locationData) => {
    try {
      const response = await gpsService.updateTripTracking(tripId, locationData);
      if (response.status === 'success') {
        setTrackingHistory(prev => [...prev, locationData]);
        
        // Calculate ETA if we have destination
        if (trip?.stops && trip.stops.length > 0) {
          const destination = trip.stops[trip.stops.length - 1];
          const etaData = gpsService.calculateETA(
            locationData.latitude,
            locationData.longitude,
            destination.location.coordinates.latitude,
            destination.location.coordinates.longitude,
            locationData.speed || 50
          );
          setEta(etaData);
        }
      }
    } catch (error) {
      console.error('Error updating trip tracking:', error);
    }
  };
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(2)}km`;
  };
  
  const formatSpeed = (speed) => {
    if (!speed) return '0 km/h';
    return `${(speed * 3.6).toFixed(1)} km/h`;
  };
  
  const formatHeading = (heading) => {
    if (!heading) return 'N';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'Trip not found'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GPS Tracking</h1>
          <p className="text-lg text-gray-600 mt-2">Trip: {trip.tripReference}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Area */}
          <div className="lg:col-span-2">
            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Live Map</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={isTracking ? stopTracking : startTracking}
                    className={`btn btn-sm ${isTracking ? 'btn-error' : 'btn-success'}`}
                  >
                    {isTracking ? (
                      <>
                        <StopIcon className="h-4 w-4 mr-2" />
                        Stop Tracking
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Tracking
                      </>
                    )}
                  </button>
                  <button
                    onClick={fetchTripDetails}
                    className="btn btn-sm btn-outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Map Container */}
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Map integration would go here</p>
                  <p className="text-xs text-gray-500">Google Maps or similar service</p>
                </div>
              </div>
            </div>
            
            {/* Trip Stops */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Route</h2>
              
              <div className="space-y-4">
                {trip.stops?.map((stop, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{stop.location.address}</h3>
                      <p className="text-sm text-gray-600">{stop.location.city}, {stop.location.district}</p>
                      {stop.timing?.estimatedArrival && (
                        <p className="text-xs text-gray-500 mt-1">
                          ETA: {formatTime(stop.timing.estimatedArrival)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {stop.stopType.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Location */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Location</h2>
              
              {currentLocation ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <SpeedometerIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {formatSpeed(currentLocation.speed)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Compass className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Heading: {formatHeading(currentLocation.heading)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <TargetIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Accuracy: ±{currentLocation.accuracy?.toFixed(0)}m
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {formatTime(currentLocation.timestamp)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600 mt-2">No location data</p>
                </div>
              )}
            </div>
            
            {/* ETA Information */}
            {eta && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimated Arrival</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      ETA: {eta.etaFormatted}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <RouteIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Distance: {formatDistance(eta.distance)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <SpeedometerIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Time: {eta.timeInHours.toFixed(1)} hours
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Trip Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Status</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Car className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Vehicle: {trip.vehicle?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Driver: {trip.driver?.name || 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Status: {trip.status}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Started: {trip.actualStartTime ? formatTime(trip.actualStartTime) : 'Not started'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Tracking History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {trackingHistory.slice(-10).map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div>
                      <span className="text-gray-600">
                        {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {formatSpeed(point.speed)}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {formatTime(point.timestamp)}
                    </span>
                  </div>
                ))}
                {trackingHistory.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No tracking data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSTracking;
