/**
 * Standardized Page Header Component
 * Ensures consistent header layout across all pages
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function PageHeader({ 
    title, 
    subtitle, 
    actionIcon, 
    actionText, 
    onActionPress,
    style 
}) {
    return (
        <View style={[styles.header, style]}>
            <View style={styles.headerText}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && (
                    <Text style={styles.subtitle}>{subtitle}</Text>
                )}
            </View>
            {actionIcon && onActionPress && (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onActionPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name={actionIcon} size={24} color={colors.primary} />
                    {actionText && (
                        <Text style={styles.actionText}>{actionText}</Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.lg,
        paddingTop: layout.spacing.lg,
        paddingBottom: layout.spacing.lg,
        backgroundColor: colors.background,
        minHeight: 120, // Fixed height for consistent positioning
    },
    headerText: {
        flex: 1,
        minHeight: 60, // Fixed height for text area
        justifyContent: 'center',
    },
    title: {
        ...typography.h2,
        marginBottom: layout.spacing.xs,
        lineHeight: 32,
    },
    subtitle: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        minHeight: 20, // Fixed height for subtitle
        lineHeight: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: layout.spacing.md,
        paddingVertical: layout.spacing.sm,
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionText: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.primary,
        marginLeft: layout.spacing.sm,
    },
});
