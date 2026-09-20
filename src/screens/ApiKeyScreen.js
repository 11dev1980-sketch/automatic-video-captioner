import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '../styles';

export default function ApiKeyScreen({ navigation }) {
  const [supadataKey, setSupadataKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingKeys();
  }, []);

  const loadExistingKeys = async () => {
    try {
      const savedSupadataKey = await AsyncStorage.getItem('SUPADATA_API_KEY');
      const savedGeminiKey = await AsyncStorage.getItem('GEMINI_API_KEY');
      if (savedSupadataKey) setSupadataKey(savedSupadataKey);
      if (savedGeminiKey) setGeminiKey(savedGeminiKey);
    } catch (error) {
      console.error('Failed to load keys:', error);
    }
  };

  const handleSave = async () => {
    Alert.alert('Info', 'API keys are managed on the server (Vercel). No local key is required.');
    navigation.goBack();
  };

  const handleClear = async () => {
    Alert.alert(
      'Clear Keys',
      'Are you sure you want to clear all saved API keys?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('SUPADATA_API_KEY');
              await AsyncStorage.removeItem('GEMINI_API_KEY');
              setSupadataKey('');
              setGeminiKey('');
              Alert.alert('Cleared', 'API keys have been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear keys');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.header}>
        <Text style={styles.title}>API Keys</Text>
        <Text style={styles.subtitle}>
          API keys are managed on the server (Vercel). No local setup required.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Supadata API Key *</Text>
        <Text style={styles.description}>
          Required for Arabic transcription. Get your key from supadata.ai
        </Text>
        <TextInput
          style={styles.input}
          placeholder="sk-..."
          value={supadataKey}
          onChangeText={setSupadataKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Gemini API Key (Optional)</Text>
        <Text style={styles.description}>
          Used for AI translation and dua extraction. Get your key from ai.google.dev
        </Text>
        <TextInput
          style={styles.input}
          placeholder="AI..."
          value={geminiKey}
          onChangeText={setGeminiKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Save Keys'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={handleClear}
          disabled={loading}
        >
          <Text style={[styles.buttonText, styles.clearButtonText]}>Clear Keys</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔒 Your keys are stored locally</Text>
        <Text style={styles.infoText}>
          API keys are stored securely on your device and are never sent to our servers. They are only used directly with the respective API providers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
    backgroundColor: '#fff',
  },
  title: {
    ...typography.h2,
    color: '#000',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: '#000',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: '#666',
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  button: {
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    ...typography.button,
  },
  clearButtonText: {
    color: '#666',
  },
  infoBox: {
    margin: spacing.xl,
    padding: spacing.lg,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    ...typography.label,
    color: '#0056b3',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: '#0056b3',
    lineHeight: 22,
  },
});
