/**
 * Upload Screen UI Component
 * PURE UI COMPONENT - Contains only the UI elements for UploadScreen
 * Modify this file to change the visual appearance of the UploadScreen
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
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

export function UploadScreenUI({
    // State
    videoUrl,
    isLoading,
    error,
    
    // Callback functions
    onUrlChange,
    onClearUrl,
    onUpload,
    onNavigateToProcessing,
    
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
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Video URL</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="link" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.urlInput}
                        value={videoUrl}
                        onChangeText={onUrlChange}
                        placeholder="Voer video-URL in (Instagram, TikTok, YouTube)"
                        placeholderTextColor={colors.textSecondary}
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                        editable={!isLoading}
                    />
                    {videoUrl.length > 0 && (
                        <TouchableOpacity onPress={onClearUrl} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                
                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
                
                <TouchableOpacity
                    style={[
                        styles.uploadButton,
                        (!videoUrl.trim() || isLoading) && styles.uploadButtonDisabled
                    ]}
                    onPress={onUpload}
                    disabled={!videoUrl.trim() || isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload" size={24} color={colors.white} />
                            <Text style={styles.uploadButtonText}>Video Uploaden</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render supported platforms
     */
    const renderSupportedPlatforms = () => {
        const platforms = [
            { name: 'Instagram', icon: 'logo-instagram', color: colors.error },
            { name: 'TikTok', icon: 'logo-tiktok', color: colors.black },
            { name: 'YouTube', icon: 'logo-youtube', color: colors.error },
        ];

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ondersteunde Platforms</Text>
                <View style={styles.platformsContainer}>
                    {platforms.map((platform, index) => (
                        <View key={index} style={styles.platformItem}>
                            <Ionicons 
                                name={platform.icon} 
                                size={32} 
                                color={platform.color} 
                            />
                            <Text style={styles.platformName}>{platform.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    /**
     * Render upload instructions
     */
    const renderInstructions = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructies</Text>
                <View style={styles.instructionsContainer}>
                    <View style={styles.instructionItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <Text style={styles.instructionText}>
                            Kopieer de video-URL van de ondersteunde platforms
                        </Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <Text style={styles.instructionText">
                            Plak de URL in het invoerveld hierboven
                        </Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <Text style={styles.instructionText}>
                            Klik op "Video Uploaden" om te beginnen
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
                        title="Video Uploaden"
                        subtitle="Upload video voor verwerking"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.contentWrapper}>
                        {/* URL Input Section */}
                        {renderUrlInput()}
                        
                        {/* Supported Platforms */}
                        {renderSupportedPlatforms()}
                        
                        {/* Instructions */}
                        {renderInstructions()}
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
    section: {
        width: '100%',
        marginBottom: layout.spacing.xl,
    },
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: layout.spacing.lg,
        textAlign: 'center',
    },
    
    // URL Input Styles
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: layout.spacing.lg,
        minHeight: 56,
        marginBottom: layout.spacing.md,
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
    uploadButton: {
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
    },
    uploadButtonDisabled: {
        opacity: 0.6,
    },
    uploadButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: layout.spacing.md,
        textAlign: 'center',
    },
    
    // Platforms Styles
    platformsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: layout.spacing.lg,
    },
    platformItem: {
        alignItems: 'center',
    },
    platformName: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: layout.spacing.sm,
    },
    
    // Instructions Styles
    instructionsContainer: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: layout.spacing.md,
    },
    instructionText: {
        ...typography.body,
        color: colors.text,
        marginLeft: layout.spacing.md,
        flex: 1,
        lineHeight: 22,
    },
});
