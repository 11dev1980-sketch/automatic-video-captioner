/**
 * Status Indicator Component - Liquid Glass Design
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function StatusIndicator({ type = 'info', message, style }) {
    const iconMap = {
        info: 'information-circle',
        success: 'checkmark-circle',
        error: 'close-circle',
        warning: 'warning',
    };

    const containerStyle = [
        styles.container,
        styles[type],
        style,
    ];

    const textStyle = [
        styles.text,
        styles[`${type}Text`],
  ];

  return (
    <View style={containerStyle}>
      <Ionicons 
        name={iconMap[type]} 
        size={20} 
        color={styles[`${type}Text`].color} 
        style={styles.icon}
      />
      <Text style={textStyle}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.spacing.md,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    marginVertical: layout.spacing.sm,
    backgroundColor: colors.glassLight,
  },
  info: {
    borderColor: colors.info + '60',
    backgroundColor: colors.info + '15',
  },
  success: {
    borderColor: colors.success + '60',
    backgroundColor: colors.success + '15',
  },
  error: {
    borderColor: colors.error + '60',
    backgroundColor: colors.error + '15',
  },
  warning: {
    borderColor: colors.warning + '60',
    backgroundColor: colors.warning + '15',
  },
  icon: {
    marginRight: layout.spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    flex: 1,
    fontWeight: '500',
  },
  infoText: {
    color: colors.info,
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.error,
  },
  warningText: {
    color: colors.warning,
  },
});
