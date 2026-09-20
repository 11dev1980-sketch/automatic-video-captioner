/**
 * Custom Button Component with Liquid Glass Effect
 * Includes haptic feedback and animations
 * Updated to use centralized theme system
 */

import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { theme } from '../../styles/theme';
import { lightHaptic } from '../../utils/haptics';

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    ...props
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const buttonStyle = [
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const buttonTextStyle = [
        styles.buttonText,
        variant === 'primary' && styles.buttonTextPrimary,
        variant === 'accent' && styles.buttonTextAccent,
        variant === 'glass' && styles.buttonTextGlass,
        disabled && styles.buttonTextDisabled,
        textStyle,
    ];

    const handlePressIn = () => {
        lightHaptic();
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: false, // Use JS driver for web compatibility
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: false, // Use JS driver for web compatibility
        }).start();
    };

    const handlePress = () => {
        if (onPress && !disabled && !loading) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
        >
            <Animated.View style={[buttonStyle, { transform: [{ scale: scaleAnim }] }]}>
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' ? colors.white : variant === 'accent' ? colors.background : colors.text}
                        size="small"
                    />
                ) : (
                    <Text style={buttonTextStyle}>{title}</Text>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        ...theme.shadows.md,
    },
    primary: {
        backgroundColor: theme.colors.primary,
    },
    accent: {
        backgroundColor: theme.colors.accent,
    },
    secondary: {
        backgroundColor: theme.colors.glassLight,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    glass: {
        backgroundColor: theme.colors.glassLight,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    small: {
        height: 40,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    medium: {
        height: 48,
    },
    large: {
        height: 56,
        paddingHorizontal: theme.spacing.xl,
    },
    disabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: theme.typography.md,
        color: theme.colors.text,
        fontWeight: theme.typography.semibold,
    },
    buttonTextPrimary: {
        color: theme.colors.white,
    },
    buttonTextAccent: {
        color: theme.colors.background,
    },
    buttonTextGlass: {
        color: theme.colors.text,
    },
    buttonTextDisabled: {
        opacity: 0.7,
    },
});
