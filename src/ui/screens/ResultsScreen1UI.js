/**
 * Results Screen 1 UI Component
 * SCREEN 1: Results display - Main results screen with transcript and summary
 * PURE UI COMPONENT - Contains only the UI elements for Results Screen 1
 * Modify this file to change the visual appearance of the Results Screen 1
 * 
 * AI-FRIENDLY: This entire file can be copied and pasted to AI tools like Claude
 * for UI improvements. The AI can return the complete improved script which
 * can replace this file directly.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');

export function ResultsScreen1UI({
    // Results state
    videoUrl,
    videoTitle,
    transcript,
    summary,
    duration,
    wordCount,
    accuracy,
    platform,
    duaEnabled,
    instagramEnabled,
    
    // Callback functions
    onEditTranscript,
    onShareResults,
    onSaveResults,
    onDownloadResults,
    onBack,
    onNewVideo,
    
    // UI state
    activeTab,
    setActiveTab,
    processParams,
    setProcessParams,
    handleTabPress,
    transcriptionResultsParams,
    showTranscriptionResults,
    setShowTranscriptionResults,
    showApiKeyScreen,
    setShowApiKeyScreen,
    showInstagramConfig,
    setShowInstagramConfig,
    captionEditorWorkspaceParams,
    setCaptionEditorWorkspaceParams,
    downloadStackNavigator,
    libraryStackNavigator,
}) {
    /**
     * Render video information header
     */
    const renderVideoInfo = () => {
        return (
            <View style={styles.videoInfoContainer}>
                <View style={styles.videoHeader}>
                    <View style={styles.videoThumbnail}>
                        <Ionicons name="play-circle" size={48} color={colors.white} />
                    </View>
                    <View style={styles.videoDetails}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                            {videoTitle || 'Video Titel'}
                        </Text>
                        <View style={styles.videoMeta}>
                            <Text style={styles.videoMetaText">
                                {duration || '0:00'} • {wordCount || 0} woorden
                            </Text>
                            <Text style={styles.videoMetaText}>
                                {platform || 'Onbekend'} • {accuracy || 0}% nauwkeurigheid
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    /**
     * Render transcript section
     */
    const renderTranscript = () => {
        return (
            <View style={styles.transcriptContainer}>
                <View style={styles.transcriptHeader}>
                    <Text style={styles.transcriptTitle}>Transcript</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={onEditTranscript}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create" size={16} color={colors.primary} />
                        <Text style={styles.editButtonText}>Bewerken</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    style={styles.transcriptScroll}
                    contentContainerStyle={styles.transcriptContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.transcriptText}>
                        {transcript || 'Geen transcript beschikbaar...'}
                    </Text>
                </ScrollView>
            </View>
        );
    };

    /**
     * Render summary section
     */
    const renderSummary = () => {
        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryTitle}>Samenvatting</Text>
                    <View style={styles.summaryMeta}>
                        <Ionicons name="information-circle" size={16} color={colors.textTertiary} />
                        <Text style={styles.summaryMetaText}>
                            AI-generaarde samenvatting
                        </Text>
                    </View>
                </View>
                <ScrollView
                    style={styles.summaryScroll}
                    contentContainerStyle={styles.summaryContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.summaryText}>
                        {summary || 'Geen samenvatting beschikbaar...'}
                    </Text>
                </ScrollView>
            </View>
        );
    };

    /**
     * Render statistics
     */
    const renderStatistics = () => {
        return (
            <View style={styles.statisticsContainer}>
                <Text style={styles.statisticsTitle}>Statistieken</Text>
                <View style={styles.statisticsGrid}>
                    <View style={styles.statItem}>
                        <View style={styles.statIcon}>
                            <Ionicons name="time" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.statValue">{duration || '0:00'}</Text>
                        <Text style={styles.statLabel}>Duur</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={styles.statIcon}>
                            <Ionicons name="text" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.statValue">{wordCount || 0}</Text>
                        <Text style={styles.statLabel}>Woorden</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={styles.statIcon}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.statValue">{accuracy || 0}%</Text>
                        <Text style={styles.statLabel}>Nauwkeurigheid</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={styles.statIcon}>
                            <Ionicons name="logo-youtube" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.statValue">{platform || 'N/A'}</Text>
                        <Text style={styles.statLabel}>Platform</Text>
                    </View>
                </View>
            </View>
        );
    };

    /**
     * Render options status
     */
    const renderOptionsStatus = () => {
        return (
            <View style={styles.optionsContainer}>
                <Text style={styles.optionsTitle}>Gebruikte Opties</Text>
                <View style={styles.optionsList}>
                    <View style={styles.optionItem}>
                        <View style={styles.optionIcon}>
                            <Ionicons 
                                name="heart" 
                                size={16} 
                                color={duaEnabled ? colors.primary : colors.textTertiary} 
                            />
                        </View>
                        <Text style={[
                            styles.optionText,
                            duaEnabled && styles.optionTextActive
                        ]}>
                            Dua's {duaEnabled ? 'ingeschakeld' : 'uitgeschakeld'}
                        </Text>
                    </View>
                    {instagramEnabled && (
                        <View style={styles.optionItem}>
                            <View style={styles.optionIcon}>
                                <Ionicons name="camera" size={16} color={colors.primary} />
                            </View>
                            <Text style={styles.optionText}>
                                Instagram upload gereed
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    /**
     * Render action buttons
     */
    const renderActions = () => {
        return (
            <View style={styles.actionsContainer}>
                <View style={styles.primaryActions}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onShareResults}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="share" size={20} color={colors.white} />
                        <Text style={styles.primaryButtonText}>Delen</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onSaveResults}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="bookmark" size={20} color={colors.white} />
                        <Text style={styles.primaryButtonText}>Opslaan</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.secondaryActions}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onDownloadResults}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="download" size={20} color={colors.primary} />
                        <Text style={styles.secondaryButtonText}>Downloaden</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onNewVideo}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle" size={20} color={colors.primary} />
                        <Text style={styles.secondaryButtonText}>Nieuwe Video</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                        <Text style={styles.backButtonText}>Terug</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Resultaten"
                        subtitle="Transcriptie en samenvatting"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Video Information */}
                        {renderVideoInfo()}
                        
                        {/* Transcript */}
                        {renderTranscript()}
                        
                        {/* Summary */}
                        {renderSummary()}
                        
                        {/* Statistics */}
                        {renderStatistics()}
                        
                        {/* Options Status */}
                        {renderOptionsStatus()}
                        
                        {/* Action Buttons */}
                        {renderActions()}
                    </View>
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
    safeAreaOverride: {
        backgroundColor: colors.background,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: 'transparent',
    },
    headerWrapper: {
        minHeight: 120,
        backgroundColor: colors.background,
        borderBottomWidth: 0,
        borderColor: 'transparent',
        borderWidth: 0,
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 120,
        alignItems: 'center',
        minHeight: '100%',
    },
    contentWrapper: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: layout.spacing.lg,
        minHeight: '100%',
    },
    
    // Video Information Styles
    videoInfoContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    videoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    videoThumbnail: {
        width: 80,
        height: 80,
        borderRadius: layout.radius.md,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    videoDetails: {
        flex: 1,
    },
    videoTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.sm,
    },
    videoMeta: {
        gap: layout.spacing.xs,
    },
    videoMetaText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    
    // Transcript Styles
    transcriptContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    transcriptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    transcriptTitle: {
        ...typography.h3,
        color: colors.text,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.xs,
        paddingHorizontal: layout.spacing.sm,
        paddingVertical: layout.spacing.xs,
        borderRadius: layout.radius.sm,
        backgroundColor: colors.primary + '10',
    },
    editButtonText: {
        ...typography.bodySmall,
        color: colors.primary,
    },
    transcriptScroll: {
        maxHeight: 200,
    },
    transcriptContent: {
        paddingBottom: layout.spacing.sm,
    },
    transcriptText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 22,
    },
    
    // Summary Styles
    summaryContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryHeader: {
        marginBottom: layout.spacing.md,
    },
    summaryTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.xs,
    },
    summaryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.xs,
    },
    summaryMetaText: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
    summaryScroll: {
        maxHeight: 150,
    },
    summaryContent: {
        paddingBottom: layout.spacing.sm,
    },
    summaryText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 22,
    },
    
    // Statistics Styles
    statisticsContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statisticsTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.lg,
    },
    statisticsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: layout.spacing.md,
    },
    statItem: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.sm,
    },
    statValue: {
        ...typography.h2,
        color: colors.primary,
        marginBottom: layout.spacing.xs,
    },
    statLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    
    // Options Status Styles
    optionsContainer: {
        width: '100%',
        backgroundColor: colors.primary + '10',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    optionsTitle: {
        ...typography.h3,
        color: colors.primary,
        marginBottom: layout.spacing.md,
    },
    optionsList: {
        gap: layout.spacing.sm,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
    },
    optionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    optionTextActive: {
        color: colors.primary,
        fontWeight: '500',
    },
    
    // Action Buttons Styles
    actionsContainer: {
        width: '100%',
        gap: layout.spacing.md,
    },
    primaryActions: {
        flexDirection: 'row',
        gap: layout.spacing.md,
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.lg,
        paddingHorizontal: layout.spacing.md,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
        elevation: 8,
    },
    primaryButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: layout.spacing.md,
    },
    secondaryButton: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundSecondary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.md,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        ...typography.button,
        color: colors.primary,
        fontSize: 14,
    },
    backButton: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundSecondary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.md,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    backButtonText: {
        ...typography.button,
        color: colors.textSecondary,
        fontSize: 14,
    },
});
