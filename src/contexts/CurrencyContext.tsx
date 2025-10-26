import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Currency options with codes and full names
// USD first, then alphabetical order
export const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number, options?: CurrencyFormatOptions) => string;
  getCurrencySymbol: (currencyCode?: string) => string;
  getCurrencyName: (currencyCode?: string) => string;
  isLoading: boolean;
}

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: number;
  locale?: string;
  currencyCode?: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { userProfile } = useAuth();
  const [currency, setCurrencyState] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState(true);

  // Load currency preference from user profile or localStorage
  useEffect(() => {
    const loadCurrencyPreference = () => {
      try {
        // First try to get from user profile
        if (userProfile?.preferredCurrency) {
          setCurrencyState(userProfile.preferredCurrency);
          localStorage.setItem('preferredCurrency', userProfile.preferredCurrency);
        } else {
          // Fallback to localStorage
          const savedCurrency = localStorage.getItem('preferredCurrency');
          if (savedCurrency && CURRENCY_OPTIONS.find(c => c.code === savedCurrency)) {
            setCurrencyState(savedCurrency);
          }
        }
      } catch (error) {
        console.error('Error loading currency preference:', error);
        setCurrencyState('USD'); // Default fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrencyPreference();
  }, [userProfile]);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const formatCurrency = (amount: number, options: CurrencyFormatOptions = {}): string => {
    const {
      showSymbol = true,
      showCode = false,
      decimals = 2,
      locale = 'en-US',
      currencyCode
    } = options;

    // Always use the user's preferred currency, not the transaction's currency
    const targetCurrency = currency;

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      let formatted = formatter.format(amount);

      if (!showSymbol) {
        // Remove currency symbol but keep the number formatting
        formatted = formatted.replace(/[^\d.,\s-]/g, '').trim();
      }

      if (showCode) {
        formatted += ` ${currency}`;
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting currency:', error);
      // Fallback formatting
      const symbol = getCurrencySymbol(targetCurrency);
      return `${symbol}${amount.toFixed(decimals)}`;
    }
  };

  const getCurrencySymbol = (currencyCode?: string): string => {
    const code = currencyCode || currency;
    const currencyOption = CURRENCY_OPTIONS.find(c => c.code === code);
    return currencyOption?.symbol || '$';
  };

  const getCurrencyName = (currencyCode?: string): string => {
    const code = currencyCode || currency;
    const currencyOption = CURRENCY_OPTIONS.find(c => c.code === code);
    return currencyOption?.name || 'US Dollar';
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyName,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
