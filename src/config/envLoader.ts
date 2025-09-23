// Environment Loader - Automatically loads the correct environment file
import { developmentEnv } from './env.development';
import { productionEnv } from './env.production';

export interface EnvConfig {
  NODE_ENV: string;
  REACT_APP_API_BASE_URL: string;
  REACT_APP_ENABLE_MOCK_DATA: string;
  REACT_APP_API_TIMEOUT: string;
}

// Get the correct environment configuration based on NODE_ENV
export const getEnvConfig = (): EnvConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  console.log('Loading environment config for:', nodeEnv);
  
  switch (nodeEnv) {
    case 'production':
      console.log('Using production environment config');
      return productionEnv;
    case 'development':
    default:
      console.log('Using development environment config');
      return developmentEnv;
  }
};

// Export the current environment config
export const currentEnvConfig = getEnvConfig();

// Helper to get API base URL from the correct environment
export const getApiBaseUrl = (): string => {
  return currentEnvConfig.REACT_APP_API_BASE_URL;
};

// Helper to check if mock data is enabled
export const isMockDataEnabled = (): boolean => {
  return currentEnvConfig.REACT_APP_ENABLE_MOCK_DATA === 'true';
};

// Helper to get API timeout
export const getApiTimeout = (): number => {
  return parseInt(currentEnvConfig.REACT_APP_API_TIMEOUT, 10);
};
