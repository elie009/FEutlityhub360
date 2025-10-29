# Configuration Documentation

## Environment Configuration

The application supports multiple environments with different configurations for API endpoints, mock data usage, and other settings.

### Configuration Files

- `src/config/environment.ts` - Main configuration file
- `src/config/api.ts` - API service configuration
- `src/config/env.development.ts` - Development environment settings
- `src/config/env.production.ts` - Production environment settings

### Environment Variables

The application uses the following environment variables:

| Variable | Description | Default | Development | Production |
|----------|-------------|---------|-------------|------------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` | `http://localhost:5000/api` | `https://your-production-api.com/api` |
| `REACT_APP_ENABLE_MOCK_DATA` | Enable mock data instead of real API calls | `false` | `false` | `false` |
| `REACT_APP_API_TIMEOUT` | API request timeout in milliseconds | `10000` | `10000` | `15000` |
| `NODE_ENV` | Node environment | `development` | `development` | `production` |

### Available Scripts

#### Development Scripts
```bash
# Start with development configuration (real API calls)
npm run start:dev

# Start with mock data (for frontend-only development)
npm run start:mock

# Start with production configuration
npm run start:prod
```

#### Build Scripts
```bash
# Build for development
npm run build:dev

# Build for production
npm run build:prod
```

### Configuration Usage

#### In Components
```typescript
import { config, isDevelopment, isMockDataEnabled } from '../config/environment';

// Check environment
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Check if mock data is enabled
if (isMockDataEnabled()) {
  console.log('Using mock data');
}

// Access configuration values
console.log('API Base URL:', config.apiBaseUrl);
console.log('API Timeout:', config.apiTimeout);
```

#### In API Service
```typescript
import { config, isMockDataEnabled } from '../config/environment';

class ApiService {
  private baseUrl = config.apiBaseUrl;
  
  async makeRequest() {
    if (isMockDataEnabled()) {
      return mockDataService.getData();
    }
    return fetch(`${this.baseUrl}/endpoint`);
  }
}
```

### Environment Switching

#### Method 1: Using npm scripts
```bash
# Development with real API
npm run start:dev

# Development with mock data
npm run start:mock

# Production
npm run start:prod
```

#### Method 2: Using environment variables directly
```bash
# Set environment variables and start
REACT_APP_API_BASE_URL=http://localhost:5000/api REACT_APP_ENABLE_MOCK_DATA=false npm start

# Use mock data
REACT_APP_API_BASE_URL=http://localhost:5000/api REACT_APP_ENABLE_MOCK_DATA=true npm start
```

#### Method 3: Creating .env files
Create `.env.local` file in the project root:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_API_TIMEOUT=10000
```

### Backend Configuration

#### Development Backend
- **URL**: `http://localhost:5000/api`
- **Purpose**: Local development server
- **Mock Data**: Disabled (uses real API calls)

#### Production Backend
- **URL**: `https://your-production-api.com/api`
- **Purpose**: Live production server
- **Mock Data**: Disabled (uses real API calls)

### Mock Data Configuration

When `REACT_APP_ENABLE_MOCK_DATA=true`:
- All API calls are intercepted and return mock data
- No actual HTTP requests are made to the backend
- Useful for frontend development without backend
- Authentication still works with mock users

### API Timeout Configuration

- **Development**: 10 seconds (10000ms)
- **Production**: 15 seconds (15000ms)
- **Custom**: Set via `REACT_APP_API_TIMEOUT` environment variable

### Security Considerations

1. **Environment Variables**: Only variables prefixed with `REACT_APP_` are exposed to the browser
2. **API Keys**: Never store sensitive API keys in environment variables
3. **Production URLs**: Always use HTTPS in production
4. **Mock Data**: Disable mock data in production builds

### Troubleshooting

#### Common Issues

1. **API calls not working**
   - Check if `REACT_APP_API_BASE_URL` is set correctly
   - Verify backend server is running
   - Check browser network tab for errors

2. **Mock data not loading**
   - Ensure `REACT_APP_ENABLE_MOCK_DATA=true`
   - Check console for mock data service errors

3. **Environment variables not loading**
   - Restart the development server after changing .env files
   - Ensure variable names start with `REACT_APP_`
   - Check for typos in variable names

#### Debug Configuration

Add this to any component to debug configuration:
```typescript
import { config } from '../config/environment';

console.log('Current configuration:', config);
console.log('Environment variables:', {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  ENABLE_MOCK_DATA: process.env.REACT_APP_ENABLE_MOCK_DATA,
  API_TIMEOUT: process.env.REACT_APP_API_TIMEOUT,
});
```


