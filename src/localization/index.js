/**
 * Localization Module
 * Exports Dutch translations and utility functions
 */

export { strings } from './nl';

/**
 * Format a string with placeholders
 * @param {string} template - Template string with {0}, {1}, etc. placeholders
 * @param {...any} values - Values to replace placeholders
 * @returns {string} Formatted string
 * 
 * @example
 * formatString("Hoi {0}!", "Mohammed") // "Hoi Mohammed!"
 * formatString("{0} video's", 5) // "5 video's"
 */
export function formatString(template, ...values) {
  return template.replace(/{(\d+)}/g, (match, index) => {
    const value = values[parseInt(index, 10)];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get plural or singular string based on count
 * @param {number} count - The count to check
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form
 * @returns {string} Appropriate form based on count
 * 
 * @example
 * pluralize(1, "video", "video's") // "video"
 * pluralize(5, "video", "video's") // "video's"
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

/**
 * Format a count with appropriate plural form
 * @param {number} count - The count
 * @param {string} singular - Singular form template with {0} placeholder
 * @param {string} plural - Plural form template with {0} placeholder
 * @returns {string} Formatted string with count
 * 
 * @example
 * formatCount(1, "{0} video", "{0} video's") // "1 video"
 * formatCount(5, "{0} video", "{0} video's") // "5 video's"
 */
export function formatCount(count, singular, plural) {
  const template = count === 1 ? singular : plural;
  return formatString(template, count);
}
