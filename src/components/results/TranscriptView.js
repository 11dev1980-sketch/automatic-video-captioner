/**
 * Transcript View Component - Liquid Glass Design
 * Displays Arabic transcript with RTL support
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function TranscriptView({ text, onCopy }) {
    if (!text) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>Geen transcript beschikbaar</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {onCopy && (
                <TouchableOpacity
                    onPress={() => onCopy(text)}
                    style={styles.copyButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="copy-outline" size={18} color={colors.primary} />
                    <Text style={styles.copyButtonText}>Kopiëren</Text>
                </TouchableOpacity>
            )}
            <ScrollView style={styles.scrollContent}>
                <Text style={styles.arabicText}>{text}</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    copyButton: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        alignItems: 'center',
        padding: layout.spacing.sm,
        marginBottom: layout.spacing.sm,
        backgroundColor: colors.primary + '15',
        borderRadius: layout.radius.md,
        paddingHorizontal: layout.spacing.md,
    },
    copyButtonText: {
        ...typography.bodySmall,
        color: colors.primary,
        marginLeft: layout.spacing.xs,
        fontWeight: '600',
    },
    content: {
        padding: layout.spacing.sm,
    },
    scrollContent: {
        maxHeight: 400,
        padding: layout.spacing.sm,
    },
    arabicText: {
        ...typography.arabic,
        lineHeight: 32,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: layout.spacing.xxl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: layout.spacing.md,
    },
});
