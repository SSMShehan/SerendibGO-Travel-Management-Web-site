import { Car, Truck, Bus, Bike, Navigation } from 'lucide-react';

export const VEHICLE_TYPES = {
  CAR: { id: 'car', label: 'Car', icon: Car, capacity: 4 },
  VAN: { id: 'van', label: 'Van', icon: Truck, capacity: 8 },
  TUK_TUK: { id: 'tuk_tuk', label: 'Tuk Tuk', icon: Bike, capacity: 3 },
  BUS: { id: 'bus', label: 'Bus', icon: Bus, capacity: 50 },
  MOTORCYCLE: { id: 'motorcycle', label: 'Motorcycle', icon: Bike, capacity: 2 }
};

export const VEHICLE_AMENITIES = {
  AC: { id: 'ac', label: 'Air Conditioning' },
  WIFI: { id: 'wifi', label: 'WiFi' },
  CHILD_SEAT: { id: 'child_seat', label: 'Child Seat' },
  GPS: { id: 'gps', label: 'GPS Navigation' },
  BLUETOOTH: { id: 'bluetooth', label: 'Bluetooth' },
  USB_CHARGING: { id: 'usb_charging', label: 'USB Charging' },
  WATER_BOTTLE: { id: 'water_bottle', label: 'Water Bottle' },
  TOUR_GUIDE: { id: 'tour_guide', label: 'Tour Guide' },
  ENGLISH_DRIVER: { id: 'english_driver', label: 'English Speaking Driver' }
};

export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  ON_TRIP: 'on_trip',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline'
};

export const DRIVER_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE_PAYMENT: 'mobile_payment',
  BANK_TRANSFER: 'bank_transfer'
};

export const getVehicleTypeIcon = (type) => {
  return VEHICLE_TYPES[type]?.icon || Car;
};

export const getVehicleTypeLabel = (type) => {
  return VEHICLE_TYPES[type]?.label || type;
};

export const getVehicleCapacity = (type) => {
  return VEHICLE_TYPES[type]?.capacity || 4;
};
