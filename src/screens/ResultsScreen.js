/**
 * Results Screen - Liquid Glass Design
 * Step 4: Display results in tabs
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabContainer } from '../components/results/TabContainer';
import { Button } from '../components/common/Button';
import { useResults } from '../hooks/useResults';
import { strings } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';
import { saveResultToHistory } from '../utils/storage';
import { saveTranscriptionResults } from '../services/videoStorageService';

export function ResultsScreen({ route, navigation }) {
    const { results, videoId, videoName } = route.params || {};
    const { copyToClipboard, shareText, saveResults, formatResultsForSave } = useResults();
    const [savedToLibrary, setSavedToLibrary] = React.useState(false);
    const [autoSaved, setAutoSaved] = useState(false);

    // Auto-save results when screen loads
    useEffect(() => {
        if (results && !autoSaved) {
            autoSaveResults();
        }
    }, [results, autoSaved]);

    const autoSaveResults = async () => {
        try {
            // Save to video library if videoId exists
            if (videoId) {
                await saveTranscriptionResults(videoId, results);
                setSavedToLibrary(true);
            }
            
            // Also save to general history for homepage display
            const historyEntry = {
                id: videoId || `result_${Date.now()}`,
                timestamp: Date.now(),
                videoName: videoName || 'Processed Video',
                arabicTranscript: results.arabicTranscript || '',
                translatedText: results.translatedText || results.dutchTranslation || '',
                originalUrl: results.originalUrl || null,
                processedDate: Date.now(),
            };
            
            await saveResultToHistory(historyEntry);
            setAutoSaved(true);
            
            console.log('Results auto-saved successfully');
        } catch (error) {
            console.error('Auto-save failed:', error);
            // Silent fail - don't show error to user for auto-save
        }
    };

    const handleCopy = async (text) => {
        const success = await copyToClipboard(text);
        if (success) {
            Alert.alert(strings.results.copied, strings.results.copiedDesc);
        } else {
            Alert.alert(strings.common.error, strings.results.errorCopy);
        }
    };

    const handleShare = async () => {
        const formattedText = formatResultsForSave(results);
        const success = await shareText(formattedText);
        if (!success) {
            Alert.alert(strings.common.error, strings.results.errorShare);
        }
    };

    const handleSave = async () => {
        const fileUri = await saveResults(results);
        if (fileUri) {
            Alert.alert(strings.results.saved, strings.results.savedDesc);
        } else {
            Alert.alert(strings.common.error, strings.results.errorSave);
        }
    };

    const handleSaveToLibrary = async () => {
        if (!videoId) {
            Alert.alert(
                'Not Available',
                'This feature is only available for videos in your library.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            const { saveTranscriptionResults } = require('../services/videoStorageService');
            await saveTranscriptionResults(videoId, results);
            setSavedToLibrary(true);
            Alert.alert(
                'Saved to Library',
                'Transcription results have been saved to your video library.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                'Save Failed',
                error.message || 'Failed to save transcription results.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleNewVideo = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Upload' }],
        });
    };

    if (!results) {
        return (
            <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
                    <Text style={styles.emptyText}>No results available</Text>
                    <Button
                        title={strings.results.startNew}
                        onPress={handleNewVideo}
                        variant="primary"
                        style={styles.button}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
            <ScrollView
                style={globalStyles.container}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Resultaten</Text>
                    <Text style={styles.subtitle}>
                        Je transcriptie en vertaling
                    </Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleShare}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="share-outline" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Delen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleSave}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="download-outline" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Opslaan</Text>
                    </TouchableOpacity>
                    {videoId && (
                        <TouchableOpacity
                            style={[styles.actionButton, savedToLibrary && styles.actionButtonSaved]}
                            onPress={handleSaveToLibrary}
                            activeOpacity={0.7}
                            disabled={savedToLibrary}
                        >
                            <Ionicons 
                                name={savedToLibrary ? "checkmark-circle" : "folder-outline"} 
                                size={20} 
                                color={savedToLibrary ? colors.success : colors.primary} 
                            />
                            <Text style={[
                                styles.actionButtonText,
                                savedToLibrary && styles.actionButtonTextSaved
                            ]}>
                                {savedToLibrary ? 'Opgeslagen' : 'Bibliotheek'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.tabContainer, { paddingBottom: 40 }]}>
                    <TabContainer results={results} onCopy={handleCopy} />
                </View>

                <View style={styles.footer}>
                    <Button
                        title={strings.results.processAnother}
                        onPress={handleNewVideo}
                        variant="primary"
                        size="large"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: layout.screenPadding.horizontal,
        paddingTop: layout.spacing.lg,
        marginBottom: layout.spacing.md,
    },
    title: {
        ...typography.h1,
        marginBottom: layout.spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: layout.screenPadding.horizontal,
        marginBottom: layout.spacing.md,
        gap: layout.spacing.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    actionButtonText: {
        ...typography.bodySmall,
        color: colors.primary,
        marginLeft: layout.spacing.xs,
        fontWeight: '600',
    },
    actionButtonSaved: {
        backgroundColor: colors.success + '15',
        borderColor: colors.success + '40',
    },
    actionButtonTextSaved: {
        color: colors.success,
    },
    tabContainer: {
        paddingHorizontal: layout.screenPadding.horizontal,
        marginBottom: layout.spacing.md,
    },
    footer: {
        paddingHorizontal: layout.screenPadding.horizontal,
        paddingBottom: layout.spacing.xl,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: layout.spacing.xxl,
    },
    emptyText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
    },
    button: {
        marginTop: layout.spacing.lg,
    },
});
