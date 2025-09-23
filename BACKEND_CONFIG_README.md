# 🚀 Automatic Environment-Based Backend Configuration

## ✅ **AUTOMATIC ENVIRONMENT LOADING!**

The system automatically loads the correct environment file based on your npm script:

- `npm run start:dev` → **Automatically loads** `env.development.ts`
- `npm run start:prod` → **Automatically loads** `env.production.ts`

### 📁 **Development**: `src/config/env.development.ts`
```typescript
export const developmentEnv = {
  NODE_ENV: 'development',
  REACT_APP_API_BASE_URL: 'https://localhost:5000/api',  // ← Change this for dev backend
  REACT_APP_ENABLE_MOCK_DATA: 'false',
  REACT_APP_API_TIMEOUT: '10000',
};
```

### 📁 **Production**: `src/config/env.production.ts`
```typescript
export const productionEnv = {
  NODE_ENV: 'production',
  REACT_APP_API_BASE_URL: 'https://your-production-api.com/api',  // ← Change this for prod backend
  REACT_APP_ENABLE_MOCK_DATA: 'false',
  REACT_APP_API_TIMEOUT: '15000',
};
```

## 🔧 **How to Change Backend URL**

### **For Development:**
1. **Open** `src/config/env.development.ts`
2. **Change** the `REACT_APP_API_BASE_URL` value:
   ```typescript
   REACT_APP_API_BASE_URL: 'https://your-new-dev-backend.com/api',  // ← Change this!
   ```
3. **Save** the file
4. **Run**: `npm run start:dev` (automatically loads dev config)

### **For Production:**
1. **Open** `src/config/env.production.ts`
2. **Change** the `REACT_APP_API_BASE_URL` value:
   ```typescript
   REACT_APP_API_BASE_URL: 'https://your-new-prod-backend.com/api',  // ← Change this!
   ```
3. **Save** the file
4. **Run**: `npm run start:prod` (automatically loads prod config)

## 📍 **What Gets Updated Automatically**

When you change the `REACT_APP_API_BASE_URL` in the environment files, it automatically updates:

- ✅ **API Service** (`src/services/api.ts`)
- ✅ **Environment Config** (`src/config/environment.ts`)
- ✅ **Proxy Config** (`setupProxy.js`) - *Automatically reads from correct env file*
- ✅ **All Components** - *Automatically uses correct environment*

## 🎯 **How It Works**

1. **NPM Script** sets `NODE_ENV` (development/production)
2. **Environment Loader** (`envLoader.ts`) automatically loads the correct file
3. **All Services** use the loaded configuration
4. **No manual configuration needed!**

## 🚀 **Available Commands**

```bash
# Development (loads env.development.ts)
npm run start:dev

# Development with mock data (loads env.development.ts + enables mock)
npm run start:mock

# Production (loads env.production.ts)
npm run start:prod

# Build for development
npm run build:dev

# Build for production
npm run build:prod
```

## 🎉 **Benefits**

- ✅ **One file per environment** - No confusion
- ✅ **Automatic loading** - No manual configuration
- ✅ **Type safety** - TypeScript ensures consistency
- ✅ **Easy switching** - Just change the npm script

**That's it!** The system automatically handles everything! 🚀
