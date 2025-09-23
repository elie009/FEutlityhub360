export interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production';
  enableMockData: boolean;
  apiTimeout: number;
}

// Get configuration from environment variables with fallbacks
const getConfig = (): EnvironmentConfig => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7019/api';
  const enableMockData = process.env.REACT_APP_ENABLE_MOCK_DATA === 'true';
  const apiTimeout = parseInt(process.env.REACT_APP_API_TIMEOUT || '10000', 10);
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

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
