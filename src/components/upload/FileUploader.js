/**
 * File Uploader Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../common/Button';
import { DragDropArea } from './DragDropArea';
import { FilePreview } from './FilePreview';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function FileUploader({ onSelectFile, selectedFile, loading, error }) {
  return (
    <View style={styles.container}>
      {!selectedFile ? (
        <DragDropArea onSelectFile={onSelectFile} loading={loading} />
      ) : (
        <FilePreview file={selectedFile} onRemove={() => onSelectFile(null)} />
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    marginTop: layout.spacing.md,
    padding: layout.spacing.md,
    backgroundColor: colors.error + '20',
    borderRadius: layout.radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
  },
});

