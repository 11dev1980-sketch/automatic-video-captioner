/**
 * Transcription Results Screen - Liquid Glass Design
 * Displays saved transcription results from video library
 * EXACT SAME VIEW as ResultsScreen with enhanced sharing
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabContainer } from '../components/results/TabContainer';
import { Button } from '../components/common/Button';
import { useResults } from '../hooks/useResults';
import { shareTranscriptionText, shareSection, copyToClipboard, shareTranscriptionWithLink } from '../services/shareService';
import { strings } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

export function TranscriptionResultsScreen({ route, navigation }) {
    const { results, videoName } = route.params || {};
    const { copyToClipboard: legacyCopy, shareText, saveResults, formatResultsForSave } = useResults();
    const [showShareMenu, setShowShareMenu] = useState(false);

    const handleCopy = async (text) => {
        const success = await copyToClipboard(text);
        if (success) {
            Alert.alert(strings.results.copied, strings.results.copiedDesc);
        } else {
            Alert.alert(strings.common.error, strings.results.errorCopy);
        }
    };

    const handleCopySection = async (sectionName) => {
        let content = '';
        switch (sectionName) {
            case 'arabic':
                content = results.arabicTranscript || '';
                break;
            case 'dutch':
                content = results.translatedText || results.dutchTranslation || results.translation || '';
                break;
            case 'duas':
                content = results.duaResults || '';
                break;
        }
        
        if (content) {
            const success = await copyToClipboard(content);
            if (success) {
                Alert.alert('Copied', `${sectionName} text copied to clipboard`);
            }
        }
    };

    const handleShare = async () => {
        try {
            await shareTranscriptionText(results, videoName || 'Transcription');
            Alert.alert('Shared', 'Transcription shared successfully');
        } catch (error) {
            Alert.alert(strings.common.error, error.message || strings.results.errorShare);
        }
    };

    const handleShareWithLink = async () => {
        try {
            const result = await shareTranscriptionWithLink(results, videoName || 'Transcription');
            if (result.method === 'clipboard') {
                Alert.alert('Link Copied', 'Shareable link copied to clipboard');
            } else {
                Alert.alert('Shared', 'Shareable link sent successfully');
            }
        } catch (error) {
            Alert.alert(strings.common.error, error.message || 'Failed to create shareable link');
        }
    };

    const handleShareSection = async (sectionName) => {
        let content = '';
        let title = '';
        
        switch (sectionName) {
            case 'arabic':
                content = results.arabicTranscript || '';
                title = 'Arabic Transcript';
                break;
            case 'dutch':
                content = results.translatedText || results.dutchTranslation || results.translation || '';
                title = 'Dutch Translation';
                break;
            case 'duas':
                content = results.duaResults || '';
                title = 'Duas';
                break;
        }
        
        if (content) {
            try {
                await shareSection(content, title);
            } catch (error) {
                Alert.alert(strings.common.error, 'Failed to share section');
            }
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

    const handleBack = () => {
        navigation.goBack();
    };

    if (!results) {
        return (
            <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
                    <Text style={styles.emptyText}>No results available</Text>
                    <Button
                        title="Go Back"
                        onPress={handleBack}
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
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Resultaten</Text>
                        <Text style={styles.subtitle}>
                            Je transcriptie en vertaling
                        </Text>
                    </View>
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
                        onPress={handleShareWithLink}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="link-outline" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Link Delen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleSave}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="download-outline" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Opslaan</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.tabContainer, { paddingBottom: 40 }]}>
                    <TabContainer results={results} onCopy={handleCopy} />
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Terug naar Bibliotheek"
                        onPress={handleBack}
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding.horizontal,
        paddingTop: layout.spacing.lg,
        marginBottom: layout.spacing.md,
    },
    backButton: {
        marginRight: layout.spacing.md,
    },
    headerText: {
        flex: 1,
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
    sectionActions: {
        paddingHorizontal: layout.screenPadding.horizontal,
        marginBottom: layout.spacing.lg,
    },
    sectionActionsTitle: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: layout.spacing.sm,
        fontWeight: '600',
    },
    sectionButtonsRow: {
        flexDirection: 'row',
        gap: layout.spacing.sm,
    },
    sectionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.md,
        padding: layout.spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 4,
    },
    sectionButtonText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
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
