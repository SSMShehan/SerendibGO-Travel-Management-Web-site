export const PRICING_TYPES = {
  BASE_RATE: 'base_rate',
  SEASONAL: 'seasonal',
  WEEKEND: 'weekend',
  HOLIDAY: 'holiday',
  PROMOTIONAL: 'promotional',
  GROUP: 'group',
  LONG_STAY: 'long_stay',
  LAST_MINUTE: 'last_minute',
  ADVANCE_BOOKING: 'advance_booking',
  PEAK: 'peak',
  OFF_PEAK: 'off_peak'
};

export const PRICING_MODELS = {
  FIXED: 'fixed',
  DYNAMIC: 'dynamic',
  TIERED: 'tiered',
  PERCENTAGE: 'percentage',
  SURCHARGE: 'surcharge',
  DISCOUNT: 'discount'
};

export const PRICING_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended'
};

export const PRICING_CURRENCIES = {
  LKR: 'LKR',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  AUD: 'AUD',
  CAD: 'CAD',
  JPY: 'JPY',
  INR: 'INR'
};

export const PRICING_UNITS = {
  PER_NIGHT: 'per_night',
  PER_PERSON: 'per_person',
  PER_ROOM: 'per_room',
  PER_HOUR: 'per_hour',
  PER_DAY: 'per_day',
  PER_WEEK: 'per_week',
  PER_MONTH: 'per_month'
};

export const PRICING_APPLICATION = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
  CONDITIONAL: 'conditional',
  OVERRIDE: 'override'
};

export const PRICING_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4
};

export const PRICING_LABELS = {
  [PRICING_TYPES.BASE_RATE]: 'Base Rate',
  [PRICING_TYPES.SEASONAL]: 'Seasonal Pricing',
  [PRICING_TYPES.WEEKEND]: 'Weekend Pricing',
  [PRICING_TYPES.HOLIDAY]: 'Holiday Pricing',
  [PRICING_TYPES.PROMOTIONAL]: 'Promotional Pricing',
  [PRICING_TYPES.GROUP]: 'Group Pricing',
  [PRICING_TYPES.LONG_STAY]: 'Long Stay Pricing',
  [PRICING_TYPES.LAST_MINUTE]: 'Last Minute Pricing',
  [PRICING_TYPES.ADVANCE_BOOKING]: 'Advance Booking Pricing',
  [PRICING_TYPES.PEAK]: 'Peak Season Pricing',
  [PRICING_TYPES.OFF_PEAK]: 'Off Peak Pricing'
};

export const PRICING_MODEL_LABELS = {
  [PRICING_MODELS.FIXED]: 'Fixed Price',
  [PRICING_MODELS.DYNAMIC]: 'Dynamic Pricing',
  [PRICING_MODELS.TIERED]: 'Tiered Pricing',
  [PRICING_MODELS.PERCENTAGE]: 'Percentage Based',
  [PRICING_MODELS.SURCHARGE]: 'Surcharge',
  [PRICING_MODELS.DISCOUNT]: 'Discount'
};

export const STATUS_LABELS = {
  [PRICING_STATUS.ACTIVE]: 'Active',
  [PRICING_STATUS.INACTIVE]: 'Inactive',
  [PRICING_STATUS.DRAFT]: 'Draft',
  [PRICING_STATUS.SCHEDULED]: 'Scheduled',
  [PRICING_STATUS.EXPIRED]: 'Expired',
  [PRICING_STATUS.SUSPENDED]: 'Suspended'
};

export const CURRENCY_LABELS = {
  [PRICING_CURRENCIES.LKR]: 'Sri Lankan Rupee (LKR)',
  [PRICING_CURRENCIES.USD]: 'US Dollar (USD)',
  [PRICING_CURRENCIES.EUR]: 'Euro (EUR)',
  [PRICING_CURRENCIES.GBP]: 'British Pound (GBP)',
  [PRICING_CURRENCIES.AUD]: 'Australian Dollar (AUD)',
  [PRICING_CURRENCIES.CAD]: 'Canadian Dollar (CAD)',
  [PRICING_CURRENCIES.JPY]: 'Japanese Yen (JPY)',
  [PRICING_CURRENCIES.INR]: 'Indian Rupee (INR)'
};

export const UNIT_LABELS = {
  [PRICING_UNITS.PER_NIGHT]: 'Per Night',
  [PRICING_UNITS.PER_PERSON]: 'Per Person',
  [PRICING_UNITS.PER_ROOM]: 'Per Room',
  [PRICING_UNITS.PER_HOUR]: 'Per Hour',
  [PRICING_UNITS.PER_DAY]: 'Per Day',
  [PRICING_UNITS.PER_WEEK]: 'Per Week',
  [PRICING_UNITS.PER_MONTH]: 'Per Month'
};

export const APPLICATION_LABELS = {
  [PRICING_APPLICATION.AUTOMATIC]: 'Automatic',
  [PRICING_APPLICATION.MANUAL]: 'Manual',
  [PRICING_APPLICATION.CONDITIONAL]: 'Conditional',
  [PRICING_APPLICATION.OVERRIDE]: 'Override'
};

export const PRIORITY_LABELS = {
  [PRICING_PRIORITY.LOW]: 'Low',
  [PRICING_PRIORITY.MEDIUM]: 'Medium',
  [PRICING_PRIORITY.HIGH]: 'High',
  [PRICING_PRIORITY.URGENT]: 'Urgent'
};

export const STATUS_COLORS = {
  [PRICING_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [PRICING_STATUS.INACTIVE]: 'bg-gray-100 text-gray-800',
  [PRICING_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [PRICING_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [PRICING_STATUS.EXPIRED]: 'bg-red-100 text-red-800',
  [PRICING_STATUS.SUSPENDED]: 'bg-orange-100 text-orange-800'
};

export const PRIORITY_COLORS = {
  [PRICING_PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
  [PRICING_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
  [PRICING_PRIORITY.HIGH]: 'bg-yellow-100 text-yellow-800',
  [PRICING_PRIORITY.URGENT]: 'bg-red-100 text-red-800'
};

export const CURRENCY_SYMBOLS = {
  [PRICING_CURRENCIES.LKR]: 'Rs.',
  [PRICING_CURRENCIES.USD]: '$',
  [PRICING_CURRENCIES.EUR]: '€',
  [PRICING_CURRENCIES.GBP]: '£',
  [PRICING_CURRENCIES.AUD]: 'A$',
  [PRICING_CURRENCIES.CAD]: 'C$',
  [PRICING_CURRENCIES.JPY]: '¥',
  [PRICING_CURRENCIES.INR]: '₹'
};

export const getPricingLabel = (type) => {
  return PRICING_LABELS[type] || 'Unknown';
};

export const getPricingModelLabel = (model) => {
  return PRICING_MODEL_LABELS[model] || 'Unknown';
};

export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || 'Unknown';
};

export const getCurrencyLabel = (currency) => {
  return CURRENCY_LABELS[currency] || 'Unknown';
};

export const getUnitLabel = (unit) => {
  return UNIT_LABELS[unit] || 'Unknown';
};

export const getApplicationLabel = (application) => {
  return APPLICATION_LABELS[application] || 'Unknown';
};

export const getPriorityLabel = (priority) => {
  return PRIORITY_LABELS[priority] || 'Unknown';
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS[PRICING_STATUS.DRAFT];
};

export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS[PRICING_PRIORITY.MEDIUM];
};

export const getCurrencySymbol = (currency) => {
  return CURRENCY_SYMBOLS[currency] || 'Rs.';
};

export const formatPrice = (amount, currency = PRICING_CURRENCIES.LKR) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  const symbol = getCurrencySymbol(currency);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return `${symbol}${formattedAmount}`;
};

export const calculatePrice = (basePrice, pricingRule) => {
  if (!basePrice || !pricingRule) return basePrice;
  
  let calculatedPrice = basePrice;
  
  switch (pricingRule.model) {
    case PRICING_MODELS.FIXED:
      calculatedPrice = pricingRule.value;
      break;
    case PRICING_MODELS.PERCENTAGE:
      calculatedPrice = basePrice * (1 + pricingRule.value / 100);
      break;
    case PRICING_MODELS.SURCHARGE:
      calculatedPrice = basePrice + pricingRule.value;
      break;
    case PRICING_MODELS.DISCOUNT:
      calculatedPrice = basePrice - pricingRule.value;
      break;
    case PRICING_MODELS.TIERED:
      // Implement tiered pricing logic
      calculatedPrice = basePrice;
      break;
    case PRICING_MODELS.DYNAMIC:
      // Implement dynamic pricing logic
      calculatedPrice = basePrice;
      break;
    default:
      calculatedPrice = basePrice;
  }
  
  return Math.max(0, calculatedPrice);
};

export const isPricingActive = (pricingRule) => {
  if (!pricingRule) return false;
  
  const now = new Date();
  const startDate = new Date(pricingRule.startDate);
  const endDate = new Date(pricingRule.endDate);
  
  return (
    pricingRule.status === PRICING_STATUS.ACTIVE &&
    now >= startDate &&
    now <= endDate
  );
};

export const getPricingRulesForDate = (pricingRules, date) => {
  if (!pricingRules || !Array.isArray(pricingRules)) return [];
  
  const targetDate = new Date(date);
  
  return pricingRules.filter(rule => {
    if (!isPricingActive(rule)) return false;
    
    const startDate = new Date(rule.startDate);
    const endDate = new Date(rule.endDate);
    
    return targetDate >= startDate && targetDate <= endDate;
  }).sort((a, b) => b.priority - a.priority);
};

export const applyPricingRules = (basePrice, pricingRules, date) => {
  if (!pricingRules || !Array.isArray(pricingRules)) return basePrice;
  
  const applicableRules = getPricingRulesForDate(pricingRules, date);
  let finalPrice = basePrice;
  
  applicableRules.forEach(rule => {
    finalPrice = calculatePrice(finalPrice, rule);
  });
  
  return finalPrice;
};

export const validatePricingRule = (pricingRule) => {
  const errors = [];
  
  if (!pricingRule.name) {
    errors.push('Name is required');
  }
  
  if (!pricingRule.type) {
    errors.push('Type is required');
  }
  
  if (!pricingRule.model) {
    errors.push('Model is required');
  }
  
  if (pricingRule.value === null || pricingRule.value === undefined) {
    errors.push('Value is required');
  }
  
  if (!pricingRule.startDate) {
    errors.push('Start date is required');
  }
  
  if (!pricingRule.endDate) {
    errors.push('End date is required');
  }
  
  if (pricingRule.startDate && pricingRule.endDate) {
    const startDate = new Date(pricingRule.startDate);
    const endDate = new Date(pricingRule.endDate);
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
  }
  
  return errors;
};

export const getPricingSummary = (pricingRules) => {
  const summary = {
    total: 0,
    active: 0,
    inactive: 0,
    draft: 0,
    scheduled: 0,
    expired: 0,
    suspended: 0
  };
  
  if (!pricingRules || !Array.isArray(pricingRules)) return summary;
  
  pricingRules.forEach(rule => {
    summary.total++;
    summary[rule.status]++;
  });
  
  return summary;
};
