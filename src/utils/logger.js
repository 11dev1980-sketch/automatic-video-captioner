/**
 * Logger Utility
 * Centralized logging system for debugging and monitoring
 */

import { Platform } from 'react-native';

// Log levels
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Current log level (can be overridden by environment)
let currentLogLevel = LOG_LEVELS.INFO;

// Set log level from environment
if (__DEV__) {
  currentLogLevel = LOG_LEVELS.DEBUG;
} else {
  // In production, only show warnings and errors
  currentLogLevel = LOG_LEVELS.WARN;
}

/**
 * Get current timestamp
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} tag - Log tag/category
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 * @returns {string} Formatted log message
 */
const formatMessage = (level, tag, message, data = null) => {
  const timestamp = getTimestamp();
  const platform = Platform.OS;
  
  let formattedMessage = `[${timestamp}] [${level}] [${tag}] [${platform}] ${message}`;
  
  if (data) {
    formattedMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
  }
  
  return formattedMessage;
};

/**
 * Core logging function
 * @param {number} level - Log level
 * @param {string} tag - Log tag
 * @param {string} message - Log message
 * @param {any} data - Additional data
 */
const log = (level, tag, message, data = null) => {
  if (level <= currentLogLevel) {
    const formattedMessage = formatMessage(level, tag, message, data);
    
    // Console logging
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage);
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedMessage);
        break;
      case LOG_LEVELS.DEBUG:
        console.log(formattedMessage);
        break;
    }
    
    // In development, also log to remote service if needed
    if (__DEV__ && level <= LOG_LEVELS.WARN) {
      // TODO: Implement remote logging service
      // sendToRemoteLoggingService(level, tag, message, data);
    }
  }
};

/**
 * Public logging API
 */
export const Logger = {
  /**
   * Log error message
   * @param {string} tag - Log tag
   * @param {string} message - Error message
   * @param {any} data - Additional error data
   */
  error: (tag, message, data = null) => {
    log(LOG_LEVELS.ERROR, tag, message, data);
  },

  /**
   * Log warning message
   * @param {string} tag - Log tag
   * @param {string} message - Warning message
   * @param {any} data - Additional warning data
   */
  warn: (tag, message, data = null) => {
    log(LOG_LEVELS.WARN, tag, message, data);
  },

  /**
   * Log info message
   * @param {string} tag - Log tag
   * @param {string} message - Info message
   * @param {any} data - Additional info data
   */
  info: (tag, message, data = null) => {
    log(LOG_LEVELS.INFO, tag, message, data);
  },

  /**
   * Log debug message
   * @param {string} tag - Log tag
   * @param {string} message - Debug message
   * @param {any} data - Additional debug data
   */
  debug: (tag, message, data = null) => {
    log(LOG_LEVELS.DEBUG, tag, message, data);
  },

  /**
   * Set log level
   * @param {number} level - Log level from LOG_LEVELS
   */
  setLogLevel: (level) => {
    currentLogLevel = level;
  },

  /**
   * Get current log level
   * @returns {number} Current log level
   */
  getLogLevel: () => {
    return currentLogLevel;
  },
};

/**
 * Convenience functions for common tags
 */
export const AppLogger = {
  error: (message, data) => Logger.error('APP', message, data),
  warn: (message, data) => Logger.warn('APP', message, data),
  info: (message, data) => Logger.info('APP', message, data),
  debug: (message, data) => Logger.debug('APP', message, data),
};

export const ApiLogger = {
  error: (message, data) => Logger.error('API', message, data),
  warn: (message, data) => Logger.warn('API', message, data),
  info: (message, data) => Logger.info('API', message, data),
  debug: (message, data) => Logger.debug('API', message, data),
};

export const StorageLogger = {
  error: (message, data) => Logger.error('STORAGE', message, data),
  warn: (message, data) => Logger.warn('STORAGE', message, data),
  info: (message, data) => Logger.info('STORAGE', message, data),
  debug: (message, data) => Logger.debug('STORAGE', message, data),
};

export const VideoLogger = {
  error: (message, data) => Logger.error('VIDEO', message, data),
  warn: (message, data) => Logger.warn('VIDEO', message, data),
  info: (message, data) => Logger.info('VIDEO', message, data),
  debug: (message, data) => Logger.debug('VIDEO', message, data),
};

export const UILogger = {
  error: (message, data) => Logger.error('UI', message, data),
  warn: (message, data) => Logger.warn('UI', message, data),
  info: (message, data) => Logger.info('UI', message, data),
  debug: (message, data) => Logger.debug('UI', message, data),
};
