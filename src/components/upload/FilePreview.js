/**
 * File Preview Component with Liquid Glass Effect
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatFileSize } from '../../services/fileHandler';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function FilePreview({ file, onRemove }) {
  if (!file) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="videocam" size={24} color={colors.primary} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name || 'Selected Video'}
        </Text>
        <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
      </View>
      {onRemove && (
        <TouchableOpacity 
          onPress={onRemove} 
          style={styles.removeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={24} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: layout.radius.md,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: layout.spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: layout.spacing.xs,
  },
  fileSize: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: layout.radius.round,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: layout.spacing.md,
  },
});
