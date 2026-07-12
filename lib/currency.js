// Currency formatting utility

const currencySymbols = {
  IDR: 'Rp',
  USD: '$',
  EUR: '€',
  SGD: 'S$',
  MYR: 'RM'
};

const currencyConfig = {
  IDR: {
    locale: 'id-ID',
    decimals: 0,
    symbol: 'Rp'
  },
  USD: {
    locale: 'en-US',
    decimals: 2,
    symbol: '$'
  },
  EUR: {
    locale: 'de-DE',
    decimals: 2,
    symbol: '€'
  },
  SGD: {
    locale: 'en-SG',
    decimals: 2,
    symbol: 'S$'
  },
  MYR: {
    locale: 'ms-MY',
    decimals: 2,
    symbol: 'RM'
  }
};

/**
 * Format number as currency based on user preference
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (IDR, USD, EUR, SGD, MYR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = null) {
  // Get currency from localStorage if not provided
  const currencyCode = currency || (typeof window !== 'undefined' ? localStorage.getItem('currency') : null) || 'IDR';
  const config = currencyConfig[currencyCode] || currencyConfig.IDR;

  // Format number with thousands separator
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  }).format(amount);

  // Return with symbol
  return `${config.symbol} ${formattedNumber}`;
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency = null) {
  const currencyCode = currency || (typeof window !== 'undefined' ? localStorage.getItem('currency') : null) || 'IDR';
  return currencySymbols[currencyCode] || 'Rp';
}

/**
 * Parse formatted currency string to number
 * @param {string} currencyString - Formatted currency string
 * @returns {number} Parsed number
 */
export function parseCurrency(currencyString) {
  if (!currencyString) return 0;
  // Remove all non-numeric characters except dot and comma
  const cleanString = currencyString.toString().replace(/[^\d,.-]/g, '');
  // Replace comma with dot for decimal
  const normalizedString = cleanString.replace(',', '.');
  return parseFloat(normalizedString) || 0;
}

export default {
  formatCurrency,
  getCurrencySymbol,
  parseCurrency
};
