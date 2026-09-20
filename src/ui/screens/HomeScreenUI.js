/**
 * Home Screen UI Component
 * PURE UI COMPONENT - Contains only the UI elements for HomeScreen
 * Modify this file to change the visual appearance of the HomeScreen
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
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

export function HomeScreenUI({
    // State
    quickStartUrl,
    urlError,
    isLoading,
    
    // Callback functions
    onQuickStartUrlChange,
    onClearUrl,
    onQuickStart,
    onNavigateToProcess,
    onNavigateToDownload,
    onNavigateToLibrary,
    onNavigateToHistory,
    onNavigateToCaptionEditor,
    
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
            <View style={styles.quickStartSection}>
                <Text style={styles.sectionTitle}>Snel Starten</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="link" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.urlInput}
                        value={quickStartUrl}
                        onChangeText={onQuickStartUrlChange}
                        placeholder="Voer Instagram, TikTok of YouTube URL in"
                        placeholderTextColor={colors.textSecondary}
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                        editable={!isLoading}
                    />
                    {quickStartUrl.length > 0 && (
                        <TouchableOpacity onPress={onClearUrl} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                
                {urlError && (
                    <Text style={styles.errorText}>{urlError}</Text>
                )}
                
                <TouchableOpacity
                    style={[
                        styles.quickStartButton,
                        (!quickStartUrl.trim() || isLoading) && styles.quickStartButtonDisabled
                    ]}
                    onPress={onQuickStart}
                    disabled={!quickStartUrl.trim() || isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <Text style={styles.buttonText}>Verwerken...</Text>
                    ) : (
                        <>
                            <Ionicons name="text" size={24} color={colors.white} />
                            <Text style={styles.buttonText}>Ondertitels maken</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render navigation cards
     */
    const renderNavigationCards = () => {
        return (
            <View style={styles.navigationSection}>
                <Text style={styles.sectionTitle}>Functies</Text>
                
                <View style={styles.cardsContainer}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={onNavigateToCaptionEditor}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="create" size={32} color={colors.primary} />
                        </View>
                        <Text style={styles.cardTitle}>Ondertitels</Text>
                        <Text style={styles.cardDescription}>Maak en bewerk ondertitels voor video's</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={onNavigateToDownload}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="download" size={32} color={colors.secondary} />
                        </View>
                        <Text style={styles.cardTitle}>Download</Text>
                        <Text style={styles.cardDescription}>Download verwerkte video's en ondertitels</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={onNavigateToLibrary}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="folder" size={32} color={colors.accent} />
                        </View>
                        <Text style={styles.cardTitle}>Bibliotheek</Text>
                        <Text style={styles.cardDescription}>Beheer je video collectie</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={onNavigateToProcess}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="videocam" size={32} color={colors.warning} />
                        </View>
                        <Text style={styles.cardTitle}>Video Verwerken</Text>
                        <Text style={styles.cardDescription}>Upload en verwerk video's</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={onNavigateToHistory}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="time" size={32} color={colors.info} />
                        </View>
                        <Text style={styles.cardTitle}>Geschiedenis</Text>
                        <Text style={styles.cardDescription}>Bekijk verwerkingsgeschiedenis</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /**
     * Render info section
     */
    const renderInfoSection = () => {
        return (
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Over deze app</Text>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color={colors.primary} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Ondersteunde Platforms</Text>
                        <Text style={styles.infoText}>
                            • Instagram Reels{'\n'}
                            • TikTok video's{'\n'}
                            • YouTube video's{'\n'}
                            • Directe videolinks
                        </Text>
                    </View>
                </View>
                
                <View style={styles.infoCard}>
                    <Ionicons name="language" size={24} color={colors.secondary} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Taal Ondersteuning</Text>
                        <Text style={styles.infoText}>
                            Automatische transcriptie en vertaling naar meerdere talen
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Arabic Video Translator"
                        subtitle="Vertaal Arabische video's naar Nederlands"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.contentWrapper}>
                        {/* Quick Start Section */}
                        {renderQuickStart()}
                        
                        {/* Navigation Cards */}
                        {renderNavigationCards()}
                        
                        {/* Info Section */}
                        {renderInfoSection()}
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
    quickStartSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: layout.spacing.xxl,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        paddingHorizontal: layout.spacing.lg,
        minHeight: 56,
        marginBottom: layout.spacing.md,
        width: '100%',
        maxWidth: 600,
    },
    inputIcon: {
        marginRight: layout.spacing.md,
    },
    urlInput: {
        flex: 1,
        height: 56,
        ...typography.body,
        color: colors.text,
        fontSize: 16,
    },
    clearButton: {
        padding: layout.spacing.sm,
    },
    errorText: {
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
        minHeight: 56,
        gap: layout.spacing.md,
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
        elevation: 8,
        width: '100%',
        maxWidth: 400,
    },
    quickStartButtonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    
    // Navigation Cards Styles
    navigationSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: layout.spacing.xxl,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: layout.spacing.lg,
        width: '100%',
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        width: '100%',
        maxWidth: 280,
        minHeight: 160,
        alignItems: 'center',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    cardTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    cardDescription: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    
    // Info Section Styles
    infoSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: layout.spacing.xl,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.md,
        width: '100%',
        maxWidth: 600,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: colors.border,
    },
    infoContent: {
        flex: 1,
        marginLeft: layout.spacing.md,
    },
    infoTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.sm,
    },
    infoText: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
});
