# 🔧 How to Change Backend URL (Localhost ↔ Production)

## Quick Guide

### ✅ **Method 1: Change Environment File (Recommended)**

This is the **easiest and recommended** way to switch between localhost and production.

---

## 🏠 **Switch to LOCALHOST (Development)**

### Step 1: Edit Development Config
Open: `src/config/env.development.ts`

Change this line:
```typescript
REACT_APP_API_BASE_URL: 'https://api.utilityhub360.com/api',  // Current (Production)
```

To:
```typescript
REACT_APP_API_BASE_URL: 'http://localhost:5000/api',  // Localhost
// OR
REACT_APP_API_BASE_URL: 'https://localhost:5001/api',  // Localhost HTTPS
```

### Step 2: Run Development Server
```bash
npm run start:dev
```

**That's it!** Your app now connects to localhost backend.

---

## 🌐 **Switch to PRODUCTION**

### Step 1: Edit Development Config
Open: `src/config/env.development.ts`

Change this line:
```typescript
REACT_APP_API_BASE_URL: 'http://localhost:5000/api',  // Localhost
```

To:
```typescript
REACT_APP_API_BASE_URL: 'https://api.utilityhub360.com/api',  // Production
```

### Step 2: Run Development Server
```bash
npm run start:dev
```

**Done!** Your app now connects to production backend.

---

## 📝 **Current Configuration**

### Development (`src/config/env.development.ts`):
```typescript
export const developmentEnv = {
  NODE_ENV: 'development',
  REACT_APP_API_BASE_URL: 'https://api.utilityhub360.com/api',  // ← CURRENTLY SET TO PRODUCTION
  REACT_APP_ENABLE_MOCK_DATA: 'false',
  REACT_APP_API_TIMEOUT: '10000',
};
```

### Production (`src/config/env.production.ts`):
```typescript
export const productionEnv = {
  NODE_ENV: 'production',
  REACT_APP_API_BASE_URL: 'https://api.utilityhub360.com/api',
  REACT_APP_ENABLE_MOCK_DATA: 'false',
  REACT_APP_API_TIMEOUT: '10000',
};
```

---

## 🎯 **Common Backend URLs**

### Localhost Options:
```typescript
// HTTP (no SSL)
'http://localhost:5000/api'
'http://localhost:3000/api'

// HTTPS (with SSL)
'https://localhost:5000/api'
'https://localhost:7001/api'

// Different port
'http://localhost:8080/api'
```

### Production Options:
```typescript
// Your current production URL
'https://api.utilityhub360.com/api'

// Alternative formats
'https://backend.yourdomain.com/api'
'https://yourdomain.com/api/v1'
```

---

## 🔄 **Quick Switch Commands**

### Development with Localhost:
```bash
# 1. Edit env.development.ts → Set to localhost URL
# 2. Run:
npm run start:dev
```

### Development with Production:
```bash
# 1. Edit env.development.ts → Set to production URL
# 2. Run:
npm run start:dev
```

### Build for Production:
```bash
npm run build:prod
```

---

## 📁 **File Locations**

| File | Purpose | Location |
|------|---------|----------|
| Development Config | Dev backend URL | `src/config/env.development.ts` |
| Production Config | Prod backend URL | `src/config/env.production.ts` |
| Environment Loader | Auto-loads config | `src/config/envLoader.ts` |
| API Service | Uses the config | `src/services/api.ts` |

---

## 🛠️ **Step-by-Step: Switch to Localhost**

### 1. **Stop the Dev Server** (if running)
Press `Ctrl + C` in terminal

### 2. **Open Config File**
```
src/config/env.development.ts
```

### 3. **Change URL**
From:
```typescript
REACT_APP_API_BASE_URL: 'https://api.utilityhub360.com/api',
```

To:
```typescript
REACT_APP_API_BASE_URL: 'http://localhost:5000/api',
```

### 4. **Save File**
Press `Ctrl + S`

### 5. **Restart Dev Server**
```bash
npm run start:dev
```

### 6. **Verify in Browser Console**
Open browser console (F12) and look for:
```
Environment config loaded: {
  apiBaseUrl: "http://localhost:5000/api",
  ...
}
```

---

## 🐛 **Troubleshooting**

### Issue: "Changes not taking effect"
**Solution:**
1. Stop dev server (`Ctrl + C`)
2. Clear browser cache (`Ctrl + Shift + Del`)
3. Delete `node_modules/.cache` folder
4. Run `npm run start:dev` again

### Issue: "CORS errors with localhost"
**Solution:**
Your backend needs to allow CORS from `http://localhost:3000`

Backend CORS config example (C#):
```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
```

### Issue: "Connection refused to localhost"
**Solutions:**
1. Make sure backend is running on the correct port
2. Check backend URL matches exactly
3. Try `http://127.0.0.1:5000/api` instead of `localhost`

---

## 📊 **Environment Variables Priority**

The system checks in this order:

1. **Environment Files** (.env files if you have them)
2. **TypeScript Config Files** (`env.development.ts` / `env.production.ts`)
3. **Default Values** (fallback in code)

Current setup uses **TypeScript Config Files** (recommended).

---

## 🎯 **Best Practices**

### For Development:
- ✅ Use `env.development.ts` for local development
- ✅ Set to localhost when testing with local backend
- ✅ Set to production when testing with real API
- ✅ Use `npm run start:dev` command

### For Production:
- ✅ Use `env.production.ts` for production builds
- ✅ Always set to actual production URL
- ✅ Enable appropriate timeouts
- ✅ Disable mock data
- ✅ Use `npm run build:prod` command

---

## 🚀 **Quick Reference**

### Switch to Localhost:
```bash
# Edit: src/config/env.development.ts
# Change to: http://localhost:5000/api
npm run start:dev
```

### Switch to Production:
```bash
# Edit: src/config/env.development.ts
# Change to: https://api.utilityhub360.com/api
npm run start:dev
```

### Verify Current Backend:
Open browser console (F12) → Look for:
```
API Service: Initialized with baseUrl: http://localhost:5000/api
```

---

## 💡 **Pro Tips**

1. **Comment out URLs** for easy switching:
```typescript
// REACT_APP_API_BASE_URL: 'http://localhost:5000/api',  // Localhost
REACT_APP_API_BASE_URL: 'https://api.utilityhub360.com/api',  // Production
```

2. **Check Network Tab** in browser DevTools to see actual API calls

3. **Use environment-specific ports**:
   - Localhost: 5000, 5001, 7000, 7001
   - Production: 443 (HTTPS)

---

## 📞 **Need Help?**

1. Check browser console for API errors
2. Check Network tab for failed requests
3. Verify backend is running and accessible
4. Confirm CORS is configured on backend

---

**Last Updated:** October 10, 2025  
**Current Setup:** Development config points to Production API  
**To Switch:** Edit `src/config/env.development.ts`

