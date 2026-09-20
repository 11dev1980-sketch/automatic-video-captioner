/**
 * CustomStyleEditor
 *
 * Full-featured style editor for customising caption appearance.
 * Provides controls for all Caption_Style properties with a live preview.
 *
 * Requirements: 2.5, 2.7
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import type { Caption_Style } from '../types/captionStyle';
import { colors } from '../styles/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CustomStyleEditorProps {
  style: Caption_Style;
  onStyleChange: (style: Caption_Style) => void;
}

// ---------------------------------------------------------------------------
// Colour swatches used for quick picks
// ---------------------------------------------------------------------------

const TEXT_COLOR_SWATCHES = ['#FFFFFF', '#FFEB3B', '#FF3366', '#00BCD4', '#000000'];
const BG_COLOR_SWATCHES = ['transparent', '#000000', '#1A1A2E', '#0D47A1', '#B71C1C'];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CustomStyleEditor = memo(function CustomStyleEditor({
  style,
  onStyleChange,
}: CustomStyleEditorProps) {
  const update = useCallback(
    (patch: Partial<Caption_Style>) => onStyleChange({ ...style, ...patch }),
    [style, onStyleChange]
  );

  const displayText = style.allCaps ? 'VOORBEELD BIJSCHRIFT' : 'Voorbeeld bijschrift';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Live preview */}
      <View style={styles.previewContainer}>
        <View
          style={[
            styles.previewBg,
            {
              backgroundColor:
                style.backgroundColor === 'transparent' ? '#1a1a2e' : style.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.previewText,
              {
                fontFamily: style.fontFamily,
                fontSize: Math.min(style.fontSize, 20),
                color: style.textColor,
                fontWeight: style.bold ? 'bold' : 'normal',
                fontStyle: style.italic ? 'italic' : 'normal',
                textDecorationLine: style.underline ? 'underline' : 'none',
                textShadowColor: style.shadow ? 'rgba(0,0,0,0.8)' : 'transparent',
                textShadowOffset: style.shadow ? { width: 1, height: 1 } : { width: 0, height: 0 },
                textShadowRadius: style.shadow ? 3 : 0,
              },
            ]}
          >
            {displayText}
          </Text>
        </View>
      </View>

      {/* Font */}
      <SectionTitle title="LETTERTYPE" />
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={style.fontFamily}
          onValueChange={(val) => update({ fontFamily: val as Caption_Style['fontFamily'] })}
          style={styles.picker}
          dropdownIconColor={colors.textSecondary}
        >
          {(['Arial', 'Helvetica', 'Roboto', 'Open Sans'] as const).map((f) => (
            <Picker.Item key={f} label={f} value={f} color={colors.text} />
          ))}
        </Picker>
      </View>

      <Row>
        <Label text={`Grootte: ${style.fontSize}px`} />
        <Slider
          style={styles.slider}
          minimumValue={12}
          maximumValue={36}
          step={1}
          value={style.fontSize}
          onValueChange={(v) => update({ fontSize: Math.round(v) })}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </Row>

      {/* Text colour */}
      <SectionTitle title="TEKSTKLEUR" />
      <View style={styles.swatchRow}>
        {TEXT_COLOR_SWATCHES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => update({ textColor: c })}
            style={[
              styles.swatch,
              { backgroundColor: c },
              style.textColor === c && styles.swatchSelected,
            ]}
            accessibilityLabel={`Tekstkleur ${c}`}
          />
        ))}
      </View>

      {/* Background colour */}
      <SectionTitle title="ACHTERGRONDKLEUR" />
      <View style={styles.swatchRow}>
        {BG_COLOR_SWATCHES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => update({ backgroundColor: c })}
            style={[
              styles.swatch,
              { backgroundColor: c === 'transparent' ? 'rgba(0,0,0,0)' : c },
              style.backgroundColor === c && styles.swatchSelected,
              c === 'transparent' && styles.transparentSwatch,
            ]}
            accessibilityLabel={c === 'transparent' ? 'Transparant' : `Achtergrond ${c}`}
          >
            {c === 'transparent' && <Text style={styles.transparentLabel}>∅</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Row>
        <Label text={`Dekking: ${Math.round(style.backgroundOpacity * 100)}%`} />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          value={style.backgroundOpacity}
          onValueChange={(v) => update({ backgroundOpacity: v })}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </Row>

      {/* Text styles */}
      <SectionTitle title="TEKSTSTIJL" />
      {(
        [
          { key: 'bold',      label: 'Vet' },
          { key: 'italic',    label: 'Cursief' },
          { key: 'underline', label: 'Onderstreept' },
          { key: 'shadow',    label: 'Schaduw' },
          { key: 'outline',   label: 'Omlijn' },
          { key: 'allCaps',   label: 'ALLES HOOFDLETTERS' },
        ] as const
      ).map(({ key, label }) => (
        <Row key={key}>
          <Label text={label} />
          <Switch
            value={Boolean(style[key])}
            onValueChange={(v) => update({ [key]: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel={label}
          />
        </Row>
      ))}

      {/* Position */}
      <SectionTitle title="POSITIE" />
      <View style={styles.positionRow}>
        {(['top', 'center', 'bottom'] as const).map((pos) => (
          <TouchableOpacity
            key={pos}
            onPress={() => update({ position: pos })}
            style={[styles.posBtn, style.position === pos && styles.posBtnActive]}
            accessibilityLabel={pos}
            accessibilityRole="radio"
            accessibilityState={{ selected: style.position === pos }}
          >
            <Text style={[styles.posBtnText, style.position === pos && styles.posBtnTextActive]}>
              {pos === 'top' ? 'Boven' : pos === 'center' ? 'Midden' : 'Onder'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  previewContainer: { marginBottom: 16 },
  previewBg: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  previewText: { textAlign: 'center' },
  sectionTitle: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  slider: { flex: 1, marginLeft: 8 },
  pickerWrapper: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: { color: colors.text, height: 44 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: colors.white },
  transparentSwatch: {
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentLabel: { color: colors.textTertiary, fontSize: 16 },
  positionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  posBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  posBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(255,51,102,0.12)' },
  posBtnText: { color: colors.textSecondary, fontSize: 13 },
  posBtnTextActive: { color: colors.primary, fontWeight: '600' },
});

export default CustomStyleEditor;
