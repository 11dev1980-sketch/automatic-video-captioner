/**
 * Error Monitoring Utility
 * Centralized error tracking and reporting
 */

import { AppLogger } from './logger';

// Error categories
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  API: 'api',
  VALIDATION: 'validation',
  STORAGE: 'storage',
  VIDEO: 'video',
  UNKNOWN: 'unknown',
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Categorize error based on error message or type
 * @param {Error|string} error - Error object or message
 * @returns {string} Error category
 */
export function categorizeError(error) {
  if (!error) return ERROR_CATEGORIES.UNKNOWN;
  
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  // Network errors
  if (errorMessage.includes('fetch') || 
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout')) {
    return ERROR_CATEGORIES.NETWORK;
  }
  
  // API errors
  if (errorMessage.includes('API') ||
      errorMessage.includes('401') ||
      errorMessage.includes('403') ||
      errorMessage.includes('429') ||
      errorMessage.includes('500')) {
    return ERROR_CATEGORIES.API;
  }
  
  // Validation errors
  if (errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('required') ||
      errorMessage.includes('format')) {
    return ERROR_CATEGORIES.VALIDATION;
  }
  
  // Storage errors
  if (errorMessage.includes('storage') ||
      errorMessage.includes('AsyncStorage') ||
      errorMessage.includes('database')) {
    return ERROR_CATEGORIES.STORAGE;
  }
  
  // Video errors
  if (errorMessage.includes('video') ||
      errorMessage.includes('media') ||
      errorMessage.includes('codec') ||
      errorMessage.includes('format')) {
    return ERROR_CATEGORIES.VIDEO;
  }
  
  return ERROR_CATEGORIES.UNKNOWN;
}

/**
 * Determine error severity based on impact
 * @param {Error|string} error - Error object or message
 * @returns {string} Error severity
 */
export function getErrorSeverity(error) {
  if (!error) return ERROR_SEVERITY.LOW;
  
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  // Critical errors that prevent app usage
  if (errorMessage.includes('authentication') ||
      errorMessage.includes('permission denied') ||
      errorMessage.includes('security') ||
      errorMessage.includes('critical')) {
    return ERROR_SEVERITY.CRITICAL;
  }
  
  // High severity errors
  if (errorMessage.includes('corruption') ||
      errorMessage.includes('data loss') ||
      errorMessage.includes('server error') ||
      errorMessage.includes('500')) {
    return ERROR_SEVERITY.HIGH;
  }
  
  // Medium severity errors
  if (errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('validation') ||
      errorMessage.includes('not found')) {
    return ERROR_SEVERITY.MEDIUM;
  }
  
  return ERROR_SEVERITY.LOW;
}

/**
 * Track error occurrence
 * @param {string} category - Error category
 * @param {string} severity - Error severity
 * @param {Error|string} error - Error object or message
 * @param {Object} context - Additional context (screen, action, etc.)
 */
export function trackError(category, severity, error, context = {}) {
  const errorData = {
    timestamp: new Date().toISOString(),
    category,
    severity,
    message: typeof error === 'string' ? error : error?.message || 'Unknown error',
    stack: error?.stack,
    context: {
      screen: context.screen || 'unknown',
      action: context.action || 'unknown',
      userId: context.userId || 'anonymous',
      sessionId: context.sessionId || 'unknown',
      ...context,
    },
  };
  
  // Log the error
  AppLogger.error('ERROR_MONITOR', 'Error tracked', errorData);
  
  // In development, also show alert for critical errors
  if (__DEV__ && severity === ERROR_SEVERITY.CRITICAL) {
    alert(`Critical Error: ${errorData.message}`);
  }
  
  // Store error for analytics (in production)
  if (!__DEV__) {
    storeErrorForAnalytics(errorData);
  }
}

/**
 * Store error for analytics
 * @param {Object} errorData - Error data to store
 */
function storeErrorForAnalytics(errorData) {
  try {
    // Store in local storage for debugging
    const errors = JSON.parse(localStorage.getItem('error_log') || '[]');
    errors.push(errorData);
    
    // Keep only last 100 errors
    if (errors.length > 100) {
      errors.splice(0, errors.length - 100);
    }
    
    localStorage.setItem('error_log', JSON.stringify(errors));
    
    // TODO: Send to analytics service
    // await sendToAnalyticsService(errorData);
  } catch (e) {
    AppLogger.error('ERROR_MONITOR', 'Failed to store error for analytics', e);
  }
}

/**
 * Get error statistics
 * @returns {Object} Error statistics
 */
export function getErrorStatistics() {
  try {
    const errors = JSON.parse(localStorage.getItem('error_log') || '[]');
    
    const stats = {
      total: errors.length,
      byCategory: {},
      bySeverity: {},
      recent: errors.slice(-10), // Last 10 errors
    };
    
    // Count by category
    errors.forEach(error => {
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });
    
    return stats;
  } catch (e) {
    AppLogger.error('ERROR_MONITOR', 'Failed to get error statistics', e);
    return {
      total: 0,
      byCategory: {},
      bySeverity: {},
      recent: [],
    };
  }
}

/**
 * Clear error log
 */
export function clearErrorLog() {
  try {
    localStorage.removeItem('error_log');
    AppLogger.info('ERROR_MONITOR', 'Error log cleared');
  } catch (e) {
    AppLogger.error('ERROR_MONITOR', 'Failed to clear error log', e);
  }
}

/**
 * Create error report
 * @returns {string} Formatted error report
 */
export function createErrorReport() {
  const stats = getErrorStatistics();
  
  const report = `
Arabic Video Translator - Error Report
Generated: ${new Date().toISOString()}

Total Errors: ${stats.total}

Errors by Category:
${Object.entries(stats.byCategory)
  .map(([category, count]) => `  ${category}: ${count}`)
  .join('\n')}

Errors by Severity:
${Object.entries(stats.bySeverity)
  .map(([severity, count]) => `  ${severity}: ${count}`)
  .join('\n')}

Recent Errors:
${stats.recent
  .map((error, index) => `${index + 1}. [${error.severity.toUpperCase()}] ${error.category}: ${error.message}`)
  .join('\n')}
  `.trim();
  
  return report;
}
