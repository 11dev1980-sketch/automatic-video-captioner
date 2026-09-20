/**
 * API Key Screen 1 UI Component
 * SCREEN 1: API Key input screen - Main API key configuration screen
 * PURE UI COMPONENT - Contains only the UI elements for API Key Screen 1
 * Modify this file to change the visual appearance of the API Key Screen 1
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
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

export function ApiKeyScreen1UI({
    // API Key state
    apiKey,
    apiKeyError,
    isValidatingApiKey,
    
    // Callback functions
    onApiKeyChange,
    onValidateApiKey,
    onBack,
    onShowHelp,
    
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
     * Render API key input section
     */
    const renderApiKeyInput = () => {
        return (
            <View style={styles.inputContainer}>
                <View style={styles.inputHeader}>
                    <Ionicons name="key" size={24} color={colors.primary} />
                    <Text style={styles.inputTitle}>API Key</Text>
                </View>
                <TextInput
                    style={[
                        styles.apiKeyInput,
                        apiKeyError && styles.apiKeyInputError
                    ]}
                    value={apiKey}
                    onChangeText={onApiKeyChange}
                    placeholder="Voer je Supadata API key in..."
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline={true}
                    numberOfLines={3}
                />
                {apiKeyError && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="warning" size={16} color={colors.error} />
                        <Text style={styles.errorText}>{apiKeyError}</Text>
                    </View>
                )}
            </View>
        );
    };

    /**
     * Render information section
     */
    const renderInformation = () => {
        return (
            <View style={styles.informationContainer}>
                <Text style={styles.informationTitle}>Waarom een API Key?</Text>
                <View style={styles.informationList}>
                    <View style={styles.informationItem}>
                        <View style={styles.informationIcon}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        </View>
                        <Text style={styles.informationText">
                            Toegang tot geavanceerde transcribeer functies
                        </Text>
                    </View>
                    <View style={styles.informationItem}>
                        <View style={styles.informationIcon}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        </View>
                        <Text style={styles.informationText">
                            Hogere nauwkeurigheid voor Arabische audio
                        </Text>
                    </View>
                    <View style={styles.informationItem}>
                        <View style={styles.informationIcon}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        </View>
                        <Text style={styles.informationText">
                            Ondersteuning voor meerdere video platformen
                        </Text>
                    </View>
                    <View style={styles.informationItem}>
                        <View style={styles.informationIcon}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        </View>
                        <Text style={styles.informationText">
                            Directe integratie met Instagram uploads
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    /**
     * Render security information
     */
    const renderSecurityInfo = () => {
        return (
            <View style={styles.securityContainer}>
                <View style={styles.securityHeader}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                    <Text style={styles.securityTitle}>Veiligheid & Privacy</Text>
                </View>
                <Text style={styles.securityText}>
                    Je API key wordt versleuteld opgeslagen op je apparaat en alleen gebruikt voor transcribeer verzoeken. We delen je key nooit met derden.
                </Text>
                <View style={styles.securityFeatures}>
                    <View style={styles.securityFeature}>
                        <Ionicons name="lock-closed" size={16} color={colors.primary} />
                        <Text style={styles.securityFeatureText}>Lokale opslag</Text>
                    </View>
                    <View style={styles.securityFeature}>
                        <Ionicons name="shield" size={16} color={colors.primary} />
                        <Text style={styles.securityFeatureText}>End-to-end versleuteling</Text>
                    </View>
                    <View style={styles.securityFeature}>
                        <Ionicons name="eye-off" size={16} color={colors.primary} />
                        <Text style={styles.securityFeatureText}>Niet zichtbaar in logs</Text>
                    </View>
                </View>
            </View>
        );
    };

    /**
     * Render help section
     */
    const renderHelpSection = () => {
        return (
            <View style={styles.helpContainer}>
                <Text style={styles.helpTitle}>Hulp nodig?</Text>
                <View style={styles.helpOptions}>
                    <TouchableOpacity
                        style={styles.helpOption}
                        onPress={onShowHelp}
                        activeOpacity={0.8}
                    >
                        <View style={styles.helpOptionIcon}>
                            <Ionicons name="document-text" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.helpOptionContent}>
                            <Text style={styles.helpOptionTitle}>API Key Gids</Text>
                            <Text style={styles.helpOptionDescription">
                                Stap-voor-stap instructies
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.helpOption}
                        onPress={() => {
                            Alert.alert(
                                'API Key Support',
                                'Neem contact op met support@arabic-transcriber.com voor hulp bij het verkrijgen van je API key.'
                            );
                        }}
                        activeOpacity={0.8}
                    >
                        <View style={styles.helpOptionIcon}>
                            <Ionicons name="mail" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.helpOptionContent}>
                            <Text style={styles.helpOptionTitle}>Contact Support</Text>
                            <Text style={styles.helpOptionDescription">
                                support@arabic-transcriber.com
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
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
                    style={[
                        styles.validateButton,
                        (!apiKey || isValidatingApiKey) && styles.validateButtonDisabled
                    ]}
                    onPress={onValidateApiKey}
                    disabled={!apiKey || isValidatingApiKey}
                    activeOpacity={0.8}
                >
                    {isValidatingApiKey ? (
                        <>
                            <View style={styles.loadingSpinner}>
                                <Ionicons name="sync" size={20} color={colors.white} />
                            </View>
                            <Text style={styles.validateButtonText}>Valideren...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                            <Text style={styles.validateButtonText}>API Key Valideren</Text>
                        </>
                    )}
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

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="API Key Instellen"
                        subtitle="Configureer je Supadata API key"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* API Key Input */}
                        {renderApiKeyInput()}
                        
                        {/* Information */}
                        {renderInformation()}
                        
                        {/* Security Info */}
                        {renderSecurityInfo()}
                        
                        {/* Help Section */}
                        {renderHelpSection()}
                        
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
    
    // API Key Input Styles
    inputContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
        marginBottom: layout.spacing.md,
    },
    inputTitle: {
        ...typography.h3,
        color: colors.text,
    },
    apiKeyInput: {
        ...typography.body,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        color: colors.text,
        fontSize: 16,
        fontFamily: 'monospace',
        textAlignVertical: 'top',
        minHeight: 80,
    },
    apiKeyInputError: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
        marginTop: layout.spacing.sm,
    },
    errorText: {
        ...typography.bodySmall,
        color: colors.error,
        flex: 1,
    },
    
    // Information Styles
    informationContainer: {
        width: '100%',
        backgroundColor: colors.primary + '10',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    informationTitle: {
        ...typography.h3,
        color: colors.primary,
        marginBottom: layout.spacing.lg,
        textAlign: 'center',
    },
    informationList: {
        gap: layout.spacing.md,
    },
    informationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: layout.spacing.sm,
    },
    informationIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    informationText: {
        ...typography.body,
        color: colors.text,
        flex: 1,
        lineHeight: 22,
    },
    
    // Security Styles
    securityContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    securityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
        marginBottom: layout.spacing.md,
    },
    securityTitle: {
        ...typography.h3,
        color: colors.text,
    },
    securityText: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: layout.spacing.lg,
    },
    securityFeatures: {
        gap: layout.spacing.sm,
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
    },
    securityFeatureText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    
    // Help Styles
    helpContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    helpTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.lg,
    },
    helpOptions: {
        gap: layout.spacing.md,
    },
    helpOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    helpOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    helpOptionContent: {
        flex: 1,
    },
    helpOptionTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    helpOptionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    
    // Action Buttons Styles
    actionsContainer: {
        width: '100%',
        gap: layout.spacing.md,
    },
    validateButton: {
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
    validateButtonDisabled: {
        opacity: 0.6,
    },
    loadingSpinner: {
        marginRight: layout.spacing.xs,
    },
    validateButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
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
