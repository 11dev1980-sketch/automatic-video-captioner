/**
 * Processing Screen 3 UI Component
 * SCREEN 3: Processing completed - Success state with completed animation and results
 * PURE UI COMPONENT - Contains only the UI elements for Processing Screen 3
 * Modify this file to change the visual appearance of the Processing Screen 3
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

export function ProcessingScreen3UI({
    // Processing state
    reelUrl,
    platform,
    duaEnabled,
    instagramEnabled,
    instagramPostConfig,
    processingResults,
    transcriptionData,
    captionData,
    processingTime,
    
    // Callback functions
    onViewResults,
    onEditCaptions,
    onShareResults,
    onSaveResults,
    onBack,
    onStartNew,
    
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
     * Render success animation
     */
    const renderSuccessAnimation = () => {
        const animatedValue = new Animated.Value(0);
        
        React.useEffect(() => {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ])
            );
            animation.start();
            return () => animation.stop();
        }, []);

        return (
            <View style={styles.successContainer}>
                <Animated.View
                    style={[
                        styles.successCircle,
                        {
                            transform: [
                                {
                                    scale: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 1.1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                </Animated.View>
                <Text style={styles.successTitle}>Verwerking Voltooid!</Text>
                <Text style={styles.successSubtext}>
                    Je video is succesvol verwerkt in {processingTime || 'onbekende tijd'}
                </Text>
            </View>
        );
    };

    /**
     * Render completed steps
     */
    const renderCompletedSteps = () => {
        const steps = [
            { icon: 'download', title: 'Video Downloaden', status: 'completed' },
            { icon: 'mic', title: 'Audio Transcriberen', status: 'completed' },
            { icon: 'language', title: 'Arabisch Vertalen', status: 'completed' },
            { icon: 'create', title: 'Ondertitels Genereren', status: 'completed' },
            { icon: 'checkmark-circle', title: 'Voltooid', status: 'completed' },
        ];

        return (
            <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Verwerkte Stappen</Text>
                <View style={styles.stepsList}>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <View style={styles.stepIconCompleted}>
                                <Ionicons name={step.icon} size={20} color={colors.white} />
                            </View>
                            <Text style={styles.stepTextCompleted}>{step.title}</Text>
                            <Ionicons name="checkmark" size={16} color={colors.success} />
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    /**
     * Render results summary
     */
    const renderResultsSummary = () => {
        return (
            <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Resultaten Overzicht</Text>
                <View style={styles.resultsList}>
                    <View style={styles.resultItem}>
                        <View style={styles.resultIcon}>
                            <Ionicons name="videocam" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.resultContent}>
                            <Text style={styles.resultLabel}>Platform</Text>
                            <Text style={styles.resultValue}>{platform || 'Onbekend'}</Text>
                        </View>
                    </View>
                    <View style={styles.resultItem}>
                        <View style={styles.resultIcon}>
                            <Ionicons name="document-text" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.resultContent}>
                            <Text style={styles.resultLabel}>Transcriptie</Text>
                            <Text style={styles.resultValue}>{transcriptionData?.length || 0} segmenten</Text>
                        </View>
                    </View>
                    <View style={styles.resultItem}>
                        <View style={styles.resultIcon}>
                            <Ionicons name="chatbubble" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.resultContent}>
                            <Text style={styles.resultLabel}>Ondertitels</Text>
                            <Text style={styles.resultValue}>{captionData?.length || 0} ondertitels</Text>
                        </View>
                    </View>
                    {duaEnabled && (
                        <View style={styles.resultItem}>
                            <View style={styles.resultIcon}>
                                <Ionicons name="heart" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.resultContent}>
                                <Text style={styles.resultLabel}>Dua's</Text>
                                <Text style={styles.resultValue}>Ingeschakeld</Text>
                            </View>
                        </View>
                    )}
                    {instagramEnabled && (
                        <View style={styles.resultItem}>
                            <View style={styles.resultIcon}>
                                <Ionicons name="camera" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.resultContent}>
                                <Text style={styles.resultLabel}>Instagram</Text>
                                <Text style={styles.resultValue}>Gereed voor upload</Text>
                            </View>
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
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onViewResults}
                    activeOpacity={0.8}
                >
                    <Ionicons name="eye" size={20} color={colors.white} />
                    <Text style={styles.primaryButtonText}>Bekijk Resultaten</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onEditCaptions}
                    activeOpacity={0.8}
                >
                    <Ionicons name="create" size={20} color={colors.primary} />
                    <Text style={styles.secondaryButtonText}>Bewerk Ondertitels</Text>
                </TouchableOpacity>
                
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.tertiaryButton}
                        onPress={onShareResults}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="share" size={18} color={colors.textSecondary} />
                        <Text style={styles.tertiaryButtonText}>Delen</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.tertiaryButton}
                        onPress={onSaveResults}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="download" size={18} color={colors.textSecondary} />
                        <Text style={styles.tertiaryButtonText}>Opslaan</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                    <Text style={styles.backButtonText}>Terug</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.newButton}
                    onPress={onStartNew}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle" size={20} color={colors.primary} />
                    <Text style={styles.newButtonText}>Nieuwe Video Verwerken</Text>
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
                    <Text style={styles.tipsTitle}>Volgende Stappen</Text>
                </View>
                <View style={styles.tipsList}>
                    <Text style={styles.tipText}>
                        • Bekijk de resultaten om de transcriptie te controleren
                    </Text>
                    <Text style={styles.tipText}>
                        • Bewerk ondertitels voor betere timing en vertaling
                    </Text>
                    <Text style={styles.tipText}>
                        • Deel je resultaten met anderen
                    </Text>
                    <Text style={styles.tipText}>
                        • Sla de resultaten op voor later gebruik
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
                        title="Verwerking Voltooid"
                        subtitle="Je video is succesvol verwerkt!"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Success Animation */}
                        {renderSuccessAnimation()}
                        
                        {/* Completed Steps */}
                        {renderCompletedSteps()}
                        
                        {/* Results Summary */}
                        {renderResultsSummary()}
                        
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
    
    // Success Animation Styles
    successContainer: {
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl,
        marginBottom: layout.spacing.xl,
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
    },
    successTitle: {
        ...typography.h1,
        color: colors.success,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    successSubtext: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    
    // Completed Steps Styles
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
    stepIconCompleted: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepTextCompleted: {
        ...typography.body,
        color: colors.success,
        fontWeight: '500',
        flex: 1,
    },
    
    // Results Summary Styles
    resultsContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    resultsTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.lg,
        textAlign: 'center',
    },
    resultsList: {
        gap: layout.spacing.sm,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.md,
        paddingVertical: layout.spacing.xs,
    },
    resultIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultContent: {
        flex: 1,
    },
    resultLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    resultValue: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
    },
    
    // Tips Styles
    tipsContainer: {
        width: '100%',
        backgroundColor: colors.success + '10',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.success + '30',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    tipsTitle: {
        ...typography.h3,
        color: colors.success,
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
        borderWidth: 2,
        borderColor: colors.primary,
    },
    secondaryButtonText: {
        ...typography.button,
        color: colors.primary,
    },
    actionRow: {
        flexDirection: 'row',
        gap: layout.spacing.md,
    },
    tertiaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundSecondary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.md,
        borderRadius: layout.radius.md,
        gap: layout.spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tertiaryButtonText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '500',
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
    newButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success + '20',
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        borderWidth: 2,
        borderColor: colors.success,
    },
    newButtonText: {
        ...typography.button,
        color: colors.success,
    },
});
