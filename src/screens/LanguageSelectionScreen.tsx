/**
 * LanguageSelectionScreen
 *
 * Second screen: user selects source and target language.
 * Navigates to StyleSelectionScreen with language choices.
 *
 * Requirements: 1.4, 1.5
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

let LanguageSelector: any = null;
try { LanguageSelector = require('../components/LanguageSelector').default; } catch {}

interface LanguageSelectionScreenProps {
  navigation?: any;
  route?: { params?: { videoUrl?: string } };
}

export default function LanguageSelectionScreen({ navigation, route }: LanguageSelectionScreenProps) {
  const { videoUrl = '' } = route?.params ?? {};
  const [sourceLanguage, setSourceLanguage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('dutch');

  const handleContinue = () => {
    navigation?.navigate('StyleSelection', { videoUrl, sourceLanguage, targetLanguage });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel="Terug" accessibilityRole="button">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Taal kiezen</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.hint}>
          Kies de taal van de video en de gewenste vertaaltaal voor de bijschriften.
        </Text>

        {LanguageSelector ? (
          <LanguageSelector
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSourceLanguageChange={setSourceLanguage}
            onTargetLanguageChange={setTargetLanguage}
          />
        ) : (
          <Text style={styles.placeholder}>LanguageSelector laden...</Text>
        )}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleContinue} accessibilityLabel="Doorgaan" accessibilityRole="button">
        <Text style={styles.btnText}>Doorgaan</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.white} />
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
