/**
 * Processing Screen 4 UI Component
 * SCREEN 4: Processing error state - Error handling and retry options
 * PURE UI COMPONENT - Contains only the UI elements for Processing Screen 4
 * Modify this file to change the visual appearance of the Processing Screen 4
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

export function ProcessingScreen4UI({
    // Processing state
    reelUrl,
    platform,
    duaEnabled,
    instagramEnabled,
    instagramPostConfig,
    errorMessage,
    errorCode,
    errorDetails,
    failedStep,
    
    // Callback functions
    onRetry,
    onBack,
    onReportIssue,
    onContactSupport,
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
     * Render error animation
     */
    const renderErrorAnimation = () => {
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
            <View style={styles.errorContainer}>
                <Animated.View
                    style={[
                        styles.errorCircle,
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
                    <Ionicons name="warning" size={64} color={colors.error} />
                </Animated.View>
                <Text style={styles.errorTitle}>Verwerking Mislukt</Text>
                <Text style={styles.errorSubtext}>
                    Er is een fout opgetreden tijdens het verwerken van je video
                </Text>
            </View>
        );
    };

    /**
     * Render error details
     */
    const renderErrorDetails = () => {
        return (
            <View style={styles.errorDetailsContainer}>
                <Text style={styles.errorDetailsTitle">Foutinformatie</Text>
                <View style={styles.errorDetailsList}>
                    <View style={styles.errorDetailItem}>
                        <Text style={styles.errorDetailLabel">Foutcode:</Text>
                        <Text style={styles.errorDetailValue">{errorCode || 'ONBEKEND'}</Text>
                    </View>
                    <View style={styles.errorDetailItem}>
                        <Text style={styles.errorDetailLabel">Mislukte stap:</Text>
                        <Text style={styles.errorDetailValue">{failedStep || 'Onbekend'}</Text>
                    </View>
                    <View style={styles.errorDetailItem}>
                        <Text style={styles.errorDetailLabel">Platform:</Text>
                        <Text style={styles.errorDetailValue">{platform || 'Onbekend'}</Text>
                    </View>
                    {errorDetails && (
                        <View style={styles.errorDetailItem}>
                            <Text style={styles.errorDetailLabel">Details:</Text>
                            <Text style={styles.errorDetailValue">{errorDetails}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    /**
     * Render troubleshooting steps
     */
    const renderTroubleshooting = () => {
        return (
            <View style={styles.troubleshootingContainer}>
                <Text style={styles.troubleshootingTitle">Probleemoplossing</Text>
                <View style={styles.troubleshootingList}>
                    <View style={styles.troubleshootingItem}>
                        <View style={styles.troubleshootingIcon}>
                            <Ionicons name="refresh" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.troubleshootingText">
                            Probeer het opnieuw met een stabiele internetverbinding
                        </Text>
                    </View>
                    <View style={styles.troubleshootingItem}>
                        <View style={styles.troubleshootingIcon}>
                            <Ionicons name="link" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.troubleshootingText">
                            Controleer of de video-URL correct en toegankelijk is
                        </Text>
                    </View>
                    <View style={styles.troubleshootingItem}>
                        <View style={styles.troubleshootingIcon}>
                            <Ionicons name="time" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.troubleshootingText">
                            Wacht enkele minuten en probeer het opnieuw
                        </Text>
                    </View>
                    <View style={styles.troubleshootingItem}>
                        <View style={styles.troubleshootingIcon}>
                            <Ionicons name="settings" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.troubleshootingText">
                            Controleer je API-instellingen en configuratie
                        </Text>
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
                    style={styles.retryButton}
                    onPress={onRetry}
                    activeOpacity={0.8}
                >
                    <Ionicons name="refresh" size={20} color={colors.white} />
                    <Text style={styles.retryButtonText">Opnieuw Proberen</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.reportButton}
                    onPress={onReportIssue}
                    activeOpacity={0.8}
                >
                    <Ionicons name="flag" size={20} color={colors.error} />
                    <Text style={styles.reportButtonText">Rapporteer Probleem</Text>
                </TouchableOpacity>
                
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.supportButton}
                        onPress={onContactSupport}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="help-circle" size={18} color={colors.textSecondary} />
                        <Text style={styles.supportButtonText">Support</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
                        <Text style={styles.backButtonText">Terug</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                    style={styles.newButton}
                    onPress={onStartNew}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle" size={20} color={colors.primary} />
                    <Text style={styles.newButtonText">Nieuwe Video</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render contact information
     */
    const renderContactInfo = () => {
        return (
            <View style={styles.contactContainer}>
                <View style={styles.contactHeader}>
                    <Ionicons name="mail" size={20} color={colors.primary} />
                    <Text style={styles.contactTitle">Contactinformatie</Text>
                </View>
                <View style={styles.contactList}>
                    <Text style={styles.contactText">
                        • Neem contact op met support als het probleem aanhoudt
                    </Text>
                    <Text style={styles.contactText">
                        • Vermeld de foutcode: {errorCode || 'ONBEKEND'}
                    </Text>
                    <Text style={styles.contactText">
                        • Beschrijf de stappen die je hebt genomen
                    </Text>
                    <Text style={styles.contactText">
                        • We reageren meestal binnen 24 uur
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
                        title="Verwerking Mislukt"
                        subtitle="Er is een fout opgetreden"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Error Animation */}
                        {renderErrorAnimation()}
                        
                        {/* Error Details */}
                        {renderErrorDetails()}
                        
                        {/* Troubleshooting */}
                        {renderTroubleshooting()}
                        
                        {/* Contact Information */}
                        {renderContactInfo()}
                        
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
    
    // Error Animation Styles
    errorContainer: {
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl,
        marginBottom: layout.spacing.xl,
    },
    errorCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.error + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
    },
    errorTitle: {
        ...typography.h1,
        color: colors.error,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    errorSubtext: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    
    // Error Details Styles
    errorDetailsContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    errorDetailsTitle: {
        ...typography.h3,
        color: colors.error,
        marginBottom: layout.spacing.md,
        textAlign: 'center',
    },
    errorDetailsList: {
        gap: layout.spacing.sm,
    },
    errorDetailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: layout.spacing.xs,
    },
    errorDetailLabel: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '500',
        flex: 1,
    },
    errorDetailValue: {
        ...typography.body,
        color: colors.text,
        flex: 2,
        textAlign: 'right',
    },
    
    // Troubleshooting Styles
    troubleshootingContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    troubleshootingTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.lg,
        textAlign: 'center',
    },
    troubleshootingList: {
        gap: layout.spacing.md,
    },
    troubleshootingItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: layout.spacing.md,
    },
    troubleshootingIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    troubleshootingText: {
        ...typography.body,
        color: colors.text,
        flex: 1,
        lineHeight: 20,
    },
    
    // Contact Information Styles
    contactContainer: {
        width: '100%',
        backgroundColor: colors.primary + '10',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    contactTitle: {
        ...typography.h3,
        color: colors.primary,
        marginLeft: layout.spacing.sm,
    },
    contactList: {
        gap: layout.spacing.sm,
    },
    contactText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    
    // Action Buttons Styles
    actionsContainer: {
        width: '100%',
        gap: layout.spacing.md,
    },
    retryButton: {
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
    retryButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error + '20',
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        borderWidth: 2,
        borderColor: colors.error,
    },
    reportButtonText: {
        ...typography.button,
        color: colors.error,
    },
    actionRow: {
        flexDirection: 'row',
        gap: layout.spacing.md,
    },
    supportButton: {
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
    supportButtonText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    backButton: {
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
    backButtonText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '500',
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
