import { CreditCard, Smartphone, Banknote, Building2 } from 'lucide-react';

export const PAYMENT_METHODS = {
  CARD: {
    id: 'card',
    label: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express',
    enabled: true,
    processingFee: 0.03 // 3%
  },
  MOBILE_PAYMENT: {
    id: 'mobile_payment',
    label: 'Mobile Payment',
    icon: Smartphone,
    description: 'mCash, FriMi, eZ Cash',
    enabled: true,
    processingFee: 0.02 // 2%
  },
  BANK_TRANSFER: {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: Building2,
    description: 'Direct bank transfer',
    enabled: true,
    processingFee: 0.01 // 1%
  },
  CASH: {
    id: 'cash',
    label: 'Cash on Arrival',
    icon: Banknote,
    description: 'Pay when you arrive',
    enabled: true,
    processingFee: 0 // No processing fee
  }
};

export const CARD_TYPES = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMERICAN_EXPRESS: 'amex',
  DISCOVER: 'discover'
};

export const MOBILE_PAYMENT_PROVIDERS = {
  M_CASH: 'm_cash',
  FRIMI: 'frimi',
  EZ_CASH: 'ez_cash',
  PAYHERE: 'payhere'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'yellow',
  [PAYMENT_STATUS.PROCESSING]: 'blue',
  [PAYMENT_STATUS.COMPLETED]: 'green',
  [PAYMENT_STATUS.FAILED]: 'red',
  [PAYMENT_STATUS.CANCELLED]: 'gray',
  [PAYMENT_STATUS.REFUNDED]: 'blue',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'orange'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PROCESSING]: 'Processing',
  [PAYMENT_STATUS.COMPLETED]: 'Completed',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.CANCELLED]: 'Cancelled',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'Partially Refunded'
};

export const CURRENCIES = {
  LKR: { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' }
};

export const getPaymentMethodIcon = (method) => {
  return PAYMENT_METHODS[method]?.icon || CreditCard;
};

export const getPaymentMethodLabel = (method) => {
  return PAYMENT_METHODS[method]?.label || method;
};

export const getPaymentMethodDescription = (method) => {
  return PAYMENT_METHODS[method]?.description || '';
};

export const getProcessingFee = (method, amount) => {
  const fee = PAYMENT_METHODS[method]?.processingFee || 0;
  return amount * fee;
};
