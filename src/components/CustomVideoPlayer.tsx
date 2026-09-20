/**
 * CustomVideoPlayer
 *
 * Custom HTML5 video player with caption overlay and custom controls.
 * Designed for web/PWA with iOS Safari compatibility.
 * Does NOT use native iOS video player or fullscreen API.
 */

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Caption_Object } from '../types/caption';
import type { Caption_Style } from '../types/captionStyle';
import { colors } from '../styles/colors';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface CustomVideoPlayerHandle {
  seekTo: (ms: number) => void;
  play: () => void;
  pause: () => void;
}

interface CustomVideoPlayerProps {
  videoUrl: string;
  captions: Caption_Object[];
  captionStyle: Caption_Style;
  onTimeUpdate?: (timeMs: number) => void;
  onPlaybackComplete?: () => void;
}

const CustomVideoPlayer = forwardRef<CustomVideoPlayerHandle, CustomVideoPlayerProps>(
  function CustomVideoPlayer(
    { videoUrl, captions, captionStyle, onTimeUpdate, onPlaybackComplete },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeCaption, setActiveCaption] = useState<Caption_Object | null>(null);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      seekTo: (ms: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = ms / 1000;
        }
      },
      play: () => {
        if (videoRef.current) {
          videoRef.current.play();
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      },
    }));

    // Format time to MM:SS
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Find current caption based on timestamp
    const getCurrentCaption = useCallback((timeMs: number): Caption_Object | null => {
      return captions.find(
        (caption) => timeMs >= caption.startTime && timeMs <= caption.endTime
      ) || null;
    }, [captions]);

    // Update active caption based on current time
    useEffect(() => {
      const caption = getCurrentCaption(currentTime * 1000);
      setActiveCaption(caption);
    }, [currentTime, getCurrentCaption]);

    // Handle video events
    useEffect(() => {
      if (!videoRef.current || !isBrowser) return;

      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        onTimeUpdate?.(video.currentTime * 1000);
      };

      const handlePlay = () => {
        setIsPlaying(true);
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        onPlaybackComplete?.();
      };

      const handleWaiting = () => {
        setIsLoading(true);
      };

      const handleCanPlay = () => {
        setIsLoading(false);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('canplay', handleCanPlay);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }, [onTimeUpdate, onPlaybackComplete]);

    // Auto-hide controls
    const resetControlsTimeout = useCallback(() => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }, [isPlaying]);

    useEffect(() => {
      resetControlsTimeout();
      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, [isPlaying, resetControlsTimeout]);

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
      if (!videoRef.current) return;
      
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      resetControlsTimeout();
    }, [isPlaying, resetControlsTimeout]);

    // Handle seek
    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
      resetControlsTimeout();
    }, [resetControlsTimeout]);

    // Toggle fullscreen (custom, not native)
    const toggleFullscreen = useCallback(() => {
      setIsFullscreen((prev) => !prev);
      resetControlsTimeout();
    }, [resetControlsTimeout]);

    // Render caption text
    const renderCaption = () => {
      if (!activeCaption) return null;

      const scale = isFullscreen ? 1.5 : 1;
      const fontSize = Math.max(16, (captionStyle.fontSize || 24) * scale);
      const fontWeight = captionStyle.bold ? '700' : '400';
      const fontStyle = captionStyle.italic ? 'italic' : 'normal';
      const fontFamily = captionStyle.fontFamily || 'Arial';

      const textStyle: React.CSSProperties = {
        fontSize: `${fontSize}px`,
        fontWeight,
        fontStyle,
        fontFamily,
        color: captionStyle.textColor || '#ffffff',
        textAlign: 'center',
        textShadow: captionStyle.shadow ? '2px 2px 4px rgba(0,0,0,0.85)' : 'none',
        padding: '8px 16px',
        maxWidth: '80%',
      };

      const backgroundStyle: React.CSSProperties = {
        backgroundColor: captionStyle.backgroundColor !== 'transparent' 
          ? `${captionStyle.backgroundColor}${Math.round((captionStyle.backgroundOpacity || 0.8) * 255).toString(16).padStart(2, '0')}`
          : 'transparent',
        borderRadius: '8px',
        padding: '8px 16px',
      };

      return (
        <div style={backgroundStyle}>
          <p style={textStyle}>
            {captionStyle.allCaps ? activeCaption.text.toUpperCase() : activeCaption.text}
          </p>
        </div>
      );
    };

    if (!isBrowser) {
      return (
        <View style={styles.container}>
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      );
    }

    return (
      <View
        ref={containerRef as any}
        style={[
          styles.container,
          isFullscreen && styles.fullscreenContainer
        ]}
      >
        <div style={styles.videoWrapper}>
          <video
            ref={videoRef}
            src={videoUrl}
            style={styles.video}
            playsInline
            webkit-playsinline="true"
            onClick={togglePlayPause}
          />

          {/* Caption overlay */}
          {activeCaption && (
            <div style={styles.captionOverlay}>
              {renderCaption()}
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </div>
          )}

          {/* Big play button overlay */}
          {!isLoading && !isPlaying && (
            <div style={styles.bigPlayButtonOverlay}>
              <TouchableOpacity
                onPress={togglePlayPause}
                style={styles.bigPlayButton}
              >
                <Ionicons name="play" size={48} color={colors.white} />
              </TouchableOpacity>
            </div>
          )}

          {/* Controls */}
          {showControls && (
            <div style={styles.controls}>
              <TouchableOpacity
                onPress={togglePlayPause}
                style={styles.controlButton}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color={colors.white}
                />
              </TouchableOpacity>

              <span style={styles.timeText}>{formatTime(currentTime)}</span>

              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                style={styles.slider}
              />

              <span style={styles.timeText}>{formatTime(duration)}</span>

              <TouchableOpacity
                onPress={toggleFullscreen}
                style={styles.controlButton}
              >
                <Ionicons
                  name={isFullscreen ? 'contract' : 'expand'}
                  size={28}
                  color={colors.white}
                />
              </TouchableOpacity>
            </div>
          )}
        </div>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  fullscreenContainer: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    borderRadius: 0,
    aspectRatio: undefined,
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  captionOverlay: {
    position: 'absolute' as any,
    bottom: '15%',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  loadingOverlay: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bigPlayButtonOverlay: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  controls: {
    position: 'absolute' as any,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row' as any,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    gap: 8,
  },
  controlButton: {
    padding: 4,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  slider: {
    flex: 1,
    height: 4,
    cursor: 'pointer',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomVideoPlayer;
