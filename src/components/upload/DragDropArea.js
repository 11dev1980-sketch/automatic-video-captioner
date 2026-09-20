/**
 * Drag Drop Area Component with Liquid Glass Effect
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function DragDropArea({ onSelectFile, loading }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelectFile}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <LoadingSpinner message="Selecting file..." />
      ) : (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="videocam" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>{strings.upload.selectVideo}</Text>
          <Text style={styles.subtitle}>
            {strings.upload.tapToBrowse}
          </Text>
          <View style={styles.formatsContainer}>
            <Text style={styles.formats}>
              {strings.upload.supportedFormats}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 240,
    backgroundColor: colors.glassLight,
    borderRadius: layout.radius.xl,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: layout.radius.xl,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: layout.spacing.lg,
  },
  title: {
    ...typography.h3,
    marginBottom: layout.spacing.xs,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: layout.spacing.md,
  },
  formatsContainer: {
    marginTop: layout.spacing.md,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.sm,
    backgroundColor: colors.glass,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formats: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
