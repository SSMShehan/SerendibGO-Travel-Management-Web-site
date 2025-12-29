export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatDateTime = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options });
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};

export const isToday = (date) => {
  if (!date) return false;
  
  const today = new Date();
  const targetDate = new Date(date);
  
  return today.toDateString() === targetDate.toDateString();
};

export const isYesterday = (date) => {
  if (!date) return false;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = new Date(date);
  
  return yesterday.toDateString() === targetDate.toDateString();
};

export const isThisWeek = (date) => {
  if (!date) return false;
  
  const now = new Date();
  const targetDate = new Date(date);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return targetDate >= weekAgo && targetDate <= now;
};

export const isThisMonth = (date) => {
  if (!date) return false;
  
  const now = new Date();
  const targetDate = new Date(date);
  
  return now.getMonth() === targetDate.getMonth() && 
         now.getFullYear() === targetDate.getFullYear();
};

export const getDaysDifference = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const addDays = (date, days) => {
  if (!date) return null;
  
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date, days) => {
  if (!date) return null;
  
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const getStartOfDay = (date) => {
  if (!date) return null;
  
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfDay = (date) => {
  if (!date) return null;
  
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const getStartOfWeek = (date) => {
  if (!date) return null;
  
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfWeek = (date) => {
  if (!date) return null;
  
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1) + 6; // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const getStartOfMonth = (date) => {
  if (!date) return null;
  
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfMonth = (date) => {
  if (!date) return null;
  
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const formatDateForAPI = (date) => {
  if (!date) return null;
  
  return new Date(date).toISOString().split('T')[0];
};

export const parseAPIDate = (dateString) => {
  if (!dateString) return null;
  
  return new Date(dateString);
};
