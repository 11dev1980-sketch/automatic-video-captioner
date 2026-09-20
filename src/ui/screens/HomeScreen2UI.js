/**
 * Home Screen 2 UI Component
 * SCREEN 2: Home screen with modal states - When modals are active (API key, Instagram config, etc.)
 * PURE UI COMPONENT - Contains only the UI elements for Home Screen 2
 * Modify this file to change the visual appearance of the Home Screen 2
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
    Modal,
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

export function HomeScreen2UI({
    // Modal state
    showApiKeyModal,
    showInstagramConfigModal,
    showTranscriptionResultsModal,
    
    // API Key modal state
    apiKey,
    apiKeyError,
    isValidatingApiKey,
    
    // Instagram config modal state
    instagramUsername,
    instagramPassword,
    instagramConfigError,
    isConfiguringInstagram,
    
    // Transcription results modal state
    transcriptionResults,
    
    // Base state (inherited from Screen 1)
    userName,
    quickStartUrl,
    urlError,
    recentResults,
    
    // Callback functions
    onQuickStartUrlChange,
    onQuickStart,
    onNavigateToHistory,
    onSelectRecentResult,
    
    // Modal callback functions
    onCloseApiKeyModal,
    onApiKeyChange,
    onValidateApiKey,
    onCloseInstagramConfigModal,
    onInstagramUsernameChange,
    onInstagramPasswordChange,
    onConfigureInstagram,
    onCloseTranscriptionResultsModal,
    onSelectTranscriptionResult,
    
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
     * Render API Key modal
     */
    const renderApiKeyModal = () => {
        if (!showApiKeyModal) return null;

        return (
            <Modal
                visible={showApiKeyModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={onCloseApiKeyModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>API Key Instellen</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onCloseApiKeyModal}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.modalDescription}>Voer je Supadata API key in om de transcribeer functies te gebruiken</Text></Text>
                        
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.apiKeyInput}
                                value={apiKey}
                                onChangeText={onApiKeyChange}
                                placeholder="API Key..."
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry={true}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {apiKeyError && (
                                <Text style={styles.errorText}>{apiKeyError}</Text>
                            )}
                        </View>
                        
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                (!apiKey || isValidatingApiKey) && styles.actionButtonDisabled
                            ]}
                            onPress={onValidateApiKey}
                            disabled={!apiKey || isValidatingApiKey}
                            activeOpacity={0.8}
                        >
                            {isValidatingApiKey ? (
                                <Text style={styles.actionButtonText}>Valideren...</Text>
                            ) : (
                                <Text style={styles.actionButtonText}>API Key Valideren</Text>
                            )}
                        </TouchableOpacity>
                        
                        <View style={styles.infoContainer}>
                            <Ionicons name="information-circle" size={20} color={colors.primary} />
                            <Text style={styles.infoText">
                                Je API key wordt veilig opgeslagen en alleen gebruikt voor transcribeer verzoeken
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        );
    };

    /**
     * Render Instagram config modal
     */
    const renderInstagramConfigModal = () => {
        if (!showInstagramConfigModal) return null;

        return (
            <Modal
                visible={showInstagramConfigModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={onCloseInstagramConfigModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Instagram Configuratie</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onCloseInstagramConfigModal}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.modalDescription}>Configureer je Instagram account om ondertitels direct te uploaden</Text>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Gebruikersnaam</Text>
                            <TextInput
                                style={styles.input}
                                value={instagramUsername}
                                onChangeText={onInstagramUsernameChange}
                                placeholder="Instagram gebruikersnaam"
                                placeholderTextColor={colors.textTertiary}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Wachtwoord</Text>
                            <TextInput
                                style={styles.input}
                                value={instagramPassword}
                                onChangeText={onInstagramPasswordChange}
                                placeholder="Instagram wachtwoord"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry={true}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        
                        {instagramConfigError && (
                            <Text style={styles.errorText}>{instagramConfigError}</Text>
                        )}
                        
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                (!instagramUsername || !instagramPassword || isConfiguringInstagram) && styles.actionButtonDisabled
                            ]}
                            onPress={onConfigureInstagram}
                            disabled={!instagramUsername || !instagramPassword || isConfiguringInstagram}
                            activeOpacity={0.8}
                        >
                            {isConfiguringInstagram ? (
                                <Text style={styles.actionButtonText}>Configureren...</Text>
                            ) : (
                                <Text style={styles.actionButtonText}>Instagram Configureren</Text>
                            )}
                        </TouchableOpacity>
                        
                        <View style={styles.warningContainer}>
                            <Ionicons name="warning" size={20} color={colors.warning} />
                            <Text style={styles.warningText">
                                Je inloggegevens worden versleuteld opgeslagen. We raden aan om een aparte Instagram account voor deze app te gebruiken.
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        );
    };

    /**
     * Render transcription results modal
     */
    const renderTranscriptionResultsModal = () => {
        if (!showTranscriptionResultsModal) return null;

        return (
            <Modal
                visible={showTranscriptionResultsModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={onCloseTranscriptionResultsModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Transcriptie Resultaten</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onCloseTranscriptionResultsModal}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.modalContent}>
                        {transcriptionResults.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
                                <Text style={styles.emptyText}>Geen transcriptie resultaten</Text>
                                <Text style={styles.emptySubtext">
                                    Start met transcriberen om resultaten te zien
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.resultsList}>
                                {transcriptionResults.map((result) => (
                                    <TouchableOpacity
                                        key={result.id}
                                        style={styles.resultCard}
                                        onPress={() => onSelectTranscriptionResult(result)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.resultHeader}>
                                            <Text style={styles.resultTitle} numberOfLines={1}>
                                                {result.videoName || `Video - ${new Date(result.timestamp).toLocaleDateString()}`}
                                            </Text>
                                            <Text style={styles.resultDate}>
                                                {new Date(result.timestamp).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View style={styles.resultMeta}>
                                            <Text style={styles.resultPlatform}>{result.platform || 'Web'}</Text>
                                            <Text style={styles.resultStatus}>{result.status || 'Voltooid'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        );
    };

    /**
     * Render dimmed background when modal is active
     */
    const renderDimmedBackground = () => {
        if (!showApiKeyModal && !showInstagramConfigModal && !showTranscriptionResultsModal) {
            return null;
        }

        return (
            <View style={styles.dimmedBackground}>
                {/* Base home screen content (dimmed) */}
                <View style={[styles.container, { opacity: 0.3 }]}>
                    <View style={styles.headerWrapper}>
                        <PageHeader
                            title={userName ? `Welkom terug, ${userName}` : 'Welkom'}
                            subtitle="Arabische Video Vertaler & Ondertitel Editor"
                        />
                    </View>
                    
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.contentWrapper}>
                            {/* Quick start section (dimmed) */}
                            <View style={styles.quickStartContainer}>
                                <Text style={styles.sectionTitle}>Snel Starten</Text>
                                <TextInput
                                    style={styles.quickStartInput}
                                    placeholder="Plak video-URL hier..."
                                    placeholderTextColor={colors.textTertiary}
                                    value={quickStartUrl}
                                    onChangeText={onQuickStartUrlChange}
                                    editable={false}
                                />
                                <TouchableOpacity
                                    style={styles.quickStartButton}
                                    disabled={true}
                                >
                                    <Text style={styles.quickStartButtonText">Start Vertalen</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                {/* Dimmed background when modal is active */}
                {renderDimmedBackground()}
                
                {/* Only show active content when no modal is open */}
                {!showApiKeyModal && !showInstagramConfigModal && !showTranscriptionResultsModal && (
                    <>
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
                                <View style={styles.quickStartContainer}>
                                    <Text style={styles.sectionTitle}>Snel Starten</Text>
                                    <Text style={styles.quickStartDescription">
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
                                            <Text style={styles.quickStartButtonText">Start Vertalen</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </>
                )}
            </View>
            
            {/* Modals */}
            {renderApiKeyModal()}
            {renderInstagramConfigModal()}
            {renderTranscriptionResultsModal()}
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
    
    // Dimmed Background
    dimmedBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    
    // Section Styles
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: layout.spacing.lg,
        textAlign: 'center',
    },
    
    // Quick Start Styles (simplified for modal state)
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
    
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.lg,
        paddingVertical: layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        ...typography.h2,
        color: colors.text,
    },
    closeButton: {
        padding: layout.spacing.sm,
    },
    modalContent: {
        flex: 1,
        padding: layout.spacing.lg,
    },
    modalDescription: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: layout.spacing.xl,
        lineHeight: 22,
    },
    
    // Input Styles for Modals
    inputContainer: {
        marginBottom: layout.spacing.lg,
    },
    inputLabel: {
        ...typography.body,
        color: colors.text,
        marginBottom: layout.spacing.sm,
        fontWeight: '500',
    },
    input: {
        ...typography.body,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
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
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginTop: layout.spacing.sm,
    },
    
    // Action Button Styles
    actionButton: {
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.lg,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
    },
    actionButtonDisabled: {
        opacity: 0.6,
    },
    actionButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    
    // Info/Warning Containers
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.primary + '10',
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        gap: layout.spacing.sm,
    },
    infoText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 20,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.warning + '10',
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        gap: layout.spacing.sm,
    },
    warningText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 20,
    },
    
    // Transcription Results Styles
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl,
    },
    emptyText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.sm,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
        lineHeight: 20,
    },
    resultsList: {
        gap: layout.spacing.md,
    },
    resultCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: layout.spacing.sm,
    },
    resultTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        flex: 1,
        marginRight: layout.spacing.sm,
    },
    resultDate: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    resultMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultPlatform: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
    resultStatus: {
        ...typography.bodySmall,
        color: colors.success,
        fontWeight: '500',
    },
});
