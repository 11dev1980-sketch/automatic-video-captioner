/**
 * LanguageSelector
 *
 * Lets the user choose source and target language for caption generation.
 * Shows detected language with confidence, and allows manual override.
 *
 * Requirements: 1.4, 1.5
 */

import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getLanguageDisplayName } from "../utils/languageDetection";
import { colors } from "../styles/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LanguageSelectorProps {
  sourceLanguage?: string | null; // null = auto-detect
  targetLanguage: string;
  detectedLanguage?: string | null;
  detectedConfidence?: number;
  onSourceLanguageChange: (lang: string | null) => void;
  onTargetLanguageChange: (lang: string) => void;
}

const SOURCE_OPTIONS = [
  { value: null, label: "Automatisch detecteren" },
  { value: "arabic", label: "Arabisch" },
  { value: "turkish", label: "Turks" },
  { value: "english", label: "Engels" },
];

const TARGET_OPTIONS = [
  { value: "dutch", label: "Nederlands" },
  { value: "english", label: "Engels" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const LanguageSelector = memo(function LanguageSelector({
  sourceLanguage,
  targetLanguage,
  detectedLanguage,
  detectedConfidence = 0,
  onSourceLanguageChange,
  onTargetLanguageChange,
}: LanguageSelectorProps) {
  const confidencePct = Math.round(detectedConfidence * 100);
  const showDetected = detectedLanguage && detectedLanguage !== "unknown";

  return (
    <View style={styles.container}>
      {/* Detected language badge */}
      {showDetected && (
        <View style={styles.detectedBadge}>
          <Text style={styles.detectedText}>
            Gedetecteerd: {getLanguageDisplayName(detectedLanguage!, "nl")}
            {confidencePct > 0 ? ` (${confidencePct}%)` : ""}
          </Text>
        </View>
      )}

      {/* Source language picker */}
      <View style={styles.row}>
        <Text style={styles.label}>Brontaal</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sourceLanguage ?? null}
            onValueChange={(val) => onSourceLanguageChange(val)}
            style={styles.picker}
            dropdownIconColor={colors.textSecondary}
            accessibilityLabel="Brontaal kiezen"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <Picker.Item
                key={String(opt.value)}
                label={opt.label}
                value={opt.value}
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Target language selector — button row (only 2 options) */}
      <View style={styles.row}>
        <Text style={styles.label}>Doeltaal</Text>
        <View style={styles.targetButtons}>
          {TARGET_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onTargetLanguageChange(opt.value)}
              style={[
                styles.targetBtn,
                targetLanguage === opt.value && styles.targetBtnSelected,
              ]}
              accessibilityLabel={`Doeltaal: ${opt.label}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: targetLanguage === opt.value }}
            >
              <Text
                style={[
                  styles.targetBtnText,
                  targetLanguage === opt.value && styles.targetBtnTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  detectedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  detectedText: {
    color: colors.success,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    width: 80,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  picker: {
    color: colors.text,
    height: 44,
  },
  targetButtons: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  targetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.backgroundTertiary,
  },
  targetBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255,51,102,0.12)",
  },
  targetBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  targetBtnTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});

export default LanguageSelector;
