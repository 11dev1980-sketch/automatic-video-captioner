/**
 * Instagram Post Configuration Component
 * Allows user to configure post details (title, description, hashtags)
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';

export function InstagramPostConfig({ onConfigChange, enabled }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');

  const handleChange = () => {
    onConfigChange({
      title,
      description,
      hashtags,
    });
  };

  if (!enabled) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="logo-instagram" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>Instagram Post Details</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Titel</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            handleChange();
          }}
          placeholder="Post titel"
          placeholderTextColor={colors.textTertiary}
          maxLength={100}
        />
        <Text style={styles.charCount}>{title.length}/100</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Beschrijving</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            handleChange();
          }}
          placeholder="Post beschrijving"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          maxLength={2200}
        />
        <Text style={styles.charCount}>{description.length}/2200</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hashtags</Text>
        <TextInput
          style={styles.input}
          value={hashtags}
          onChangeText={(text) => {
            setHashtags(text);
            handleChange();
          }}
          placeholder="islam, dua, arabisch (gescheiden door komma's)"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
        />
        <Text style={styles.helperText}>
          Scheid meerdere hashtags met komma's
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glassLight,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: layout.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: layout.spacing.lg,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    marginLeft: layout.spacing.sm,
  },
  inputGroup: {
    marginBottom: layout.spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text,
    marginBottom: layout.spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    color: colors.text,
    ...typography.body,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: layout.spacing.xs,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: layout.spacing.xs,
  },
});
