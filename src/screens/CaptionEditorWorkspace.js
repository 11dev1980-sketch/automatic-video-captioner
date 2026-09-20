/**
 * Caption Editor Workspace
 * Full caption editing interface with video player and timeline
 */

import React, { useState, useRef, useEffect } from 'react';
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
    ActivityIndicator
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
import { colors } from '../styles/colors';
import { CaptionEditorWorkspaceUI } from '../ui/screens/CaptionEditorWorkspaceUI';

// Debug logging for component import
console.log('[CAPTION-WORKSPACE] CaptionEditorWorkspaceUI import:', CaptionEditorWorkspaceUI);
console.log('[CAPTION-WORKSPACE] CaptionEditorWorkspaceUI type:', typeof CaptionEditorWorkspaceUI);
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';
import { formatDuration } from '../utils/videoUtils';
import { transcribeReel } from '../services/supadataService';
import { PageHeader } from '../components/common/PageHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CaptionEditorWorkspace({ route, navigation }) {
    const { videoId, videoUri, videoName, duration: videoDuration } = route?.params || {};
    
    console.log('[CAPTION-WORKSPACE] Component mounted');
    console.log('[CAPTION-WORKSPACE] Route params:', route?.params);
    console.log('[CAPTION-WORKSPACE] videoUri:', videoUri);
    console.log('[CAPTION-WORKSPACE] videoName:', videoName);
    console.log('[CAPTION-WORKSPACE] videoId:', videoId);

    // If processed results were passed in route params (from history), use them
    useEffect(() => {
        const processed = route?.params?.processedResults;
        if (processed && processed.segments && processed.segments.length > 0) {
            console.log('[CAPTION-WORKSPACE] Using processed results from history, segments count:', processed.segments.length);
            const mapped = processed.segments.map(s => ({ ...s, style: 'arabic' }));
            setCaptions(mapped);
            // If translation exists, expose it in UI via duaResults or similar
            if (processed.translatedText) {
                console.log('[CAPTION-WORKSPACE] Processed translated text available, targetLanguage:', processed.targetLanguage);
            }
        }
    }, [route?.params]);
    
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(videoDuration || 0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSeeking, setIsSeeking] = useState(false);
    const [videoWidth, setVideoWidth] = useState(null);
    const [videoHeight, setVideoHeight] = useState(null);
    
    // Transcription state
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionError, setTranscriptionError] = useState(null);
    
    // Caption editor state
    const [captions, setCaptions] = useState([]);
    const [selectedCaption, setSelectedCaption] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [editingStartTime, setEditingStartTime] = useState('');
    const [editingEndTime, setEditingEndTime] = useState('');
    const [captionStyles] = useState({
        default: { fontSize: 16, color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.8)' },
        highlight: { fontSize: 18, color: '#ff3366', backgroundColor: 'rgba(0,0,0,0.9)' },
        title: { fontSize: 24, color: '#ffb020', backgroundColor: 'rgba(0,0,0,0.7)', fontWeight: 'bold' },
        arabic: { fontSize: 18, color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.9)', textAlign: 'right', fontFamily: 'Arial' },
    });

    /**
     * Handle video transcription
     */
    const handleTranscribe = async () => {
        if (!videoUri) {
            console.log('[CAPTION-WORKSPACE] No video URI available for transcription');
            return;
        }

        setIsTranscribing(true);
        setTranscriptionError(null);
        console.log('[CAPTION-WORKSPACE] Starting automatic transcription...');

        try {
            // Prefer the direct extracted video URL for transcription, falling back
        // to the original post URL only if the direct stream fails.
        const directUrl = videoUri || "";
        const originalUrl = route?.params?.originalVideoUrl || "";
        let transcriptionUrl = directUrl || originalUrl;

        if (!transcriptionUrl) {
            throw new Error('Geen video-URL beschikbaar voor transcriptie');
        }

        console.log('[CAPTION-WORKSPACE] Trying transcription with URL:', transcriptionUrl);

        let result;
        try {
            result = await transcribeReel(transcriptionUrl);
        } catch (firstError) {
            console.warn('[CAPTION-WORKSPACE] First transcription attempt failed:', firstError?.message || firstError);
            if (directUrl && originalUrl && directUrl !== originalUrl) {
                transcriptionUrl = originalUrl;
                console.log('[CAPTION-WORKSPACE] Retrying transcription with original URL:', transcriptionUrl);
                result = await transcribeReel(transcriptionUrl);
            } else {
                throw firstError;
            }
        }

        console.log('[CAPTION-WORKSPACE] Transcription successful:', result);
            console.log('[CAPTION-WORKSPACE] Transcription successful:', result);
            
            if (result.segments && result.segments.length > 0) {
                // Add Arabic caption style to all segments
                const arabicCaptions = result.segments.map(segment => ({
                    ...segment,
                    style: 'arabic'
                }));
                
                setCaptions(arabicCaptions);
                console.log('[CAPTION-WORKSPACE] ============================================');
                console.log('[CAPTION-WORKSPACE] Created', arabicCaptions.length, 'Arabic captions from transcription');
                console.log('[CAPTION-WORKSPACE] ============================================');
                console.log('[CAPTION-WORKSPACE] CAPTION TIMING DETAILS:');
                arabicCaptions.forEach((cap, idx) => {
                    console.log(`[CAPTION-WORKSPACE] Caption #${idx + 1}: ${cap.startTime.toFixed(2)}s - ${cap.endTime.toFixed(2)}s (${(cap.endTime - cap.startTime).toFixed(2)}s): "${cap.text.substring(0, 30)}${cap.text.length > 30 ? '...' : ''}"`);
                });
                console.log('[CAPTION-WORKSPACE] ============================================');
            } else if (result.text) {
                // Create a single caption with the transcribed text
                const singleCaption = {
                    id: 1,
                    startTime: 0,
                    endTime: duration || 10,
                    text: result.text,
                    style: 'arabic'
                };
                setCaptions([singleCaption]);
                console.log('[CAPTION-WORKSPACE] Created single Arabic caption from transcription');
            }
        } catch (error) {
            console.error('[CAPTION-WORKSPACE] Transcription error:', error);
            setTranscriptionError(error.message || 'Transcriptie mislukt');
            // Don't show alert for automatic transcription to avoid interrupting user experience
        } finally {
            setIsTranscribing(false);
        }
    };

    /**
     * Handle playback status update
     */
    const handlePlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setIsLoading(false);
            setIsPlaying(status.isPlaying || false);
            
            if (!isSeeking) {
                // Handle both milliseconds (expo-av) and seconds (HTML5 video)
                const positionValue = status.position !== undefined ? status.position : (status.positionMillis || 0) / 1000;
                setPosition(positionValue);
            }
            
            // Handle both milliseconds (expo-av) and seconds (HTML5 video)
            if (status.duration !== undefined) {
                setDuration(status.duration);
            } else if (status.durationMillis) {
                setDuration(status.durationMillis / 1000);
            }

            // Capture video dimensions when available
            if (status.naturalSize && !videoWidth && !videoHeight) {
                setVideoWidth(status.naturalSize.width);
                setVideoHeight(status.naturalSize.height);
            }
            
            // Trigger automatic transcription when video loads for the first time
            if (!isTranscribing && captions.length === 0 && videoUri) {
                console.log('[CAPTION-WORKSPACE] Video loaded, triggering automatic transcription...');
                handleTranscribe();
            }
        } else if (status.error) {
            setError(status.error);
            setIsLoading(false);
        }
    };

    /**
     * Handle play/pause toggle
     */
    const handlePlayPause = async () => {
        try {
            if (videoRef.current) {
                if (isPlaying) {
                    // HTML5 video uses pause() method
                    videoRef.current.pause();
                } else {
                    // HTML5 video uses play() method
                    await videoRef.current.play();
                }
            }
        } catch (err) {
            Alert.alert('Playback Error', 'Failed to control playback');
        }
    };

    /**
     * Handle seek
     */
    const handleSeek = async (value) => {
        try {
            if (videoRef.current) {
                const positionMillis = value * 1000;
                await videoRef.current.setPositionAsync(positionMillis);
                setPosition(value);
            }
        } catch (err) {
            // Silent fail
        }
    };

    /**
     * Handle seek start
     */
    const handleSeekStart = () => {
        setIsSeeking(true);
    };

    /**
     * Handle seek complete
     */
    const handleSeekComplete = async (value) => {
        setIsSeeking(false);
        await handleSeek(value);
    };

    /**
     * Handle caption selection
     */
    const handleCaptionSelect = (caption) => {
        setSelectedCaption(caption);
        setEditingText(caption.text);
        setEditingStartTime(caption.startTime.toString());
        setEditingEndTime(caption.endTime.toString());
        // Seek to caption start time
        handleSeek(caption.startTime);
    };

    /**
     * Handle caption text update
     */
    const handleCaptionTextUpdate = () => {
        if (selectedCaption && editingText.trim()) {
            const startTime = parseFloat(editingStartTime) || selectedCaption.startTime;
            const endTime = parseFloat(editingEndTime) || selectedCaption.endTime;
            
            setCaptions(prevCaptions => 
                prevCaptions.map(caption => 
                    caption.id === selectedCaption.id 
                        ? { ...caption, text: editingText.trim(), startTime, endTime }
                        : caption
                )
            );
        }
    };

    /**
     * Handle caption timing update
     */
    const handleCaptionTimingUpdate = () => {
        if (selectedCaption) {
            const startTime = parseFloat(editingStartTime) || selectedCaption.startTime;
            const endTime = parseFloat(editingEndTime) || selectedCaption.endTime;
            
            setCaptions(prevCaptions => 
                prevCaptions.map(caption => 
                    caption.id === selectedCaption.id 
                        ? { ...caption, startTime, endTime }
                        : caption
                )
            );
        }
    };

    /**
     * Handle add new caption
     */
    const handleAddCaption = () => {
        const newCaption = {
            id: Date.now(),
            startTime: position,
            endTime: Math.min(position + 3, duration),
            text: 'Nieuwe ondertitel',
            style: 'default'
        };
        setCaptions([...captions, newCaption]);
        setSelectedCaption(newCaption);
        setEditingText(newCaption.text);
    };

    /**
     * Handle delete caption
     */
    const handleDeleteCaption = (captionId) => {
        Alert.alert(
            'Ondertitel verwijderen',
            'Weet je zeker dat je deze ondertitel wilt verwijderen?',
            [
                { text: 'Annuleren', style: 'cancel' },
                { 
                    text: 'Verwijderen', 
                    style: 'destructive',
                    onPress: () => {
                        setCaptions(prevCaptions => 
                            prevCaptions.filter(caption => caption.id !== captionId)
                        );
                        if (selectedCaption?.id === captionId) {
                            setSelectedCaption(null);
                            setEditingText('');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Get current caption based on playback position
     */
    const getCurrentCaption = () => {
        const current = captions.find(caption => 
            position >= caption.startTime && position <= caption.endTime
        );
        
        // Debug logging for caption visibility
        if (captions.length > 0 && position > 0) {
            console.log(`[CAPTION-WORKSPACE] Position: ${position.toFixed(2)}s, Current caption: ${current ? '#' + current.id : 'NONE'}`);
            if (!current) {
                // Log nearby captions for debugging
                const nearby = captions.filter(c => 
                    Math.abs(c.startTime - position) < 2 || 
                    Math.abs(c.endTime - position) < 2
                );
                if (nearby.length > 0) {
                    console.log(`[CAPTION-WORKSPACE] Nearby captions:`, nearby.map(c => 
                        `#${c.id}: ${c.startTime.toFixed(2)}s-${c.endTime.toFixed(2)}s`
                    ));
                }
            }
        }
        
        return current;
    };

    /**
     * Render video player
     */
    const renderVideoPlayer = () => {
        if (!videoUri) {
            return (
                <View style={styles.noVideoContainer}>
                    <Ionicons name="videocam-off" size={80} color={colors.textTertiary} />
                    <Text style={styles.noVideoText}>Geen video geselecteerd</Text>
                    <Text style={styles.noVideoSubtext}>Kies een video uit de bibliotheek om ondertitels toe te voegen</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={80} color={colors.error} />
                    <Text style={styles.errorTitle}>Afspeelfout</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                </View>
            );
        }

        // Use video's natural dimensions with proper scaling
        let videoStyle = [styles.video];
        let containerStyle = [styles.videoContainer];
        
        if (videoWidth && videoHeight) {
            const maxWidth = SCREEN_WIDTH - (layout.spacing.lg * 2);
            const maxHeight = SCREEN_HEIGHT * 0.4;
            
            if (videoWidth <= maxWidth && videoHeight <= maxHeight) {
                videoStyle.push({ width: videoWidth, height: videoHeight });
                containerStyle.push({ width: videoWidth, height: videoHeight });
            } else {
                const widthScale = maxWidth / videoWidth;
                const heightScale = maxHeight / videoHeight;
                const scale = Math.min(widthScale, heightScale);
                
                const finalWidth = videoWidth * scale;
                const finalHeight = videoHeight * scale;
                
                videoStyle.push({ width: finalWidth, height: finalHeight });
                containerStyle.push({ width: finalWidth, height: finalHeight });
            }
        } else {
            videoStyle.push({ aspectRatio: 16 / 9 });
            containerStyle.push({
                width: SCREEN_WIDTH - (layout.spacing.lg * 2),
                aspectRatio: 16 / 9,
                minHeight: 200,
            });
        }

const currentCaption = getCurrentCaption();

// Debug logging before rendering
console.log('[CAPTION-WORKSPACE] About to render CaptionEditorWorkspaceUI');
console.log('[CAPTION-WORKSPACE] Props being passed:', {
    videoUri,
    videoRef,
    onPlaybackStatusUpdate: !!handlePlaybackStatusUpdate,
    style: videoStyle,
    onPlayPause: !!handlePlayPause,
    isPlaying,
    captions: captions?.length || 0,
    selectedCaption: !!selectedCaption,
    onSelectCaption: !!setSelectedCaption,
    onAddCaption: !!handleAddCaption,
    onUpdateCaption: !!handleCaptionTextUpdate,
    onUpdateCaptionTiming: !!handleCaptionTimingUpdate,
    onDeleteCaption: !!handleDeleteCaption,
    onTranscribe: !!handleTranscribe,
    isTranscribing,
    transcriptionError,
    videoName,
    videoDuration: duration,
    currentPosition: position,
    onSeek: !!handleSeek,
    onSeekStart: !!handleSeekStart,
    onSeekComplete: !!handleSeekComplete
});

return (
<View style={containerStyle}>
<CaptionEditorWorkspaceUI
    // Video state
    videoRef={videoRef}
    videoUri={videoUri}
    videoName={videoName}
    videoId={videoId}
    isPlaying={isPlaying}
    position={position}
    duration={duration}
    isLoading={isLoading}
    error={error}
    isSeeking={isSeeking}
    videoWidth={videoWidth}
    videoHeight={videoHeight}
    
    // Transcription state
    isTranscribing={isTranscribing}
    transcriptionError={transcriptionError}
    
    // Caption editor state
    captions={captions}
    selectedCaption={selectedCaption}
    editingText={editingText}
    editingStartTime={editingStartTime}
    editingEndTime={editingEndTime}
    captionStyles={captionStyles}
    
    // Callback functions
    onPlayPause={handlePlayPause}
    onSeek={handleSeek}
    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
    onTranscribe={handleTranscribe}
    onSelectCaption={handleCaptionSelect}
    onEditCaption={handleCaptionTextUpdate}
    onSaveCaption={handleCaptionTextUpdate}
    onDeleteCaption={handleDeleteCaption}
    onAddCaption={handleAddCaption}
    onUpdateTime={() => {}}
    onExport={() => {}}
    onBack={() => navigation.goBack()}
    
    // UI state
    activeTab={null}
    setActiveTab={() => {}}
    processParams={null}
    showTranscriptionResults={false}
    setShowTranscriptionResults={() => {}}
    
    // Caption editing setters
    setEditingText={setEditingText}
    setEditingStartTime={setEditingStartTime}
    setEditingEndTime={setEditingEndTime}
/>
            </View>
        );
    };

    /**
     * Render playback controls
     */
    const renderControls = () => {
        if (!videoUri || error) return null;

        return (
            <View style={styles.controlsContainer}>
                <View style={styles.seekContainer}>
                    <Text style={styles.timeText}>{formatDuration(position)}</Text>
                    <Slider
                        style={styles.slider}
                        value={position}
                        minimumValue={0}
                        maximumValue={duration || 1}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.textTertiary}
                        thumbTintColor={colors.primary}
                        onSlidingStart={handleSeekStart}
                        onSlidingComplete={handleSeekComplete}
                        disabled={isLoading}
                    />
                    <Text style={styles.timeText}>{formatDuration(duration)}</Text>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={handlePlayPause}
                        disabled={isLoading}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={32}
                            color={colors.white}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddCaption}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={24} color={colors.white} />
                        <Text style={styles.addButtonText}>Ondertitel toevoegen</Text>
                    </TouchableOpacity>

                                    </View>
            </View>
        );
    };

    /**
     * Render caption list
     */
    const renderCaptionList = () => {
        return (
            <View style={styles.captionListContainer}>
                <Text style={styles.captionListTitle}>Ondertitels</Text>
                <ScrollView style={styles.captionScroll} showsVerticalScrollIndicator={false}>
                    {captions.map((caption) => (
                        <TouchableOpacity
                            key={caption.id}
                            style={[
                                styles.captionItem,
                                selectedCaption?.id === caption.id && styles.captionItemSelected
                            ]}
                            onPress={() => handleCaptionSelect(caption)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.captionItemContent}>
                                <View style={styles.captionItemHeader}>
                                    <Text style={styles.captionItemTime}>
                                        {formatDuration(caption.startTime)} - {formatDuration(caption.endTime)}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteCaption(caption.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.captionItemText} numberOfLines={2}>
                                    {caption.text}
                                </Text>
                                <View style={[
                                    styles.styleIndicator,
                                    { backgroundColor: captionStyles[caption.style].backgroundColor }
                                ]}>
                                    <Text style={styles.styleIndicatorText}>{caption.style}</Text>
                                </View>
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
                <View style={styles.editorPlaceholder}>
                    <Ionicons name="text-outline" size={48} color={colors.textTertiary} />
                    <Text style={styles.editorPlaceholderText}>Selecteer een ondertitel om te bewerken</Text>
                </View>
            );
        }

        return (
            <View style={styles.editorContainer}>
                <Text style={styles.editorTitle}>Bewerk ondertitel</Text>
                
                <View style={styles.timeEditor}>
                    <Text style={styles.timeLabel}>Timing:</Text>
                    <View style={styles.timeInputsContainer}>
                        <View style={styles.timeInputContainer}>
                            <Text style={styles.timeInputLabels}>Start:</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={editingStartTime}
                                onChangeText={setEditingStartTime}
                                onBlur={handleCaptionTimingUpdate}
                                placeholder="0.0"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.timeInputContainer}>
                            <Text style={styles.timeInputLabels}>Einde:</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={editingEndTime}
                                onChangeText={setEditingEndTime}
                                onBlur={handleCaptionTimingUpdate}
                                placeholder="3.0"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.textEditorContainer}>
                    <Text style={styles.textLabel}>Tekst:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={editingText}
                        onChangeText={setEditingText}
                        multiline
                        numberOfLines={3}
                        placeholder="Voer ondertitel tekst in..."
                        placeholderTextColor={colors.textMuted}
                        onBlur={handleCaptionTextUpdate}
                    />
                </View>

                <View style={styles.styleEditor}>
                    <Text style={styles.styleLabel}>Stijl:</Text>
                    <View style={styles.styleOptions}>
                        {Object.keys(captionStyles).map((style) => (
                            <TouchableOpacity
                                key={style}
                                style={[
                                    styles.styleOption,
                                    selectedCaption.style === style && styles.styleOptionSelected
                                ]}
                                onPress={() => {
                                    setCaptions(prevCaptions => 
                                        prevCaptions.map(caption => 
                                            caption.id === selectedCaption.id 
                                                ? { ...caption, style }
                                                : caption
                                        )
                                    );
                                    setSelectedCaption({ ...selectedCaption, style });
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.styleOptionText,
                                    selectedCaption.style === style && styles.styleOptionTextSelected
                                ]}>
                                    {style}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    // Initialize loading state and trigger transcription when videoUri is available
    useEffect(() => {
        if (videoUri) {
            console.log('[CAPTION-WORKSPACE] Video URI available, setting loading to false');
            setIsLoading(false);
            
            // Start transcription immediately when entering workspace
            if (!isTranscribing && captions.length === 0) {
                console.log('[CAPTION-WORKSPACE] Starting immediate transcription on workspace entry...');
                handleTranscribe();
            }
        }
    }, [videoUri]);

    return (
        <SafeAreaView style={[globalStyles.safeArea]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Ondertitel Workspace"
                        subtitle={videoName || 'Geen video'}
                    />
                </View>
                
                {/* Transcription Status Indicator */}
                {isTranscribing && (
                    <View style={styles.transcriptionStatus}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.transcriptionStatusText}>Bezig met transcriptie...</Text>
                    </View>
                )}
                
                {transcriptionError && (
                    <View style={styles.transcriptionError}>
                        <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                        <Text style={styles.transcriptionErrorText}>{transcriptionError}</Text>
                    </View>
                )}
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Video Player */}
                        {renderVideoPlayer()}

                        {/* Playback Controls */}
                        {renderControls()}

                        {/* Caption List and Editor */}
                        <View style={styles.captionWorkshop}>
                            {renderCaptionList()}
                            {renderCaptionEditor()}
                        </View>
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
    
    // Video Player Styles
    videoContainer: {
        backgroundColor: colors.background,
        borderRadius: layout.radius.lg,
        overflow: 'hidden',
        marginTop: layout.spacing.lg,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    video: {
        width: SCREEN_WIDTH - (layout.spacing.lg * 2),
        height: undefined, // Let aspect ratio determine height
        aspectRatio: 16 / 9, // Maintain aspect ratio
        maxHeight: SCREEN_HEIGHT * 0.7, // Allow more height for full size
    },
    captionOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    captionText: {
        textAlign: 'center',
        fontWeight: '500',
    },
    centerPlayButtonOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    centerPlayButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background + 'CC',
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    noVideoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.xl,
        paddingVertical: layout.spacing.xl,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.lg,
        marginTop: layout.spacing.lg,
        minHeight: 200,
    },
    noVideoText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    noVideoSubtext: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
        lineHeight: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding.horizontal,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.lg,
        marginTop: layout.spacing.lg,
        minHeight: 200,
    },
    errorTitle: {
        ...typography.h3,
        color: colors.error,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.sm,
    },
    errorMessage: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    
    // Controls Styles
    controlsContainer: {
        width: '100%',
        paddingHorizontal: layout.spacing.md,
        paddingVertical: layout.spacing.lg,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.lg,
        marginTop: layout.spacing.lg,
    },
    seekContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.md,
    },
    slider: {
        flex: 1,
        marginHorizontal: layout.spacing.md,
    },
    timeText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        minWidth: 45,
        textAlign: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: layout.spacing.md,
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.glassLight,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: layout.radius.md,
        paddingVertical: layout.spacing.sm,
        paddingHorizontal: layout.spacing.md,
        gap: layout.spacing.sm,
    },
    addButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 14,
    },
    transcribeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary || '#ff6b35',
        borderRadius: layout.radius.md,
        paddingVertical: layout.spacing.sm,
        paddingHorizontal: layout.spacing.md,
        gap: layout.spacing.sm,
    },
    transcribeButtonDisabled: {
        opacity: 0.6,
    },
    transcribeButtonText: {
        ...typography.button,
        color: colors.white,
        fontSize: 14,
    },
    transcriptionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundSecondary,
        paddingVertical: layout.spacing.sm,
        paddingHorizontal: layout.spacing.md,
        marginHorizontal: layout.spacing.lg,
        marginTop: layout.spacing.sm,
        borderRadius: layout.radius.md,
        gap: layout.spacing.sm,
    },
    transcriptionStatusText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '500',
    },
    transcriptionError: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: layout.spacing.sm,
        paddingHorizontal: layout.spacing.md,
        marginHorizontal: layout.spacing.lg,
        marginTop: layout.spacing.sm,
        borderRadius: layout.radius.md,
        gap: layout.spacing.sm,
    },
    transcriptionErrorText: {
        ...typography.bodySmall,
        color: colors.error,
        fontWeight: '500',
    },
    
    // Caption Workshop Styles
    captionWorkshop: {
        width: '100%',
        flexDirection: 'row',
        gap: layout.spacing.lg,
        marginTop: layout.spacing.lg,
    },
    
    // Caption List Styles
    captionListContainer: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
    },
    captionListTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.md,
    },
    captionScroll: {
        flex: 1,
    },
    captionItem: {
        backgroundColor: colors.backgroundTertiary,
        borderRadius: layout.radius.md,
        padding: layout.spacing.sm,
        marginBottom: layout.spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    captionItemSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.glassLight,
    },
    captionItemContent: {
        gap: layout.spacing.xs,
    },
    captionItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    captionItemTime: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontFamily: 'monospace',
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captionItemText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 18,
    },
    styleIndicator: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    styleIndicatorText: {
        ...typography.bodySmall,
        color: colors.white,
        fontSize: 10,
        fontWeight: '600',
    },
    
    // Caption Editor Styles
    editorContainer: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
    },
    editorPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.lg,
    },
    editorPlaceholderText: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
        marginTop: layout.spacing.sm,
    },
    editorTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.md,
    },
    timeEditor: {
        marginBottom: layout.spacing.md,
    },
    timeLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    timeValue: {
        ...typography.body,
        color: colors.text,
        fontFamily: 'monospace',
    },
    timeInputsContainer: {
        flexDirection: 'row',
        gap: layout.spacing.md,
    },
    timeInputContainer: {
        flex: 1,
    },
    timeInputLabels: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    timeInput: {
        backgroundColor: colors.backgroundTertiary,
        borderRadius: layout.radius.sm,
        padding: layout.spacing.sm,
        color: colors.text,
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
        textAlign: 'center',
        fontFamily: 'monospace',
    },
    textEditorContainer: {
        marginBottom: layout.spacing.md,
    },
    textLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: colors.backgroundTertiary,
        borderRadius: layout.radius.md,
        padding: layout.spacing.sm,
        color: colors.text,
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    styleEditor: {
        marginBottom: layout.spacing.md,
    },
    styleLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    styleOptions: {
        flexDirection: 'row',
        gap: layout.spacing.sm,
    },
    styleOption: {
        flex: 1,
        backgroundColor: colors.backgroundTertiary,
        borderRadius: layout.radius.sm,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    styleOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    styleOptionText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    styleOptionTextSelected: {
        color: colors.white,
    },
});
