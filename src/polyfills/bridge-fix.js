// bridge-fix.js - MUST execute before ANY React Native code
(function() {
  'use strict';
  
  // CRITICAL: Ensure ALL arrays are proper arrays (not undefined/null)
  const safeArray = (val) => Array.isArray(val) ? val : [];
  
  // Create the EXACT structure React Native Web expects
  const bridgeConfig = {
    remoteModuleConfig: safeArray([
      {moduleName: 'SourceCode', moduleID: 1, methods: ['getConstants', 'getSourceCode']}
    ]),
    localModuleConfig: safeArray([]),
    moduleTable: {
      'SourceCode': {
        moduleID: 1, 
        name: 'SourceCode', 
        syncMethods: safeArray([]), 
        asyncMethods: safeArray(['getConstants', 'getSourceCode'])
      }
    },
    methodQueue: safeArray([])
  };
  
  // TurboModuleRegistry mock - ensure all returns are safe
  const turboRegistry = {
    getEnforcing: function(moduleName) {
      return {
        addListener: function() { return { remove: function() {} }; },
        removeListeners: function() {},
        getConstants: function() { return {}; },
        getSourceCode: function() { return { script: '' }; }
      };
    },
    get: function(moduleName) { return turboRegistry.getEnforcing(moduleName); },
    registerConfig: function() {}
  };
  
  // Set on ALL global contexts - with defensive checks
  var targets = [];
  if (typeof globalThis !== 'undefined') targets.push(globalThis);
  if (typeof global !== 'undefined') targets.push(global);
  if (typeof window !== 'undefined') targets.push(window);
  
  for (var i = 0; i < targets.length; i++) {
    var t = targets[i];
    if (t) {
      // Defensive: only set if not already set to avoid conflicts
      if (!t.__fbBatchedBridgeConfig) t.__fbBatchedBridgeConfig = bridgeConfig;
      if (!t.__fbBatchedBridge) {
        t.__fbBatchedBridge = {
          enqueueNativeCall: function() {},
          flushedQueue: function() { return safeArray([]); },
          callFunctionReturnFlushedQueue: function() { return safeArray([]); }
        };
      }
      if (!t.TurboModuleRegistry) t.TurboModuleRegistry = turboRegistry;
      if (!t.NativeModules) t.NativeModules = {};
      if (!t.PlatformConstants) t.PlatformConstants = {};
    }
  }
  
  // ADD DETAILED LOGGING TO PINPOINT ITERATION ERRORS
  if (typeof console !== 'undefined') {
    // Intercept iteration errors specifically with detailed tracking
    var originalError = console.error;
    console.error = function() {
      var msg = String(arguments[0] || '');
      if (msg.indexOf('is not iterable') !== -1) {
        console.log('🚨 ITERATION ERROR DETECTED:');
        console.log('📝 Message:', msg);
        console.log('📍 Full stack trace:', new Error().stack);
        console.log('🔍 Arguments:', Array.prototype.slice.call(arguments));
        console.log('⏰ Timestamp:', new Date().toISOString());
        
        // Try to identify the component causing the error
        var stack = new Error().stack;
        if (stack) {
          var lines = stack.split('\n');
          console.log('📂 Call stack analysis:');
          lines.slice(0, 8).forEach(function(line, index) {
            console.log('   ', index + 1, ':', line.trim());
          });
        }
        
        return; // Suppress but log details
      }
      if (msg.indexOf('__fbBatchedBridgeConfig') !== -1 || 
          msg.indexOf('TurboModuleRegistry') !== -1) {
        console.log('🚨 bridge-fix intercepted:', msg);
        return;
      }
      originalError.apply(console, arguments);
    };
    
    // Also track React component rendering
    if (typeof window !== 'undefined') {
      var originalLog = console.log;
      console.log = function() {
        var msg = String(arguments[0] || '');
        if (msg.indexOf('rendering') !== -1 || msg.indexOf('App.js') !== -1) {
          originalLog.apply(console, arguments);
        }
        originalLog.apply(console, arguments);
      };
    }
  }
})();
