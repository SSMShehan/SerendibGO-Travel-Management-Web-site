export const HOTEL_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  OUT_OF_ORDER: 'out_of_order'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

export const STATUS_COLORS = {
  [HOTEL_STATUS.DRAFT]: 'gray',
  [HOTEL_STATUS.PENDING]: 'yellow',
  [HOTEL_STATUS.APPROVED]: 'green',
  [HOTEL_STATUS.REJECTED]: 'red',
  [HOTEL_STATUS.SUSPENDED]: 'orange',
  
  [ROOM_STATUS.AVAILABLE]: 'green',
  [ROOM_STATUS.OCCUPIED]: 'red',
  [ROOM_STATUS.MAINTENANCE]: 'yellow',
  [ROOM_STATUS.OUT_OF_ORDER]: 'gray',
  
  [BOOKING_STATUS.PENDING]: 'yellow',
  [BOOKING_STATUS.CONFIRMED]: 'green',
  [BOOKING_STATUS.CHECKED_IN]: 'blue',
  [BOOKING_STATUS.CHECKED_OUT]: 'gray',
  [BOOKING_STATUS.CANCELLED]: 'red',
  [BOOKING_STATUS.NO_SHOW]: 'orange',
  
  [PAYMENT_STATUS.PENDING]: 'yellow',
  [PAYMENT_STATUS.PAID]: 'green',
  [PAYMENT_STATUS.FAILED]: 'red',
  [PAYMENT_STATUS.REFUNDED]: 'blue',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'orange'
};

export const STATUS_LABELS = {
  [HOTEL_STATUS.DRAFT]: 'Draft',
  [HOTEL_STATUS.PENDING]: 'Pending Approval',
  [HOTEL_STATUS.APPROVED]: 'Approved',
  [HOTEL_STATUS.REJECTED]: 'Rejected',
  [HOTEL_STATUS.SUSPENDED]: 'Suspended',
  
  [ROOM_STATUS.AVAILABLE]: 'Available',
  [ROOM_STATUS.OCCUPIED]: 'Occupied',
  [ROOM_STATUS.MAINTENANCE]: 'Maintenance',
  [ROOM_STATUS.OUT_OF_ORDER]: 'Out of Order',
  
  [BOOKING_STATUS.PENDING]: 'Pending',
  [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
  [BOOKING_STATUS.CHECKED_IN]: 'Checked In',
  [BOOKING_STATUS.CHECKED_OUT]: 'Checked Out',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled',
  [BOOKING_STATUS.NO_SHOW]: 'No Show',
  
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'Partially Refunded'
};
