/**
 * Feature Toggle Component - Liquid Glass Design
 */

import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function FeatureToggle({
    label,
    description,
    value,
    onValueChange
}) {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                {description && (
                    <Text style={styles.description}>{description}</Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{
                    false: colors.border,
                    true: colors.primary + '80'
                }}
                thumbColor={value ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    textContainer: {
        flex: 1,
        marginRight: layout.spacing.md,
    },
    label: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    description: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});
