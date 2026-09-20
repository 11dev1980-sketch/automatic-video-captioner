/**
 * Haptic Feedback Utility
 * Provides haptic feedback for iOS devices
 */

import { Platform } from 'react-native';

// Dynamically import haptics only on native platforms
let Haptics = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
        Haptics = require('expo-haptics');
    } catch (e) {
        console.log('Haptics not available');
    }
}

/**
 * Light haptic feedback for button presses
 */
export const lightHaptic = () => {
    if (Haptics && Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};

/**
 * Medium haptic feedback for important actions
 */
export const mediumHaptic = () => {
    if (Haptics && Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
};

/**
 * Heavy haptic feedback for critical actions
 */
export const heavyHaptic = () => {
    if (Haptics && Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
};

/**
 * Success haptic feedback
 */
export const successHaptic = () => {
    if (Haptics && Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
};

/**
 * Warning haptic feedback
 */
export const warningHaptic = () => {
    if (Haptics && Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
};

/**
 * Error haptic feedback
 */
export const errorHaptic = () => {
    if (Haptics && Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
};

/**
 * Selection haptic feedback for toggles/switches
 */
export const selectionHaptic = () => {
    if (Haptics && Platform.OS === 'ios') {
        Haptics.selectionAsync();
    }
};
