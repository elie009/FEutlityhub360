import { getApiBaseUrl as envGetApiBaseUrl, isMockDataEnabled as envIsMockDataEnabled, getApiTimeout, currentEnvConfig } from './envLoader';

export interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production';
  enableMockData: boolean;
  apiTimeout: number;
}

// Get configuration from the correct environment file
const getConfig = (): EnvironmentConfig => {
  // Use environment variables if set (for override), otherwise use env files
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || envGetApiBaseUrl();
  const enableMockData = process.env.REACT_APP_ENABLE_MOCK_DATA 
    ? process.env.REACT_APP_ENABLE_MOCK_DATA === 'true' 
    : envIsMockDataEnabled();
  const apiTimeout = process.env.REACT_APP_API_TIMEOUT 
    ? parseInt(process.env.REACT_APP_API_TIMEOUT, 10)
    : getApiTimeout();
  const environment = currentEnvConfig.NODE_ENV as 'development' | 'production';

  console.log('Environment config loaded:', {
    apiBaseUrl,
    environment,
    enableMockData,
    apiTimeout
  });

  return {
    apiBaseUrl,
    environment,
    enableMockData,
    apiTimeout,
  };
};

// Export the configuration
export const config: EnvironmentConfig = getConfig();

// Helper function to check if we're in development
export const isDevelopment = (): boolean => config.environment === 'development';

// Helper function to check if we're in production
export const isProduction = (): boolean => config.environment === 'production';

// Helper function to get API base URL
export const getApiBaseUrl = (): string => config.apiBaseUrl;

// Helper function to check if mock data is enabled
export const isMockDataEnabled = (): boolean => config.enableMockData;

export default config;
