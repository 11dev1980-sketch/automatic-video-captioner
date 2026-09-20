/**
 * Configure Screen - Liquid Glass Design
 * Step 2: Model selection and feature toggles
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../components/common/PageHeader';
import { FeatureToggle } from '../components/configuration/FeatureToggle';
import { SettingsCard } from '../components/configuration/SettingsCard';
import { Button } from '../components/common/Button';
import { InstagramPostConfig } from '../components/InstagramPostConfig';
import { loadDuaEnabled, saveDuaEnabled } from '../utils/storage';
import { isInstagramConfigured } from '../services/instagramService';
import { strings } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

export function ConfigureScreen({ route, navigation }) {
    const { reelUrl, videoUri, videoName, source } = route.params || {};
    const [instagramEnabled, setInstagramEnabled] = useState(false);
    const [instagramConfigured, setInstagramConfigured] = useState(false);
    const [instagramPostConfig, setInstagramPostConfig] = useState({
        title: '',
        description: '',
        hashtags: '',
    });
    const [targetLanguage, setTargetLanguage] = useState('dutch');

    useEffect(() => {
        const loadPreferences = async () => {
            const configured = await isInstagramConfigured();
            setInstagramConfigured(configured);
        };
        loadPreferences();
    }, []);

    const handleInstagramToggle = async (value) => {
        if (value && !instagramConfigured) {
            // Navigate to Instagram config if not configured
            navigation.navigate('InstagramConfig');
            return;
        }
        setInstagramEnabled(value);
    };

    const handleContinue = () => {
        if (reelUrl || videoUri) {
            navigation.navigate('Processing', {
                reelUrl,
                videoUri,
                videoName,
                source: source || 'upload',
                instagramEnabled,
                instagramPostConfig: instagramEnabled ? instagramPostConfig : null,
                targetLanguage,
            });
        }
    };

    if (!reelUrl && !videoUri) {
        navigation.goBack();
        return null;
    }

    return (
        <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <PageHeader
                    title={strings.configure.title}
                    subtitle={strings.configure.description}
                />
                
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={{ ...styles.content, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                >

                <SettingsCard>
                    <View style={{ paddingVertical: 8 }}>
                        <Text style={{ ...typography.body, marginBottom: 8 }}>Doelvertaling</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Button
                                title="Nederlands"
                                onPress={() => setTargetLanguage('dutch')}
                                variant={targetLanguage === 'dutch' ? 'primary' : 'secondary'}
                                size="small"
                            />
                            <Button
                                title="English"
                                onPress={() => setTargetLanguage('english')}
                                variant={targetLanguage === 'english' ? 'primary' : 'secondary'}
                                size="small"
                            />
                        </View>
                    </View>
                </SettingsCard>

                <SettingsCard>
                    <FeatureToggle
                        label="Plaatsen op Instagram"
                        description="Upload verwerkte video automatisch naar Instagram als Reel"
                        value={instagramEnabled}
                        onValueChange={handleInstagramToggle}
                        disabled={!instagramConfigured}
                    />
                    {!instagramConfigured && (
                        <Text style={styles.configWarning}>
                            Configureer eerst Instagram inloggegevens in instellingen
                        </Text>
                    )}
                </SettingsCard>

                <InstagramPostConfig
                    enabled={instagramEnabled}
                    onConfigChange={setInstagramPostConfig}
                />

                <Button
                    title={strings.configure.startProcessing}
                    onPress={handleContinue}
                    variant="primary"
                    size="large"
                    style={styles.processButton}
                    disabled={false}
                />
            </ScrollView>
          </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: layout.screenPadding.horizontal,
        paddingTop: layout.spacing.xl,
        paddingBottom: layout.spacing.xxl,
    },
    processButton: {
        marginTop: layout.spacing.lg,
    },
    configWarning: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        marginTop: layout.spacing.sm,
        fontStyle: 'italic',
    },
});
