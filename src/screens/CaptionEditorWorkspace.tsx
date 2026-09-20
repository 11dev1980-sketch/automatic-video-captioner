/**
 * CaptionEditorWorkspace (TypeScript version)
 *
 * Main caption editor screen integrating all components:
 * VideoPlayerWithCaptions, CaptionTimeline, SettingsPanel, ExportPanel.
 * Handles caption generation on mount, editing operations, and state persistence.
 *
 * Requirements: All phases
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Caption_Object } from "../types/caption";
import type { Caption_Style } from "../types/captionStyle";
import { CAPTION_STYLE_PRESETS } from "../types/captionStyle";
import {
  splitCaption,
  mergeAdjacentCaptions,
  deleteCaption,
  updateCaptionText,
} from "../utils/captionOperations";
import {
  saveCaptionData,
  loadCaptionData,
  saveCaptionProject,
  loadCaptionProject,
} from "../utils/persistence";
import { touchEditingSession } from "../utils/captionSession";
import { captionAPI, mediaAPI, videoAPI } from "../api/client";
import { saveResultToHistory } from "../utils/storage";
import {
  burnCaptionsInBrowser,
  canBurnVideoInBrowser,
} from "../services/browserVideoBurner";
import { colors } from "../styles/colors";

// Lazy component imports with fallbacks
let CustomVideoPlayer: any = null;
let CaptionTimeline: any = null;
let SettingsPanel: any = null;
let ExportPanel: any = null;

try {
  CustomVideoPlayer =
    require("../components/CustomVideoPlayer").default;
} catch {}
try {
  CaptionTimeline = require("../components/CaptionTimeline").default;
} catch {}
try {
  SettingsPanel = require("../components/SettingsPanel").default;
} catch {}
try {
  ExportPanel = require("../components/ExportPanel").default;
} catch {}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = "edit" | "style" | "export";

interface RouteParams {
  videoUrl?: string;
  /** CaptionEditorScreen passes the extracted video URL as videoUri */
  videoUri?: string;
  originalVideoUrl?: string;
  title?: string;
  targetLanguage?: string;
  sourceLanguage?: string;
  apiKey?: string;
  wordsPerCaption?: number;
  videoName?: string;
  videoId?: string;
  returnTo?: string;
  /**
   * Dev Preview only — pre-loaded Caption_Object[] injected by DevPreviewScreen.
   * When present the component skips the caption-generation API call entirely
   * and uses these captions directly, so no API quota is consumed.
   */
  __demoData?: Caption_Object[];
}

interface CaptionEditorWorkspaceProps {
  route?: { params?: RouteParams };
  navigation?: any;
}

// ---------------------------------------------------------------------------
// Default settings
// ---------------------------------------------------------------------------

const DEFAULT_STYLE: Caption_Style = { ...CAPTION_STYLE_PRESETS.modern };
const DEFAULT_WORDS_PER_CAPTION = 5;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function CaptionEditorWorkspace({
  route,
  navigation,
}: CaptionEditorWorkspaceProps) {
  const params = route?.params ?? {};
  const {
    // CaptionEditorScreen.js sends videoUri; older callers send videoUrl
    videoUri,
    videoUrl: videoUrlParam = "",
    originalVideoUrl = "",
    title = "Bijschriften editor",
    targetLanguage = "dutch",
    sourceLanguage,
    apiKey,
    wordsPerCaption: initialWords = DEFAULT_WORDS_PER_CAPTION,
    videoId: routeVideoId,
    __demoData,
  } = params;
  // Normalise: prefer videoUri (from CaptionEditorScreen) over videoUrl
  const videoUrl = videoUri || videoUrlParam; // CDN URL for video playback
  // For transcription, prefer the direct video URL whenever available.
  // Fall back to the original social media URL only if a direct stream URL is unavailable.
  const transcriptionUrl = videoUrl || originalVideoUrl;

  const [captions, setCaptions] = useState<Caption_Object[]>([]);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [captionStyle, setCaptionStyle] =
    useState<Caption_Style>(DEFAULT_STYLE);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState(videoUrl);
  const [wordsPerCaption, setWordsPerCaption] = useState(initialWords);
  const [activeTab, setActiveTab] = useState<TabId>("edit");

  const isSocialMediaUrl = useCallback((url: string) => {
    return /^https?:\/\/(www\.)?(instagram\.com|instagr\.am|tiktok\.com|vm\.tiktok|vt\.tiktok)\//.test(
      url,
    );
  }, []);

  const resolveDirectVideoUrl = useCallback(async (url: string) => {
    if (!url || !isSocialMediaUrl(url)) {
      return url;
    }

    console.log(
      "[CaptionEditorWorkspace] Resolving direct video URL before caption generation:",
      url,
    );

    try {
      const extractResult: any = await videoAPI.extract(url);
      if (extractResult?.success && extractResult?.videoUrl) {
        console.log(
          "[CaptionEditorWorkspace] videoAPI.extract returned direct URL:",
          extractResult.videoUrl,
        );
        return extractResult.videoUrl;
      }

      console.warn(
        "[CaptionEditorWorkspace] videoAPI.extract did not return a direct video URL:",
        extractResult,
      );
    } catch (err: any) {
      console.warn(
        "[CaptionEditorWorkspace] videoAPI.extract failed:",
        err?.message || err,
      );
    }

    try {
      const mediaResult: any = /tiktok|vm\.tiktok|vt\.tiktok/.test(url)
        ? await mediaAPI.tiktok(url)
        : await mediaAPI.instagram(url);

      if (mediaResult?.success && mediaResult?.videoUrl) {
        console.log(
          "[CaptionEditorWorkspace] mediaAPI returned direct URL:",
          mediaResult.videoUrl,
        );
        return mediaResult.videoUrl;
      }
    } catch (err: any) {
      console.warn(
        "[CaptionEditorWorkspace] mediaAPI extraction failed:",
        err?.message || err,
      );
    }

    return url;
  }, [isSocialMediaUrl]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const playerRef = useRef<any>(null);
  const videoId = routeVideoId || videoUrl.slice(-20).replace(/[^a-z0-9]/gi, "_") || "unknown";
  const previewVideoUrl = resolvedVideoUrl || videoUrl;

  // Load saved captions or generate new ones on mount
  useEffect(() => {
    if (!videoUrl) return;

    // ── Dev Preview mode ─────────────────────────────────────────────────────
    // When __demoData captions are injected by DevPreviewScreen we skip the
    // API call entirely so no API quota is consumed.
    if (__demoData && __demoData.length > 0) {
      setCaptions(__demoData);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    (async () => {
      // Try to load saved captions first
      const project = await loadCaptionProject(videoId);
      if (project?.captions?.length) {
        setCaptions(project.captions);
        if (project.captionStyle) setCaptionStyle(project.captionStyle);
        if (project.wordsPerCaption) setWordsPerCaption(project.wordsPerCaption);
        if (project.videoUrl) setResolvedVideoUrl(project.videoUrl);
        return;
      }

      const saved = await loadCaptionData(videoId);
      if (saved && saved.length > 0) {
        setCaptions(project?.captions || saved);
        if (project?.captionStyle) setCaptionStyle(project.captionStyle);
        if (project?.wordsPerCaption) setWordsPerCaption(project.wordsPerCaption);
        if (project?.videoUrl) setResolvedVideoUrl(project.videoUrl);
        return;
      }
      // Otherwise generate new captions
      generateCaptions();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl]);

  useEffect(() => {
    if (!videoUrl) return;

    (async () => {
      const resolved = await resolveDirectVideoUrl(videoUrl);
      setResolvedVideoUrl(resolved);
    })();
  }, [videoUrl, resolveDirectVideoUrl]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (videoUrl) {
      generateCaptions();
    }
  }, [wordsPerCaption]);

  // Generate captions via API
  const generateCaptions = useCallback(async () => {
    if (!videoUrl) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStep("Bijschriften ophalen...");
    setGenerationProgress(10);

    try {
      setGenerationStep("Transcriberen...");
      setGenerationProgress(30);

      // Only resolve URL if it's a social media URL; skip for already-resolved CDN URLs
      let resolvedUrl = transcriptionUrl;
      if (isSocialMediaUrl(transcriptionUrl)) {
        resolvedUrl = await resolveDirectVideoUrl(transcriptionUrl);
      }
      setResolvedVideoUrl(resolvedUrl);

      console.log("[CaptionEditorWorkspace] generateCaptions payload:", {
        transcriptionUrl,
        resolvedUrl,
        isSocialMediaUrl: isSocialMediaUrl(transcriptionUrl),
        targetLanguage,
        sourceLanguage,
        wordsPerCaption,
      });

      const result: any = await captionAPI.generate({
        videoUrl: resolvedUrl,
        targetLanguage: targetLanguage as any,
        sourceLanguage: sourceLanguage as any,
        apiKey,
        wordsPerCaption,
      });

      setGenerationProgress(90);

      if (result?.success === false) {
        throw new Error(result.error || result.details || "Bijschriften genereren mislukt");
      }

      if (result?.data?.captions && result.data.captions.length > 0) {
        setCaptions(result.data.captions);
        await saveCaptionData(videoId, result.data.captions);
        setGenerationStep("Klaar!");
        setGenerationProgress(100);
      } else {
        throw new Error(result?.error || result?.details || "Geen bijschriften ontvangen");
      }
    } catch (error: any) {
      console.error("[CaptionEditorWorkspace] generateCaptions failed:", error, 'body:', (error && error.body) || null);
      let msg = "Bijschriften genereren mislukt";
      if (error) {
        if (typeof error === 'string') {
          msg = error;
        } else if (error.body) {
          try {
            const body = error.body;
            if (typeof body === 'string') {
              try {
                const parsed = JSON.parse(body);
                msg = parsed?.error || parsed?.details || parsed?.message || JSON.stringify(parsed);
              } catch {
                msg = body;
              }
            } else if (typeof body === 'object') {
              msg = body?.error || body?.details || body?.message || JSON.stringify(body);
            } else {
              msg = error.message || String(error);
            }
          } catch (e) {
            msg = error.message || String(error);
          }
        } else {
          msg = error.message || String(error);
        }
      }
      setGenerationError(msg);
      setGenerationStep("");
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        setGenerationStep("");
      }, 1500);
    }
  }, [
    videoUrl,
    transcriptionUrl,
    targetLanguage,
    sourceLanguage,
    apiKey,
    wordsPerCaption,
    videoId,
    isSocialMediaUrl,
    resolveDirectVideoUrl,
  ]);

  // Auto-save captions when they change and refresh the session timestamp so
  // the session stays alive as long as the user is actively editing.
  useEffect(() => {
    if (captions.length > 0 && videoId) {
      saveCaptionData(videoId, captions);
      saveCaptionProject({
        videoId,
        videoUrl: resolvedVideoUrl || videoUrl,
        originalVideoUrl: originalVideoUrl || videoUrl,
        videoName: title,
        captions,
        captionStyle,
        wordsPerCaption,
        savedAt: Date.now(),
      });
      saveResultToHistory({
        id: `caption_${videoId}`,
        type: "caption_editor",
        timestamp: Date.now(),
        videoId,
        videoName: title || "Caption editor",
        videoUrl: resolvedVideoUrl || videoUrl,
        originalVideoUrl: originalVideoUrl || videoUrl,
        captionCount: captions.length,
        captionStyle,
        wordsPerCaption,
      });
      // Best-effort: keep session alive in AsyncStorage
      touchEditingSession().catch(() => {});
    }
  }, [captions, videoId, resolvedVideoUrl, videoUrl, originalVideoUrl, title, captionStyle, wordsPerCaption]);



  // Caption editing handlers
  const handleCaptionPress = useCallback((caption: Caption_Object) => {
    playerRef.current?.seekTo(caption.startTime);
  }, []);

  const handleCaptionEdit = useCallback((id: string, text: string) => {
    setCaptions((prev) => updateCaptionText(prev, id, text));
  }, []);

  const handleCaptionDelete = useCallback((id: string) => {
    setCaptions((prev) => deleteCaption(prev, id));
  }, []);

  const handleCaptionSplit = useCallback(
    (id: string) => {
      setCaptions((prev) => splitCaption(prev, id, currentTimeMs));
    },
    [currentTimeMs],
  );

  const handleCaptionMerge = useCallback((id: string) => {
    setCaptions((prev) => mergeAdjacentCaptions(prev, id));
  }, []);

  const handleStyleChange = useCallback((style: Caption_Style) => {
    setCaptionStyle(style);
  }, []);

  // Tabs
  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: "edit", label: "Bewerken", icon: "create-outline" },
    { id: "style", label: "Stijl", icon: "color-palette-outline" },
    { id: "export", label: "Export", icon: "download-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Terug"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Video player */}
      <View style={styles.playerArea}>
        {videoUrl && CustomVideoPlayer ? (
          <CustomVideoPlayer
            ref={playerRef}
            videoUrl={previewVideoUrl}
            captions={captions}
            captionStyle={captionStyle}
            onTimeUpdate={setCurrentTimeMs}
          />
        ) : (
          <View style={styles.placeholderPlayer}>
            <Ionicons
              name="videocam-outline"
              size={40}
              color={colors.textTertiary}
            />
            <Text style={styles.placeholderText}>
              {videoUrl ? "Video laden..." : "Geen video geselecteerd"}
            </Text>
          </View>
        )}
      </View>

      {/* Generation progress overlay */}
      {isGenerating && (
        <View style={styles.generationOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.generationStep}>{generationStep}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${generationProgress}%` as any },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{generationProgress}%</Text>
        </View>
      )}



      {/* Error state */}
      {generationError && !isGenerating && captions.length === 0 && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={16} color={colors.error} />
          <Text style={styles.errorText}>{generationError}</Text>
          <TouchableOpacity onPress={generateCaptions} style={styles.retryBtn}>
            <Text style={styles.retryText}>Opnieuw</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={
                activeTab === tab.id ? colors.primary : colors.textTertiary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === "edit" &&
          (CaptionTimeline ? (
            <CaptionTimeline
              captions={captions}
              currentTime={currentTimeMs}
              onCaptionPress={handleCaptionPress}
              onCaptionEdit={handleCaptionEdit}
              onCaptionDelete={handleCaptionDelete}
              onCaptionSplit={handleCaptionSplit}
              onCaptionMerge={handleCaptionMerge}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                {captions.length} bijschriften geladen
              </Text>
            </View>
          ))}

        {activeTab === "style" &&
          (SettingsPanel ? (
            <SettingsPanel
              settings={{ wordsPerCaption, captionStyle }}
              onSettingsChange={(s: any) => {
                setWordsPerCaption(s.wordsPerCaption);
                setCaptionStyle(s.captionStyle);
              }}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Stijlinstellingen</Text>
            </View>
          ))}

        {activeTab === "export" &&
          (ExportPanel ? (
            <ExportPanel
              captions={captions}
              videoUrl={resolvedVideoUrl || videoUrl}
              captionStyle={captionStyle}
              onExportComplete={() => {
                // Export saves directly to local disk, no need to manage url
              }}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Exporteren</Text>
            </View>
          ))}
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  regenerateBtn: { padding: 4 },
  playerArea: {
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  placeholderPlayer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  generationOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,14,26,0.9)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    zIndex: 10,
  },
  generationStep: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  progressBar: {
    width: "60%",
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  progressText: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: 13,
  },
  retryBtn: { padding: 4 },
  retryText: { color: colors.primary, fontSize: 13, fontWeight: "600" },

  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    gap: 3,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  tabText: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
});

// ---------------------------------------------------------------------------
// Exports
// Metro bundler resolves .tsx before .js, so this file wins when another
// module does:  import { CaptionEditorWorkspace } from './CaptionEditorWorkspace'
// We therefore export both a default export and a named export so that
// both import styles work:
//   import CaptionEditorWorkspace from './CaptionEditorWorkspace'  ✓
//   import { CaptionEditorWorkspace } from './CaptionEditorWorkspace'  ✓
// ---------------------------------------------------------------------------
export default CaptionEditorWorkspace;
export { CaptionEditorWorkspace };
