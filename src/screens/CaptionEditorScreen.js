/**
 * Caption Editor Screen - Video Selection
 * First screen: Load video via URL input before caption editing
 * FUNCTIONALITY ONLY - UI is in CaptionEditorScreenUI.js
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { layout } from "../styles/layout";
import { typography } from "../styles/typography";
import {
  extractInstagramVideoUrl,
  cleanupVideo,
  isValidInstagramUrl,
  getErrorMessage,
} from "../services/instagramDownloaderService";
import { loadResultsHistory } from '../utils/storage';
import {
  extractVideo,
  isValidUrl,
  detectPlatform,
} from "../services/videoExtractService";
import {
  saveEditingSession,
  loadEditingSession,
} from "../utils/captionSession";
import { selectVideoFile, validateVideoFile } from '../services/fileHandler';
import { transcribeVideo as transcribeVideoFromApi } from '../services/supadataService';

// Video component with fallback for web compatibility
let Video;
try {
  Video = require("react-native-video").default;
} catch (error) {
  Video = null;
}
import { CaptionEditorScreenUI } from "../ui/screens/CaptionEditorScreenUI";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function CaptionEditorScreen({ navigation, route }) {
  console.log("🎬 CaptionEditorScreen: Component starting to render");
  console.log(
    "📍 CaptionEditorScreen: Navigation prop:",
    navigation ? "present" : "missing",
  );
  console.log("📍 CaptionEditorScreen: Route params:", route?.params);

  // Video state
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [extractedVideoUrl, setExtractedVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  // Local video state
  const [localVideoFile, setLocalVideoFile] = useState(null);
  const [isLocalVideo, setIsLocalVideo] = useState(false);

  // Auto-load video if params are provided from navigation
  useEffect(() => {
    if (route?.params?.reelUrl) {
      console.log("📍 CaptionEditorScreen: Auto-loading video from params:", route.params.reelUrl);
      setVideoUrl(route.params.reelUrl);
      // Trigger the load video function
      setTimeout(() => {
        handleLoadVideo(route.params.reelUrl);
      }, 100);
    }
  }, [route?.params?.reelUrl]);

  const normalizeUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    return url.trim().replace(/\/+$/, '').toLowerCase();
  };

  const createStableVideoId = (url) => {
    const normalized = normalizeUrl(url);
    let hash = 0;
    for (let i = 0; i < normalized.length; i += 1) {
      hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0;
    }
    return `video_${Math.abs(hash).toString(36) || Date.now()}`;
  };

  // Rate limiting state
  const lastApiCallTime = useRef(0);
  const RATE_LIMIT_DELAY = 3000; // 3 seconds between API calls

  /**
   * Validate video URL
   */
  const isValidVideoUrl = (url) => {
    // Handle event objects by extracting the actual URL
    if (!url) return false;
    
    // If it's an event object, try to get the URL from the current state
    if (typeof url !== 'string') {
      console.log('[CAPTION-EDITOR] Non-string URL passed, using state value');
      return false;
    }
    
    if (url.trim().length === 0) return false;

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)/;
    if (!urlPattern.test(url.trim())) return false;

    // Check for common video file extensions or streaming platforms
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|wmv|flv|m4v)(\?.*)?$/i;
    const streamingPlatforms =
      /(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv|instagram\.com)/i;

    return videoExtensions.test(url) || streamingPlatforms.test(url);
  };

  /**
   * Handle local video file selection
   */
  const handleSelectLocalVideo = async () => {
    try {
      setIsLoading(true);
      setVideoError(null);
      
      const file = await selectVideoFile();
      
      if (!file) {
        setIsLoading(false);
        return;
      }

      // Validate file
      await validateVideoFile(file);
      
      console.log('[CAPTION-EDITOR] Local video selected:', file.name, file.size);
      
      setLocalVideoFile(file);
      setExtractedVideoUrl(file.uri);
      setVideoLoaded(true);
      setIsLocalVideo(true);
      setVideoId(`local_${Date.now()}`);
      
      // For local videos, navigate directly to workspace without extraction
      // The caption workspace will handle transcription using the file URI
      const newVideoName = file.name;
      await saveEditingSession({
        originalVideoUrl: file.uri,
        videoUri: file.uri,
        videoName: newVideoName,
        videoId: `local_${Date.now()}`,
        isLocal: true,
        localVideoFile: file,
      });
      
      navigation.navigate('CaptionEditorWorkspace', {
        videoUri: file.uri,
        originalVideoUrl: file.uri,
        videoName: newVideoName,
        videoId: `local_${Date.now()}`,
        isLocal: true,
        localVideoFile: file,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('[CAPTION-EDITOR] Local video selection failed:', error);
      setVideoError(error.message);
      Alert.alert('Fout bij selecteren', error.message);
      setIsLoading(false);
    }
  };

  /**
   * Load video from URL
   */
  const handleLoadVideo = async (urlToLoad = null) => {
    // Handle event objects - use current state if event is passed
    let urlToUse = urlToLoad || videoUrl;
    
    // If urlToLoad is an event object, use the current videoUrl state
    if (urlToLoad && typeof urlToLoad !== 'string') {
      console.log('[CAPTION-EDITOR] Event object passed, using current videoUrl state');
      urlToUse = videoUrl;
    }
    
    console.log("[CAPTION-EDITOR] Load video button clicked, URL:", urlToUse);

    if (!isValidVideoUrl(urlToUse)) {
      Alert.alert("Ongeldige URL", "Voer een geldige video-URL in");
      return;
    }

    // Check rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTime.current;
    if (timeSinceLastCall < RATE_LIMIT_DELAY) {
      const waitTime = Math.ceil((RATE_LIMIT_DELAY - timeSinceLastCall) / 1000);
      Alert.alert(
        "Rate Limit",
        `Please wait ${waitTime} second${waitTime > 1 ? "s" : ""} before making another request.`,
        [{ text: "OK" }],
      );
      return;
    }

    lastApiCallTime.current = now;
    setIsLoading(true);
    setVideoError(null);
    setVideoLoaded(false);
    console.log("[CAPTION-EDITOR] Starting video load...");

    try {
      // Check history first: if this URL was processed earlier, reuse results
      try {
        const history = await loadResultsHistory();
        if (history && history.length) {
          const normalizedVideoUrl = normalizeUrl(urlToUse);
          const match = history.find((h) => {
            const normalizedHistoryUrl = normalizeUrl(h.originalUrl);
            const normalizedCaptionUrl = normalizeUrl(h.originalVideoUrl);
            const normalizedVideoUrlField = normalizeUrl(h.videoUrl);
            // Check all types (caption_editor, transcription, etc.) for URL match
            return (
              (normalizedHistoryUrl && normalizedHistoryUrl === normalizedVideoUrl) ||
              (normalizedCaptionUrl && normalizedCaptionUrl === normalizedVideoUrl) ||
              (normalizedVideoUrlField && normalizedVideoUrlField === normalizedVideoUrl)
            );
          });
          if (match) {
            console.log('[CAPTION-EDITOR] Found existing processed result in history for URL:', urlToUse, 'type:', match.type);
            const newVideoId = match.videoId || createStableVideoId(match.originalVideoUrl || urlToUse);
            const newVideoName = `Video - ${new Date().toLocaleTimeString()}`;
            const playableUrl = match.videoUrl || match.originalVideoUrl || videoUrl;
            await saveEditingSession({
                originalVideoUrl: match.originalUrl || videoUrl,
                videoUri: playableUrl,
                videoName: newVideoName,
                videoId: newVideoId,
            });
            // Navigate to workspace with processed results attached
            navigation.navigate('CaptionEditorWorkspace', {
              videoUri: playableUrl,
              originalVideoUrl: urlToUse,
              videoName: newVideoName,
              videoId: newVideoId,
              processedResults: match,
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (hx) {
        console.warn('[CAPTION-EDITOR] History check failed (non-fatal):', hx.message);
      }

      let finalVideoUrl = urlToUse;

      // Check if it's a social media URL (Instagram/TikTok) and extract video
      const platform = detectPlatform(urlToUse);
      if (platform) {
        console.log(
          `[CAPTION-EDITOR] ========== ${platform.toUpperCase()} VIDEO DETECTION ==========`,
        );
        console.log(`[CAPTION-EDITOR] ${platform} URL detected:`, urlToUse);
        console.log(
          "[CAPTION-EDITOR] Using reliable API extraction (RapidAPI + self-hosted fallbacks)...",
        );

        try {
          console.log("[CAPTION-EDITOR] Calling extractVideo...");
          const result = await extractVideo(urlToUse);

          if (!result.success) {
            throw new Error(result.error || "Failed to extract video");
          }

          finalVideoUrl = result.videoUrl;

          console.log(`[CAPTION-EDITOR] ✅ ${platform} extraction successful!`);
          console.log("[CAPTION-EDITOR] Method used:", result.method);
          console.log(
            "[CAPTION-EDITOR] Proxy applied:",
            result.proxied ? "yes" : "no",
          );
          console.log(
            "[CAPTION-EDITOR] Final video URL:",
            finalVideoUrl.substring(0, 100) + "...",
          );

          console.log(
            `[CAPTION-EDITOR] 🎉 Successfully loaded ${platform} video via API`,
          );
        } catch (error) {
          console.error(
            `[CAPTION-EDITOR] 💥 Failed to extract ${platform} video:`,
          );
          console.error("[CAPTION-EDITOR] Error:", error.message);

          // Simple error message
          setVideoError(`Sorry, we couldn't load this ${platform} video.`);
          setIsLoading(false);
          return;
        }
      } else {
        console.log(
          "[CAPTION-EDITOR] Direct video URL detected, using as-is:",
          urlToUse,
        );
      }

      // Store the extracted video URL
      setExtractedVideoUrl(finalVideoUrl);
      setVideoUrl(urlToUse); // Update the state with the final URL being used

      // Reset video ref for web
      if (videoRef.current && Platform.OS === "web") {
        try {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        } catch (error) {
          console.log("[CAPTION-EDITOR] Error resetting video:", error);
        }
      }

      // Small delay to ensure proper loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      setVideoLoaded(true);
      setIsLoading(false);
      console.log(
        "[CAPTION-EDITOR] Video loaded successfully, videoLoaded:",
        true,
      );
    } catch (error) {
      console.error("[CAPTION-EDITOR] Error loading video:", error);
      setVideoError(
        "Sorry, we couldn't load this video. Please try again later or upload the video directly.",
      );
      setIsLoading(false);
    }
  };

  /**
   * Handle playback status update
   */
  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying || false);
      setPosition((status.positionMillis || 0) / 1000);

      if (status.durationMillis) {
        setDuration(status.durationMillis / 1000);
      }
    } else if (status.error) {
      console.error("[CAPTION-EDITOR] Playback error:", status.error);
      // Provide user-friendly error message based on error type
      let errorMessage = "Sorry, we couldn't play this video.";

      if (
        status.error.message &&
        status.error.message.includes("no supported sources")
      ) {
        errorMessage =
          "This video format isn't supported. Please try uploading the video directly or use a different Instagram video.";
      } else if (
        status.error.message &&
        status.error.message.includes("network")
      ) {
        errorMessage =
          "Network error occurred. Please check your connection and try again.";
      } else if (
        status.error.message &&
        status.error.message.includes("cors")
      ) {
        errorMessage =
          "Video access blocked. Please try uploading the video directly.";
      }

      setVideoError(errorMessage);
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
      console.error("[CAPTION-EDITOR] Playback error:", err);
    }
  };

  // Callback functions for UI
  const handleVideoUrlChange = (url) => setVideoUrl(url);
  const handleClearVideoUrl = () => setVideoUrl("");

  // ─── Session restore ────────────────────────────────────────────────────
  // On mount, check for a saved editing session. If one exists the user is
  // taken directly back to the caption workspace without having to re-enter
  // the URL. The captions are stored separately by saveCaptionData() and are
  // loaded automatically by CaptionEditorWorkspace on mount.
  useEffect(() => {
    console.log(
      "[CAPTION-EDITOR] Session restore is disabled to ensure the input field is shown first",
    );
    // If you want to preserve session state without navigating automatically,
    // the session can be loaded manually on demand instead of restoring here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    console.log(
      "[CAPTION-EDITOR] Component mounted, setting up cleanup handler",
    );

    return () => {
      console.log("[CAPTION-EDITOR] Component unmounting, running cleanup");
      if (videoId) {
        console.log("[CAPTION-EDITOR] Cleaning up video:", videoId);
        cleanupVideo(videoId)
          .then(() =>
            console.log("[CAPTION-EDITOR] ✅ Video cleanup completed"),
          )
          .catch((err) =>
            console.error("[CAPTION-EDITOR] ❌ Video cleanup failed:", err),
          );
      } else {
        console.log("[CAPTION-EDITOR] No video ID to cleanup");
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // ─── Start editing ──────────────────────────────────────────────────────
  const handleStartEditing = async () => {
    console.log("📍 CaptionEditorScreen: handleStartEditing called");
    console.log("📍 CaptionEditorScreen: Navigation available:", !!navigation);

    if (!navigation) {
      console.error("❌ CaptionEditorScreen: Navigation prop is missing!");
      return;
    }

    // Generate a stable videoId that will be used as the caption storage key
    const newVideoId = createStableVideoId(videoUrl);
    const newVideoName = `Video - ${new Date().toLocaleTimeString()}`;

    // ── Persist the session so it survives a page refresh ───────────────
    await saveEditingSession({
      originalVideoUrl: videoUrl,
      videoUri: extractedVideoUrl || videoUrl,
      videoName: newVideoName,
      videoId: newVideoId,
    });

    console.log(
      "📍 CaptionEditorScreen: Session saved — navigating to workspace",
    );
    navigation.navigate("CaptionEditorWorkspace", {
      videoUri: extractedVideoUrl || videoUrl,
      originalVideoUrl: videoUrl,
      videoName: newVideoName,
      videoId: newVideoId,
    });
  };

  console.log("📍 CaptionEditorScreen: Rendering CaptionEditorScreenUI");
  return (
    <CaptionEditorScreenUI
      // Video state
      videoRef={videoRef}
      videoUrl={videoUrl}
      extractedVideoUrl={extractedVideoUrl}
      isLoading={isLoading}
      videoLoaded={videoLoaded}
      videoError={videoError}
      isPlaying={isPlaying}
      duration={duration}
      position={position}
      // Local video state
      localVideoFile={localVideoFile}
      isLocalVideo={isLocalVideo}
      // Input state
      quickStartUrl={videoUrl}
      // Callback functions
      onVideoUrlChange={handleVideoUrlChange}
      onClearVideoUrl={handleClearVideoUrl}
      onLoadVideo={handleLoadVideo}
      onSelectLocalVideo={handleSelectLocalVideo}
      onPlayPause={handlePlayPause}
      onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      onEditCaptions={handleStartEditing}
      // UI state (for TabNavigator compatibility)
      activeTab={null}
      setActiveTab={() => {}}
      processParams={null}
      setProcessParams={() => {}}
      handleTabPress={() => {}}
      transcriptionResultsParams={null}
      showTranscriptionResults={false}
      setShowTranscriptionResults={() => {}}
      showApiKeyScreen={false}
      setShowApiKeyScreen={() => {}}
      showInstagramConfig={false}
      setShowInstagramConfig={() => {}}
      captionEditorWorkspaceParams={null}
      setCaptionEditorWorkspaceParams={() => {}}
      downloadStackNavigator={null}
      libraryStackNavigator={null}
    />
  );
}
