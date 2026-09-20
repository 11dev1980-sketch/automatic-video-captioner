/**
 * DevPreviewScreen — Developer tool
 *
 * Renders every real production screen with mock data so the developer can inspect
 * UI/UX without spending API quota. No API calls are made — all data is from demoData.js.
 *
 * Accessed via the 🧑‍💻 button on the Home screen.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Real production screens (rendered directly with mock data)
import { ResultsScreen } from "./ResultsScreen";
import { TranscriptionResultsScreen } from "./TranscriptionResultsScreen";
import { CaptionEditorWorkspace } from "./CaptionEditorWorkspace";
import { VideoPlayerScreen } from "./VideoPlayerScreen";
import { CaptionEditorScreen } from "./CaptionEditorScreen";
import { SimulatedCaptionWorkspaceScreen } from "./SimulatedCaptionWorkspaceScreen";

// Mock data
import {
  DEMO_RESULTS,
  DEMO_RESULTS_NO_DUA,
  DEMO_VIDEO_URL,
  DEMO_VIDEO_NAME,
  DEMO_REEL_URL,
  DEMO_CAPTIONS,
} from "../demo/demoData";

import { colors } from "../styles/colors";

// ─── Processing Simulation Sub-Screen ────────────────────────────────────────
// A standalone component that simulates the processing animation without
// calling any real API. After the animation completes it calls onDone(results).

function SimulatedProcessingScreen({ onDone, onCancel }) {
  const STEPS = [
    { label: "Transcript ophalen...", progress: 0.25, delay: 900 },
    { label: "Arabische tekst voorbereiden...", progress: 0.5, delay: 800 },
    { label: "Vertalen naar Nederlands...", progress: 0.72, delay: 1000 },
    { label: "Dua's extraheren...", progress: 0.88, delay: 700 },
    { label: "Verwerking voltooid!", progress: 1.0, delay: 500 },
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let idx = 0;

    const runStep = () => {
      if (cancelled || idx >= STEPS.length) {
        if (!cancelled) {
          setDone(true);
          setTimeout(() => onDone(DEMO_RESULTS), 600);
        }
        return;
      }
      setStepIndex(idx);
      Animated.timing(anim, {
        toValue: STEPS[idx].progress,
        duration: STEPS[idx].delay,
        useNativeDriver: false,
      }).start(() => {
        idx += 1;
        setTimeout(runStep, 200);
      });
    };

    setTimeout(runStep, 300);
    return () => {
      cancelled = true;
    };
  }, []);

  const progressWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  const currentStep = STEPS[Math.min(stepIndex, STEPS.length - 1)];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 1,
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          SIMULATIE — geen API-aanroepen
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {done ? "✅ Verwerking voltooid" : "Video verwerken..."}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          {currentStep.label}
        </Text>

        {/* Progress bar */}
        <View
          style={{
            width: "100%",
            height: 6,
            backgroundColor: colors.border,
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 48,
          }}
        >
          <Animated.View
            style={{
              height: "100%",
              width: progressWidth,
              backgroundColor: colors.primary,
              borderRadius: 3,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={onCancel}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Annuleren
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    title: "Verwerkingsflow",
    icon: "git-branch-outline",
    items: [
      {
        id: "processing_sim",
        label: "Verwerking (animatie ~4 sec)",
        subtitle: "Gesimuleerde voortgangsbalk → gaat daarna naar Resultaten",
        icon: "sync-circle-outline",
        color: "#6366F1",
      },
      {
        id: "results_full",
        label: "Resultaten — volledig",
        subtitle: "Arabisch transcript + vertaling + dua's",
        icon: "checkmark-circle-outline",
        color: "#10B981",
      },
      {
        id: "results_no_dua",
        label: "Resultaten — zonder Dua",
        subtitle: "Arabisch + vertaling, geen dua-resultaten",
        icon: "document-text-outline",
        color: "#3B82F6",
      },
      {
        id: "transcription_results",
        label: "Transcriptie uit Bibliotheek",
        subtitle: "TranscriptionResultsScreen (opgeslagen resultaten)",
        icon: "library-outline",
        color: "#8B5CF6",
      },
    ],
  },
  {
    title: "Caption Editor",
    icon: "create-outline",
    items: [
      {
        id: "caption_editor_screen",
        label: "Caption Editor — URL-invoer",
        subtitle: "CaptionEditorScreen (beginscherm)",
        icon: "link-outline",
        color: "#F59E0B",
      },
      {
        id: "caption_workspace",
        label: "Caption Workspace — met video",
        subtitle: "Volledige editor met demo-video en bijschriften",
        icon: "film-outline",
        color: "#EF4444",
      },
    ],
  },
  {
    title: "Download & Speler",
    icon: "download-outline",
    items: [
      {
        id: "video_player",
        label: "Video Speler",
        subtitle: "VideoPlayerScreen met publieke test-video",
        icon: "play-circle-outline",
        color: "#14B8A6",
      },
    ],
  },
];

function MenuScreen({ onSelect, onClose }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.menuHeader}>
          <View style={styles.menuHeaderBadge}>
            <Text style={styles.menuHeaderBadgeText}>🧑‍💻 DEV</Text>
          </View>
          <Text style={styles.menuTitle}>Developer Preview</Text>
          <Text style={styles.menuSubtitle}>
            Bekijk elk scherm met nepdata — geen API-aanroepen, geen kosten
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
            <Text style={styles.closeBtnText}>Sluiten</Text>
          </TouchableOpacity>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name={section.icon}
                size={16}
                color={colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>
                {section.title.toUpperCase()}
              </Text>
            </View>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => onSelect(item.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuItemIcon,
                    { backgroundColor: item.color + "22" },
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Alle schermen zijn de echte productie-componenten.{"\n"}
          Alleen de data is nep — de UI/UX is identiek aan de live app.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DevPreviewScreen({ onClose }) {
  const [activePreview, setActivePreview] = useState(null);
  const [previewParams, setPreviewParams] = useState({});

  // Build a mock navigation object that each screen can use.
  // goBack → returns to the dev menu.
  // navigate / replace → can show another preview screen (e.g. Processing → Results).
  const makeMockNav = (extraHandlers = {}) => ({
    goBack: () => setActivePreview(null),
    navigate: (screen, params) => {
      // When ProcessingScreen navigates to Results after completion:
      if (screen === "Results" || screen === "ResultsScreen") {
        setPreviewParams(params || {});
        setActivePreview("results_full");
        return;
      }
      // Generic fallback: return to menu
      setActivePreview(null);
    },
    replace: (screen, params) => {
      if (screen === "Results" || screen === "ResultsScreen") {
        setPreviewParams(params || {});
        setActivePreview("results_full");
        return;
      }
      setActivePreview(null);
    },
    reset: () => setActivePreview(null),
    emit: () => ({ defaultPrevented: false }),
    ...extraHandlers,
  });

  const handleSelect = (id) => {
    switch (id) {
      case "results_full":
        setPreviewParams({ results: DEMO_RESULTS, videoName: DEMO_VIDEO_NAME });
        setActivePreview("results_full");
        break;
      case "results_no_dua":
        setPreviewParams({
          results: DEMO_RESULTS_NO_DUA,
          videoName: DEMO_VIDEO_NAME,
        });
        setActivePreview("results_no_dua");
        break;
      case "transcription_results":
        setPreviewParams({ results: DEMO_RESULTS, videoName: DEMO_VIDEO_NAME });
        setActivePreview("transcription_results");
        break;
      case "caption_editor_screen":
        setPreviewParams({});
        setActivePreview("caption_editor_screen");
        break;
      case "caption_workspace":
        setPreviewParams({
          videoUri: DEMO_VIDEO_URL,
          originalVideoUrl: DEMO_REEL_URL,
          videoName: DEMO_VIDEO_NAME,
          videoId: "demo_video_001",
          // Inject pre-loaded captions so CaptionEditorWorkspace skips the
          // Supadata / captionAPI.generate() call entirely (no API quota used).
          __demoData: DEMO_CAPTIONS,
        });
        setActivePreview("caption_workspace");
        break;
      case "video_player":
        setPreviewParams({
          videoId: "demo_video_001",
          videoUri: DEMO_VIDEO_URL,
          videoName: DEMO_VIDEO_NAME,
          duration: 102,
        });
        setActivePreview("video_player");
        break;
      case "processing_sim":
        setActivePreview("processing_sim");
        break;
      default:
        break;
    }
  };

  // Render the selected preview
  if (activePreview === "processing_sim") {
    return (
      <View style={{ flex: 1 }}>
        <DevBanner
          label="Verwerking (simulatie)"
          onBack={() => setActivePreview(null)}
        />
        <SimulatedProcessingScreen
          onDone={(results) => {
            setPreviewParams({ results, videoName: DEMO_VIDEO_NAME });
            setActivePreview("results_full");
          }}
          onCancel={() => setActivePreview(null)}
        />
      </View>
    );
  }

  if (activePreview === "results_full" || activePreview === "results_no_dua") {
    const route = { params: previewParams };
    const nav = makeMockNav();
    return (
      <View style={{ flex: 1 }}>
        <DevBanner label="Resultaten" onBack={() => setActivePreview(null)} />
        <ResultsScreen route={route} navigation={nav} />
      </View>
    );
  }

  if (activePreview === "transcription_results") {
    const route = { params: previewParams };
    const nav = makeMockNav();
    return (
      <View style={{ flex: 1 }}>
        <DevBanner
          label="Transcriptie Resultaten"
          onBack={() => setActivePreview(null)}
        />
        <TranscriptionResultsScreen route={route} navigation={nav} />
      </View>
    );
  }

  if (activePreview === "caption_editor_screen") {
    const nav = makeMockNav({
      navigate: (screen, params) => {
        if (screen === "CaptionEditorWorkspace") {
          setPreviewParams(params || {});
          setActivePreview("caption_workspace");
        } else {
          setActivePreview(null);
        }
      },
    });
    return (
      <View style={{ flex: 1 }}>
        <DevBanner
          label="Caption Editor — Invoer"
          onBack={() => setActivePreview(null)}
        />
        <CaptionEditorScreen navigation={nav} />
      </View>
    );
  }

  if (activePreview === "caption_workspace") {
    return (
      <View style={{ flex: 1 }}>
        <DevBanner
          label="Caption Workspace"
          onBack={() => setActivePreview(null)}
        />
        <SimulatedCaptionWorkspaceScreen onBack={() => setActivePreview(null)} />
      </View>
    );
  }

  if (activePreview === "video_player") {
    const route = { params: previewParams };
    const nav = makeMockNav();
    return (
      <View style={{ flex: 1 }}>
        <DevBanner label="Video Speler" onBack={() => setActivePreview(null)} />
        <VideoPlayerScreen route={route} navigation={nav} />
      </View>
    );
  }

  // Default: show menu
  return <MenuScreen onSelect={handleSelect} onClose={onClose} />;
}

// ─── Dev Banner (shown at top of every preview screen) ───────────────────────

function DevBanner({ label, onBack }) {
  return (
    <View style={styles.devBanner}>
      <TouchableOpacity style={styles.devBannerBack} onPress={onBack}>
        <Ionicons name="arrow-back" size={14} color="#fff" />
        <Text style={styles.devBannerBackText}>Menu</Text>
      </TouchableOpacity>
      <View style={styles.devBannerLabel}>
        <Text style={styles.devBannerBadge}>🧑‍💻 DEV</Text>
        <Text style={styles.devBannerScreen}>{label}</Text>
      </View>
      <View style={{ width: 60 }} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Dev banner
  devBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E1B4B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingTop: Platform.OS === "ios" ? 50 : 10,
  },
  devBannerBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    width: 70,
  },
  devBannerBackText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  devBannerLabel: { alignItems: "center", flex: 1 },
  devBannerBadge: {
    fontSize: 11,
    color: "#A5B4FC",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  devBannerScreen: {
    fontSize: 13,
    color: "#E0E7FF",
    fontWeight: "600",
    marginTop: 1,
  },

  // Menu
  menuHeader: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 56 : 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  menuHeaderBadge: {
    backgroundColor: "#312E81",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 12,
  },
  menuHeaderBadgeText: {
    color: "#A5B4FC",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  menuTitle: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  menuSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  closeBtnText: { color: "#94A3B8", fontSize: 13 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: { flex: 1 },
  menuItemLabel: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuItemSubtitle: { color: "#64748B", fontSize: 12, lineHeight: 16 },

  footerNote: {
    color: "#334155",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 32,
    marginHorizontal: 24,
    paddingBottom: 16,
  },
});
