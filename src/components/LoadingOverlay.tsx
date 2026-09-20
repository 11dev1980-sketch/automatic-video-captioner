/**
 * LoadingOverlay
 *
 * Full-screen loading overlay with spinner and optional message.
 * Used for async operations like caption generation and video export.
 *
 * Requirements: 31.1
 */

import React, { memo } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { colors } from "../styles/colors";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay = memo(function LoadingOverlay({
  visible,
  message,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <View
          style={styles.card}
          accessibilityLabel={message || "Laden..."}
          accessibilityRole="alert"
        >
          <ActivityIndicator size="large" color={colors.primary} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 14,
    minWidth: 140,
    borderWidth: 1,
    borderColor: colors.border,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 200,
  },
});

export default LoadingOverlay;
