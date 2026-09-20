/**
 * StylePresetCard
 *
 * Displays a single caption style preset with a live preview.
 * Requirements: 2.1-2.6
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Caption_Style } from '../types/captionStyle';
import { colors } from '../styles/colors';

interface StylePresetCardProps {
  preset: Caption_Style;
  isSelected: boolean;
  onSelect: () => void;
}

const PRESET_LABELS: Record<string, string> = {
  modern:  'Modern',
  classic: 'Klassiek',
  bold:    'Vet',
  minimal: 'Minimaal',
  custom:  'Aangepast',
};

const StylePresetCard = memo(function StylePresetCard({
  preset,
  isSelected,
  onSelect,
}: StylePresetCardProps) {
  const displayText = preset.allCaps ? 'VOORBEELD' : 'Voorbeeld';
  const label = PRESET_LABELS[preset.presetName] ?? preset.presetName;

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[styles.card, isSelected && styles.cardSelected]}
      accessibilityLabel={`Stijl ${label}${isSelected ? ', geselecteerd' : ''}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      {/* Preview area */}
      <View
        style={[
          styles.preview,
          {
            backgroundColor:
              preset.backgroundColor === 'transparent'
                ? '#1a1a2e'
                : preset.backgroundColor,
          },
        ]}
      >
        <Text
          style={{
            fontFamily: preset.fontFamily,
            fontSize: Math.min(preset.fontSize, 16),
            color: preset.textColor,
            fontWeight: preset.bold ? 'bold' : 'normal',
            fontStyle: preset.italic ? 'italic' : 'normal',
            textShadowColor: preset.shadow ? 'rgba(0,0,0,0.8)' : 'transparent',
            textShadowOffset: preset.shadow ? { width: 1, height: 1 } : { width: 0, height: 0 },
            textShadowRadius: preset.shadow ? 3 : 0,
          }}
        >
          {displayText}
        </Text>
      </View>

      {/* Label */}
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>

      {/* Selection indicator */}
      {isSelected && <View style={styles.selectionDot} />}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 100,
    marginHorizontal: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.backgroundTertiary,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  preview: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 11,
    paddingVertical: 6,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectionDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

export default StylePresetCard;
