/**
 * AI Provider Service
 * Manages multiple AI providers and configuration
 */

import aiConfig from '../config/aiConfig.json';

/**
 * Get current AI configuration
 * @returns {Object} Current AI configuration
 */
export function getAIConfig() {
  return aiConfig;
}

/**
 * Get active AI provider
 * @returns {Object} Active provider configuration
 */
export function getActiveProvider() {
  const { providers, settings } = aiConfig;
  const activeProvider = providers[settings.activeProvider];
  
  if (!activeProvider || !activeProvider.enabled) {
    // Try fallback provider
    if (settings.allowFallback && providers[settings.fallbackProvider]?.enabled) {
      return providers[settings.fallbackProvider];
    }
    throw new Error('No active AI provider available');
  }
  
  return activeProvider;
}

/**
 * Check if DUB5 AI is enabled
 * @returns {boolean} True if DUB5 AI is enabled
 */
export function isDUB5Enabled() {
  return aiConfig.providers.dub5.enabled;
}

/**
 * Check if Gemini is enabled
 * @returns {boolean} True if Gemini is enabled
 */
export function isGeminiEnabled() {
  return aiConfig.providers.gemini.enabled;
}

/**
 * Toggle DUB5 AI provider
 * @param {boolean} enabled - Enable or disable DUB5
 */
export function toggleDUB5(enabled) {
  aiConfig.providers.dub5.enabled = enabled;
  
  // Update active provider if needed
  if (enabled && !aiConfig.providers.gemini.enabled) {
    aiConfig.settings.activeProvider = 'dub5';
  } else if (!enabled && aiConfig.settings.activeProvider === 'dub5') {
    aiConfig.settings.activeProvider = aiConfig.providers.gemini.enabled ? 'gemini' : 'dub5';
  }
  
  return aiConfig;
}

/**
 * Toggle Gemini provider
 * @param {boolean} enabled - Enable or disable Gemini
 */
export function toggleGemini(enabled) {
  aiConfig.providers.gemini.enabled = enabled;
  
  // Update active provider if needed
  if (enabled && !aiConfig.providers.dub5.enabled) {
    aiConfig.settings.activeProvider = 'gemini';
  } else if (!enabled && aiConfig.settings.activeProvider === 'gemini') {
    aiConfig.settings.activeProvider = 'dub5';
  }
  
  return aiConfig;
}

/**
 * Set active provider
 * @param {string} providerName - Provider name ('dub5' or 'gemini')
 */
export function setActiveProvider(providerName) {
  if (!aiConfig.providers[providerName]) {
    throw new Error(`Unknown provider: ${providerName}`);
  }
  
  if (!aiConfig.providers[providerName].enabled) {
    throw new Error(`Provider ${providerName} is not enabled`);
  }
  
  aiConfig.settings.activeProvider = providerName;
  return aiConfig;
}

/**
 * Get provider for specific task
 * @param {string} task - Task type ('transcription', 'translation', 'duaExtraction')
 * @returns {Object} Provider configuration for the task
 */
export function getProviderForTask(task) {
  const activeProvider = getActiveProvider();
  const prompt = aiConfig.prompts[task];
  
  return {
    ...activeProvider,
    prompt,
    task
  };
}

/**
 * Save configuration changes
 * Note: In a real app, this would persist to storage
 */
export function saveConfig() {
  // In development, just log the changes
  console.log('AI Config updated:', JSON.stringify(aiConfig, null, 2));
  
  // In production, this would save to AsyncStorage or server
  return Promise.resolve(aiConfig);
}
