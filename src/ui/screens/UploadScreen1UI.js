/**
 * Upload Screen 1 UI Component
 * SCREEN 1: URL input screen - Initial upload screen with URL input field
 * PURE UI COMPONENT - Contains only the UI elements for Upload Screen 1
 * Modify this file to change the visual appearance of the Upload Screen 1
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

export function UploadScreen1UI({
    // Upload state
    url,
    setUrl,
    isUrlValid,
    platform,
    instagramEnabled,

    // Callback functions
    onUpload,
    onValidateUrl,
    onBack,
    onToggleInstagram,
    
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
     * Render URL input section
     */
    const renderUrlInput = () => {
        return (
            <View style={styles.urlInputContainer}>
                <View style={styles.inputHeader}>
                    <Ionicons name="link" size={24} color={colors.primary} />
                    <Text style={styles.inputTitle}>Video URL</Text>
                </View>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={[
                            styles.urlInput,
                            isUrlValid === false && styles.urlInputError
                        ]}
                        value={url}
                        onChangeText={setUrl}
                        placeholder="Voer video URL in..."
                        placeholderTextColor={colors.textTertiary}
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                    />
                    {url.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => setUrl('')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
                {isUrlValid === false && (
                    <Text style={styles.errorMessage}>
                        Ongeldige URL. Voer een geldige video URL in.
                    </Text>
                )}
                {isUrlValid === true && (
                    <Text style={styles.successMessage}>
                        Geldige URL gedetecteerd!
                    </Text>
                )}
            </View>
        );
    };

    /**
     * Render platform information
     */
    const renderPlatformInfo = () => {
        return (
            <View style={styles.platformContainer}>
                <View style={styles.platformHeader}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={styles.platformTitle}>Ondersteunde Platforms</Text>
                </View>
                <View style={styles.platformList}>
                    <View style={styles.platformItem}>
                        <Ionicons name="logo-youtube" size={24} color={colors.primary} />
                        <Text style={styles.platformName}>YouTube</Text>
                    </View>
                    <View style={styles.platformItem}>
                        <Ionicons name="logo-instagram" size={24} color={colors.primary} />
                        <Text style={styles.platformName}>Instagram</Text>
                    </View>
                    <View style={styles.platformItem}>
                        <Ionicons name="logo-tiktok" size={24} color={colors.primary} />
                        <Text style={styles.platformName}>TikTok</Text>
                    </View>
                    <View style={styles.platformItem}>
                        <Ionicons name="logo-twitter" size={24} color={colors.primary} />
                        <Text style={styles.platformName}>Twitter</Text>
                    </View>
                </View>
            </View>
        );
    };

    /**
     * Render options
     */
    const renderOptions = () => {
        return (
            <View style={styles.optionsContainer}>
                <Text style={styles.optionsTitle}>Opties</Text>
                
                <TouchableOpacity
                    style={[
                        styles.optionItem,
                        instagramEnabled && styles.optionItemActive
                    ]}
                    onPress={onToggleInstagram}
                    activeOpacity={0.8}
                >
                    <View style={styles.optionIcon}>
                        <Ionicons 
                            name="camera" 
                            size={20} 
                            color={instagramEnabled ? colors.primary : colors.textTertiary} 
                        />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={[
                            styles.optionTitle,
                            instagramEnabled && styles.optionTitleActive
                        ]}>
                            Instagram Upload
                        </Text>
                        <Text style={styles.optionDescription}>
                            Upload resultaten naar Instagram
                        </Text>
                    </View>
                    <View style={[
                        styles.toggleSwitch,
                        instagramEnabled && styles.toggleSwitchActive
                    ]}>
                        <View style={[
                            styles.toggleCircle,
                            instagramEnabled && styles.toggleCircleActive
                        ]} />
                    </View>
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
                    <Ionicons name="bulb" size={20} color={colors.primary} />
                    <Text style={styles.tipsTitle}>Tips</Text>
                </View>
                <View style={styles.tipsList}>
                    <Text style={styles.tipText}>
                        • Zorg dat de video publiek toegankelijk is
                    </Text>
                    <Text style={styles.tipText}>
                        • Langere video's duren langer om te verwerken
                    </Text>
                    <Text style={styles.tipText}>
                        • Controleer de URL op spelfouten
                    </Text>
                    <Text style={styles.tipText}>
                        • Gebruik een stabiele internetverbinding
                    </Text>
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
                        styles.uploadButton,
                        (!url || isUrlValid === false) && styles.uploadButtonDisabled
                    ]}
                    onPress={onUpload}
                    disabled={!url || isUrlValid === false}
                    activeOpacity={0.8}
                >
                    <Ionicons name="cloud-upload" size={20} color={colors.white} />
                    <Text style={styles.uploadButtonText}>Video Uploaden</Text>
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
                        title="Video Uploaden"
                        subtitle="Voer de video URL in om te beginnen"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* URL Input */}
                        {renderUrlInput()}
                        
                        {/* Platform Information */}
                        {renderPlatformInfo()}
                        
                        {/* Options */}
                        {renderOptions()}
                        
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
    
    // URL Input Styles
    urlInputContainer: {
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
        marginBottom: layout.spacing.md,
    },
    inputTitle: {
        ...typography.h3,
        color: colors.text,
        marginLeft: layout.spacing.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    urlInput: {
        flex: 1,
        ...typography.body,
        color: colors.text,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        paddingHorizontal: layout.spacing.md,
        paddingVertical: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 50,
    },
    urlInputError: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    clearButton: {
        position: 'absolute',
        right: layout.spacing.md,
        padding: layout.spacing.xs,
    },
    errorMessage: {
        ...typography.bodySmall,
        color: colors.error,
        marginTop: layout.spacing.sm,
    },
    successMessage: {
        ...typography.bodySmall,
        color: colors.success,
        marginTop: layout.spacing.sm,
    },
    
    // Platform Information Styles
    platformContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    platformHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
    },
    platformTitle: {
        ...typography.h3,
        color: colors.text,
        marginLeft: layout.spacing.sm,
    },
    platformList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: layout.spacing.lg,
    },
    platformItem: {
        alignItems: 'center',
        gap: layout.spacing.xs,
    },
    platformName: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    
    // Options Styles
    optionsContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionsTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.lg,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.md,
        borderRadius: layout.radius.md,
        backgroundColor: colors.backgroundSecondary,
        marginBottom: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionItemActive: {
        backgroundColor: colors.primary + '10',
        borderColor: colors.primary,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionContent: {
        flex: 1,
        marginLeft: layout.spacing.md,
    },
    optionTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: 2,
    },
    optionTitleActive: {
        color: colors.primary,
    },
    optionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    toggleSwitch: {
        width: 48,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleSwitchActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    toggleCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.textTertiary,
    },
    toggleCircleActive: {
        backgroundColor: colors.white,
        alignSelf: 'flex-end',
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
    uploadButton: {
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
    uploadButtonDisabled: {
        backgroundColor: colors.backgroundSecondary,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        elevation: 0,
    },
    uploadButtonText: {
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
