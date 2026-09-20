/**
 * Upload Screen 2 UI Component
 * SCREEN 2: Upload processing screen - Processing state with progress animation
 * PURE UI COMPONENT - Contains only the UI elements for Upload Screen 2
 * Modify this file to change the visual appearance of the Upload Screen 2
 *
 * AI-FRIENDLY: This entire file can be copied and pasted to AI tools like Claude
 * for UI improvements. The AI can return the complete improved script which
 * can replace this file directly.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { layout } from "../../styles/layout";
import { typography } from "../../styles/typography";
import { globalStyles } from "../../styles/globalStyles";
import { PageHeader } from "../../components/common/PageHeader";

const { width: SCREEN_WIDTH } =
  require("react-native").Dimensions.get("window");

export function UploadScreen2UI({
  // Upload state
  url,
  platform,
  duaEnabled,
  instagramEnabled,
  uploadProgress,
  currentStep,
  totalSteps,
  estimatedTimeRemaining,
  processingSteps,

  // Callback functions
  onCancel,
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
   * Render upload progress animation
   */
  const renderUploadAnimation = () => {
    const animatedValue = new Animated.Value(0);

    React.useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }, []);

    return (
      <View style={styles.animationContainer}>
        <Animated.View
          style={[
            styles.uploadCircle,
            {
              transform: [
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="cloud-upload" size={64} color={colors.primary} />
        </Animated.View>
        <Text style={styles.uploadTitle}>Video Uploaden</Text>
        <Text style={styles.uploadSubtext}>
          Je video wordt geüpload en verwerkt...
        </Text>
      </View>
    );
  };

  /**
   * Render upload progress
   */
  const renderUploadProgress = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Upload Voortgang</Text>
          <Text style={styles.progressPercentage}>
            {Math.round(uploadProgress)}%
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${uploadProgress}%` }]}
          />
        </View>

        <View style={styles.progressDetails}>
          <Text style={styles.progressStep}>
            Stap {currentStep} van {totalSteps}
          </Text>
          <Text style={styles.progressTime}>
            Resterende tijd: {estimatedTimeRemaining || "Berekenen..."}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render processing steps
   */
  const renderProcessingSteps = () => {
    return (
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>Verwerkingsstappen</Text>
        <View style={styles.stepsList}>
          {processingSteps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepIcon,
                  step.completed && styles.stepIconCompleted,
                  step.current && styles.stepIconCurrent,
                ]}
              >
                {step.completed ? (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                ) : step.current ? (
                  <Ionicons name="time" size={16} color={colors.white} />
                ) : (
                  <Ionicons
                    name="ellipse"
                    size={16}
                    color={colors.textTertiary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepText,
                  step.completed && styles.stepTextCompleted,
                  step.current && styles.stepTextCurrent,
                ]}
              >
                {step.name}
              </Text>
              {step.completed && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.success}
                />
              )}
              {step.current && (
                <Animated.View style={styles.currentIndicator}>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={16}
                    color={colors.primary}
                  />
                </Animated.View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  /**
   * Render upload information
   */
  const renderUploadInfo = () => {
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Upload Informatie</Text>
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>URL:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {url}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <Text style={styles.infoValue}>{platform || "Detecteren..."}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dua's:</Text>
            <Text style={styles.infoValue}>
              {duaEnabled ? "Ingeschakeld" : "Uitgeschakeld"}
            </Text>
          </View>
          {instagramEnabled && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Instagram:</Text>
              <Text style={styles.infoValue}>Gereed voor upload</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  /**
   * Render tips
   */
  const renderTips = () => {
    return (
      <View style={styles.tipsContainer}>
        <View style={styles.tipsHeader}>
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.tipsTitle}>Tips</Text>
        </View>
        <View style={styles.tipsList}>
          <Text style={styles.tipText}>
            • Houd de app open voor beste resultaten
          </Text>
          <Text style={styles.tipText}>
            • Je kunt de app op de achtergrond laten draaien
          </Text>
          <Text style={styles.tipText}>
            • Upload wordt automatisch hervat bij verbinding
          </Text>
          <Text style={styles.tipText}>
            • Annuleren verwijdert de voortgang
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render action buttons
   */
  const renderActions = () => {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={20} color={colors.white} />
          <Text style={styles.cancelButtonText}>Upload Annuleren</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backButtonText}>Terug</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[globalStyles.safeArea, styles.safeAreaOverride]}
      edges={["top"]}
    >
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <PageHeader
            title="Video Uploaden"
            subtitle="Je video wordt verwerkt..."
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Upload Animation */}
            {renderUploadAnimation()}

            {/* Upload Progress */}
            {renderUploadProgress()}

            {/* Processing Steps */}
            {renderProcessingSteps()}

            {/* Upload Information */}
            {renderUploadInfo()}

            {/* Tips */}
            {renderTips()}

            {/* Action Buttons */}
            {renderActions()}
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
    borderColor: "transparent",
  },
  headerWrapper: {
    minHeight: 120,
    backgroundColor: colors.background,
    borderBottomWidth: 0,
    borderColor: "transparent",
    borderWidth: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    alignItems: "center",
    minHeight: "100%",
  },
  contentWrapper: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: layout.spacing.lg,
    minHeight: "100%",
  },

  // Upload Animation Styles
  animationContainer: {
    alignItems: "center",
    paddingVertical: layout.spacing.xxl,
    marginBottom: layout.spacing.xl,
  },
  uploadCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: layout.spacing.lg,
  },
  uploadTitle: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: layout.spacing.sm,
    textAlign: "center",
  },
  uploadSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Upload Progress Styles
  progressContainer: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    marginBottom: layout.spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.spacing.md,
  },
  progressTitle: {
    ...typography.h3,
    color: colors.text,
  },
  progressPercentage: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: layout.spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressStep: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Processing Steps Styles
  stepsContainer: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    marginBottom: layout.spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: layout.spacing.lg,
  },
  stepsList: {
    gap: layout.spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.md,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepIconCompleted: {
    backgroundColor: colors.success,
  },
  stepIconCurrent: {
    backgroundColor: colors.primary,
  },
  stepText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  stepTextCompleted: {
    color: colors.success,
    fontWeight: "500",
  },
  stepTextCurrent: {
    color: colors.primary,
    fontWeight: "500",
  },
  currentIndicator: {
    marginLeft: layout.spacing.xs,
  },

  // Upload Information Styles
  infoContainer: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    marginBottom: layout.spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: layout.spacing.lg,
  },
  infoList: {
    gap: layout.spacing.sm,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: layout.spacing.xs,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    flex: 2,
    textAlign: "right",
  },

  // Tips Styles
  tipsContainer: {
    width: "100%",
    backgroundColor: colors.primary + "10",
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    marginBottom: layout.spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.spacing.md,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.primary,
    marginLeft: layout.spacing.sm,
  },
  tipsList: {
    gap: layout.spacing.sm,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Action Buttons Styles
  actionsContainer: {
    width: "100%",
    gap: layout.spacing.md,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error,
    paddingVertical: layout.spacing.lg,
    paddingHorizontal: layout.spacing.xl,
    borderRadius: layout.radius.lg,
    gap: layout.spacing.sm,
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.3)",
    elevation: 8,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
