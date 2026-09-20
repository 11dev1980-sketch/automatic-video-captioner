/**
 * Caption Editor Screen 3 UI Component
 * SCREEN 3: Caption editor workspace - Full caption editing interface
 * PURE UI COMPONENT - Contains only the UI elements for CaptionEditor Screen 3
 * Modify this file to change the visual appearance of the CaptionEditor Screen 3
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
    TextInput,
    ScrollView,
    Alert,
    Dimensions,
    Platform,
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
import Slider from '@react-native-community/slider';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');

export function CaptionEditorScreen3UI({
    // Video state
    videoRef,
    videoUri,
    videoName,
    videoId,
    isPlaying,
    position,
    duration,
    isLoading,
    error,
    isSeeking,
    videoWidth,
    videoHeight,
    
    // Transcription state
    isTranscribing,
    transcriptionError,
    
    // Caption editor state
    captions,
    selectedCaption,
    editingText,
    editingStartTime,
    editingEndTime,
    captionStyles,
    
    // Callback functions
    onPlayPause,
    onSeek,
    onPlaybackStatusUpdate,
    onTranscribe,
    onSelectCaption,
    onEditCaption,
    onSaveCaption,
    onDeleteCaption,
    onAddCaption,
    onUpdateTime,
    onExport,
    onBack,
    
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
     * Render video player section
     */
    const renderVideoPlayer = () => {
        if (isLoading) {
            return (
                <View style={styles.videoContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Video wordt geladen...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.videoContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.error} />
                    <Text style={styles.errorText}>Video kon niet worden geladen</Text>
                </View>
            );
        }

        return (
            <View style={styles.videoContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={styles.video}
                    resizeMode="contain"
                    shouldPlay={false}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    useNativeControls={false}
                />
                
                {/* Video Controls Overlay */}
                <View style={styles.videoControlsOverlay}>
                    <TouchableOpacity
                        style={styles.playPauseButton}
                        onPress={onPlayPause}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={32}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /**
     * Render timeline slider
     */
    const renderTimeline = () => {
        return (
            <View style={styles.timelineContainer}>
                <Text style={styles.timeText}>{formatDuration(position)}</Text>
                <Slider
                    style={styles.timelineSlider}
                    minimumValue={0}
                    maximumValue={duration || 100}
                    value={position}
                    onSlidingComplete={onSeek}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.backgroundSecondary}
                    thumbStyle={styles.sliderThumb}
                />
                <Text style={styles.timeText}>{formatDuration(duration)}</Text>
            </View>
        );
    };

    /**
     * Render current caption overlay
     */
    const renderCurrentCaption = () => {
        const currentCaption = captions.find(caption => 
            position >= caption.startTime && position <= caption.endTime
        );

        if (!currentCaption) return null;

        const style = captionStyles[currentCaption.style] || captionStyles.default;

        return (
            <View style={styles.currentCaptionContainer}>
                <Text style={[styles.currentCaptionText, style]}>
                    {currentCaption.text}
                </Text>
            </View>
        );
    };

    /**
     * Render caption list
     */
    const renderCaptionList = () => {
        if (captions.length === 0) {
            return (
                <View style={styles.emptyCaptionContainer}>
                    <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
                    <Text style={styles.emptyCaptionText}>Geen ondertitels beschikbaar</Text>
                    <Text style={styles.emptyCaptionSubtext}>
                        Klik op 'Transcribeer Video' om ondertitels te genereren
                    </Text>
                    <TouchableOpacity
                        style={styles.transcribeButton}
                        onPress={onTranscribe}
                        disabled={isTranscribing}
                        activeOpacity={0.8}
                    >
                        {isTranscribing ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <>
                                <Ionicons name="mic" size={20} color={colors.white} />
                                <Text style={styles.transcribeButtonText}>Transcribeer Video</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.captionListContainer}>
                <View style={styles.captionListHeader}>
                    <Text style={styles.captionListTitle}>Ondertitels</Text>
                    <View style={styles.captionListActions}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={onAddCaption}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={20} color={colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.exportButton}
                            onPress={onExport}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="download" size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <ScrollView style={styles.captionScrollView} showsVerticalScrollIndicator={false}>
                    {captions.map((caption) => (
                        <TouchableOpacity
                            key={caption.id}
                            style={[
                                styles.captionItem,
                                selectedCaption?.id === caption.id && styles.captionItemSelected
                            ]}
                            onPress={() => onSelectCaption(caption)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.captionItemContent}>
                                <View style={styles.captionItemHeader}>
                                    <Text style={styles.captionItemTime}>
                                        {formatDuration(caption.startTime)} - {formatDuration(caption.endTime)}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => onDeleteCaption(caption.id)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="trash" size={16} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.captionItemText}>{caption.text}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    /**
     * Render caption editor
     */
    const renderCaptionEditor = () => {
        if (!selectedCaption) {
            return (
                <View style={styles.editorContainer}>
                    <Text style={styles.editorPlaceholder}>
                        Selecteer een ondertitel om te bewerken
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.editorContainer}>
                <View style={styles.editorHeader}>
                    <Text style={styles.editorTitle}>Bewerk Ondertitel</Text>
                    <TouchableOpacity
                        style={styles.closeEditorButton}
                        onPress={() => onSelectCaption(null)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.editorContent}>
                    <View style={styles.timeInputContainer}>
                        <View style={styles.timeInputRow}>
                            <Text style={styles.timeInputLabel}>Start tijd:</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={editingStartTime}
                                onChangeText={setEditingStartTime}
                                placeholder="0.0"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.timeInputRow}>
                            <Text style={styles.timeInputLabel}>Eind tijd:</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={editingEndTime}
                                onChangeText={setEditingEndTime}
                                placeholder="0.0"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TextInput
                        style={styles.textInput}
                        value={editingText}
                        onChangeText={setEditingText}
                        placeholder="Ondertitel tekst..."
                        multiline
                        textAlignVertical="top"
                    />

                    <View style={styles.editorActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => onSelectCaption(null)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelButtonText}>Annuleren</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={onSaveCaption}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.saveButtonText}>Opslaan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    /**
     * Format duration helper
     */
    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Ondertitel Editor"
                        subtitle={videoName || "Video bewerken"}
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.contentWrapper}>
                        {/* Video Player Section */}
                        <View style={styles.videoSection}>
                            {renderVideoPlayer()}
                            {renderTimeline()}
                            {renderCurrentCaption()}
                        </View>
                        
                        {/* Caption List Section */}
                        {renderCaptionList()}
                        
                        {/* Caption Editor Section */}
                        {renderCaptionEditor()}
                        
                        {/* Transcription Status */}
                        {transcriptionError && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={colors.error} />
                                <Text style={styles.errorText}>{transcriptionError}</Text>
                            </View>
                        )}
                        
                        {/* Navigation Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={onBack}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={20} color={colors.white} />
                            <Text style={styles.backButtonText}>Terug</Text>
                        </TouchableOpacity>
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
    
    // Video Section Styles
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoControlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playPauseButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: layout.spacing.md,
    },
    errorText: {
        ...typography.body,
        color: colors.error,
        marginTop: layout.spacing.md,
        textAlign: 'center',
    },
    
    // Timeline Styles
    timelineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: layout.spacing.md,
        paddingHorizontal: layout.spacing.md,
    },
    timelineSlider: {
        flex: 1,
        marginHorizontal: layout.spacing.md,
    },
    sliderThumb: {
        width: 20,
        height: 20,
        backgroundColor: colors.primary,
    },
    timeText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        minWidth: 45,
        textAlign: 'center',
    },
    
    // Current Caption Styles
    currentCaptionContainer: {
        position: 'absolute',
        bottom: layout.spacing.lg,
        left: layout.spacing.lg,
        right: layout.spacing.lg,
        alignItems: 'center',
    },
    currentCaptionText: {
        ...typography.h3,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: colors.white,
        paddingHorizontal: layout.spacing.md,
        paddingVertical: layout.spacing.sm,
        borderRadius: layout.radius.md,
    },
    
    // Caption List Styles
    captionListContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    captionListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    captionListTitle: {
        ...typography.h3,
        color: colors.text,
    },
    captionListActions: {
        flexDirection: 'row',
        gap: layout.spacing.sm,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exportButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captionScrollView: {
        maxHeight: 300,
    },
    captionItem: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        marginBottom: layout.spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    captionItemSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    captionItemContent: {
        flex: 1,
    },
    captionItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: layout.spacing.sm,
    },
    captionItemTime: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    deleteButton: {
        padding: layout.spacing.xs,
    },
    captionItemText: {
        ...typography.body,
        color: colors.text,
    },
    
    // Empty Caption State
    emptyCaptionContainer: {
        width: '100%',
        alignItems: 'center',
        padding: layout.spacing.xl,
    },
    emptyCaptionText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    emptyCaptionSubtext: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
        marginBottom: layout.spacing.xl,
    },
    transcribeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.xl,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
    },
    transcribeButtonText: {
        ...typography.button,
        color: colors.white,
    },
    
    // Editor Styles
    editorContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    editorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    editorTitle: {
        ...typography.h3,
        color: colors.text,
    },
    closeEditorButton: {
        padding: layout.spacing.xs,
    },
    editorPlaceholder: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
        padding: layout.spacing.xl,
    },
    editorContent: {
        flex: 1,
    },
    timeInputContainer: {
        marginBottom: layout.spacing.lg,
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.sm,
    },
    timeInputLabel: {
        ...typography.body,
        color: colors.text,
        width: 80,
    },
    timeInput: {
        flex: 1,
        ...typography.body,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.radius.md,
        padding: layout.spacing.sm,
        color: colors.text,
        marginLeft: layout.spacing.md,
    },
    textInput: {
        ...typography.body,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        color: colors.text,
        minHeight: 100,
        marginBottom: layout.spacing.lg,
    },
    editorActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: layout.spacing.md,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        paddingVertical: layout.spacing.md,
        borderRadius: layout.radius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelButtonText: {
        ...typography.button,
        color: colors.textSecondary,
    },
    saveButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.md,
        borderRadius: layout.radius.md,
        alignItems: 'center',
    },
    saveButtonText: {
        ...typography.button,
        color: colors.white,
    },
    
    // Error Container
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error + '20',
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        marginBottom: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.error,
    },
    
    // Back Button
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
