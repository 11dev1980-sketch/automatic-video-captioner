/**
 * Dua View Component - Liquid Glass Design
 * Displays extracted duas in 3-line format
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { parseDuaResults } from '../../services/duaService';

export function DuaView({ text, onCopy }) {
    if (!text || text.includes('Geen dua gevonden')) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="star-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>Geen dua's gevonden in deze inhoud</Text>
            </View>
        );
    }

    const duas = parseDuaResults(text);

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
                {duas.map((dua, index) => (
                    <View key={index} style={styles.duaContainer}>
                        <Text style={styles.arabicText}>{dua.arabic}</Text>
                        <Text style={styles.transliterationText}>{dua.transliteration}</Text>
                        <Text style={styles.dutchText}>{dua.dutch}</Text>
                        {index < duas.length - 1 && <View style={styles.divider} />}
                    </View>
                ))}
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
    duaContainer: {
        marginBottom: layout.spacing.lg,
        paddingBottom: layout.spacing.lg,
    },
    arabicText: {
        ...typography.arabicLarge,
        marginBottom: layout.spacing.sm,
        color: colors.text,
    },
    transliterationText: {
        ...typography.body,
        fontStyle: 'italic',
        color: colors.accent,
        marginBottom: layout.spacing.xs,
    },
    dutchText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginTop: layout.spacing.lg,
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
