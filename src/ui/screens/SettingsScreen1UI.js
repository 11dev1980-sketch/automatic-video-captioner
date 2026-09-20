/**
 * Settings Screen 1 UI Component
 * SCREEN 1: Settings screen - Main app settings and preferences
 * PURE UI COMPONENT - Contains only the UI elements for Settings Screen 1
 * Modify this file to change the visual appearance of the Settings Screen 1
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

export function SettingsScreen1UI({
    // Settings state
    notificationsEnabled,
    darkModeEnabled,
    autoSaveEnabled,
    soundEnabled,
    vibrationEnabled,
    language,
    fontSize,
    
    // User info
    userName,
    userEmail,
    isPremiumUser,
    
    // Callback functions
    onNotificationsToggle,
    onDarkModeToggle,
    onAutoSaveToggle,
    onSoundToggle,
    onVibrationToggle,
    onLanguageChange,
    onFontSizeChange,
    onEditProfile,
    onManageSubscription,
    onPrivacySettings,
    onAbout,
    onHelp,
    onFeedback,
    onRateApp,
    onShareApp,
    onLogout,
    onDeleteAccount,
    
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
     * Render user profile section
     */
    const renderUserProfile = () => {
        return (
            <View style={styles.profileContainer}>
                <View style={styles.profileHeader}>
                    <View style={styles.profileAvatar}>
                        <Ionicons name="person" size={32} color={colors.white} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userName || 'Gebruiker'}</Text>
                        <Text style={styles.profileEmail}>{userEmail || 'geen@email.com'}</Text>
                        {isPremiumUser && (
                            <View style={styles.premiumBadge}>
                                <Ionicons name="star" size={12} color={colors.white} />
                                <Text style={styles.premiumText}>Premium</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={onEditProfile}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>
                
                {!isPremiumUser && (
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={onManageSubscription}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="diamond" size={20} color={colors.white} />
                        <Text style={styles.upgradeButtonText}>Upgrade naar Premium</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    /**
     * Render app preferences
     */
    const renderAppPreferences = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>App Voorkeuren</Text>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="notifications" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Notificaties</Text>
                        </View>
                        <Text style={styles.settingDescription">
                            Ontvang notificaties voor transcripties en updates
                        </Text>
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
                        <Text style={styles.settingDescription">
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
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="save" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Automatisch Opslaan</Text>
                        </View>
                        <Text style={styles.settingDescription}>
                            Sla werk automatisch op tijdens het bewerken
                        </Text>
                    </View>
                    <Switch
                        value={autoSaveEnabled}
                        onValueChange={onAutoSaveToggle}
                        trackColor={{ false: colors.border, true: colors.primary + '30' }}
                        thumbColor={autoSaveEnabled ? colors.primary : colors.textTertiary}
                    />
                </View>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="volume-high" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Geluid</Text>
                        </View>
                        <Text style={styles.settingDescription}>
                            Speel geluidseffecten af voor acties
                        </Text>
                    </View>
                    <Switch
                        value={soundEnabled}
                        onValueChange={onSoundToggle}
                        trackColor={{ false: colors.border, true: colors.primary + '30' }}
                        thumbColor={soundEnabled ? colors.primary : colors.textTertiary}
                    />
                </View>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingContent}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="phone-portrait" size={20} color={colors.primary} />
                            <Text style={styles.settingTitle}>Trilling</Text>
                        </View>
                        <Text style={styles.settingDescription">
                            Tril bij belangrijke notificaties
                        </Text>
                    </View>
                    <Switch
                        value={vibrationEnabled}
                        onValueChange={onVibrationToggle}
                        trackColor={{ false: colors.border, true: colors.primary + '30' }}
                        thumbColor={vibrationEnabled ? colors.primary : colors.textTertiary}
                    />
                </View>
            </View>
        );
    };

    /**
     * Render display settings
     */
    const renderDisplaySettings = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Weergave</Text>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onLanguageChange}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="language" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Taal</Text>
                        <Text style={styles.actionButtonDescription">
                            {language || 'Nederlands'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onFontSizeChange}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="text" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Lettergrootte</Text>
                        <Text style={styles.actionButtonDescription">
                            {fontSize || 'Normaal'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render account settings
     */
    const renderAccountSettings = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Account</Text>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onManageSubscription}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="card" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Abonnement</Text>
                        <Text style={styles.actionButtonDescription">
                            {isPremiumUser ? 'Premium Actief' : 'Gratis Versie'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onPrivacySettings}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Privacy</Text>
                        <Text style={styles.actionButtonDescription">
                            Beheer je privacy-instellingen
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={onDeleteAccount}
                    activeOpacity={0.8}
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render support section
     */
    const renderSupportSection = () => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Support</Text>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onHelp}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="help-circle" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Help & Support</Text>
                        <Text style={styles.actionButtonDescription">
                            Veelgestelde vragen en hulp
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onFeedback}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="chatbubble" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Feedback</Text>
                        <Text style={styles.actionButtonDescription">
                            Deel je mening en suggesties
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onRateApp}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="star" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Beoordeel App</Text>
                        <Text style={styles.actionButtonDescription">
                            Geef ons een rating in de app store
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onShareApp}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="share-social" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Deel App</Text>
                        <Text style={styles.actionButtonDescription">
                            Deel met vrienden en collega's
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onAbout}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonIcon}>
                        <Ionicons name="information-circle" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonTitle}>Over</Text>
                        <Text style={styles.actionButtonDescription">
                            Versie en ontwikkelaarsinformatie
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render logout button
     */
    const renderLogoutButton = () => {
        return (
            <View style={styles.logoutContainer}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => {
                        Alert.alert(
                            'Uitloggen',
                            'Weet je zeker dat je wilt uitloggen?',
                            [
                                { text: 'Annuleren', style: 'cancel' },
                                { text: 'Uitloggen', style: 'destructive', onPress: onLogout }
                            ]
                        );
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out" size={20} color={colors.error} />
                    <Text style={styles.logoutButtonText}>Uitloggen</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Instellingen"
                        subtitle="App voorkeuren en account"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* User Profile */}
                        {renderUserProfile()}
                        
                        {/* App Preferences */}
                        {renderAppPreferences()}
                        
                        {/* Display Settings */}
                        {renderDisplaySettings()}
                        
                        {/* Account Settings */}
                        {renderAccountSettings()}
                        
                        {/* Support Section */}
                        {renderSupportSection()}
                        
                        {/* Logout Button */}
                        {renderLogoutButton()}
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
    
    // Profile Styles
    profileContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.xs,
    },
    profileEmail: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: layout.spacing.sm,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warning,
        paddingHorizontal: layout.spacing.sm,
        paddingVertical: layout.spacing.xs,
        borderRadius: layout.radius.sm,
        alignSelf: 'flex-start',
        gap: layout.spacing.xs,
    },
    premiumText: {
        ...typography.bodySmall,
        color: colors.white,
        fontWeight: '600',
    },
    editProfileButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.warning,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.lg,
        borderRadius: layout.radius.md,
        gap: layout.spacing.sm,
    },
    upgradeButtonText: {
        ...typography.button,
        color: colors.white,
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
    
    // Logout Styles
    logoutContainer: {
        width: '100%',
        marginTop: layout.spacing.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error + '10',
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.lg,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    logoutButtonText: {
        ...typography.button,
        color: colors.error,
    },
});
