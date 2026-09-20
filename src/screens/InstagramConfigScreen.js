/**
 * Instagram Configuration Screen
 * Allows user to configure Instagram API credentials for automated posting
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';

const INSTAGRAM_CONFIG_KEY = '@instagram_config';

export function InstagramConfigScreen({ navigation }) {
  const [accessToken, setAccessToken] = useState('');
  const [igUserId, setIgUserId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await AsyncStorage.getItem(INSTAGRAM_CONFIG_KEY);
      if (config) {
        const parsed = JSON.parse(config);
        setAccessToken(parsed.accessToken || '');
        setIgUserId(parsed.igUserId || '');
        setSaved(true);
      }
    } catch (error) {
      console.error('Error loading Instagram config:', error);
    }
  };

  const saveConfig = async () => {
    if (!accessToken || !igUserId) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    try {
      const config = { accessToken, igUserId };
      await AsyncStorage.setItem(INSTAGRAM_CONFIG_KEY, JSON.stringify(config));
      setSaved(true);
      Alert.alert('Succes', 'Instagram configuratie opgeslagen');
    } catch (error) {
      Alert.alert('Fout', 'Kon configuratie niet opslaan');
    }
  };

  const clearConfig = async () => {
    Alert.alert(
      'Configuratie Wissen',
      'Weet je zeker dat je je Instagram inloggegevens wilt wissen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Wissen',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(INSTAGRAM_CONFIG_KEY);
              setAccessToken('');
              setIgUserId('');
              setSaved(false);
              Alert.alert('Succes', 'Configuratie gewist');
            } catch (error) {
              Alert.alert('Fout', 'Kon configuratie niet wissen');
            }
          }
        }
      ]
    );
  };

  const openSetupGuide = () => {
    Linking.openURL('https://developers.facebook.com/docs/instagram-platform/content-publishing/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="logo-instagram" size={48} color={colors.primary} />
          <Text style={styles.title}>Instagram Automatisering</Text>
          <Text style={styles.subtitle}>
            Configureer je Instagram account om verwerkte video's automatisch te plaatsen
          </Text>
        </View>

        {saved && (
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.statusText}>Configuratie opgeslagen</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Installatie Instructies</Text>
          <TouchableOpacity style={styles.guideButton} onPress={openSetupGuide}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.guideButtonText}>Bekijk Installatie Gids</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Inloggegevens</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Access Token</Text>
            <TextInput
              style={styles.input}
              value={accessToken}
              onChangeText={setAccessToken}
              placeholder="Voer je Instagram access token in"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              Genereer via Graph API Explorer met instagram_content_publish permissie
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram Gebruikers ID</Text>
            <TextInput
              style={styles.input}
              value={igUserId}
              onChangeText={setIgUserId}
              placeholder="Voer je Instagram gebruikers ID in"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              Vind in Graph API Explorer met me?fields=id,username
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
            <Ionicons name="save-outline" size={20} color={colors.white} />
            <Text style={styles.saveButtonText}>Configuratie Opslaan</Text>
          </TouchableOpacity>

          {saved && (
            <TouchableOpacity style={styles.clearButton} onPress={clearConfig}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={styles.clearButtonText}>Configuratie Wissen</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.accent} />
          <Text style={styles.infoText}>
            Je inloggegevens worden lokaal op je apparaat opgeslagen. We sturen ze nooit naar externe servers.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: layout.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: layout.spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginTop: layout.spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: layout.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    padding: layout.spacing.md,
    borderRadius: layout.radius.md,
    marginBottom: layout.spacing.lg,
  },
  statusText: {
    ...typography.body,
    color: colors.success,
    marginLeft: layout.spacing.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: layout.spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: layout.spacing.md,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    padding: layout.spacing.md,
    borderRadius: layout.radius.md,
  },
  guideButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: layout.spacing.sm,
    fontWeight: '600',
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
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    color: colors.text,
    ...typography.body,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: layout.spacing.xs,
  },
  buttonContainer: {
    marginBottom: layout.spacing.xl,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: layout.spacing.md,
    borderRadius: layout.radius.md,
    marginBottom: layout.spacing.md,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    marginLeft: layout.spacing.sm,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '15',
    padding: layout.spacing.md,
    borderRadius: layout.radius.md,
  },
  clearButtonText: {
    ...typography.body,
    color: colors.error,
    marginLeft: layout.spacing.sm,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.accent + '15',
    padding: layout.spacing.md,
    borderRadius: layout.radius.md,
    alignItems: 'flex-start',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: layout.spacing.sm,
    flex: 1,
  },
});
