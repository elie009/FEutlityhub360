const { createProxyMiddleware } = require('http-proxy-middleware');

// 🚀 BACKEND CONFIGURATION FROM ENVIRONMENT FILES
// Automatically loads from env.development.ts or env.production.ts based on NODE_ENV
let BACKEND_URL = 'https://localhost:5000'; // fallback

try {
  // Try to load the environment config
  const envLoader = require('./src/config/envLoader.ts');
  const apiBaseUrl = envLoader.getApiBaseUrl();
  BACKEND_URL = apiBaseUrl.replace('/api', '');
  console.log('Loaded backend URL from environment file:', BACKEND_URL);
} catch (error) {
  console.log('Could not load environment file, using fallback:', BACKEND_URL);
  // Fallback to environment variable if available
  if (process.env.REACT_APP_API_BASE_URL) {
    BACKEND_URL = process.env.REACT_APP_API_BASE_URL.replace('/api', '');
    console.log('Using environment variable:', BACKEND_URL);
  }
}

console.log('Final proxy target:', BACKEND_URL);

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      secure: false, // Allow self-signed certificates
      logLevel: 'debug',
      onError: function (err, req, res) {
        console.log('Proxy error:', err);
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Proxying request to:', proxyReq.path);
      }
    })
  );
};
