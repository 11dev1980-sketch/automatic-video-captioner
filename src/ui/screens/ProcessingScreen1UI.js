/**
 * Processing Screen 1 UI Component
 * SCREEN 1: Initial processing screen - Starting state with loading animation
 * PURE UI COMPONENT - Contains only the UI elements for Processing Screen 1
 * Modify this file to change the visual appearance of the Processing Screen 1
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
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

export function ProcessingScreen1UI({
    // Processing state
    reelUrl,
    platform,
    duaEnabled,
    instagramEnabled,
    instagramPostConfig,
    
    // Callback functions
    onRetry,
    onBack,
    onCancel,
    
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
     * Render loading animation
     */
    const renderLoadingAnimation = () => {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Video wordt voorbereid...</Text>
                <Text style={styles.loadingSubtext}>
                    Even geduld terwijl we je video verwerken
                </Text>
            </View>
        );
    };

    /**
     * Render video info
     */
    const renderVideoInfo = () => {
        return (
            <View style={styles.videoInfoContainer}>
                <View style={styles.videoInfoHeader}>
                    <Ionicons name="videocam" size={24} color={colors.primary} />
                    <Text style={styles.videoInfoTitle}>Video Informatie</Text>
                </View>
                <View style={styles.videoInfoContent}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Platform:</Text>
                        <Text style={styles.infoValue}>{platform || 'Onbekend'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>URL:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>{reelUrl}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Dua's:</Text>
                        <Text style={styles.infoValue}>{duaEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}</Text>
                    </View>
                    {instagramEnabled && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Instagram:</Text>
                            <Text style={styles.infoValue}>Ingeschakeld</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    /**
     * Render processing steps
     */
    const renderProcessingSteps = () => {
        const steps = [
            { icon: 'download', title: 'Video Downloaden', status: 'pending' },
            { icon: 'mic', title: 'Audio Transcriberen', status: 'pending' },
            { icon: 'language', title: 'Arabisch Vertalen', status: 'pending' },
            { icon: 'create', title: 'Ondertitels Genereren', status: 'pending' },
            { icon: 'checkmark-circle', title: 'Voltooid', status: 'pending' },
        ];

        return (
            <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Verwerkingsstappen</Text>
                <View style={styles.stepsList}>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <View style={[
                                styles.stepIcon,
                                step.status === 'completed' && styles.stepIconCompleted,
                                step.status === 'active' && styles.stepIconActive
                            ]}>
                                <Ionicons 
                                    name={step.icon} 
                                    size={20} 
                                    color={
                                        step.status === 'completed' ? colors.white :
                                        step.status === 'active' ? colors.primary :
                                        colors.textTertiary
                                    } 
                                />
                            </View>
                            <Text style={[
                                styles.stepText,
                                step.status === 'completed' && styles.stepTextCompleted,
                                step.status === 'active' && styles.stepTextActive
                            ]}>
                                {step.title}
                            </Text>
                        </View>
                    ))}
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
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close-circle" size={20} color={colors.white} />
                    <Text style={styles.cancelButtonText}>Annuleren</Text>
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
        );
    };

    /**
     * Render tips
     */
    const renderTips = () => {
        return (
            <View style={styles.tipsContainer}>
                <View style={styles.tipsHeader}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={styles.tipsTitle}>Tips</Text>
                </View>
                <View style={styles.tipsList}>
                    <Text style={styles.tipText}>
                        • Verwerking kan enkele minuten duren afhankelijk van de videolengte
                    </Text>
                    <Text style={styles.tipText}>
                        • Zorg voor een stabiele internetverbinding
                    </Text>
                    <Text style={styles.tipText}>
                        • Je kunt de app op de achtergrond laten draaien
                    </Text>
                    <Text style={styles.tipText">
                        • Resultaten worden automatisch opgeslagen
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Video Verwerken"
                        subtitle="Je video wordt verwerkt..."
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Loading Animation */}
                        {renderLoadingAnimation()}
                        
                        {/* Video Info */}
                        {renderVideoInfo()}
                        
                        {/* Processing Steps */}
                        {renderProcessingSteps()}
                        
                        {/* Tips */}
                        {renderTips()}
                        
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
    
    // Loading Styles
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl,
        marginBottom: layout.spacing.xl,
    },
    loadingText: {
        ...typography.h3,
        color: colors.text,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    loadingSubtext: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    
    // Video Info Styles
    videoInfoContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    videoInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    videoInfoTitle: {
        ...typography.h3,
        color: colors.text,
        marginLeft: layout.spacing.sm,
    },
    videoInfoContent: {
        gap: layout.spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: layout.spacing.xs,
    },
    infoLabel: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        ...typography.body,
        color: colors.text,
        flex: 1,
        textAlign: 'right',
        marginLeft: layout.spacing.md,
    },
    
    // Processing Steps Styles
    stepsContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    stepsTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.lg,
        textAlign: 'center',
    },
    stepsList: {
        gap: layout.spacing.md,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.md,
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepIconCompleted: {
        backgroundColor: colors.success,
    },
    stepIconActive: {
        backgroundColor: colors.primary + '20',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    stepText: {
        ...typography.body,
        color: colors.textSecondary,
        flex: 1,
    },
    stepTextCompleted: {
        color: colors.success,
        fontWeight: '500',
    },
    stepTextActive: {
        color: colors.primary,
        fontWeight: '500',
    },
    
    // Tips Styles
    tipsContainer: {
        width: '100%',
        backgroundColor: colors.primary + '10',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    tipsTitle: {
        ...typography.h3,
        color: colors.primary,
        marginLeft: layout.spacing.sm,
    },
    tipsList: {
        gap: layout.spacing.sm,
    },
    tipText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    
    // Action Buttons Styles
    actionsContainer: {
        width: '100%',
        gap: layout.spacing.md,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error,
        paddingVertical: layout.spacing.lg,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
    },
    cancelButtonText: {
        ...typography.button,
        color: colors.white,
    },
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
