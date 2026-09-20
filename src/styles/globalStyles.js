/**
 * Global Styles - Liquid Glass Design System
 * Shared styles used across the application
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { layout } from './layout';
import { typography } from './typography';

export const globalStyles = StyleSheet.create({
    // Container Styles
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: layout.screenPadding.horizontal,
        paddingVertical: layout.screenPadding.vertical,
        paddingBottom: 120, // Extra bottom padding to prevent dock overlay
    },
    scrollableContent: {
        paddingHorizontal: layout.screenPadding.horizontal,
        paddingVertical: layout.screenPadding.vertical,
        paddingBottom: 120, // Extra bottom padding to prevent dock overlay
        flexGrow: 1,
    },

    // Card Styles - Glass Effect
    card: {
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.xl,
        padding: layout.cardPadding.vertical,
        marginBottom: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        elevation: 4,
    },
    cardElevated: {
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.xl,
        padding: layout.cardPadding.vertical,
        marginBottom: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },

    // Text Styles
    title: {
        ...typography.h2,
        marginBottom: layout.spacing.md,
        fontWeight: '700',
    },
    subtitle: {
        ...typography.h4,
        marginBottom: layout.spacing.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    bodyText: {
        ...typography.body,
        marginBottom: layout.spacing.sm,
    },
    arabicText: {
        ...typography.arabic,
        marginBottom: layout.spacing.md,
    },

    // Button Styles
    button: {
        height: layout.buttonHeight.medium,
        borderRadius: layout.radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.lg,
        backgroundColor: colors.primary,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonAccent: {
        backgroundColor: colors.accent,
    },
    buttonSecondary: {
        backgroundColor: colors.glassLight,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    buttonText: {
        ...typography.button,
        fontWeight: '600',
    },
    buttonTextAccent: {
        ...typography.button,
        color: colors.background,
    },

    // Input Styles - Glass Effect
    input: {
        height: layout.buttonHeight.medium,
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.lg,
        paddingHorizontal: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        color: colors.text,
        ...typography.body,
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: layout.spacing.md,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Error - Glass Effect
    errorContainer: {
        backgroundColor: colors.error + '15',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.error + '40',
        marginVertical: layout.spacing.md,
    },
    errorText: {
        color: colors.error,
        ...typography.bodySmall,
        fontWeight: '500',
    },

    // Success - Glass Effect
    successContainer: {
        backgroundColor: colors.success + '15',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.success + '40',
        marginVertical: layout.spacing.md,
    },
    successText: {
        color: colors.success,
        ...typography.bodySmall,
        fontWeight: '500',
    },
});
