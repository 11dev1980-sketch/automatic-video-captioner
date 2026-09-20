/**
 * Results Screen UI Component
 * PURE UI COMPONENT - Contains only the UI elements for ResultsScreen
 * Modify this file to change the visual appearance of the ResultsScreen
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
    ActivityIndicator,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

export function ResultsScreenUI({
    // Results state
    results,
    isLoading,
    error,
    
    // Callback functions
    onRetry,
    onShare,
    onDownload,
    onEditCaptions,
    onBack,
    onViewTranscription,
    
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
     * Render loading state
     */
    const renderLoading = () => {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Resultaten worden geladen...</Text>
            </View>
        );
    };

    /**
     * Render error state
     */
    const renderError = () => {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={64} color={colors.error} />
                <Text style={styles.errorTitle}>Er is een fout opgetreden</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Ionicons name="refresh" size={20} color={colors.white} />
                    <Text style={styles.retryButtonText}>Opnieuw Proberen</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render results content
     */
    const renderResults = () => {
        if (!results) return null;

        return (
            <View style={styles.resultsContainer}>
                {/* Arabic Transcript */}
                {results.arabicTranscript && (
                    <View style={styles.resultSection}>
                        <Text style={styles.sectionTitle}>Arabisch Transcript</Text>
                        <View style={styles.transcriptContainer}>
                            <Text style={styles.transcriptText}>{results.arabicTranscript}</Text>
                        </View>
                    </View>
                )}

                {/* Dutch Translation */}
                {results.dutchTranslation && (
                    <View style={styles.resultSection}>
                        <Text style={styles.sectionTitle}>Nederlandse Vertaling</Text>
                        <View style={styles.transcriptContainer}>
                            <Text style={styles.transcriptText}>{results.dutchTranslation}</Text>
                        </View>
                    </View>
                )}
                    </View>
                )}
            </View>
        );
    };

    /**
     * Render action buttons
     */
    const renderActions = () => {
        return (
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onShare}
                    activeOpacity={0.8}
                >
                    <Ionicons name="share" size={20} color={colors.white} />
                    <Text style={styles.actionButtonText}>Delen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onDownload}
                    activeOpacity={0.8}
                >
                    <Ionicons name="download" size={20} color={colors.white} />
                    <Text style={styles.actionButtonText}>Downloaden</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onEditCaptions}
                    activeOpacity={0.8}
                >
                    <Ionicons name="create" size={20} color={colors.white} />
                    <Text style={styles.actionButtonText}>Ondertitels Bewerken</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onViewTranscription}
                    activeOpacity={0.8}
                >
                    <Ionicons name="document-text" size={20} color={colors.white} />
                    <Text style={styles.actionButtonText}>Transcriptie Bekijken</Text>
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
                        subtitle="Verwerkte video ondertitels"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Loading State */}
                        {isLoading && renderLoading()}
                        
                        {/* Error State */}
                        {error && renderError()}
                        
                        {/* Results Content */}
                        {!isLoading && !error && renderResults()}
                        
                        {/* Action Buttons */}
                        {!isLoading && !error && results && renderActions()}
                        
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={onBack}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={20} color={colors.white} />
                            <Text style={styles.backButtonText}>Terug</Text>
                        </TouchableOpacity>
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
    
    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl,
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: layout.spacing.md,
    },
    
    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl,
    },
    errorTitle: {
        ...typography.h2,
        color: colors.error,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.md,
        textAlign: 'center',
    },
    errorMessage: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: layout.spacing.xl,
        paddingHorizontal: layout.spacing.lg,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
    },
    retryButtonText: {
        ...typography.button,
        color: colors.white,
    },
    
    // Results Container
    resultsContainer: {
        width: '100%',
    },
    resultSection: {
        marginBottom: layout.spacing.xl,
    },
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: layout.spacing.lg,
    },
    transcriptContainer: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    transcriptText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 24,
    },
    
    // Dua Styles
    duaContainer: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    duaItem: {
        marginBottom: layout.spacing.md,
        paddingBottom: layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    duaItem:last-child {
        marginBottom: 0,
        paddingBottom: 0,
        borderBottomWidth: 0,
    },
    duaText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 22,
        marginBottom: layout.spacing.sm,
    },
    duaReference: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    
    // Action Buttons
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: layout.spacing.md,
        marginBottom: layout.spacing.xl,
    },
    actionButton: {
        flex: 1,
        minWidth: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.md,
        borderRadius: layout.radius.md,
        gap: layout.spacing.sm,
    },
    actionButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 14,
    },
    
    // Back Button
    backButton: {
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
    backButtonText: {
        ...typography.button,
        color: colors.textSecondary,
    },
});
