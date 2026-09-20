// CRITICAL: This MUST be the absolute first import - no comments, no code before it
import './src/polyfills/bridge-fix';

import { registerRootComponent } from 'expo';
import App from './App';

// Catch "not iterable" errors globally
if (typeof window !== 'undefined') {
  window.addEventListener('error', function(e) {
    if (e.message && e.message.indexOf('is not iterable') !== -1) {
      console.log('🚨 GLOBAL: Caught iterable error:', e.message);
      console.log('📍 Error target:', e.target);
      console.log('📍 Error filename:', e.filename);
      console.log('📍 Error lineno:', e.lineno);
      // Prevent crash but log for debugging
      e.preventDefault();
    }
  }, true);
}

registerRootComponent(App);
