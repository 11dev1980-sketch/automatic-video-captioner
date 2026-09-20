/**
 * Home Screen
 * Welcome screen with app overview and quick actions
 * FUNCTIONALITY ONLY - UI is in HomeScreenUI.js
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  Platform,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreenUI } from "../ui/screens/HomeScreenUI";
import { getUserName, saveUserName } from "../services/userSettingsService";
import { loadResultsHistory } from "../utils/storage";
import { validateSupportedUrl } from "../utils/validators";
import { strings, formatString } from "../localization";
import { colors } from "../styles/colors";
import { layout } from "../styles/layout";
import { typography } from "../styles/typography";
import { globalStyles } from "../styles/globalStyles";
import { PageHeader } from "../components/common/PageHeader";
import * as Clipboard from "expo-clipboard";

export function HomeScreen({ navigation }) {
  console.log("🏠 HomeScreen: Component starting to render");
  console.log(
    "📍 HomeScreen: Navigation prop:",
    navigation ? "present" : "missing",
  );

  const [userName, setUserName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [quickStartUrl, setQuickStartUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [recentResults, setRecentResults] = useState([]);
  const [greeting, setGreeting] = useState("Hallo");

  console.log("📍 HomeScreen: State initialized, about to run useEffect");

  useEffect(() => {
    console.log("📍 HomeScreen: useEffect running, about to load data");
    try {
      loadUserName();
      loadRecentResults();
      updateGreeting();
      console.log("✅ HomeScreen: Data loading initiated successfully");
    } catch (error) {
      console.error("❌ HomeScreen: Error in useEffect:", error);
      console.error("❌ HomeScreen: Error stack:", error.stack);
    }
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Goedemorgen");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Goedemiddag");
    } else if (hour >= 18 && hour < 24) {
      setGreeting("Goedenavond");
    } else {
      setGreeting("Hallo");
    }
  };

  const loadUserName = async () => {
    const name = await getUserName();
    if (name) {
      setUserName(name);
    }
  };

  const loadRecentResults = async () => {
    console.log("📍 HomeScreen: loadRecentResults starting");
    try {
      const history = await loadResultsHistory();
      console.log("📍 HomeScreen: History loaded:", history);
      console.log("📍 HomeScreen: History type:", typeof history);
      console.log("📍 HomeScreen: History isArray:", Array.isArray(history));

      if (history && Array.isArray(history)) {
        console.log("📍 HomeScreen: About to slice first 3 results");
        const slicedResults = history.slice(0, 3);
        console.log("📍 HomeScreen: Sliced results:", slicedResults);
        setRecentResults(slicedResults);
        console.log("✅ HomeScreen: Recent results set successfully");
      } else {
        console.log(
          "📍 HomeScreen: No valid history found, setting empty array",
        );
        setRecentResults([]);
      }
    } catch (error) {
      console.error("❌ HomeScreen: Error in loadRecentResults:", error);
      console.error("❌ HomeScreen: Error stack:", error.stack);
      setRecentResults([]);
    }
  };

  const handleQuickStart = async () => {
    let urlToUse = quickStartUrl.trim();

    if (!urlToUse) {
      try {
        const text = await Clipboard.getStringAsync();
        if (text && validateSupportedUrl(text).valid) {
          urlToUse = text.trim();
          setQuickStartUrl(urlToUse);
        } else {
          setUrlError("Voer een video-URL in of plak een URL van uw klembord.");
          return;
        }
      } catch (err) {
        setUrlError("Voer een video-URL in of plak een URL van uw klembord.");
        return;
      }
    }

    const validation = validateSupportedUrl(urlToUse);
    if (!validation.valid) {
      setUrlError(validation.error);
      return;
    }
    // Use cleaned URL and pass platform info
    const cleanUrl = validation.cleaned || urlToUse;
    // Navigate directly to CaptionEditor with the URL pre-filled
    // The CaptionEditorScreen will auto-load the video via useEffect
    navigation.navigate("CaptionEditor", {
      reelUrl: cleanUrl,
      platform: validation.platform,
      instagramEnabled: false,
      instagramPostConfig: null,
      targetLanguage: "dutch",
    });
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setQuickStartUrl(text);
        setUrlError("");
      }
    } catch (err) {
      console.log("Clipboard read failed", err);
    }
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await saveUserName(tempName.trim());
      setUserName(tempName.trim());
      setShowNameModal(false);
      setTempName("");
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getResultTitle = (result) => {
    // Try to get a meaningful title from the result
    const translation = result.translatedText || result.dutchTranslation;
    if (translation) {
      return (
        translation.slice(0, 50) +
        (translation.length > 50 ? "..." : "")
      );
    } else if (result.arabicTranscript) {
      return (
        result.arabicTranscript.slice(0, 50) +
        (result.arabicTranscript.length > 50 ? "..." : "")
      );
    }
    return "Processed Result";
  };

  console.log(
    "📍 HomeScreen: About to render JSX, recentResults:",
    recentResults,
  );
  console.log("📍 HomeScreen: recentResults type:", typeof recentResults);
  console.log(
    "📍 HomeScreen: recentResults isArray:",
    Array.isArray(recentResults),
  );

  try {
    return (
      <SafeAreaView style={globalStyles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.headerWrapper}>
            <PageHeader
              title={
                userName
                  ? `${greeting}, ${userName}`
                  : greeting
              }
              subtitle={strings.home.subtitle}
            />
            {/* Header buttons hidden for PWA */}
            {/* Developer Preview removed in production */}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Start Section */}
            <View style={styles.quickStartContainer}>
              <Text style={styles.sectionTitle}>
                {strings.home.quickStartTitle}
              </Text>
              <Text style={styles.quickStartDescription}>
                {strings.home.quickStartDescription}
              </Text>
              <View style={styles.quickStartCard}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.quickStartInput, { flex: 1, marginBottom: 0 }]}
                    placeholder={strings.home.quickStartPlaceholder}
                    placeholderTextColor={colors.textTertiary}
                    value={quickStartUrl}
                    onChangeText={(text) => {
                      setQuickStartUrl(text);
                      setUrlError("");
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity style={styles.pasteButton} onPress={handlePaste} activeOpacity={0.7}>
                    <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {urlError ? (
                  <Text style={styles.urlError}>{urlError}</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.quickStartButton}
                  onPress={handleQuickStart}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickStartButtonText}>
                    {strings.home.quickStartButton}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Recently Processed Section */}
            {recentResults.length > 0 && (
              <View style={styles.recentContainer}>
                <View style={styles.recentHeader}>
                  <Text style={styles.sectionTitle}>
                    {strings.home.recentTitle}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("History")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewAllText}>
                      {strings.home.viewAll}
                    </Text>
                  </TouchableOpacity>
                </View>
                {recentResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.recentVideoCard}
                    onPress={() =>
                      navigation.navigate("TranscriptionResults", {
                        results: result,
                        videoName: result.videoName || getResultTitle(result),
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentVideoIcon}>
                      <Ionicons
                        name="document-text"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.recentVideoInfo}>
                      <Text style={styles.recentVideoTitle} numberOfLines={1}>
                        {getResultTitle(result)}
                      </Text>
                      <Text style={styles.recentVideoMeta}>
                        {formatDate(result.timestamp)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Name Input Modal */}
            <Modal
              visible={showNameModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowNameModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {strings.home.namePrompt}
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={strings.home.namePlaceholder}
                    placeholderTextColor={colors.textTertiary}
                    value={tempName}
                    onChangeText={setTempName}
                    autoFocus={true}
                    onSubmitEditing={handleSaveName}
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalButtonCancel}
                      onPress={() => {
                        setShowNameModal(false);
                        setTempName("");
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalButtonCancelText}>
                        {strings.common.cancel}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalButtonSave}
                      onPress={handleSaveName}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalButtonSaveText}>
                        {strings.common.save}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    console.error("❌ HomeScreen: Error during render:", error);
    console.error("❌ HomeScreen: Error stack:", error.stack);
    return (
      <SafeAreaView style={globalStyles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <Text style={{ color: "white", textAlign: "center", marginTop: 50 }}>
            HomeScreen Error: {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    minHeight: 120, // Fixed height to match all pages
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.spacing.lg,
  },
  headerButtons: {
    flexDirection: "row",
    gap: layout.spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.spacing.lg,
    paddingTop: layout.spacing.lg,
    paddingBottom: layout.spacing.xxl * 2,
  },
  quickStartContainer: {
    marginBottom: layout.spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: layout.spacing.sm,
  },
  quickStartDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: layout.spacing.md,
  },
  quickStartCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.radius.md,
    padding: layout.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickStartInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    color: colors.text,
    outlineStyle: "none",
    minHeight: 52,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.spacing.md,
    gap: 8,
  },
  pasteButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius.md,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  urlError: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: layout.spacing.md,
  },
  quickStartButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: layout.spacing.md,
    paddingHorizontal: layout.spacing.lg,
    borderRadius: layout.radius.lg,
    minHeight: 52,
    gap: layout.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStartButtonDisabled: {
    opacity: 0.5,
  },
  quickStartButtonText: {
    ...typography.button,
    color: colors.white,
  },
  recentContainer: {
    marginBottom: layout.spacing.xl,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.spacing.md,
  },
  viewAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  recentVideoCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    marginBottom: layout.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.md,
  },
  recentVideoIcon: {
    width: 48,
    height: 48,
    borderRadius: layout.radius.sm,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  recentVideoInfo: {
    flex: 1,
  },
  recentVideoTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 2,
  },
  recentVideoMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: layout.spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.xl,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: layout.spacing.lg,
    textAlign: "center",
  },
  modalInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    marginBottom: layout.spacing.lg,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: layout.spacing.md,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: layout.spacing.md,
    borderRadius: layout.radius.md,
    alignItems: "center",
  },
  modalButtonCancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  modalButtonSave: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: layout.spacing.md,
    borderRadius: layout.radius.md,
    alignItems: "center",
  },
  devPreviewBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  devPreviewBtnText: {
    fontSize: 16,
  },
  modalButtonSaveText: {
    ...typography.button,
    color: colors.white,
  },
});
