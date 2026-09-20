/**
 * Configure Screen 1 UI Component
 * SCREEN 1: Configuration screen - Main app configuration and settings
 * PURE UI COMPONENT - Contains only the UI elements for Configure Screen 1
 * Modify this file to change the visual appearance of the Configure Screen 1
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
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

export function ConfigureScreen1UI({
    // Configuration state
    duaEnabled,
    instagramEnabled,
    autoSaveEnabled,
    notificationsEnabled,
    darkModeEnabled,
    
    // Instagram config
    instagramConfigured,
    instagramUsername,
    
    // API Key state
    apiKeyConfigured,
    
    // Callback functions
    onDuaToggle,
    onInstagramToggle,
    onAutoSaveToggle,
    onNotificationsToggle,
    onDarkModeToggle,
    onConfigureInstagram,
    onConfigureApiKey,
    onResetSettings,
    onExportSettings,
    onImportSettings,
    
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
     * Render transcription settings
     */
    const renderTranscriptionSettings = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Transcriptie Instellingen</Text>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="heart" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Dua's Inschakelen</Text>
                        </View>
                        <Text style={styles.settingDescription}>Voeg automatisch Islamitische dua's toe aan transcripties</Text>
                    </View>
                    <Switch
                        value={duaEnabled}
                        onValueChange={onDuaToggle}
                        trackColor={{ false: colors.border, true: colors.primary + '30' }}
                        thumbColor={duaEnabled ? colors.primary : colors.textTertiary}
                    />
                </View>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="save" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Automatisch Opslaan</Text>
                        </View>
                        <Text style={styles.settingDescription}>
                            Sla transcripties automatisch op na voltooiing
                        </Text>
                    </View>
                    <Switch
                        value={autoSaveEnabled}
                        onValueChange={onAutoSaveToggle}
                        trackColor={{ false: colors.border, true: colors.primary + '30' }}
                        thumbColor={autoSaveEnabled ? colors.primary : colors.textTertiary}
                    />
                </View>
            </View>
        );
    };

    /**
     * Render Instagram settings
     */
    const renderInstagramSettings = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Instagram Integratie</Text>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="camera" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Instagram Upload</Text>
                        </View>
                        <Text style={styles.settingDescription}>
                            Upload ondertitels direct naar Instagram
                        </Text>
                        {instagramConfigured && (
                            <Text style={styles.settingStatus}>Geconfigureerd als @{instagramUsername}</Text>
                        )}
                    </View>
                    <Switch
                        value={instagramEnabled}
                        onValueChange={onInstagramToggle}
                        trackColor={{ false: colors.border, true: colors.primary + '30' }}
                        thumbColor={instagramEnabled ? colors.primary : colors.textTertiary}
                    />
                </View>
                
                {instagramEnabled && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onConfigureInstagram}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionButtonIcon}>
                            <Ionicons name="settings" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.actionButtonContent}>
                            <Text style={styles.actionButtonTitle">
                                {instagramConfigured ? 'Instagram Configuratie Bewerken' : 'Instagram Configureren'}
                            </Text>
                            <Text style={styles.actionButtonDescription">
                                {instagramConfigured ? 'Wijzig je Instagram instellingen' : 'Stel je Instagram account in'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    /**
     * Render app settings
     */
    const renderAppSettings = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>App Instellingen</Text>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="notifications" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Notificaties</Text>
                        </View>
                        <Text style={styles.settingDescription}>Ontvang notificaties bij voltooide transcripties</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={onNotificationsToggle}
                        trackColor={{ false: colors.border, true: colors.primary + '30' }}
                        thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
                    />
                </View>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="moon" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Donkere Modus</Text>
                        </View>
                        <Text style={styles.settingDescription}>
                            Gebruik donker thema voor de app
                        </Text>
                    </View>
                    <Switch
                        value={darkModeEnabled}
                        onValueChange={onDarkModeToggle}
                        trackColor={{ false: colors.border, true: colors.primary + '30' }}
                        thumbColor={darkModeEnabled ? colors.primary : colors.textTertiary}
                    />
                </View>
            </View>
        );
    };

    /**
     * Render API settings
     */
    const renderApiSettings = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>API Instellingen</Text>
                
                <View style={styles.apiStatusContainer}>
                    <View style={styles.apiStatusHeader}>
                        <Ionicons name="key" size={20} color={apiKeyConfigured ? colors.success : colors.warning} />
                        <Text style={styles.apiStatusTitle}>API Key Status</Text>
                    </View>
                    <Text style={[
                        styles.apiStatusText,
                        { color: apiKeyConfigured ? colors.success : colors.warning }
                    ]}>
                        {apiKeyConfigured ? 'Geconfigureerd en actief' : 'Niet geconfigureerd'}
                    </Text>
                </View>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onConfigureApiKey}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="key" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle">
                            {apiKeyConfigured ? 'API Key Bewerken' : 'API Key Configureren'}
                        </Text>
                        <Text style={styles.actionButtonDescription}>
                            {apiKeyConfigured ? 'Wijzig je Supadata API key' : 'Stel je Supadata API key in'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render data management
     */
    const renderDataManagement = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Data Beheer</Text>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onExportSettings}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="download" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Exporteer Instellingen</Text>
                        <Text style={styles.actionButtonDescription">
                            Exporteer je configuratie naar een bestand
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onImportSettings}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="upload" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Importeer Instellingen</Text>
                        <Text style={styles.actionButtonDescription">
                            Importeer configuratie uit een bestand
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={() => {
                        Alert.alert(
                            'Instellingen Resetten',
                            'Weet je zeker dat je alle instellingen wilt resetten naar de standaardwaarden? Deze actie kan niet ongedaan worden gemaakt.',
                            [
                                { text: 'Annuleren', style: 'cancel' },
                                { text: 'Resetten', style: 'destructive', onPress: onResetSettings }
                            ]
                        );
                    }}
                    activeOpacity={0.8}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Configuratie"
                        subtitle="App instellingen en voorkeuren"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Transcription Settings */}
                        {renderTranscriptionSettings()}
                        
                        {/* Instagram Settings */}
                        {renderInstagramSettings()}
                        
                        {/* App Settings */}
                        {renderAppSettings()}
                        
                        {/* API Settings */}
                        {renderApiSettings()}
                        
                        {/* Data Management */}
                        {renderDataManagement()}
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
    sectionContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: layout.spacing.lg,
    },
    
    // Setting Item Styles
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSecondary,
    },
    settingContent: {
        flex: 1,
        marginRight: layout.spacing.md,
    },
    settingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
        marginBottom: layout.spacing.xs,
    },
    settingTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
    },
    settingDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    settingStatus: {
        ...typography.bodySmall,
        color: colors.success,
        marginTop: layout.spacing.xs,
        fontWeight: '500',
    },
    
    // API Status Styles
    apiStatusContainer: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        marginBottom: layout.spacing.md,
    },
    apiStatusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
        marginBottom: layout.spacing.xs,
    },
    apiStatusTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
    },
    apiStatusText: {
        ...typography.bodySmall,
        fontWeight: '500',
    },
    
    // Action Button Styles
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        marginBottom: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dangerButton: {
        backgroundColor: colors.error + '10',
        borderColor: colors.error + '30',
    },
    actionButtonIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    dangerButtonIcon: {
        backgroundColor: colors.error + '10',
    },
    actionButtonContent: {
        flex: 1,
    },
    actionButtonTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    actionButtonDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    dangerButtonText: {
        color: colors.error,
    },
    dangerButtonDescription: {
        color: colors.error + '80',
    },
});
