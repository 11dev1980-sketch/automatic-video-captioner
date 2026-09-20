/**
 * User Settings Service
 * Manages user preferences and settings stored locally
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    USER_NAME: '@user_name',
    FIRST_LAUNCH: '@first_launch',
    DOCK_MODE: '@dock_mode',
};

/**
 * Save user name
 */
export async function saveUserName(name) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get user name
 */
export async function getUserName() {
    try {
        const name = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
        return name || null;
    } catch (error) {
        return null;
    }
}

/**
 * Check if this is first launch
 */
export async function isFirstLaunch() {
    try {
        const hasLaunched = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
        return hasLaunched === null;
    } catch (error) {
        return false;
    }
}

/**
 * Mark app as launched
 */
export async function markAsLaunched() {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'true');
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Clear all user settings
 */
export async function clearUserSettings() {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.USER_NAME,
            STORAGE_KEYS.FIRST_LAUNCH,
            STORAGE_KEYS.DOCK_MODE,
        ]);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Save dock mode preference
 * @param {string} mode - 'floating' or 'traditional'
 */
export async function saveDockMode(mode) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.DOCK_MODE, mode);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get dock mode preference
 * @returns {Promise<string>} - 'floating' or 'traditional' (default: 'floating')
 */
export async function getDockMode() {
    try {
        const mode = await AsyncStorage.getItem(STORAGE_KEYS.DOCK_MODE);
        return mode || 'floating';
    } catch (error) {
        return 'floating';
    }
}
