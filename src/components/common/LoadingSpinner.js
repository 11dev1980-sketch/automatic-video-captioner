/**
 * Loading Spinner Component with Liquid Glass Effect
 * Uses only background and primary (pink) colors
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function LoadingSpinner({ message, size = 'large', color = colors.primary }) {
    // Ensure message is a string to prevent text node errors
    const safeMessage = message && typeof message === 'string' ? message : '';
    
    return (
        <View style={styles.container}>
            <View style={styles.spinnerContainer}>
                <ActivityIndicator size={size} color={colors.primary} />
            </View>
            {safeMessage ? <Text style={styles.message}>{safeMessage}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: layout.spacing.xl,
    },
    spinnerContainer: {
        width: 64,
        height: 64,
        borderRadius: layout.radius.xl,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    message: {
        ...typography.body,
        marginTop: layout.spacing.md,
        color: colors.text,
        textAlign: 'center',
        fontWeight: '500',
    },
});

