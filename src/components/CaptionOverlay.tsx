/**
 * CaptionOverlay
 *
 * Renders the active caption on top of the video player.
 * Applies all Caption_Style properties to the text display.
 * Uses React.memo and Animated for 60fps performance.
 *
 * Requirements: 4.10, 10.9
 */

import React, { useEffect, useRef, memo } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import type { Caption_Object } from "../types/caption";
import type { Caption_Style } from "../types/captionStyle";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CaptionOverlayProps {
  caption: Caption_Object | null;
  style: Caption_Style;
}

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CaptionOverlay = memo(function CaptionOverlay({
  caption,
  style,
}: CaptionOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const prevCaptionId = useRef<string | null>(null);

  // Fade in/out when caption changes
  useEffect(() => {
    if (caption?.id !== prevCaptionId.current) {
      prevCaptionId.current = caption?.id ?? null;

      if (caption && style.fadeIn) {
        opacity.setValue(0);
        Animated.timing(opacity, {
          toValue: 1,
          duration: style.animationDuration || 300,
          useNativeDriver: Platform.OS !== "web",
        }).start();
      } else if (!caption && style.fadeOut) {
        Animated.timing(opacity, {
          toValue: 0,
          duration: style.animationDuration || 300,
          useNativeDriver: Platform.OS !== "web",
        }).start();
      } else {
        opacity.setValue(caption ? 1 : 0);
      }
    }
  }, [caption, style, opacity]);

  if (!caption) return null;

  // Build position styles
  const positionStyle = getPositionStyle(style);

  // Build text styles
  const displayText = style.allCaps ? caption.text.toUpperCase() : caption.text;

  const textShadowStyle = style.shadow
    ? {
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      }
    : {};

  return (
    <Animated.View
      style={[styles.container, positionStyle, { opacity, pointerEvents: 'none' }]}
      accessibilityLabel={`Ondertitel: ${caption.text}`}
      accessibilityLiveRegion="polite"
    >
      <View
        style={[
          styles.textContainer,
          {
            backgroundColor:
              style.backgroundColor === "transparent"
                ? "transparent"
                : hexToRgba(style.backgroundColor, style.backgroundOpacity),
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              color: style.textColor,
              fontWeight: style.bold ? "bold" : "normal",
              fontStyle: style.italic ? "italic" : "normal",
              textDecorationLine: style.underline ? "underline" : "none",
            },
            textShadowStyle,
          ]}
        >
          {displayText}
        </Text>
      </View>
    </Animated.View>
  );
});

// ---------------------------------------------------------------------------
// Position helper
// ---------------------------------------------------------------------------

function getPositionStyle(style: Caption_Style) {
  const base: any = { position: "absolute", left: 0, right: 0 };
  const offset = style.verticalOffset || 50;

  switch (style.position) {
    case "top":
      return { ...base, top: offset };
    case "center":
      return { ...base, top: "45%" };
    case "bottom":
    default:
      return { ...base, bottom: offset };
  }
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  textContainer: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: "90%",
  },
  text: {
    textAlign: "center",
  },
});

export default CaptionOverlay;
