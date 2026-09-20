/**
 * Video Player Screen - Liquid Glass Design
 * Plays selected video with controls and processing option
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Video component with fallback for web compatibility
let Video;
try {
  Video = require('react-native-video').default;
} catch (error) {
  
  Video = null;
}
// Audio component with fallback for web compatibility
let Audio;
try {
  Audio = require('expo-av').Audio;
} catch (error) {
  
  Audio = null;
}
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';
import { formatDuration } from '../utils/videoUtils';
import { saveVideo } from '../services/videoStorageService';
import { PageHeader } from '../components/common/PageHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function VideoPlayerScreen({ route, navigation }) {
    const { videoId, videoUri, videoName, duration: videoDuration } = route.params;
    
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(videoDuration || 0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSeeking, setIsSeeking] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
    const [isSavedToLibrary, setIsSavedToLibrary] = useState(false);
    const [videoWidth, setVideoWidth] = useState(null);
    const [videoHeight, setVideoHeight] = useState(null);

    /**
     * Detect if running as iOS PWA
     */
    const isIOSPWA = () => {
        if (Platform.OS !== 'web') {
            return false;
        }
        
        // Check if running on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        // Check if running in standalone mode (PWA)
        const isStandalone = window.navigator.standalone === true || 
                            window.matchMedia('(display-mode: standalone)').matches;
        
        return isIOS && isStandalone;
    };

    /**
     * Handle save to library for iOS PWA
     */
    const handleSaveToLibrary = async () => {
        if (isSavedToLibrary) {
            Alert.alert('Already Saved', 'This video is already in your library.');
            return;
        }

        setIsSavingToLibrary(true);
        
        try {
            // Generate a unique ID for the video
            const videoIdToSave = videoId || `video_${Date.now()}`;
            
            // For downloaded videos, we use the video URI as thumbnail
            // since we don't have access to thumbnail generation on web
            const thumbnailUri = videoUri;
            
            // Prepare video metadata
            const videoMetadata = {
                id: videoIdToSave,
                uri: videoUri,
                filename: videoName || `Video ${Date.now()}`,
                duration: duration || 0,
                thumbnailUri: thumbnailUri,
                dateAdded: Date.now(),
                size: 0, // Size unknown for downloaded videos
                format: 'mp4',
            };
            
            // Save to library
            await saveVideo(videoMetadata);
            
            setIsSavedToLibrary(true);
            
            Alert.alert(
                'Opgeslagen in bibliotheek',
                'Video is succesvol opgeslagen in je bibliotheek!',
                [
                    {
                        text: 'Bibliotheek bekijken',
                        onPress: () => navigation.navigate('Library'),
                    },
                    {
                        text: 'OK',
                        style: 'cancel',
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                'Opslaan mislukt',
                `Video kon niet worden opgeslagen in bibliotheek: ${error.message}`
            );
        } finally {
            setIsSavingToLibrary(false);
        }
    };

    /**
     * Handle playback status update
     */
    const handlePlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setIsLoading(false);
            setIsPlaying(status.isPlaying);
            
            if (!isSeeking) {
                setPosition(status.positionMillis / 1000);
            }
            
            if (status.durationMillis) {
                setDuration(status.durationMillis / 1000);
            }

            // Capture video dimensions when available
            if (status.naturalSize && !videoWidth && !videoHeight) {
                setVideoWidth(status.naturalSize.width);
                setVideoHeight(status.naturalSize.height);
            }

            // Handle video completion
            if (status.didJustFinish && !status.isLooping) {
                handleVideoCompletion();
            }
        } else if (status.error) {
            handlePlaybackError(status.error);
        }
    };

    /**
     * Handle play/pause toggle - Play in custom player without forcing fullscreen
     */
    const handlePlayPause = async () => {
        try {
            if (videoRef.current) {
                // Play/pause in the custom player without forcing fullscreen
                // This allows users to interact with custom controls (loop button, etc.)
                // Users can manually enter fullscreen using the fullscreen button if desired
                if (isPlaying) {
                    await videoRef.current.pauseAsync();
                } else {
                    await videoRef.current.playAsync();
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
     * Handle fullscreen toggle
     */
    const handleFullscreen = async () => {
        try {
            if (videoRef.current) {
                if (isFullscreen) {
                    await videoRef.current.dismissFullscreenPlayer();
                } else {
                    await videoRef.current.presentFullscreenPlayer();
                }
                setIsFullscreen(!isFullscreen);
            }
        } catch (err) {
            Alert.alert('Fullscreen Error', 'Failed to toggle fullscreen mode');
        }
    };

    /**
     * Handle loop toggle
     */
    const handleLoopToggle = async () => {
        try {
            if (videoRef.current) {
                await videoRef.current.setIsLoopingAsync(!isLooping);
                setIsLooping(!isLooping);
            }
        } catch (err) {
            // Silent fail
        }
    };

    /**
     * Handle process video - Navigate to ConfigureScreen
     */
    const handleProcessVideo = () => {
        if (videoUri) {
            navigation.navigate('Configure', {
                videoUri,
                videoName,
                source: 'library',
            });
        }
    };

    /**
     * Handle download video
     */
    const handleDownloadVideo = async () => {
        try {
            // For web, create a download link
            if (Platform.OS === 'web') {
                const link = document.createElement('a');
                const isRemote = /^https?:\/\//i.test(videoUri || '');
                const sameOrigin = typeof window !== 'undefined' && videoUri?.startsWith(window.location.origin);
                link.href = isRemote && !sameOrigin
                    ? `${window.location.origin}/api/video?action=proxy&videoUrl=${encodeURIComponent(videoUri)}`
                    : videoUri;
                link.download = videoName || `video_${Date.now()}.mp4`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                Alert.alert('Download gestart', 'Video download is gestart. Controleer je downloads map.');
            } else {
                // For mobile, use existing download functionality
                Alert.alert('Download', 'Download functionaliteit voor mobiel wordt nog ontwikkeld.');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Download fout', 'Video kon niet worden gedownload. Probeer het opnieuw.');
        }
    };

    /**
     * Handle back to library
     */
    const handleBackToLibrary = () => {
        // Pause video before navigating
        if (videoRef.current && isPlaying) {
            videoRef.current.pauseAsync();
        }
        
        navigation.goBack();
    };

    /**
     * Handle video completion
     */
    const handleVideoCompletion = () => {
        setIsPlaying(false);
        Alert.alert(
            'Video voltooid',
            'Video afspelen voltooid.',
            [
                {
                    text: 'Opnieuw afspelen',
                    onPress: async () => {
                        if (videoRef.current) {
                            await videoRef.current.replayAsync();
                        }
                    },
                },
                {
                    text: 'Terug naar bibliotheek',
                    onPress: handleBackToLibrary,
                },
            ]
        );
    };

    /**
     * Handle playback error
     */
    const handlePlaybackError = (errorMessage) => {
        setError(errorMessage || 'Video afspelen mislukt');
        setIsLoading(false);
        
        Alert.alert(
            'Afspeelfout',
            `Video kan niet worden afgespeeld. ${errorMessage || 'Bestand mogelijk beschadigd of niet langer toegankelijk.'}`,
            [
                {
                    text: 'Terug naar bibliotheek',
                    onPress: handleBackToLibrary,
                },
            ]
        );
    };

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        // Set audio mode to play even in silent mode and continue in background
        const setupAudio = async () => {
            try {
                if (Audio && Audio.setAudioModeAsync) {
                    await Audio.setAudioModeAsync({
                        playsInSilentModeIOS: true,
                        staysActiveInBackground: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                    });
                }
            } catch (err) {
                // Silent fail - non-critical
            }
        };

        setupAudio();

        // DO NOT auto-enter fullscreen - let user control when to go fullscreen
        // This ensures all platforms (iOS PWA and regular web) show the custom player first
        // User can click play button to enter fullscreen if desired

        return () => {
            if (videoRef.current) {
                try {
                    videoRef.current.pauseAsync?.();
                    videoRef.current.unloadAsync?.();
                } catch (err) {
                    // Silent fail on cleanup
                }
            }
        };
    }, []);

    /**
     * Render video player
     */
    const renderVideoPlayer = () => {
        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={80} color={colors.error} />
                    <Text style={styles.errorTitle}>Afspeelfout</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                </View>
            );
        }

        // Calculate video container styles
        let videoStyle = [styles.video];
        let containerStyle = [styles.videoContainer];
        
        if (videoWidth && videoHeight) {
            const maxWidth = SCREEN_WIDTH - (layout.spacing.lg * 2);
            const maxHeight = SCREEN_HEIGHT * 0.7;
            
            if (videoWidth <= maxWidth && videoHeight <= maxHeight) {
                videoStyle.push({
                    width: videoWidth,
                    height: videoHeight,
                });
                
                containerStyle.push({
                    width: videoWidth,
                    height: videoHeight,
                    minWidth: videoWidth,
                    minHeight: videoHeight,
                });
            } else {
                const widthScale = maxWidth / videoWidth;
                const heightScale = maxHeight / videoHeight;
                const scale = Math.min(widthScale, heightScale);
                
                const finalWidth = videoWidth * scale;
                const finalHeight = videoHeight * scale;
                
                videoStyle.push({
                    width: finalWidth,
                    height: finalHeight,
                });
                
                containerStyle.push({
                    width: finalWidth,
                    height: finalHeight,
                    minWidth: finalWidth,
                    minHeight: finalHeight,
                });
            }
        } else {
            videoStyle.push({ aspectRatio: 16 / 9 });
            containerStyle.push({
                width: SCREEN_WIDTH - (layout.spacing.lg * 2),
                aspectRatio: 16 / 9,
                minHeight: 300,
            });
        }

        // Web fallback when Video component is not available
        if (!Video && Platform.OS === 'web') {
            return (
                <View style={containerStyle}>
                    <video
                        ref={videoRef}
                        src={videoUri}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            backgroundColor: '#000',
                        }}
                        controls
                        playsInline
                        loop={isLooping}
                        onLoadedMetadata={(e) => {
                            setIsLoading(false);
                            setDuration(e.target.duration);
                            setVideoWidth(e.target.videoWidth);
                            setVideoHeight(e.target.videoHeight);
                            handlePlaybackStatusUpdate({
                                isLoaded: true,
                                durationMillis: e.target.duration * 1000,
                                naturalSize: {
                                    width: e.target.videoWidth,
                                    height: e.target.videoHeight,
                                },
                            });
                        }}
                        onTimeUpdate={(e) => {
                            setPosition(e.target.currentTime);
                            handlePlaybackStatusUpdate({
                                isLoaded: true,
                                isPlaying: !e.target.paused,
                                positionMillis: e.target.currentTime * 1000,
                                durationMillis: e.target.duration * 1000,
                            });
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onError={(e) => {
                            console.log('╔════════════════════════════════════════════════════════════════╗');
                            console.log('║                  ❌ VIDEO PLAYER ERROR                         ║');
                            console.log('╚════════════════════════════════════════════════════════════════╝');
                            console.error('[VIDEO-PLAYER] 💥 Video Error Event:', e);
                            console.error('[VIDEO-PLAYER] 💥 Error Type:', e.type);
                            console.error('[VIDEO-PLAYER] 💥 Error Target:', e.target);
                            console.error('[VIDEO-PLAYER] 💥 Video URL:', videoUri);
                            console.error('[VIDEO-PLAYER] 💥 Video Source:', e.target?.src);
                            console.error('[VIDEO-PLAYER] 💥 Network State:', e.target?.networkState);
                            console.error('[VIDEO-PLAYER] 💥 Ready State:', e.target?.readyState);
                            console.error('[VIDEO-PLAYER] 💥 Error Code:', e.target?.error?.code);
                            console.error('[VIDEO-PLAYER] 💥 Error Message:', e.target?.error?.message);
                            console.error('[VIDEO-PLAYER] 📝 Possible Causes:');
                            console.error('[VIDEO-PLAYER]    - Video expired from server memory');
                            console.error('[VIDEO-PLAYER]    - CORS issue with video URL');
                            console.error('[VIDEO-PLAYER]    - Network connectivity problem');
                            console.error('[VIDEO-PLAYER]    - Invalid video format');
                            console.error('[VIDEO-PLAYER]    - Vercel serverless function timeout');
                            handlePlaybackError('Video kan niet worden geladen');
                        }}
                    />
                    
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Video laden...</Text>
                        </View>
                    )}
                </View>
            );
        }

        // Native Video component (when available)
        if (!Video) {
            return (
                <View style={containerStyle}>
                    <View style={[videoStyle, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundSecondary }]}>
                        <Ionicons name="videocam-off-outline" size={48} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Video player not available</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={containerStyle}>
                <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={videoStyle}
                    resizeMode="contain"
                    shouldPlay={false}
                    isLooping={isLooping}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    onError={(err) => handlePlaybackError(err)}
                    onReadyForDisplay={(event) => {
                        if (event.naturalSize) {
                            setVideoWidth(event.naturalSize.width);
                            setVideoHeight(event.naturalSize.height);
                        }
                    }}
                    usePoster
                    posterSource={{ uri: videoUri }}
                    posterStyle={{ resizeMode: 'cover' }}
                />
                
                {/* Center Play/Pause Button Overlay */}
                {!isLoading && (
                    <View style={styles.centerPlayButtonOverlay}>
                        <TouchableOpacity
                            style={styles.centerPlayButton}
                            onPress={handlePlayPause}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={isPlaying ? 'pause' : 'play'}
                                size={48}
                                color={colors.white}
                            />
                        </TouchableOpacity>
                    </View>
                )}
                
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Video laden...</Text>
                    </View>
                )}
            </View>
        );
    };

    /**
     * Render playback controls
     */
    const renderControls = () => {
        if (error) {
            return null;
        }

        return (
            <View style={styles.controlsContainer}>
                {/* Time and Seek Bar */}
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

                {/* Control Buttons */}
                <View style={styles.buttonsContainer}>
                    {/* Play/Pause Button */}
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

                    {/* Loop Button */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={handleLoopToggle}
                        disabled={isLoading}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="repeat"
                            size={24}
                            color={isLooping ? colors.primary : colors.textSecondary}
                        />
                    </TouchableOpacity>

                    {/* Fullscreen Button */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={handleFullscreen}
                        disabled={isLoading}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isFullscreen ? 'contract' : 'expand'}
                            size={24}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /**
     * Render action buttons
     */
    const renderActionButtons = () => {
        // Show "Save to Library" button for iOS PWA users
        if (isIOSPWA()) {
            return (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.saveToLibraryButton,
                            (isSavingToLibrary || isSavedToLibrary) && styles.saveToLibraryButtonDisabled
                        ]}
                        onPress={handleSaveToLibrary}
                        disabled={isSavingToLibrary || isSavedToLibrary}
                        activeOpacity={0.7}
                    >
                        {isSavingToLibrary ? (
                            <>
                                <ActivityIndicator size="small" color={colors.white} />
                                <Text style={styles.saveToLibraryButtonText}>Opslaan...</Text>
                            </>
                        ) : isSavedToLibrary ? (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                                <Text style={styles.saveToLibraryButtonText}>Opgeslagen in bibliotheek</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={24} color={colors.white} />
                                <Text style={styles.saveToLibraryButtonText}>Opslaan in bibliotheek</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.saveToLibraryHint}>
                        Sla deze video op in je bibliotheek om later te bekijken
                    </Text>
                </View>
            );
        }
        
        // Show process video button for library videos
        if (videoUri && !isIOSPWA()) {
            return (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.processVideoButton}
                        onPress={handleProcessVideo}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="play-circle" size={24} color={colors.white} />
                        <Text style={styles.processVideoButtonText}>Video verwerken</Text>
                    </TouchableOpacity>
                    <Text style={styles.processVideoHint}>
                        Video transcriberen en vertalen
                    </Text>
                </View>
            );
        }
        
        return null;
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title={videoName}
                        subtitle="Videospeler"
                    />
                </View>
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Video Player */}
                        {renderVideoPlayer()}

                        {/* Download Button */}
                        {!error && (
                            <View style={styles.downloadButtonContainer}>
                                <TouchableOpacity
                                    style={styles.downloadButton}
                                    onPress={handleDownloadVideo}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="cloud-download-outline" size={24} color={colors.white} />
                                    <Text style={styles.downloadButtonText}>Download</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
        minHeight: 120, // Fixed height to match all pages
        backgroundColor: colors.background, // Ensure same background
        borderBottomWidth: 0, // Remove white separator line
        borderColor: 'transparent', // Ensure no border color
        borderWidth: 0, // Explicitly remove all borders
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 120,
        alignItems: 'center', // Center content in scroll view
        minHeight: '100%', // Ensure full height for scrolling
    },
    contentWrapper: {
        alignItems: 'center', // Center all content including video
        width: '100%',
        paddingHorizontal: layout.spacing.lg,
        minHeight: '100%', // Ensure wrapper takes full height
    },
    videoContainer: {
        // Allow dynamic sizing while ensuring centering
        backgroundColor: colors.background,
        borderRadius: layout.radius.lg,
        overflow: 'hidden',
        marginTop: layout.spacing.lg,
        alignSelf: 'center', // Ensure centering
        alignItems: 'center', // Center video inside container
        justifyContent: 'center', // Center video inside container
    },
    video: {
        // Provide fallback dimensions while allowing natural size
        width: SCREEN_WIDTH - (layout.spacing.lg * 2),
        height: 300, // Fallback height
        maxWidth: SCREEN_WIDTH - (layout.spacing.lg * 2),
        maxHeight: SCREEN_HEIGHT * 0.7,
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
        marginTop: layout.spacing.md,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding.horizontal,
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
    controlsContainer: {
        paddingHorizontal: layout.screenPadding.horizontal,
        paddingVertical: layout.spacing.lg,
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
        justifyContent: 'center',
        alignItems: 'center',
        gap: layout.spacing.lg,
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.glassLight,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.glassLight,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsContainer: {
        paddingHorizontal: layout.screenPadding.horizontal,
        paddingVertical: layout.spacing.lg,
    },
    saveToLibraryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        gap: layout.spacing.sm,
    },
    saveToLibraryButtonDisabled: {
        opacity: 0.6,
    },
    saveToLibraryButtonText: {
        ...typography.button,
        color: colors.white,
    },
    saveToLibraryHint: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: layout.spacing.sm,
    },
    processButton: {
        backgroundColor: colors.primary,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        alignItems: 'center',
    },
    processButtonText: {
        ...typography.button,
        color: colors.white,
        marginTop: layout.spacing.sm,
    },
    processButtonSubtext: {
        ...typography.bodySmall,
        color: colors.white,
        opacity: 0.9,
        marginTop: layout.spacing.xs,
    },
    downloadButtonContainer: {
        alignItems: 'center',
        marginTop: layout.spacing.lg,
        paddingHorizontal: layout.spacing.lg,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.lg,
        borderRadius: layout.radius.lg,
        minHeight: 52,
        gap: layout.spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    downloadButtonText: {
        ...typography.button,
        color: colors.white,
    },
});
