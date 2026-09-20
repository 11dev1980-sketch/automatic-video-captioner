/**
 * Progress Bar Component - Liquid Glass Design
 * Uses only background and primary (pink) colors
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function ProgressBar({ progress = 0, showPercentage = true, style }) {
    const percentage = Math.min(100, Math.max(0, progress * 100));

    return (
        <View style={[styles.container, style]}>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${percentage}%` }]} />
            </View>
            {showPercentage && (
                <View style={styles.percentageContainer}>
                    <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    track: {
        height: 10,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: layout.radius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    fill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: layout.radius.md,
    },
    percentageContainer: {
        marginTop: layout.spacing.sm,
        alignItems: 'flex-end',
    },
    percentage: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
    },
});

