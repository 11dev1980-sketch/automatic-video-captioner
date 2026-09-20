/**
 * Step Indicator Component - Liquid Glass Design
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function StepIndicator({ steps, currentStep }) {
    return (
        <View style={styles.container}>
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                    <View key={index} style={styles.stepContainer}>
                        <View style={[
                            styles.stepCircle,
                            isActive && styles.stepCircleActive,
                            isCompleted && styles.stepCircleCompleted,
                        ]}>
                            {isCompleted ? (
                                <Ionicons name="checkmark" size={20} color={colors.text} />
                            ) : (
                                <Text style={[
                                    styles.stepNumber,
                                    isActive && styles.stepNumberActive,
                                ]}>
                                    {index + 1}
                                </Text>
                            )}
                        </View>
                        <Text style={[
                            styles.stepLabel,
                            isActive && styles.stepLabelActive,
                            isCompleted && styles.stepLabelCompleted,
                        ]}>
                            {step}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: layout.spacing.lg,
        paddingHorizontal: layout.spacing.md,
    },
    stepContainer: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 44,
        height: 44,
        borderRadius: layout.radius.round,
        backgroundColor: colors.background,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.sm,
    },
    stepCircleActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    stepCircleCompleted: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    stepNumber: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    stepNumberActive: {
        color: colors.text,
    },
    stepLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        fontSize: 11,
    },
    stepLabelActive: {
        color: colors.text,
        fontWeight: '600',
    },
    stepLabelCompleted: {
        color: colors.text,
    },
});
