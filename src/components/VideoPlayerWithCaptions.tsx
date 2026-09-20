/**
 * VideoPlayerWithCaptions
 *
 * Video player with integrated caption overlay and playback controls.
 * Uses expo-video for playback and tracks position every 50ms.
 *
 * Requirements: 4.10, 4.11
 */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { Caption_Object } from '../types/caption';
import type { Caption_Style } from '../types/captionStyle';
import { CaptionSynchronizer } from '../utils/captionSynchronizer';
import CaptionOverlay from './CaptionOverlay';
import { colors } from '../styles/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VideoPlayerHandle {
  seekTo: (ms: number) => void;
  play: () => void;
  pause: () => void;
}

interface VideoPlayerWithCaptionsProps {
  videoUrl: string;
  captions: Caption_Object[];
  captionStyle: Caption_Style;
  onTimeUpdate?: (timeMs: number) => void;
  onPlaybackComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Helper: format ms → MM:SS
// ---------------------------------------------------------------------------

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const VideoPlayerWithCaptions = forwardRef<VideoPlayerHandle, VideoPlayerWithCaptionsProps>(
  function VideoPlayerWithCaptions(
    { videoUrl, captions, captionStyle, onTimeUpdate, onPlaybackComplete },
    ref
  ) {
    const [currentTimeMs, setCurrentTimeMs] = useState(0);
    const [durationMs, setDurationMs] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCaption, setActiveCaption] = useState<Caption_Object | null>(null);

    const syncRef = useRef(new CaptionSynchronizer(captions));
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Update synchronizer when captions change
    useEffect(() => {
      syncRef.current.updateCaptions(captions);
    }, [captions]);

    // expo-video player
    const player = useVideoPlayer(videoUrl, (p) => {
      p.loop = false;
    });

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      seekTo: (ms: number) => {
        player.currentTime = ms / 1000;
      },
      play: () => player.play(),
      pause: () => player.pause(),
    }));

    // Poll playback position every 50ms
    useEffect(() => {
      intervalRef.current = setInterval(() => {
        if (!player) return;
        const timeMs = (player.currentTime ?? 0) * 1000;
        const dur = (player.duration ?? 0) * 1000;

        setCurrentTimeMs(timeMs);
        if (dur > 0 && durationMs !== dur) setDurationMs(dur);

        const caption = syncRef.current.getCurrentCaption(timeMs);
        setActiveCaption(caption);

        onTimeUpdate?.(timeMs);
        setIsLoading(false);

        if (dur > 0 && timeMs >= dur - 100) {
          onPlaybackComplete?.();
        }
      }, 50);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [player, durationMs, onTimeUpdate, onPlaybackComplete]);

    const handlePlayPause = useCallback(() => {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying((p) => !p);
    }, [isPlaying, player]);

    const handleSeek = useCallback(
      (value: number) => {
        player.currentTime = value / 1000;
        setCurrentTimeMs(value);
      },
      [player]
    );

    return (
      <View style={styles.container}>
        {/* Video */}
        <View style={styles.videoWrapper}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />

          {/* Caption overlay */}
          <CaptionOverlay caption={activeCaption} style={captionStyle} />

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {/* Big Play Overlay Button */}
          {!isLoading && !isPlaying && (
            <View style={styles.centerPlayButtonContainer} pointerEvents="box-none">
              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.bigPlayButton}
                accessibilityLabel="Speel video af"
              >
                <Ionicons name="play" size={48} color={colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playButton}
            accessibilityLabel={isPlaying ? 'Pauzeer' : 'Afspelen'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>

          <Text style={styles.timeText}>{formatTime(currentTimeMs)}</Text>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={durationMs || 1}
            value={currentTimeMs}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            accessibilityLabel="Zoekbalk"
          />

          <Text style={styles.timeText}>{formatTime(durationMs)}</Text>
        </View>
      </View>
    );
  }
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoWrapper: {
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  centerPlayButtonContainer: {
    ...StyleSheet.absoluteFillObject,
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
    paddingLeft: 4, // center the play icon visually
  },
  playButton: {
    padding: 4,
    marginRight: 8,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
});

export default memo(VideoPlayerWithCaptions);
