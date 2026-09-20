/**
 * Caption Editor Screen 2 UI Component
 * SCREEN 2: Video loaded state with "Ondertitels Bewerken" button and success message
 * PURE UI COMPONENT - Contains only the UI elements for CaptionEditor Screen 2
 * Modify this file to change the visual appearance of the CaptionEditor Screen 2
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
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Video component with fallback for web compatibility
let Video;
try {
  Video = require('react-native-video').default;
} catch (error) {
  
  Video = null;
}
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');

export function CaptionEditorScreen2UI({
    // Video state
    videoRef,
    videoUrl,
    extractedVideoUrl,
    isLoading,
    videoLoaded,
    videoError,
    isPlaying,
    duration,
    position,
    
    // Input state
    quickStartUrl,
    
    // Callback functions
    onVideoUrlChange,
    onClearVideoUrl,
    onLoadVideo,
    onPlayPause,
    onPlaybackStatusUpdate,
    onEditCaptions,
    
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
     * Render video preview section
     */
    const renderVideoPreview = () => {
        return (
            <View style={styles.videoSection}>
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: extractedVideoUrl || videoUrl }}
                        style={styles.video}
                        resizeMode="contain"
                        shouldPlay={false}
                        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                        useNativeControls={false}
                    />
                    
                    {/* Video Controls Overlay */}
                    <TouchableOpacity
                        style={styles.playPauseOverlay}
                        onPress={onPlayPause}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={48}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                </View>
                
                {/* Video Info */}
                <View style={styles.videoInfo}>
                    <Text style={styles.videoUrl} numberOfLines={1}>
                        {extractedVideoUrl || videoUrl}
                    </Text>
                    <Text style={styles.videoDuration}>
                        Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </Text>
                </View>
            </View>
        );
    };

    /**
     * Render success message
     */
    const renderSuccessMessage = () => {
        return (
            <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                <Text style={styles.successTitle}>Video Geladen</Text>
                <Text style={styles.successSubtitle}>
                    Klik op 'Ondertitels Bewerken' om verder te gaan
                </Text>
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
                    onPress={onEditCaptions}
                    activeOpacity={0.8}
                >
                    <Ionicons name="create" size={24} color={colors.white} />
                    <Text style={styles.primaryButtonText}>Ondertitels Bewerken</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onClearVideoUrl}
                    activeOpacity={0.8}
                >
                    <Ionicons name="refresh" size={20} color={colors.textSecondary} />
                    <Text style={styles.secondaryButtonText}>Andere Video Laden</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render next steps
     */
    const renderNextSteps = () => {
        return (
            <View style={styles.nextStepsContainer}>
                <Text style={styles.nextStepsTitle}>Volgende Stappen</Text>
                <View style={styles.stepsList}>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>Ondertitels automatisch genereren</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepText}>Arabisch naar Nederlands vertalen</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.stepText}>Ondertitels bewerken en aanpassen</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.stepText}>Exporteren of delen</Text>
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
                        title="Video Geladen"
                        subtitle="Klaar voor ondertitel bewerking"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.contentWrapper}>
                        {/* Video Preview */}
                        {renderVideoPreview()}
                        
                        {/* Success Message */}
                        {renderSuccessMessage()}
                        
                        {/* Action Buttons */}
                        {renderActions()}
                        
                        {/* Next Steps */}
                        {renderNextSteps()}
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
    
    // Video Section
    videoSection: {
        width: '100%',
        marginBottom: layout.spacing.xl,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    playPauseOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    videoInfo: {
        marginTop: layout.spacing.md,
        paddingHorizontal: layout.spacing.sm,
    },
    videoUrl: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    videoDuration: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        textAlign: 'center',
        marginTop: layout.spacing.xs,
    },
    
    // Success Message
    successContainer: {
        alignItems: 'center',
        paddingVertical: layout.spacing.xl,
        marginBottom: layout.spacing.xl,
    },
    successTitle: {
        ...typography.h2,
        color: colors.success,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    successSubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    
    // Action Buttons
    actionsContainer: {
        width: '100%',
        gap: layout.spacing.md,
        marginBottom: layout.spacing.xl,
    },
    primaryButton: {
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
        backgroundColor: colors.surface,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.lg,
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: layout.spacing.sm,
    },
    secondaryButtonText: {
        ...typography.button,
        color: colors.textSecondary,
        fontSize: 16,
    },
    
    // Next Steps
    nextStepsContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    nextStepsTitle: {
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
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        ...typography.button,
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    stepText: {
        ...typography.body,
        color: colors.text,
        flex: 1,
    },
});
