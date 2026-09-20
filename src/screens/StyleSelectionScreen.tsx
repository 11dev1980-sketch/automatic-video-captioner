/**
 * StyleSelectionScreen
 *
 * Third screen: user picks a caption style preset.
 * Navigates to CaptionEditorWorkspace with all choices.
 *
 * Requirements: 2.6
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

let StylePresetSelector: any = null;
try { StylePresetSelector = require('../components/StylePresetSelector').default; } catch {}

interface StyleSelectionScreenProps {
  navigation?: any;
  route?: { params?: { videoUrl?: string; sourceLanguage?: string; targetLanguage?: string } };
}

export default function StyleSelectionScreen({ navigation, route }: StyleSelectionScreenProps) {
  const { videoUrl = '', sourceLanguage, targetLanguage = 'dutch' } = route?.params ?? {};
  const [selectedPreset, setSelectedPreset] = useState('modern');

  const handleStart = () => {
    navigation?.navigate('CaptionEditorWorkspace', {
      videoUrl,
      sourceLanguage,
      targetLanguage,
      title: 'Bijschriften editor',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel="Terug" accessibilityRole="button">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Stijl kiezen</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.hint}>Kies een stijl voor de bijschriften. Je kunt dit later nog aanpassen.</Text>

        {StylePresetSelector ? (
          <StylePresetSelector
            selectedPreset={selectedPreset}
            onPresetSelect={setSelectedPreset}
          />
        ) : (
          <Text style={styles.placeholder}>Stijlkeuze laden...</Text>
        )}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleStart} accessibilityLabel="Bijschriften genereren" accessibilityRole="button">
        <Ionicons name="sparkles-outline" size={18} color={colors.white} />
        <Text style={styles.btnText}>Bijschriften genereren</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { color: colors.text, fontSize: 17, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 24 },
  placeholder: { color: colors.textTertiary, textAlign: 'center', marginTop: 40 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, margin: 16, borderRadius: 12, paddingVertical: 14 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
