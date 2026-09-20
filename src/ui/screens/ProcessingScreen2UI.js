/**
 * Processing Screen 2 UI Component
 * SCREEN 2: Processing with progress - Active processing state with progress indicators
 * PURE UI COMPONENT - Contains only the UI elements for Processing Screen 2
 * Modify this file to change the visual appearance of the Processing Screen 2
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

export function ProcessingScreen2UI({
    // Processing state
    reelUrl,
    platform,
    duaEnabled,
    instagramEnabled,
    instagramPostConfig,
    processingStep,
    progress,
    currentStepName,
    estimatedTimeRemaining,
    
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
     * Render active processing animation
     */
    const renderActiveProcessing = () => {
        const animatedValue = new Animated.Value(0);
        
        React.useEffect(() => {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                ])
            );
            animation.start();
            return () => animation.stop();
        }, []);

        return (
            <View style={styles.processingContainer}>
                <Animated.View
                    style={[
                        styles.processingCircle,
                        {
                            transform: [
                                {
                                    scale: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 1.2],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Ionicons name="settings" size={48} color={colors.primary} />
                </Animated.View>
                <Text style={styles.processingTitle}>Bezig met verwerken...</Text>
                <Text style={styles.currentStepText}>{currentStepName}</Text>
                <Text style={styles.estimatedTimeText}>
                    Resterende tijd: {estimatedTimeRemaining || 'Berekenen...'}
                </Text>
            </View>
        );
    };

    /**
     * Render progress bar
     */
    const renderProgressBar = () => {
        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Voortgang</Text>
                    <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.progressBar}>
                    <View 
                        style={[
                            styles.progressFill,
                            { width: `${progress}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressSubtext}>
                    Stap {processingStep} van 5 voltooid
                </Text>
            </View>
        );
    };

    /**
     * Render active processing steps
     */
    const renderActiveSteps = () => {
        const steps = [
            { icon: 'download', title: 'Video Downloaden', status: processingStep > 1 ? 'completed' : processingStep === 1 ? 'active' : 'pending' },
            { icon: 'mic', title: 'Audio Transcriberen', status: processingStep > 2 ? 'completed' : processingStep === 2 ? 'active' : 'pending' },
            { icon: 'language', title: 'Arabisch Vertalen', status: processingStep > 3 ? 'completed' : processingStep === 3 ? 'active' : 'pending' },
            { icon: 'create', title: 'Ondertitels Genereren', status: processingStep > 4 ? 'completed' : processingStep === 4 ? 'active' : 'pending' },
            { icon: 'checkmark-circle', title: 'Voltooid', status: processingStep === 5 ? 'active' : 'pending' },
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
                                {step.status === 'active' ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Ionicons 
                                        name={step.icon} 
                                        size={20} 
                                        color={
                                            step.status === 'completed' ? colors.white :
                                            step.status === 'active' ? colors.primary :
                                            colors.textTertiary
                                        } 
                                    />
                                )}
                            </View>
                            <Text style={[
                                styles.stepText,
                                step.status === 'completed' && styles.stepTextCompleted,
                                step.status === 'active' && styles.stepTextActive
                            ]}>
                                {step.title}
                            </Text>
                            {step.status === 'active' && (
                                <ActivityIndicator size="small" color={colors.primary} />
                            )}
                            {step.status === 'completed' && (
                                <Ionicons name="checkmark" size={16} color={colors.success} />
                            )}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    /**
     * Render processing details
     */
    const renderProcessingDetails = () => {
        return (
            <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Verwerkingsdetails</Text>
                <View style={styles.detailsList}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Platform:</Text>
                        <Text style={styles.detailValue}>{platform || 'Onbekend'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Dua's:</Text>
                        <Text style={styles.detailValue}>{duaEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}</Text>
                    </View>
                    {instagramEnabled && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Instagram:</Text>
                            <Text style={styles.detailValue}>Ingeschakeld</Text>
                        </View>
                    )}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Huidige stap:</Text>
                        <Text style={styles.detailValue}>{currentStepName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Voortgang:</Text>
                        <Text style={styles.detailValue}>{Math.round(progress)}%</Text>
                    </View>
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
                    <Text style={styles.cancelButtonText}>Verwerking Annuleren</Text>
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
     * Render status information
     */
    const renderStatusInfo = () => {
        return (
            <View style={styles.statusContainer}>
                <View style={styles.statusHeader}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={styles.statusTitle}>Statusinformatie</Text>
                </View>
                <View style={styles.statusList}>
                    <Text style={styles.statusText}>
                        • De video wordt momenteel verwerkt
                    </Text>
                    <Text style={styles.statusText}>
                        • Houd de app open voor beste resultaten
                    </Text>
                    <Text style={styles.statusText}>
                        • Je kunt annuleren als je wilt stoppen
                    </Text>
                    <Text style={styles.statusText}>
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
                        subtitle="Bezig met verwerken..."
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Active Processing Animation */}
                        {renderActiveProcessing()}
                        
                        {/* Progress Bar */}
                        {renderProgressBar()}
                        
                        {/* Active Processing Steps */}
                        {renderActiveSteps()}
                        
                        {/* Processing Details */}
                        {renderProcessingDetails()}
                        
                        {/* Status Information */}
                        {renderStatusInfo()}
                        
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
    
    // Processing Animation Styles
    processingContainer: {
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl,
        marginBottom: layout.spacing.xl,
    },
    processingCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
    },
    processingTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    currentStepText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '500',
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    estimatedTimeText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    
    // Progress Bar Styles
    progressContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    progressTitle: {
        ...typography.h3,
        color: colors.text,
    },
    progressPercentage: {
        ...typography.h3,
        color: colors.primary,
        fontWeight: '600',
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: layout.spacing.sm,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    progressSubtext: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    
    // Active Steps Styles
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
    
    // Details Styles
    detailsContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    detailsTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.md,
        textAlign: 'center',
    },
    detailsList: {
        gap: layout.spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: layout.spacing.xs,
    },
    detailLabel: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    detailValue: {
        ...typography.body,
        color: colors.text,
        flex: 1,
        textAlign: 'right',
        marginLeft: layout.spacing.md,
    },
    
    // Status Information Styles
    statusContainer: {
        width: '100%',
        backgroundColor: colors.primary + '10',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    statusTitle: {
        ...typography.h3,
        color: colors.primary,
        marginLeft: layout.spacing.sm,
    },
    statusList: {
        gap: layout.spacing.sm,
    },
    statusText: {
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
