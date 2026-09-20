/**
 * Typography System - Professional Design
 * Supports Arabic (RTL) and Dutch (LTR) text
 * Uses system fonts optimized for readability
 */

export const typography = {
    // Headings - Bold, clear hierarchy
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
        color: '#ffffff',
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        color: '#ffffff',
        letterSpacing: -0.2,
    },
    h4: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        color: '#ffffff',
    },

    // Body Text - Optimized for readability
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        color: '#d1d5db',
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        color: '#d1d5db',
    },
    bodyLarge: {
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 28,
        color: '#d1d5db',
    },

    // Arabic Text (RTL support) - Larger for readability
    arabic: {
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 32,
        color: '#ffffff',
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    arabicLarge: {
        fontSize: 20,
        fontWeight: '400',
        lineHeight: 36,
        color: '#ffffff',
        textAlign: 'right',
        writingDirection: 'rtl',
    },

    // Labels and Captions - Subtle, informative
    label: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        color: '#9ca3af',
        letterSpacing: 0.2,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: '#6b7280',
        letterSpacing: 0.1,
    },

    // Button Text - Bold, clear
    button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        color: '#ffffff',
        letterSpacing: 0.2,
    },
    buttonSmall: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        color: '#ffffff',
        letterSpacing: 0.1,
    },
};
