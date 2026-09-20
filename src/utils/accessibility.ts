/**
 * Accessibility Utilities
 *
 * Dutch ARIA-like labels for all interactive elements.
 * Screen reader announcements via AccessibilityInfo.
 *
 * Requirements: 12.4, 12.5, 12.6
 */

import { AccessibilityInfo, Platform } from "react-native";

// ---------------------------------------------------------------------------
// Label generators
// ---------------------------------------------------------------------------

/**
 * Returns an accessibility label for a UI element in Dutch.
 *
 * @param elementType - Type of element (e.g. 'play', 'caption', 'export')
 * @param context     - Optional additional context (e.g. caption text or index)
 * @returns Dutch accessibility label string
 */
export function getAccessibilityLabel(
  elementType: string,
  context?: string,
): string {
  const labels: Record<string, string> = {
    // Playback controls
    play: "Afspelen",
    pause: "Pauzeer",
    seek: "Zoekbalk — sleep om positie te wijzigen",
    volume: "Volume",
    fullscreen: "Volledig scherm",

    // Caption timeline
    caption: context ? `Bijschrift ${context}` : "Bijschrift",
    caption_edit: context
      ? `Bijschrift ${context} bewerken`
      : "Bijschrift bewerken",
    caption_delete: context
      ? `Bijschrift ${context} verwijderen`
      : "Bijschrift verwijderen",
    caption_split: context
      ? `Bijschrift ${context} splitsen`
      : "Bijschrift splitsen",
    caption_merge: "Bijschrift samenvoegen met volgend",
    timeline: "Bijschriften tijdlijn",

    // Settings
    settings: "Instellingen",
    font_size: "Lettergrootte instellen",
    font_family: "Lettertype kiezen",
    text_color: "Tekstkleur kiezen",
    bg_color: "Achtergrondkleur kiezen",
    position: "Positie van bijschriften instellen",
    words_per_cap: "Woorden per bijschrift instellen",
    reset: "Instellingen resetten naar standaard",

    // Export
    export: "Bijschriften exporteren",
    export_srt: "SRT bestand exporteren",
    export_video: "Video met bijschriften exporteren",

    // Navigation
    back: "Terug",
    close: "Sluiten",
    save: "Opslaan",
    cancel: "Annuleren",
    confirm: "Bevestigen",
  };

  return (
    labels[elementType] ?? (context ? `${elementType} ${context}` : elementType)
  );
}

// ---------------------------------------------------------------------------
// Screen reader announcements
// ---------------------------------------------------------------------------

/**
 * Announces a message to screen readers (VoiceOver / TalkBack).
 * Safe to call on all platforms; no-ops on web if AccessibilityInfo is unavailable.
 *
 * @param message - Message to announce
 */
export function announceForAccessibility(message: string): void {
  try {
    AccessibilityInfo.announceForAccessibility(message);
  } catch {
    // Silently ignore in test / web environments
  }
}

/**
 * Announce a caption change to screen readers.
 *
 * @param captionText - New caption text
 */
export function announceCaptionChange(captionText: string): void {
  announceForAccessibility(`Bijschrift: ${captionText}`);
}

/**
 * Announce an error to screen readers.
 *
 * @param errorMessage - Error message
 */
export function announceError(errorMessage: string): void {
  announceForAccessibility(`Fout: ${errorMessage}`);
}

/**
 * Announce a success action to screen readers.
 *
 * @param successMessage - Success message
 */
export function announceSuccess(successMessage: string): void {
  announceForAccessibility(successMessage);
}

// ---------------------------------------------------------------------------
// WCAG colour contrast checker (basic)
// ---------------------------------------------------------------------------

/**
 * Parses a hex colour string to RGB.
 * Returns null for invalid input.
 */
function hexToRGB(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#([0-9A-Fa-f]{6})$/.exec(hex);
  if (!match) return null;
  return {
    r: parseInt(match[1].slice(0, 2), 16),
    g: parseInt(match[1].slice(2, 4), 16),
    b: parseInt(match[1].slice(4, 6), 16),
  };
}

/**
 * Computes relative luminance of a colour (WCAG 2.1 formula).
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const sRGB = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculates the contrast ratio between two hex colours.
 * WCAG AA requires ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
 *
 * @param hex1 - First colour as hex (#RRGGBB)
 * @param hex2 - Second colour as hex (#RRGGBB)
 * @returns Contrast ratio, or null if colours are invalid
 */
export function getContrastRatio(hex1: string, hex2: string): number | null {
  const c1 = hexToRGB(hex1);
  const c2 = hexToRGB(hex2);
  if (!c1 || !c2) return null;

  const L1 = relativeLuminance(c1.r, c1.g, c1.b);
  const L2 = relativeLuminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns true if the colour pair meets WCAG AA standard for normal text (≥ 4.5:1).
 */
export function meetsWCAGAA(
  textColor: string,
  backgroundColor: string,
): boolean {
  if (backgroundColor === "transparent") return true; // Cannot check transparent
  const ratio = getContrastRatio(textColor, backgroundColor);
  return ratio !== null && ratio >= 4.5;
}

// ---------------------------------------------------------------------------
// Keyboard shortcut map (for web / desktop platforms)
// ---------------------------------------------------------------------------

export const KEYBOARD_SHORTCUTS: Record<string, string> = {
  Space: "Afspelen / Pauzeer",
  ArrowLeft: "Achteruit 5 seconden",
  ArrowRight: "Vooruit 5 seconden",
  ArrowUp: "Volgend bijschrift",
  ArrowDown: "Vorig bijschrift",
  "Ctrl+S": "Opslaan",
  "Ctrl+E": "Exporteren",
  Escape: "Sluiten / Annuleren",
};
