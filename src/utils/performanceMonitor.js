/**
 * Performance Monitoring Utility
 * Tracks app performance metrics and bottlenecks
 */

import { Platform } from 'react-native';
import { AppLogger } from './logger';

// Performance metrics storage
const PERFORMANCE_KEYS = {
  APP_STARTUP: '@perf_app_startup',
  SCREEN_RENDER: '@perf_screen_render',
  API_CALL: '@perf_api_call',
  VIDEO_PROCESSING: '@perf_video_processing',
  MEMORY_USAGE: '@perf_memory_usage',
  BUNDLE_SIZE: '@perf_bundle_size',
};

/**
 * Measure app startup time
 */
export function measureAppStartup() {
  const startTime = Date.now();
  
  // Record startup start
  recordMetric('app_startup_start', {
    timestamp: startTime,
    platform: Platform.OS,
  });
  
  // Return function to call when app is ready
  return () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    recordMetric('app_startup_complete', {
      duration,
      timestamp: endTime,
      platform: Platform.OS,
    });
    
    AppLogger.info('PERFORMANCE', `App startup completed in ${duration}ms`);
  };
}

/**
 * Measure screen render time
 * @param {string} screenName - Name of the screen
 * @param {Function} renderFunction - Function to measure
 */
export function measureScreenRender(screenName, renderFunction) {
  const startTime = performance.now();
  
  try {
    const result = renderFunction();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric('screen_render', {
      screen: screenName,
      duration,
      timestamp: Date.now(),
    });
    
    AppLogger.debug('PERFORMANCE', `Screen ${screenName} rendered in ${duration}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric('screen_render_error', {
      screen: screenName,
      duration,
      error: error.message,
      timestamp: Date.now(),
    });
    
    AppLogger.error('PERFORMANCE', `Screen ${screenName} render failed after ${duration}ms`, error);
    throw error;
  }
}

/**
 * Measure API call performance
 * @param {string} apiName - Name of the API endpoint
 * @param {Function} apiCall - API function to call
 */
export async function measureApiCall(apiName, apiCall) {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric('api_call', {
      api: apiName,
      duration,
      success: true,
      timestamp: Date.now(),
    });
    
    AppLogger.debug('PERFORMANCE', `API ${apiName} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric('api_call', {
      api: apiName,
      duration,
      success: false,
      error: error.message,
      timestamp: Date.now(),
    });
    
    AppLogger.error('PERFORMANCE', `API ${apiName} failed after ${duration}ms`, error);
    throw error;
  }
}

/**
 * Measure video processing performance
 * @param {Object} videoInfo - Video information
 * @param {Function} processingFunction - Processing function
 */
export async function measureVideoProcessing(videoInfo, processingFunction) {
  const startTime = performance.now();
  const videoSize = videoInfo.size || 0;
  
  try {
    const result = await processingFunction();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric('video_processing', {
      videoSize,
      duration,
      success: true,
      throughput: videoSize > 0 ? (videoSize / 1024 / 1024) / (duration / 1000) : 0, // MB/s
      timestamp: Date.now(),
    });
    
    AppLogger.info('PERFORMANCE', `Video processing completed in ${duration}ms (${videoSize} bytes)`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric('video_processing', {
      videoSize,
      duration,
      success: false,
      error: error.message,
      timestamp: Date.now(),
    });
    
    AppLogger.error('PERFORMANCE', `Video processing failed after ${duration}ms`, error);
    throw error;
  }
}

/**
 * Record performance metric
 * @param {string} metricName - Name of the metric
 * @param {Object} data - Metric data
 */
function recordMetric(metricName, data) {
  try {
    const existingMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
    
    if (!existingMetrics[metricName]) {
      existingMetrics[metricName] = [];
    }
    
    existingMetrics[metricName].push(data);
    
    // Keep only last 100 metrics per type
    if (existingMetrics[metricName].length > 100) {
      existingMetrics[metricName] = existingMetrics[metricName].slice(-100);
    }
    
    localStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
  } catch (error) {
    AppLogger.error('PERFORMANCE', 'Failed to record metric', error);
  }
}

/**
 * Get performance statistics
 * @param {string} metricName - Name of the metric
 * @returns {Object} Performance statistics
 */
export function getPerformanceStats(metricName) {
  try {
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
    const metricData = metrics[metricName] || [];
    
    if (metricData.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        recent: [],
      };
    }
    
    const values = metricData.map(m => m.duration || 0);
    const recent = metricData.slice(-10);
    
    return {
      count: metricData.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      recent: recent.map(m => ({
        timestamp: m.timestamp,
        duration: m.duration,
        success: m.success,
      })),
    };
  } catch (error) {
    AppLogger.error('PERFORMANCE', 'Failed to get performance stats', error);
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      recent: [],
    };
  }
}

/**
 * Get memory usage (if available)
 * @returns {Object} Memory usage information
 */
export function getMemoryUsage() {
  try {
    if (Platform.OS === 'web' && performance.memory) {
      const memory = performance.memory;
      
      recordMetric('memory_usage', {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      });
      
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    
    return {
      used: 0,
      total: 0,
      limit: 0,
      percentage: 0,
    };
  } catch (error) {
    AppLogger.error('PERFORMANCE', 'Failed to get memory usage', error);
    return {
      used: 0,
      total: 0,
      limit: 0,
      percentage: 0,
    };
  }
}

/**
 * Check for performance issues
 * @returns {Array} Array of performance issues
 */
export function checkPerformanceIssues() {
  const issues = [];
  
  // Check screen render times
  const screenRenderStats = getPerformanceStats('screen_render');
  if (screenRenderStats.average > 1000) { // > 1s render time
    issues.push({
      type: 'slow_screen_render',
      severity: 'medium',
      message: `Average screen render time is ${screenRenderStats.average.toFixed(2)}ms`,
      recommendation: 'Optimize screen components and reduce complexity',
    });
  }
  
  // Check API call times
  const apiCallStats = getPerformanceStats('api_call');
  if (apiCallStats.average > 5000) { // > 5s API call time
    issues.push({
      type: 'slow_api_calls',
      severity: 'high',
      message: `Average API call time is ${apiCallStats.average.toFixed(2)}ms`,
      recommendation: 'Check API performance and implement caching',
    });
  }
  
  // Check memory usage
  const memoryUsage = getMemoryUsage();
  if (memoryUsage.percentage > 80) {
    issues.push({
      type: 'high_memory_usage',
      severity: 'high',
      message: `Memory usage is ${memoryUsage.percentage.toFixed(1)}%`,
      recommendation: 'Optimize memory usage and implement cleanup',
    });
  }
  
  // Check video processing times
  const videoProcessingStats = getPerformanceStats('video_processing');
  if (videoProcessingStats.average > 30000) { // > 30s processing time
    issues.push({
      type: 'slow_video_processing',
      severity: 'medium',
      message: `Average video processing time is ${(videoProcessingStats.average / 1000).toFixed(1)}s`,
      recommendation: 'Optimize video processing algorithms',
    });
  }
  
  return issues;
}

/**
 * Generate performance report
 * @returns {string} Formatted performance report
 */
export function generatePerformanceReport() {
  const issues = checkPerformanceIssues();
  const memoryUsage = getMemoryUsage();
  const screenStats = getPerformanceStats('screen_render');
  const apiStats = getPerformanceStats('api_call');
  const videoStats = getPerformanceStats('video_processing');
  
  const report = `
Arabic Video Translator - Performance Report
Generated: ${new Date().toISOString()}

Memory Usage:
  Used: ${(memoryUsage.used / 1024 / 1024).toFixed(2)} MB
  Total: ${(memoryUsage.total / 1024 / 1024).toFixed(2)} MB
  Percentage: ${memoryUsage.percentage.toFixed(1)}%

Screen Performance:
  Average Render Time: ${screenStats.average.toFixed(2)}ms
  Min Render Time: ${screenStats.min}ms
  Max Render Time: ${screenStats.max}ms
  Total Renders: ${screenStats.count}

API Performance:
  Average Call Time: ${apiStats.average.toFixed(2)}ms
  Min Call Time: ${apiStats.min}ms
  Max Call Time: ${apiStats.max}ms
  Total Calls: ${apiStats.count}
  Success Rate: ${((apiStats.recent.filter(r => r.success).length / apiStats.recent.length) * 100).toFixed(1)}%

Video Processing Performance:
  Average Processing Time: ${(videoStats.average / 1000).toFixed(1)}s
  Min Processing Time: ${(videoStats.min / 1000).toFixed(1)}s
  Max Processing Time: ${(videoStats.max / 1000).toFixed(1)}s
  Total Processed: ${videoStats.count}
  Success Rate: ${((videoStats.recent.filter(r => r.success).length / videoStats.recent.length) * 100).toFixed(1)}%

Performance Issues:
${issues.length === 0 ? 'No performance issues detected' : 
  issues.map((issue, index) => 
    `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}\n   ${issue.message}\n   Recommendation: ${issue.recommendation}`
  ).join('\n\n')
}

Recent Slow Operations:
${getRecentSlowOperations()}
  `.trim();
  
  return report;
}

/**
 * Get recent slow operations
 * @returns {string} Formatted slow operations
 */
function getRecentSlowOperations() {
  const allMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
  const slowOperations = [];
  
  // Collect slow operations from all metric types
  Object.entries(allMetrics).forEach(([metricName, metrics]) => {
    metrics.forEach(metric => {
      if (metric.duration > 1000) { // > 1s
        slowOperations.push({
          type: metricName,
          duration: metric.duration,
          timestamp: metric.timestamp,
        });
      }
    });
  });
  
  // Sort by duration (slowest first) and take top 10
  slowOperations.sort((a, b) => b.duration - a.duration);
  
  return slowOperations
    .slice(0, 10)
    .map((op, index) => 
      `${index + 1}. ${op.type}: ${(op.duration / 1000).toFixed(1)}s (${new Date(op.timestamp).toLocaleString()})`
    )
    .join('\n');
}

/**
 * Clear performance metrics
 */
export function clearPerformanceMetrics() {
  try {
    localStorage.removeItem('performance_metrics');
    AppLogger.info('PERFORMANCE', 'Performance metrics cleared');
  } catch (error) {
    AppLogger.error('PERFORMANCE', 'Failed to clear performance metrics', error);
  }
}
