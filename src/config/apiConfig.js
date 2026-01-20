export const API_CONFIG = {
  Prabhat_URL: import.meta.env.VITE_Prabhat_Base || (import.meta.env.DEV ? '' : `https://uaterp.gbru.in`),
  API_KEY: import.meta.env.VITE_ERPNEXT_API_KEY || 'SHOPTION_XYZ_9834SDJKS',
  API_SECRET: import.meta.env.VITE_ERPNEXT_API_SECRET || 'SHOPTION_SECRET_99ASD9A8S9D',
  PAYMENT_URL: import.meta.env.VITE_PAYMENT_PRABHAT 
};

// Debug logging
console.log('API_CONFIG loaded:', {
  Prabhat_URL: API_CONFIG.Prabhat_URL,
  API_KEY: API_CONFIG.API_KEY ? 'SET' : 'NOT SET',
  API_SECRET: API_CONFIG.API_SECRET ? 'SET' : 'NOT SET'
});