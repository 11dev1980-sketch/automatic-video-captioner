/**
 * VideoInputScreen
 *
 * First screen: user enters a video URL or selects a local video.
 * Validates the URL and navigates to LanguageSelectionScreen.
 *
 * Requirements: 1.4, 1.5, 2.6
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { validateVideoUrl } from '../utils/inputValidation';
import { colors } from '../styles/colors';

interface VideoInputScreenProps {
  navigation?: any;
}

export default function VideoInputScreen({ navigation }: VideoInputScreenProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleContinue = useCallback(() => {
    const validation = validateVideoUrl(url.trim());
    if (!validation.isValid && !validation.cleanedUrl) {
      setError(validation.error || 'Ongeldige URL');
      return;
    }
    setError('');
    navigation?.navigate('LanguageSelection', {
      videoUrl: validation.cleanedUrl || url.trim(),
    });
  }, [url, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <Ionicons name="link-outline" size={48} color={colors.primary} />
          </View>

          <Text style={styles.title}>Video URL invoeren</Text>
          <Text style={styles.subtitle}>
            Plak een link van Instagram of TikTok om bijschriften te genereren
          </Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={url}
            onChangeText={(t) => { setUrl(t); setError(''); }}
            placeholder="https://www.instagram.com/reel/..."
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleContinue}
            accessibilityLabel="Video URL invoerveld"
          />

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, !url.trim() && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={!url.trim()}
            accessibilityLabel="Doorgaan"
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>Doorgaan</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 24, alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 120 },
  iconContainer: { marginBottom: 24 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  input: {
    width: '100%', backgroundColor: colors.backgroundTertiary, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  inputError: { borderColor: colors.error },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, alignSelf: 'flex-start' },
  errorText: { color: colors.error, fontSize: 12 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14,
    paddingHorizontal: 32, width: '100%', marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
