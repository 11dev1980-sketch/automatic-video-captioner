/**
 * Home Screen 1 UI Component
 * SCREEN 1: Initial home screen - Welcome state with quick start and features
 * PURE UI COMPONENT - Contains only the UI elements for Home Screen 1
 * Modify this file to change the visual appearance of the Home Screen 1
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
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

export function HomeScreen1UI({
    // State
    userName,
    quickStartUrl,
    urlError,
    recentResults,
    
    // Callback functions
    onQuickStartUrlChange,
    onQuickStart,
    onNavigateToHistory,
    onSelectRecentResult,
    
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
     * Render quick start section
     */
    const renderQuickStart = () => {
        return (
            <View style={styles.quickStartContainer}>
                <Text style={styles.sectionTitle}>Snel Starten</Text>
                <Text style={styles.quickStartDescription}>
                    Voer een video-URL in om direct te beginnen met transcriberen en vertalen
                </Text>
                <View style={styles.quickStartCard}>
                    <TextInput
                        style={styles.quickStartInput}
                        placeholder="Plak video-URL hier (Instagram, TikTok, YouTube...)"
                        placeholderTextColor={colors.textTertiary}
                        value={quickStartUrl}
                        onChangeText={onQuickStartUrlChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {urlError ? (
                        <Text style={styles.urlError}>{urlError}</Text>
                    ) : null}
                    <TouchableOpacity
                        style={[styles.quickStartButton, !quickStartUrl && styles.quickStartButtonDisabled]}
                        onPress={onQuickStart}
                        disabled={!quickStartUrl}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-forward" size={20} color={colors.white} />
                        <Text style={styles.quickStartButtonText}>Start Vertalen</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /**
     * Render features section
     */
    const renderFeatures = () => {
        const features = [
            {
                icon: 'mic',
                title: 'Automatische Transcriptie',
                description: 'Arabische audio automatisch omzetten naar tekst',
                color: colors.primary,
            },
            {
                icon: 'language',
                title: 'Arabisch ↔ Nederlands',
                description: 'Professionele vertaling tussen talen',
                color: colors.secondary,
            },
            {
                icon: 'create',
                title: 'Ondertitel Editor',
                description: 'Bewerk en verfijn ondertitels met precisie',
                color: colors.success,
            },
            {
                icon: 'logo-instagram',
                title: 'Instagram Integratie',
                description: 'Direct ondertitels uploaden naar Instagram',
                color: colors.error,
            },
        ];

        return (
            <View style={styles.featuresContainer}>
                <Text style={styles.sectionTitle}>Functies</Text>
                <View style={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureCard}>
                            <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                                <Ionicons name={feature.icon} size={28} color={feature.color} />
                            </View>
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    /**
     * Render recent results section
     */
    const renderRecentResults = () => {
        if (recentResults.length === 0) {
            return (
                <View style={styles.recentContainer}>
                    <Text style={styles.sectionTitle}>Recente Resultaten</Text>
                    <View style={styles.emptyRecentContainer}>
                        <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
                        <Text style={styles.emptyRecentText}>Nog geen resultaten</Text>
                        <Text style={styles.emptyRecentSubtext">
                            Start met het transcriberen van video's om resultaten te zien
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.recentContainer}>
                <View style={styles.recentHeader}>
                    <Text style={styles.sectionTitle}>Recente Resultaten</Text>
                    <TouchableOpacity
                        onPress={onNavigateToHistory}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.viewAllText}>Bekijk Alles</Text>
                    </TouchableOpacity>
                </View>
                {recentResults.slice(0, 3).map((result) => (
                    <TouchableOpacity
                        key={result.id}
                        style={styles.recentVideoCard}
                        onPress={() => onSelectRecentResult(result)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.recentVideoIcon}>
                            <Ionicons name="document-text" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.recentVideoInfo}>
                            <Text style={styles.recentVideoTitle} numberOfLines={1}>
                                {result.videoName || `Video - ${new Date(result.timestamp).toLocaleDateString()}`}
                            </Text>
                            <Text style={styles.recentVideoMeta}>
                                {new Date(result.timestamp).toLocaleDateString()} • {result.platform || 'Web'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    /**
     * Render quick actions
     */
    const renderQuickActions = () => {
        const actions = [
            {
                icon: 'videocam',
                title: 'Video Editor',
                description: 'Bewerk ondertitels voor video\'s',
                onPress: () => {}, // Will be passed from screen
            },
            {
                icon: 'library',
                title: 'Bibliotheek',
                description: 'Bekijk al je resultaten',
                onPress: () => {}, // Will be passed from screen
            },
            {
                icon: 'settings',
                title: 'Instellingen',
                description: 'Configureer de app',
                onPress: () => {}, // Will be passed from screen
            },
        ];

        return (
            <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Snelle Acties</Text>
                <View style={styles.quickActionsGrid}>
                    {actions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickActionCard}
                            onPress={action.onPress}
                            activeOpacity={0.8}
                        >
                            <View style={styles.quickActionIcon}>
                                <Ionicons name={action.icon} size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.quickActionTitle}>{action.title}</Text>
                            <Text style={styles.quickActionDescription}>{action.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title={userName ? `Welkom terug, ${userName}` : 'Welkom'}
                        subtitle="Arabische Video Vertaler & Ondertitel Editor"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Quick Start Section */}
                        {renderQuickStart()}
                        
                        {/* Features Section */}
                        {renderFeatures()}
                        
                        {/* Recent Results Section */}
                        {renderRecentResults()}
                        
                        {/* Quick Actions Section */}
                        {renderQuickActions()}
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
    
    // Section Styles
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: layout.spacing.lg,
        textAlign: 'center',
    },
    
    // Quick Start Styles
    quickStartContainer: {
        width: '100%',
        marginBottom: layout.spacing.xl,
    },
    quickStartDescription: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: layout.spacing.lg,
        lineHeight: 22,
    },
    quickStartCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickStartInput: {
        ...typography.body,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        color: colors.text,
        marginBottom: layout.spacing.md,
        fontSize: 16,
    },
    urlError: {
        color: colors.error,
        fontSize: 14,
        marginBottom: layout.spacing.md,
        textAlign: 'center',
    },
    quickStartButton: {
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
    quickStartButtonDisabled: {
        opacity: 0.6,
    },
    quickStartButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    
    // Features Styles
    featuresContainer: {
        width: '100%',
        marginBottom: layout.spacing.xl,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: layout.spacing.md,
    },
    featureCard: {
        width: '48%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: layout.spacing.sm,
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    featureTitle: {
        ...typography.h3,
        color: colors.text,
        textAlign: 'center',
        marginBottom: layout.spacing.sm,
    },
    featureDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    
    // Recent Results Styles
    recentContainer: {
        width: '100%',
        marginBottom: layout.spacing.xl,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
    },
    viewAllText: {
        ...typography.button,
        color: colors.primary,
    },
    emptyRecentContainer: {
        alignItems: 'center',
        paddingVertical: layout.spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyRecentText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginTop: layout.spacing.md,
        marginBottom: layout.spacing.sm,
    },
    emptyRecentSubtext: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
        lineHeight: 20,
    },
    recentVideoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        marginBottom: layout.spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    recentVideoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    recentVideoInfo: {
        flex: 1,
    },
    recentVideoTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    recentVideoMeta: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    
    // Quick Actions Styles
    quickActionsContainer: {
        width: '100%',
        marginBottom: layout.spacing.xl,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: layout.spacing.md,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    quickActionTitle: {
        ...typography.h3,
        color: colors.text,
        textAlign: 'center',
        marginBottom: layout.spacing.sm,
    },
    quickActionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
});
