/**
 * Results Screen 2 UI Component
 * SCREEN 2: Results with actions - Enhanced results screen with additional action options
 * PURE UI COMPONENT - Contains only the UI elements for Results Screen 2
 * Modify this file to change the visual appearance of the Results Screen 2
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
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');

export function ResultsScreen2UI({
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
    
    // Action states
    showShareModal,
    showSaveModal,
    showDownloadModal,
    shareOptions,
    saveOptions,
    downloadOptions,
    
    // Callback functions
    onEditTranscript,
    onShareResults,
    onSaveResults,
    onDownloadResults,
    onBack,
    onNewVideo,
    onOpenShareModal,
    onCloseShareModal,
    onSelectShareOption,
    onOpenSaveModal,
    onCloseSaveModal,
    onSelectSaveOption,
    onOpenDownloadModal,
    onCloseDownloadModal,
    onSelectDownloadOption,
    onExportToInstagram,
    onCreateCaptions,
    onTranslateResults,
    
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
     * Render enhanced video information header
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
                <View style={styles.videoActions}>
                    <TouchableOpacity
                        style={styles.videoActionButton}
                        onPress={onEditTranscript}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create" size={16} color={colors.primary} />
                        <Text style={styles.videoActionText}>Bewerken</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.videoActionButton}
                        onPress={onCreateCaptions}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="subtitles" size={16} color={colors.primary} />
                        <Text style={styles.videoActionText}>Ondertitels</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.videoActionButton}
                        onPress={onTranslateResults}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="language" size={16} color={colors.primary} />
                        <Text style={styles.videoActionText}>Vertalen</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /**
     * Render quick actions
     */
    const renderQuickActions = () => {
        return (
            <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle}>Snelle Acties</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={onOpenShareModal}
                        activeOpacity={0.8}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="share" size={24} color={colors.white} />
                        </View>
                        <Text style={styles.quickActionText}>Delen</Text>
                        <Text style={styles.quickActionSubtext}>Deel resultaten</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={onOpenSaveModal}
                        activeOpacity={0.8}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="bookmark" size={24} color={colors.white} />
                        </View>
                        <Text style={styles.quickActionText}>Opslaan</Text>
                        <Text style={styles.quickActionSubtext}>Bewaar resultaten</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={onOpenDownloadModal}
                        activeOpacity={0.8}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="download" size={24} color={colors.white} />
                        </View>
                        <Text style={styles.quickActionText}>Download</Text>
                        <Text style={styles.quickActionSubtext}>Exporteer bestanden</Text>
                    </TouchableOpacity>
                    
                    {instagramEnabled && (
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={onExportToInstagram}
                            activeOpacity={0.8}
                        >
                            <View style={styles.quickActionIcon}>
                                <Ionicons name="camera" size={24} color={colors.white} />
                            </View>
                            <Text style={styles.quickActionText}>Instagram</Text>
                            <Text style={styles.quickActionSubtext}>Upload naar IG</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    /**
     * Render transcript preview
     */
    const renderTranscriptPreview = () => {
        return (
            <View style={styles.transcriptContainer}>
                <View style={styles.transcriptHeader}>
                    <Text style={styles.transcriptTitle}>Transcript Voorbeeld</Text>
                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={onEditTranscript}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.viewAllText}>Bekijk Alles</Text>
                        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    style={styles.transcriptScroll}
                    contentContainerStyle={styles.transcriptContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.transcriptText}>
                        {transcript ? transcript.substring(0, 300) + '...' : 'Geen transcript beschikbaar...'}
                    </Text>
                </ScrollView>
            </View>
        );
    };

    /**
     * Render summary preview
     */
    const renderSummaryPreview = () => {
        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryTitle}>Samenvatting</Text>
                    <View style={styles.summaryMeta}>
                        <Ionicons name="sparkles" size={16} color={colors.primary} />
                        <Text style={styles.summaryMetaText}>
                            AI-generaard
                        </Text>
                    </View>
                </View>
                <ScrollView
                    style={styles.summaryScroll}
                    contentContainerStyle={styles.summaryContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.summaryText}>
                        {summary ? summary.substring(0, 200) + '...' : 'Geen samenvatting beschikbaar...'}
                    </Text>
                </ScrollView>
            </View>
        );
    };

    /**
     * Render share modal
     */
    const renderShareModal = () => {
        return (
            <Modal
                visible={showShareModal}
                transparent={true}
                animationType="fade"
                onRequestClose={onCloseShareModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Delen</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={onCloseShareModal}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            {shareOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.modalOption}
                                    onPress={() => onSelectShareOption(option)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.modalOptionIcon}>
                                        <Ionicons name={option.icon} size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.modalOptionContent}>
                                        <Text style={styles.modalOptionTitle">{option.title}</Text>
                                        <Text style={styles.modalOptionDescription">{option.description}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    /**
     * Render save modal
     */
    const renderSaveModal = () => {
        return (
            <Modal
                visible={showSaveModal}
                transparent={true}
                animationType="fade"
                onRequestClose={onCloseSaveModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Opslaan</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={onCloseSaveModal}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            {saveOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.modalOption}
                                    onPress={() => onSelectSaveOption(option)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.modalOptionIcon}>
                                        <Ionicons name={option.icon} size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.modalOptionContent}>
                                        <Text style={styles.modalOptionTitle}>{option.title}</Text>
                                        <Text style={styles.modalOptionDescription}>{option.description}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    /**
     * Render download modal
     */
    const renderDownloadModal = () => {
        return (
            <Modal
                visible={showDownloadModal}
                transparent={true}
                animationType="fade"
                onRequestClose={onCloseDownloadModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Download</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={onCloseDownloadModal}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            {downloadOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.modalOption}
                                    onPress={() => onSelectDownloadOption(option)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.modalOptionIcon}>
                                        <Ionicons name={option.icon} size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.modalOptionContent}>
                                        <Text style={styles.modalOptionTitle}>{option.title}</Text>
                                        <Text style={styles.modalOptionDescription}>{option.description}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    /**
     * Render action buttons
     */
    const renderActions = () => {
        return (
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onNewVideo}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle" size={20} color={colors.white} />
                    <Text style={styles.primaryButtonText}>Nieuwe Video</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onBack}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                    <Text style={styles.secondaryButtonText}>Terug</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Resultaten"
                        subtitle="Acties en opties"
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
                        
                        {/* Quick Actions */}
                        {renderQuickActions()}
                        
                        {/* Transcript Preview */}
                        {renderTranscriptPreview()}
                        
                        {/* Summary Preview */}
                        {renderSummaryPreview()}
                        
                        {/* Action Buttons */}
                        {renderActions()}
                    </View>
                </ScrollView>
                
                {/* Modals */}
                {renderShareModal()}
                {renderSaveModal()}
                {renderDownloadModal()}
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
        marginBottom: layout.spacing.md,
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
    videoActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    videoActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary + '10',
        paddingVertical: layout.spacing.sm,
        paddingHorizontal: layout.spacing.xs,
        borderRadius: layout.radius.sm,
        marginHorizontal: layout.spacing.xs,
        gap: layout.spacing.xs,
    },
    videoActionText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontSize: 12,
    },
    
    // Quick Actions Styles
    quickActionsContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickActionsTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.lg,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: layout.spacing.md,
    },
    quickActionButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.primary,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        alignItems: 'center',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        elevation: 6,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.white + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.sm,
    },
    quickActionText: {
        ...typography.button,
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: layout.spacing.xs,
    },
    quickActionSubtext: {
        ...typography.bodySmall,
        color: colors.white + '80',
        textAlign: 'center',
    },
    
    // Transcript Preview Styles
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
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.xs,
    },
    viewAllText: {
        ...typography.bodySmall,
        color: colors.primary,
    },
    transcriptScroll: {
        maxHeight: 120,
    },
    transcriptContent: {
        paddingBottom: layout.spacing.sm,
    },
    transcriptText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 22,
    },
    
    // Summary Preview Styles
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
        color: colors.primary,
    },
    summaryScroll: {
        maxHeight: 100,
    },
    summaryContent: {
        paddingBottom: layout.spacing.sm,
    },
    summaryText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 22,
    },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: layout.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        ...typography.h3,
        color: colors.text,
    },
    modalCloseButton: {
        padding: layout.spacing.xs,
    },
    modalBody: {
        padding: layout.spacing.lg,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSecondary,
    },
    modalOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    modalOptionContent: {
        flex: 1,
    },
    modalOptionTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    modalOptionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    
    // Action Buttons Styles
    actionsContainer: {
        width: '100%',
        gap: layout.spacing.md,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.lg,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
        elevation: 8,
    },
    primaryButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundSecondary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        ...typography.button,
        color: colors.textSecondary,
    },
});
