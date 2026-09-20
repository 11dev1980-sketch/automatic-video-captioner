/**
 * ToastNotification
 *
 * Slide-up toast notification with auto-dismiss after 3 seconds.
 * Supports success, error, and info types with Dutch-themed styling.
 *
 * Requirements: 31.2
 */

import React, { memo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastType = "success" | "error" | "info";

interface ToastNotificationProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number; // ms before auto-dismiss (default 3000)
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TOAST_CONFIG: Record<
  ToastType,
  { icon: string; color: string; bg: string }
> = {
  success: {
    icon: "checkmark-circle-outline",
    color: colors.success,
    bg: "rgba(16,185,129,0.12)",
  },
  error: {
    icon: "alert-circle-outline",
    color: colors.error,
    bg: "rgba(239,68,68,0.12)",
  },
  info: {
    icon: "information-circle-outline",
    color: colors.info,
    bg: "rgba(59,130,246,0.12)",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ToastNotification = memo(function ToastNotification({
  visible,
  message,
  type = "info",
  duration = 3000,
  onDismiss,
}: ToastNotificationProps) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Slide up and fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: Platform.OS !== "web",
          tension: 60,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start();

      // Auto-dismiss
      dismissTimer.current = setTimeout(() => {
        hideToast();
      }, duration);
    } else {
      hideToast();
    }

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => onDismiss());
  };

  if (!visible) return null;

  const config = TOAST_CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.color,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      accessibilityLabel={`${type === "error" ? "Fout" : type === "success" ? "Geslaagd" : "Info"}: ${message}`}
    >
      <Ionicons name={config.icon as any} size={20} color={config.color} />
      <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={hideToast}
        accessibilityLabel="Melding sluiten"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={18} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});

export default ToastNotification;
