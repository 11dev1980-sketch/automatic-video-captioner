/**
 * Processing Screen UI Component
 * PURE UI COMPONENT - Contains only the UI elements for ProcessingScreen
 * Modify this file to change the visual appearance of the ProcessingScreen
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');

export function ProcessingScreenUI({
    // Processing state
    reelUrl,
    platform,
    duaEnabled,
    instagramEnabled,
    instagramPostConfig,
    
    // Processing progress
    currentStep,
    progress,
    totalSteps,
    stepProgress,
    isProcessing,
    isCompleted,
    hasError,
    
    // Results
    results,
    
    // Callback functions
    onRetry,
    onNavigateToResults,
    onNavigateBack,
    
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
     * Render processing step indicator
     */
    const renderStepIndicator = () => {
        const steps = [
            { key: 'transcription', title: 'Transcriptie', icon: 'document-text' },
            { key: 'preprocessing', title: 'Voorbewerking', icon: 'settings' },
            { key: 'translation', title: 'Vertaling', icon: 'language' },
            { key: 'instagram', title: 'Instagram Upload', icon: 'logo-instagram' }
        ];

        return (
            <View style={styles.stepIndicatorContainer}>
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const isUpcoming = index > currentStep;

                    return (
                        <View key={step.key} style={styles.stepItem}>
                            <View style={[
                                styles.stepCircle,
                                isActive && styles.stepCircleActive,
                                isCompleted && styles.stepCircleCompleted,
                                isUpcoming && styles.stepCircleUpcoming
                            ]}>
                                <Ionicons
                                    name={step.icon}
                                    size={20}
                                    color={
                                        isCompleted ? colors.white :
                                        isActive ? colors.primary :
                                        colors.textTertiary
                                    }
                                />
                            </View>
                            <Text style={[
                                styles.stepText,
                                isActive && styles.stepTextActive,
                                isCompleted && styles.stepTextCompleted,
                                isUpcoming && styles.stepTextUpcoming
                            ]}>
                                {step.title}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    /**
     * Render progress bar
     */
    const renderProgressBar = () => {
        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill,
                        { width: `${progress}%` }
                    ]} />
                </View>
                <Text style={styles.progressText}>
                    {currentStep + 1} van {totalSteps} - {Math.round(progress)}%
                </Text>
            </View>
        );
    };

    /**
     * Render current step content
     */
    const renderCurrentStep = () => {
        if (hasError) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.error} />
                    <Text style={styles.errorTitle}>Verwerking Mislukt</Text>
                    <Text style={styles.errorMessage}>
                        Er is een fout opgetreden tijdens het verwerken van de video.
                        Probeer het opnieuw of controleer de video-URL.
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Ionicons name="refresh" size={20} color={colors.white} />
                        <Text style={styles.retryButtonText}>Opnieuw Proberen</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (isCompleted) {
            return (
                <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                    <Text style={styles.successTitle}>Verwerking Voltooid</Text>
                    <Text style={styles.successMessage}>
                        De video is succesvol verwerkt en vertaald.
                    </Text>
                    <TouchableOpacity style={styles.continueButton} onPress={onNavigateToResults}>
                        <Ionicons name="arrow-forward" size={20} color={colors.white} />
                        <Text style={styles.continueButtonText}>Bekijk Resultaten</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const stepContent = {
            transcription: {
                title: 'Arabisch Transcriptie',
                description: 'De Arabische audio wordt omgezet naar tekst',
                icon: 'document-text'
            },
            preprocessing: {
                title: 'Video Voorbewerking',
                description: 'De video wordt voorbereid voor verwerking',
                icon: 'settings'
            },
            translation: {
                title: 'Arabisch naar Nederlands',
                description: 'De Arabische tekst wordt vertaald naar het Nederlands',
                icon: 'language'
            },
            instagram: {
                title: 'Instagram Upload',
                description: 'De vertaalde ondertitels worden geüpload naar Instagram',
                icon: 'logo-instagram'
            }
        };

        const currentStepContent = stepContent[Object.keys(stepContent)[currentStep]] || stepContent.transcription;

        return (
            <View style={styles.stepContentContainer}>
                <View style={styles.stepContentHeader}>
                    <Ionicons name={currentStepContent.icon} size={32} color={colors.primary} />
                    <Text style={styles.stepContentTitle}>{currentStepContent.title}</Text>
                </View>
                <Text style={styles.stepContentDescription}>{currentStepContent.description}</Text>
                
                {isProcessing && (
                    <View style={styles.processingIndicator}>
                        <View style={styles.processingDots}>
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={[styles.dot, styles.dotActive]} />
                        </View>
                        <Text style={styles.processingText}>Bezig met verwerken...</Text>
                    </View>
                )}
            </View>
        );
    };

    /**
     * Render video info
     */
    const renderVideoInfo = () => {
        if (!reelUrl) return null;

        return (
            <View style={styles.videoInfoContainer}>
                <Text style={styles.videoInfoTitle}>Video Informatie</Text>
                <View style={styles.videoInfoRow}>
                    <Ionicons name="link" size={16} color={colors.textSecondary} />
                    <Text style={styles.videoInfoText} numberOfLines={1}>
                        {reelUrl}
                    </Text>
                </View>
                <View style={styles.videoInfoRow}>
                    <Ionicons name="logo-instagram" size={16} color={colors.textSecondary} />
                    <Text style={styles.videoInfoText}>Platform: {platform || 'Onbekend'}</Text>
                </View>
                <View style={styles.videoInfoRow}>
                    <Ionicons name="checkmark" size={16} color={colors.textSecondary} />
                    <Text style={styles.videoInfoText}>Dua's: {duaEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}</Text>
                </View>
                {instagramEnabled && (
                    <View style={styles.videoInfoRow}>
                        <Ionicons name="logo-instagram" size={16} color={colors.textSecondary} />
                        <Text style={styles.videoInfoText}>Instagram: Ingeschakeld</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Video Verwerken"
                        subtitle="Arabische video wordt vertaald"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Video Info */}
                        {renderVideoInfo()}
                        
                        {/* Step Indicator */}
                        {renderStepIndicator()}
                        
                        {/* Progress Bar */}
                        {renderProgressBar()}
                        
                        {/* Current Step Content */}
                        {renderCurrentStep()}
                        
                        {/* Back Button */}
                        {!isProcessing && !isCompleted && (
                            <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
                                <Ionicons name="arrow-back" size={20} color={colors.white} />
                                <Text style={styles.backButtonText}>Terug</Text>
                            </TouchableOpacity>
                        )}
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
    videoInfoTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.md,
    },
    videoInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.sm,
    },
    videoInfoText: {
        ...typography.body,
        color: colors.textSecondary,
        marginLeft: layout.spacing.sm,
        flex: 1,
    },
    
    // Step Indicator Styles
    stepIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: layout.spacing.xl,
        paddingHorizontal: layout.spacing.sm,
    },
    stepItem: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.sm,
        borderWidth: 2,
        borderColor: colors.border,
    },
    stepCircleActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    stepCircleCompleted: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    stepCircleUpcoming: {
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
    },
    stepText: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        textAlign: 'center',
        fontSize: 12,
    },
    stepTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    stepTextCompleted: {
        color: colors.success,
        fontWeight: '600',
    },
    stepTextUpcoming: {
        color: colors.textTertiary,
    },
    
    // Progress Bar Styles
    progressContainer: {
        width: '100%',
        marginBottom: layout.spacing.xl,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    progressText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: layout.spacing.sm,
    },
    
    // Step Content Styles
    stepContentContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.xl,
        marginBottom: layout.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    stepContentHeader: {
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
    },
    stepContentTitle: {
        ...typography.h2,
        color: colors.text,
        marginTop: layout.spacing.md,
        textAlign: 'center',
    },
    stepContentDescription: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    processingIndicator: {
        alignItems: 'center',
        marginTop: layout.spacing.lg,
    },
    processingDots: {
        flexDirection: 'row',
        marginBottom: layout.spacing.md,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.backgroundSecondary,
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: colors.primary,
    },
    processingText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '500',
    },
    
    // Error State Styles
    errorContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
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
    
    // Success State Styles
    successContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.success,
    },
    successTitle: {
        ...typography.h2,
        color: colors.success,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.md,
        textAlign: 'center',
    },
    successMessage: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: layout.spacing.xl,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
    },
    continueButtonText: {
        ...typography.button,
        color: colors.white,
    },
    
    // Back Button Styles
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
