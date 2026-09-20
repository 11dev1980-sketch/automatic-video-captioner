/**
 * Settings Card Component - Liquid Glass Effect
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';

export function SettingsCard({ children, style }) {
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.xl,
        padding: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        marginBottom: layout.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
});
