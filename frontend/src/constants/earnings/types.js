export const EARNINGS_TYPES = {
  BOOKING_REVENUE: 'booking_revenue',
  COMMISSION: 'commission',
  BONUS: 'bonus',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
  PENALTY: 'penalty',
  PROMOTION: 'promotion',
  TAX: 'tax'
};

export const EARNINGS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold'
};

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  SCHEDULED: 'scheduled'
};

export const PAYOUT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  WISE: 'wise',
  CHECK: 'check',
  CASH: 'cash'
};

export const PAYOUT_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BI_WEEKLY: 'bi_weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ON_DEMAND: 'on_demand'
};

export const EARNINGS_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

export const EARNINGS_LABELS = {
  [EARNINGS_TYPES.BOOKING_REVENUE]: 'Booking Revenue',
  [EARNINGS_TYPES.COMMISSION]: 'Commission',
  [EARNINGS_TYPES.BONUS]: 'Bonus',
  [EARNINGS_TYPES.REFUND]: 'Refund',
  [EARNINGS_TYPES.ADJUSTMENT]: 'Adjustment',
  [EARNINGS_TYPES.PENALTY]: 'Penalty',
  [EARNINGS_TYPES.PROMOTION]: 'Promotion',
  [EARNINGS_TYPES.TAX]: 'Tax'
};

export const STATUS_LABELS = {
  [EARNINGS_STATUS.PENDING]: 'Pending',
  [EARNINGS_STATUS.PROCESSING]: 'Processing',
  [EARNINGS_STATUS.COMPLETED]: 'Completed',
  [EARNINGS_STATUS.FAILED]: 'Failed',
  [EARNINGS_STATUS.CANCELLED]: 'Cancelled',
  [EARNINGS_STATUS.ON_HOLD]: 'On Hold'
};

export const PAYOUT_STATUS_LABELS = {
  [PAYOUT_STATUS.PENDING]: 'Pending',
  [PAYOUT_STATUS.PROCESSING]: 'Processing',
  [PAYOUT_STATUS.COMPLETED]: 'Completed',
  [PAYOUT_STATUS.FAILED]: 'Failed',
  [PAYOUT_STATUS.CANCELLED]: 'Cancelled',
  [PAYOUT_STATUS.SCHEDULED]: 'Scheduled'
};

export const PAYOUT_METHOD_LABELS = {
  [PAYOUT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYOUT_METHODS.PAYPAL]: 'PayPal',
  [PAYOUT_METHODS.STRIPE]: 'Stripe',
  [PAYOUT_METHODS.WISE]: 'Wise',
  [PAYOUT_METHODS.CHECK]: 'Check',
  [PAYOUT_METHODS.CASH]: 'Cash'
};

export const PAYOUT_FREQUENCY_LABELS = {
  [PAYOUT_FREQUENCY.DAILY]: 'Daily',
  [PAYOUT_FREQUENCY.WEEKLY]: 'Weekly',
  [PAYOUT_FREQUENCY.BI_WEEKLY]: 'Bi-Weekly',
  [PAYOUT_FREQUENCY.MONTHLY]: 'Monthly',
  [PAYOUT_FREQUENCY.QUARTERLY]: 'Quarterly',
  [PAYOUT_FREQUENCY.ON_DEMAND]: 'On Demand'
};

export const PERIOD_LABELS = {
  [EARNINGS_PERIODS.TODAY]: 'Today',
  [EARNINGS_PERIODS.YESTERDAY]: 'Yesterday',
  [EARNINGS_PERIODS.THIS_WEEK]: 'This Week',
  [EARNINGS_PERIODS.LAST_WEEK]: 'Last Week',
  [EARNINGS_PERIODS.THIS_MONTH]: 'This Month',
  [EARNINGS_PERIODS.LAST_MONTH]: 'Last Month',
  [EARNINGS_PERIODS.THIS_QUARTER]: 'This Quarter',
  [EARNINGS_PERIODS.LAST_QUARTER]: 'Last Quarter',
  [EARNINGS_PERIODS.THIS_YEAR]: 'This Year',
  [EARNINGS_PERIODS.LAST_YEAR]: 'Last Year',
  [EARNINGS_PERIODS.CUSTOM]: 'Custom Range'
};

export const STATUS_COLORS = {
  [EARNINGS_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [EARNINGS_STATUS.PROCESSING]: 'bg-blue-100 text-blue-800',
  [EARNINGS_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [EARNINGS_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [EARNINGS_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
  [EARNINGS_STATUS.ON_HOLD]: 'bg-orange-100 text-orange-800'
};

export const PAYOUT_STATUS_COLORS = {
  [PAYOUT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PAYOUT_STATUS.PROCESSING]: 'bg-blue-100 text-blue-800',
  [PAYOUT_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [PAYOUT_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [PAYOUT_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
  [PAYOUT_STATUS.SCHEDULED]: 'bg-purple-100 text-purple-800'
};

export const EARNINGS_TYPE_COLORS = {
  [EARNINGS_TYPES.BOOKING_REVENUE]: 'bg-green-100 text-green-800',
  [EARNINGS_TYPES.COMMISSION]: 'bg-blue-100 text-blue-800',
  [EARNINGS_TYPES.BONUS]: 'bg-purple-100 text-purple-800',
  [EARNINGS_TYPES.REFUND]: 'bg-red-100 text-red-800',
  [EARNINGS_TYPES.ADJUSTMENT]: 'bg-yellow-100 text-yellow-800',
  [EARNINGS_TYPES.PENALTY]: 'bg-red-100 text-red-800',
  [EARNINGS_TYPES.PROMOTION]: 'bg-pink-100 text-pink-800',
  [EARNINGS_TYPES.TAX]: 'bg-gray-100 text-gray-800'
};

export const getEarningsLabel = (type) => {
  return EARNINGS_LABELS[type] || 'Unknown';
};

export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || 'Unknown';
};

export const getPayoutStatusLabel = (status) => {
  return PAYOUT_STATUS_LABELS[status] || 'Unknown';
};

export const getPayoutMethodLabel = (method) => {
  return PAYOUT_METHOD_LABELS[method] || 'Unknown';
};

export const getPayoutFrequencyLabel = (frequency) => {
  return PAYOUT_FREQUENCY_LABELS[frequency] || 'Unknown';
};

export const getPeriodLabel = (period) => {
  return PERIOD_LABELS[period] || 'Unknown';
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS[EARNINGS_STATUS.PENDING];
};

export const getPayoutStatusColor = (status) => {
  return PAYOUT_STATUS_COLORS[status] || PAYOUT_STATUS_COLORS[PAYOUT_STATUS.PENDING];
};

export const getEarningsTypeColor = (type) => {
  return EARNINGS_TYPE_COLORS[type] || EARNINGS_TYPE_COLORS[EARNINGS_TYPES.BOOKING_REVENUE];
};

export const formatCurrency = (amount, currency = 'LKR') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

export const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const calculateCommission = (amount, rate) => {
  if (!amount || !rate) return 0;
  return (amount * rate) / 100;
};

export const calculateNetEarnings = (grossEarnings, commission, fees, taxes) => {
  const totalDeductions = (commission || 0) + (fees || 0) + (taxes || 0);
  return (grossEarnings || 0) - totalDeductions;
};

export const getEarningsSummary = (earnings) => {
  const summary = {
    totalEarnings: 0,
    totalCommission: 0,
    totalFees: 0,
    totalTaxes: 0,
    netEarnings: 0,
    pendingEarnings: 0,
    completedEarnings: 0,
    failedEarnings: 0
  };

  if (!earnings || !Array.isArray(earnings)) return summary;

  earnings.forEach(earning => {
    summary.totalEarnings += earning.amount || 0;
    
    if (earning.type === EARNINGS_TYPES.COMMISSION) {
      summary.totalCommission += earning.amount || 0;
    }
    
    if (earning.type === EARNINGS_TYPES.TAX) {
      summary.totalTaxes += earning.amount || 0;
    }
    
    switch (earning.status) {
      case EARNINGS_STATUS.PENDING:
        summary.pendingEarnings += earning.amount || 0;
        break;
      case EARNINGS_STATUS.COMPLETED:
        summary.completedEarnings += earning.amount || 0;
        break;
      case EARNINGS_STATUS.FAILED:
        summary.failedEarnings += earning.amount || 0;
        break;
    }
  });

  summary.netEarnings = calculateNetEarnings(
    summary.totalEarnings,
    summary.totalCommission,
    summary.totalFees,
    summary.totalTaxes
  );

  return summary;
};
