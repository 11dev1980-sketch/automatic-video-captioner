/**
 * StylePresetSelector
 *
 * Horizontal scrollable row showing all 5 style preset cards.
 * Requirements: 2.1-2.6
 */

import React, { memo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CAPTION_STYLE_PRESETS } from '../types/captionStyle';
import StylePresetCard from './StylePresetCard';
import { colors } from '../styles/colors';

interface StylePresetSelectorProps {
  selectedPreset: string;
  onPresetSelect: (presetName: string) => void;
}

const PRESET_ORDER = ['modern', 'classic', 'bold', 'minimal', 'custom'];

const StylePresetSelector = memo(function StylePresetSelector({
  selectedPreset,
  onPresetSelect,
}: StylePresetSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Stijl kiezen</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Stijlkeuze"
        accessibilityRole="radiogroup"
      >
        {PRESET_ORDER.map((name) => {
          const preset = CAPTION_STYLE_PRESETS[name];
          if (!preset) return null;
          return (
            <StylePresetCard
              key={name}
              preset={preset}
              isSelected={selectedPreset === name}
              onSelect={() => onPresetSelect(name)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
});

export default StylePresetSelector;
