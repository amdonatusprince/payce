export const supportedCurrencies = {
  'ETH-sepolia-sepolia': { decimals: 18 },
  'ETH-mainnet': { decimals: 18 },
  'ETH-base': { decimals: 18 },
  'USDT-base': { decimals: 6 },
  'USDC-base': { decimals: 6 },
  'USDC-mainnet': { decimals: 6 },

} as const;
  
  export const supportedChains = [
    'Mainnet',
    'Sepolia',
    'Polygon',
    'Arbitrum',
    'Optimism',
    'Base'
  ] as const;
  
  export const paymentStatuses = [
    'pending',
    'completed',
    'failed',
    'processing'
  ] as const;
  
  export const invoiceStatuses = [
    'draft',
    'sent',
    'paid',
    'overdue',
    'cancelled'
  ] as const;
  
  export const transactionTypes = [
    'payment',
    'invoice',
    'escrow',
    'swap',
    'transfer'
  ] as const;
  
  // Add TypeScript types for the constants
  export type SupportedCurrency = keyof typeof supportedCurrencies;
  export type SupportedChain = typeof supportedChains[number];
  export type PaymentStatus = typeof paymentStatuses[number];
  export type InvoiceStatus = typeof invoiceStatuses[number];
  export type TransactionType = typeof transactionTypes[number];
  
  // Configuration constants
  export const CONFIG = {
    MAX_BATCH_SIZE: 100,
    MIN_TRANSACTION_AMOUNT: 0.000001,
    MAX_TRANSACTION_AMOUNT: 1000000,
    DEFAULT_CURRENCY: 'USDC' as SupportedCurrency,
    DEFAULT_CHAIN: 'Ethereum' as SupportedChain,
    TRANSACTION_FEE: 0.001, // 0.1%
    SWAP_FEE: 0.005, // 0.5%
  } as const;
  
  // API endpoints (if needed)
  export const API_ENDPOINTS = {
    TRANSACTIONS: '/api/transactions',
    INVOICES: '/api/invoices',
    PAYMENTS: '/api/payments',
    USERS: '/api/users',
    ANALYTICS: '/api/analytics',
  } as const;
  
  // Theme constants
  export const THEME = {
    colors: {
      primary: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
      },
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  } as const;
  
  // Validation constants
  export const VALIDATION = {
    address: {
      pattern: /^0x[a-fA-F0-9]{40}$/,
      message: 'Invalid Ethereum address',
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address',
    },
    password: {
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number',
    },
  } as const;