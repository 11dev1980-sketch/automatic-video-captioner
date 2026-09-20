/**
 * GenerationProgress
 *
 * Shows the 4-step caption generation pipeline with animated progress bar.
 * Displays current step, progress %, and a cancel button.
 *
 * Requirements: 8.6, 8.7, 8.8
 */

import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GenerationStepId =
  | "extracting"
  | "transcribing"
  | "translating"
  | "segmenting"
  | "done"
  | "error";

interface GenerationProgressProps {
  currentStep: GenerationStepId | number;
  stepProgress?: number; // 0–1 within current step
  overallProgress?: number; // 0–100 overall
  errorMessage?: string;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

const STEPS: Array<{ id: GenerationStepId; label: string; icon: string }> = [
  { id: "extracting", label: "Video ophalen", icon: "download-outline" },
  { id: "transcribing", label: "Transcriberen", icon: "mic-outline" },
  { id: "translating", label: "Vertalen", icon: "language-outline" },
  { id: "segmenting", label: "Segmenteren", icon: "cut-outline" },
];

function stepIndexOf(step: GenerationStepId | number): number {
  if (typeof step === "number") return step;
  return STEPS.findIndex((s) => s.id === step);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GenerationProgress = memo(function GenerationProgress({
  currentStep,
  stepProgress = 0,
  overallProgress,
  errorMessage,
  onCancel,
}: GenerationProgressProps) {
  const currentIdx = stepIndexOf(currentStep as GenerationStepId);
  const pct =
    overallProgress ??
    Math.round(((currentIdx + stepProgress) / STEPS.length) * 100);

  if (currentStep === "error" || errorMessage) {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
        <Text style={styles.errorTitle}>Genereren mislukt</Text>
        <Text style={styles.errorMsg}>
          {errorMessage || "Er is een fout opgetreden"}
        </Text>
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            style={styles.cancelBtn}
            accessibilityLabel="Sluiten"
          >
            <Text style={styles.cancelText}>Sluiten</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.spinner}
      />
      <Text style={styles.title}>Bijschriften genereren</Text>

      {/* Step list */}
      <View style={styles.steps}>
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx || currentStep === "done";
          const active = idx === currentIdx && currentStep !== "done";

          return (
            <View key={step.id} style={styles.stepRow}>
              <View
                style={[
                  styles.stepIcon,
                  done && styles.stepIconDone,
                  active && styles.stepIconActive,
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : (
                  <Ionicons
                    name={step.icon as any}
                    size={14}
                    color={active ? colors.white : colors.textTertiary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  done && styles.stepLabelDone,
                  active && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
              {active && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.stepSpinner}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(pct, 100)}%` as any },
          ]}
        />
      </View>
      <Text style={styles.progressPct}>{pct}%</Text>

      {/* Cancel */}
      {onCancel && (
        <TouchableOpacity
          onPress={onCancel}
          style={styles.cancelBtn}
          accessibilityLabel="Genereren annuleren"
        >
          <Text style={styles.cancelText}>Annuleren</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spinner: { marginBottom: 4 },
  title: { color: colors.text, fontSize: 16, fontWeight: "600" },
  steps: { width: "100%", gap: 8 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepIconDone: { backgroundColor: colors.success },
  stepIconActive: { backgroundColor: colors.primary },
  stepLabel: { flex: 1, color: colors.textTertiary, fontSize: 13 },
  stepLabelDone: { color: colors.textSecondary },
  stepLabelActive: { color: colors.text, fontWeight: "600" },
  stepSpinner: {},
  progressBarBg: {
    width: "100%",
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressPct: { color: colors.textTertiary, fontSize: 12 },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  cancelText: { color: colors.textSecondary, fontSize: 13 },
  errorTitle: { color: colors.error, fontSize: 16, fontWeight: "600" },
  errorMsg: { color: colors.textSecondary, fontSize: 13, textAlign: "center" },
});

export default GenerationProgress;
