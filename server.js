const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env, fallback to .env.example
const envPath = path.resolve(process.cwd(), '.env');
const envExamplePath = path.resolve(process.cwd(), '.env.example');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('[Server] ✓ Loaded .env (local development)');
} else if (fs.existsSync(envExamplePath)) {
  dotenv.config({ path: envExamplePath });
  console.log('[Server] ✓ Loaded .env.example (fallback)');
} else {
  console.log('[Server] ⚠ Warning: No .env or .env.example found');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load API handlers directly
const transcribeHandler = require('./api/transcribe');
const captionHandler = require('./api/caption');
const downloadHandler = require('./api/download');

console.log('[Server] Transcribe handler type:', typeof transcribeHandler);
console.log('[Server] Caption handler type:', typeof captionHandler);
console.log('[Server] Download handler type:', typeof downloadHandler);

// Directly mount the routers
app.use('/api/transcribe', transcribeHandler);
app.use('/api/caption', captionHandler);
app.use('/api/download', downloadHandler);

// Serve RapidAPI video download endpoints (for downloading reels and other videos)
// Note: Download endpoint now works locally using RAPIDAPI_KEY environment variable
// Video and Media ES module handlers are still skipped for local server
// const mediaHandler = require('./api/media');
// app.use('/api/media', mediaHandler);
// const videoHandler = require('./api/video');
// app.use('/api/video', videoHandler);
console.log('[Server] ⚠ Media and Video ES module handlers skipped (use /api/download for local development)');

// Log environment variables (without exposing actual keys)
console.log('[Server] Environment loaded:');
const supadataKeys = process.env.SUPADATA_API_KEY ? process.env.SUPADATA_API_KEY.split(',').map(k => k.trim()).filter(k => k) : [];
console.log('[Server] SUPADATA_API_KEY:', supadataKeys.length > 0 ? `✓ Set (${supadataKeys.length} key(s))` : '✗ Missing');
const geminiKeys = process.env.GOOGLE_AI_STUDIO_API_KEY ? process.env.GOOGLE_AI_STUDIO_API_KEY.split(',').map(k => k.trim()).filter(k => k) : [];
console.log('[Server] GOOGLE_AI_STUDIO_API_KEY:', geminiKeys.length > 0 ? `✓ Set (${geminiKeys.length} key(s))` : '✗ Missing');
const rapidapiKeys = process.env.RAPIDAPI_KEY ? process.env.RAPIDAPI_KEY.split(',').map(k => k.trim()).filter(k => k) : [];
console.log('[Server] RAPIDAPI_KEY:', rapidapiKeys.length > 0 ? `✓ Set (${rapidapiKeys.length} key(s))` : '✗ Missing');

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.RAILWAY_STATIC_URL;
  const port = process.env.PORT || PORT;
  
  if (isRailway) {
    const publicDomain = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_STATIC_URL;
    console.log(`\n🚀 API Server running at https://${publicDomain}`);
    console.log(`📡 API endpoints available at https://${publicDomain}/api/*\n`);
    console.log('[Server] Running on Railway');
  } else {
    console.log(`\n🚀 API Server running at http://localhost:${port}`);
    console.log(`📡 API endpoints available at http://localhost:${port}/api/*\n`);
  }
});

// Keep the server running indefinitely
const keepAlive = setInterval(() => {
  // Keep the process alive
}, 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API server...');
  clearInterval(keepAlive);
  server.close(() => {
    console.log('✅ API server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down API server...');
  clearInterval(keepAlive);
  server.close(() => {
    console.log('✅ API server closed');
    process.exit(0);
  });
});
