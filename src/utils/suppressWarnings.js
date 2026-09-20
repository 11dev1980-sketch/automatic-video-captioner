/**
 * Suppress specific React Native Web deprecation warnings
 * that originate from third-party libraries (React Navigation)
 */

const originalWarn = console.warn;

console.warn = function(...args) {
  const message = args[0];
  if (typeof message === 'string' && message.includes('props.pointerEvents is deprecated')) {
    // Suppress this specific warning as it comes from React Navigation's internal implementation
    return;
  }
  originalWarn.apply(console, args);
};

export {};
