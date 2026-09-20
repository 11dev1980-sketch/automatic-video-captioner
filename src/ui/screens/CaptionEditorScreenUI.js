/**
 * Caption Editor Screen UI Component
 * PURE UI COMPONENT - Contains only the UI elements for CaptionEditorScreen
 * Modify this file to change the visual appearance of the CaptionEditorScreen
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Custom Video Player Component
const VideoPlayer = ({ videoUrl, extractedVideoUrl, videoRef, onPlaybackStatusUpdate, style, onPlayPause, isPlaying }) => {
  const finalVideoUrl = extractedVideoUrl || videoUrl;
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const localVideoRef = useRef(null);
  
  // Update the passed ref to point to our local video element
  useEffect(() => {
    if (videoRef && localVideoRef.current) {
      videoRef.current = localVideoRef.current;
    }
  }, [videoRef, localVideoRef.current]);
  
  if (!finalVideoUrl) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
        <Text style={{ color: '#666', fontSize: 16 }}>No video loaded</Text>
      </View>
    );
  }
  
  // Hide controls after 2 seconds of inactivity
  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };
  
  // Show controls when user interacts
  const showControlsTemporarily = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };
  
  // Handle video click (play/pause)
  const handleVideoClick = () => {
    showControlsTemporarily();
    if (onPlayPause) {
      onPlayPause();
    }
  };
  
  // Handle seek
  const handleSeek = (value) => {
    if (localVideoRef.current) {
      const newTime = (value / 100) * duration;
      localVideoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Format time display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle play/pause programmatically
  useEffect(() => {
    if (localVideoRef.current && videoLoaded) {
      if (isPlaying) {
        localVideoRef.current.play().catch(err => {
          console.error('Video play error:', err);
        });
      } else {
        localVideoRef.current.pause();
      }
    }
  }, [isPlaying, videoLoaded]);
  
  return (
    <View style={style}>
      {/* HTML5 video element */}
      <video
        ref={localVideoRef}
        src={finalVideoUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000',
          borderRadius: 8,
        }}
        controls={false} // Hide HTML5 controls
        playsInline={true}
        webkit-playsinline="true"
        onLoadStart={() => {
          console.log('🎬 VideoPlayer: Video loading started');
          setVideoLoaded(false);
        }}
        onLoadedData={(e) => {
          console.log('🎬 VideoPlayer: Video data loaded');
          const video = e.target;
          setDuration(video.duration);
          setVideoLoaded(true);
          
          // Update the passed ref
          if (videoRef) {
            videoRef.current = video;
          }
          
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: false,
              duration: video.duration,
              position: 0,
            });
          }
        }}
        onTimeUpdate={(e) => {
          const video = e.target;
          setCurrentTime(video.currentTime);
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: !video.paused,
              duration: video.duration,
              position: video.currentTime,
            });
          }
        }}
        onPlay={() => {
          console.log('🎬 VideoPlayer: Video playing');
          showControlsTemporarily();
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: true,
              duration: duration,
              position: currentTime,
            });
          }
        }}
        onPause={() => {
          console.log('🎬 VideoPlayer: Video paused');
          showControlsTemporarily();
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: false,
              duration: duration,
              position: currentTime,
            });
          }
        }}
        onError={(error) => {
          console.error('❌ VideoPlayer: Video error:', error);
          console.error('❌ VideoPlayer: Error details:', {
            message: error?.message,
            code: error?.code,
            type: error?.type,
            target: error?.target?.src || 'no source'
          });
          
          // Get more detailed error info from the video element
          const videoElement = localVideoRef.current;
          if (videoElement) {
            console.error('❌ VideoPlayer: Video element error code:', videoElement.error?.code);
            console.error('❌ VideoPlayer: Video element error message:', videoElement.error?.message);
            console.error('❌ VideoPlayer: Network state:', videoElement.networkState);
            console.error('❌ VideoPlayer: Ready state:', videoElement.readyState);
          }
          
          // Provide specific error messages based on error type
          let errorMessage = 'Sorry, we couldn\'t play this video.';
          if (videoElement?.error?.code === 1) {
            errorMessage = 'Video loading was aborted. Please try again.';
          } else if (videoElement?.error?.code === 2) {
            errorMessage = 'Network error occurred. Please check your connection.';
          } else if (videoElement?.error?.code === 3) {
            errorMessage = 'Video decoding error. The file may be corrupted.';
          } else if (videoElement?.error?.code === 4) {
            errorMessage = 'Video format not supported or video not found.';
          }
          
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: false,
              error: { ...error, message: errorMessage }
            });
          }
        }}
      />
      
      {/* Custom Controls Overlay */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}
        onPress={handleVideoClick}
        activeOpacity={1}
      >
        {/* Center Play/Pause Button */}
        {showControls && (
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: 50,
            padding: 15,
          }}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={48}
              color={colors.white}
            />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Bottom Progress Bar */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingVertical: 10,
        paddingHorizontal: 15,
      }}>
        {/* Progress Bar */}
        <View style={{
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 2,
          marginBottom: 8,
        }}>
          <View style={{
            height: '100%',
            backgroundColor: colors.primary,
            borderRadius: 2,
            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          }} />
        </View>
        
        {/* Time Display */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text style={{
            color: colors.white,
            fontSize: 12,
            fontFamily: 'monospace',
          }}>
            {formatTime(currentTime)}
          </Text>
          <Text style={{
            color: colors.white,
            fontSize: 12,
            fontFamily: 'monospace',
          }}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
};
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');


export function CaptionEditorScreenUI({
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
    onSelectLocalVideo,
    onPlayPause,
    onPlaybackStatusUpdate,
    onEditCaptions,

    // Local video state
    localVideoFile,
    isLocalVideo,
    
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
     * Render video preview
     */
    const renderVideoPreview = () => {
        if (!videoLoaded && !videoError) {
            return (
                <View style={styles.noVideoContainer}>
                    <Ionicons name="videocam-outline" size={80} color={colors.textTertiary} />
                    <Text style={styles.noVideoText}>Voer een video-URL in om te beginnen</Text>
                    <Text style={styles.noVideoSubtext}>Ondersteunt YouTube, Vimeo en directe videolinks</Text>
                </View>
            );
        }

        if (videoError) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={80} color={colors.error} />
                    <Text style={styles.errorTitle}>Video Fout</Text>
                    <Text style={styles.errorMessage}>{videoError}</Text>
                    <Text style={styles.errorHint}>
                        Tip: Probeer een directe videolink te gebruiken, of upload een video vanaf je apparaat.
                    </Text>
                </View>
            );
        }

        console.log('🎬 CaptionEditorScreenUI: renderVideoPreview called');
        console.log('📍 CaptionEditorScreenUI: videoUrl:', videoUrl);
        console.log('📍 CaptionEditorScreenUI: extractedVideoUrl:', extractedVideoUrl);
        console.log('📍 CaptionEditorScreenUI: videoLoaded:', videoLoaded);
        console.log('📍 CaptionEditorScreenUI: videoError:', videoError);
        
        return (
            <View style={styles.videoContainer}>
                <VideoPlayer
                    videoUrl={videoUrl}
                    extractedVideoUrl={extractedVideoUrl}
                    videoRef={videoRef}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    style={styles.video}
                    onPlayPause={onPlayPause}
                    isPlaying={isPlaying}
                />
                
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}
            </View>
        );
    };

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
                        onChangeText={onVideoUrlChange}
                        placeholder="Voer video-URL in (bijv. YouTube, Vimeo, of directe link)"
                        placeholderTextColor={colors.textSecondary}
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                        editable={!isLoading}
                    />
                    {videoUrl.length > 0 && (
                        <TouchableOpacity onPress={onClearVideoUrl} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                
                <TouchableOpacity
                    style={[
                        styles.loadButton,
                        (!videoUrl.trim() || isLoading) && styles.loadButtonDisabled
                    ]}
                    onPress={() => onLoadVideo()}
                    disabled={!videoUrl.trim() || isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="download-outline" size={24} color={colors.white} />
                            <Text style={styles.loadButtonText}>URL Laden</Text>
                        </>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.loadButton,
                        styles.localUploadButton,
                        isLoading && styles.loadButtonDisabled
                    ]}
                    onPress={onSelectLocalVideo}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="folder-open-outline" size={24} color={colors.white} />
                            <Text style={styles.loadButtonText}>Video Uploaden</Text>
                        </>
                    )}
                </TouchableOpacity>
                
                {videoError && (
                    <Text style={styles.errorText}>{videoError}</Text>
                )}
            </View>
        );
    };

    /**
     * Render video preview section
     */
    const renderVideoSection = () => {
        if (!videoLoaded && !videoError) return null;
        
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Video Voorbeeld</Text>
                {renderVideoPreview()}
                
                {videoLoaded && (
                    <View style={styles.videoInfo}>
                        <Text style={styles.videoInfoText}>
                            Video geladen • Klik op 'Ondertitels Bewerken' om verder te gaan
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Ondertitel Editor"
                        subtitle="Video laden"
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
                        
                        {/* Video Preview Section */}
                        {renderVideoSection()}
                        
                        {/* Load Video Button - styled like download button */}
                        {videoLoaded && !videoError && (
                            <View style={styles.loadVideoButtonContainer}>
                                <TouchableOpacity
                                    style={styles.loadVideoButton}
                                    onPress={onEditCaptions}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="create-outline" size={24} color={colors.white} />
                                    <Text style={styles.loadVideoButtonText}>Ondertitels Bewerken</Text>
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
    
    // Section Styles
    section: {
        width: '100%',
        marginBottom: layout.spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: layout.spacing.md,
    },
    
    // URL Input Styles - match download page exactly
    urlInput: {
        flex: 1,
        height: 52,
        ...typography.body,
        color: colors.text,
        outlineStyle: 'none',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: layout.spacing.md,
        minHeight: 52,
        marginBottom: layout.spacing.md,
    },
    inputIcon: {
        marginRight: layout.spacing.sm,
    },
    clearButton: {
        padding: layout.spacing.xs,
    },
    loadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.lg,
        borderRadius: layout.radius.lg,
        minHeight: 52,
        gap: layout.spacing.sm,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        elevation: 4,
    },
    loadButtonDisabled: {
        opacity: 0.6,
    },
    localUploadButton: {
        backgroundColor: colors.secondary,
        marginTop: layout.spacing.md,
    },
    loadButtonText: {
        ...typography.button,
        color: colors.white,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: layout.spacing.sm,
    },
    
    // Video Preview Styles - full size display
    videoContainer: {
        backgroundColor: colors.background,
        borderRadius: layout.radius.lg,
        overflow: 'hidden',
        marginTop: layout.spacing.lg,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: SCREEN_WIDTH - (layout.spacing.lg * 2),
    },
    video: {
        width: '100%',
        height: undefined, // Let aspect ratio determine height
        aspectRatio: 16 / 9, // Maintain aspect ratio
        maxHeight: SCREEN_HEIGHT * 0.7, // Allow more height
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
    videoInfo: {
        marginTop: layout.spacing.md,
        padding: layout.spacing.sm,
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.sm,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    videoInfoText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    
    // No Video State
    noVideoContainer: {
        aspectRatio: 16 / 9,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.xl,
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
    
    // Error State
    errorContainer: {
        aspectRatio: 16 / 9,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.xl,
    },
    errorTitle: {
        ...typography.h3,
        color: colors.error,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    errorMessage: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    errorHint: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        textAlign: 'center',
        marginTop: layout.spacing.md,
        fontStyle: 'italic',
    },
    
    // Load Video Button - styled like download button
    loadVideoButtonContainer: {
        alignItems: 'center',
        marginTop: layout.spacing.lg,
        paddingHorizontal: layout.spacing.lg,
    },
    loadVideoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.lg,
        borderRadius: layout.radius.lg,
        minHeight: 52,
        gap: layout.spacing.sm,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        elevation: 4,
    },
    loadVideoButtonText: {
        ...typography.button,
        color: colors.white,
    },
    
    // Video Fallback Styles
    videoFallback: {
        aspectRatio: 16 / 9,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        padding: layout.spacing.lg,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    videoFallbackText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    videoFallbackSubtext: {
        ...typography.body,
        color: colors.textTertiary,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    videoFallbackUrl: {
        ...typography.caption,
        color: colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
