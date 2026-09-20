/**
 * SettingsPanel
 *
 * Full caption appearance settings panel.
 * Combines words-per-caption, font, colour, toggles and position controls.
 * Debounces AsyncStorage writes by 300 ms. Loads saved settings on mount.
 *
 * Requirements: 3.1-3.13, 10.1, 10.2, 11.1
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
import { CAPTION_STYLE_PRESETS } from '../types/captionStyle';
import { saveSettings, loadSettings } from '../utils/persistence';
import { colors } from '../styles/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaptionPanelSettings {
  wordsPerCaption: number;     // 1-10
  captionStyle: Caption_Style;
}

interface SettingsPanelProps {
  settings: CaptionPanelSettings;
  onSettingsChange: (settings: CaptionPanelSettings) => void;
}

// ---------------------------------------------------------------------------
// Colour swatches
// ---------------------------------------------------------------------------

const TEXT_SWATCHES  = ['#FFFFFF', '#FFEB3B', '#FF3366', '#00BCD4', '#000000'];
const BG_SWATCHES    = ['transparent', '#000000', '#1A1A2E', '#0D47A1', '#B71C1C'];
const FONT_FAMILIES  = ['Arial', 'Helvetica', 'Roboto', 'Open Sans'] as const;

const DEFAULT_SETTINGS: CaptionPanelSettings = {
  wordsPerCaption: 5,
  captionStyle: { ...CAPTION_STYLE_PRESETS.modern },
};

const STORAGE_KEY_PREFIX = 'settings_panel';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );
}

function SectionTitle({ text }: { text: string }) {
  return <Text style={styles.sectionTitle}>{text}</Text>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SettingsPanel = memo(function SettingsPanel({
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings().then((saved: any) => {
      if (saved?.captionPanelSettings) {
        onSettingsChange(saved.captionPanelSettings);
      }
      setIsLoaded(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save to AsyncStorage (300 ms)
  const saveDebounced = useCallback(
    (nextSettings: CaptionPanelSettings) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveSettings({ captionPanelSettings: nextSettings });
      }, 300);
    },
    []
  );

  const update = useCallback(
    (patch: Partial<CaptionPanelSettings>) => {
      const next = { ...settings, ...patch };
      onSettingsChange(next);
      saveDebounced(next);
    },
    [settings, onSettingsChange, saveDebounced]
  );

  const [localWords, setLocalWords] = useState(settings.wordsPerCaption);
  useEffect(() => {
    setLocalWords(settings.wordsPerCaption);
  }, [settings.wordsPerCaption]);

  const updateStyle = useCallback(
    (patch: Partial<Caption_Style>) => {
      update({ captionStyle: { ...settings.captionStyle, ...patch } });
    },
    [settings.captionStyle, update]
  );

  const { captionStyle: st } = settings;
  const previewText = st.allCaps ? 'VOORBEELD' : 'Voorbeeld';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Words per caption ── */}
      <SectionTitle text="BIJSCHRIFTEN" />
      <Row label={`Woorden: ${settings.wordsPerCaption}`}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={localWords}
          onValueChange={(v) => setLocalWords(Math.round(v))}
          onSlidingComplete={(v) => update({ wordsPerCaption: Math.round(v) })}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel="Woorden per bijschrift"
        />
      </Row>

      {/* ── Font ── */}
      <SectionTitle text="LETTERTYPE" />
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={st.fontFamily}
          onValueChange={(v) => updateStyle({ fontFamily: v as Caption_Style['fontFamily'] })}
          style={[styles.picker, { backgroundColor: '#ffffff', color: '#000000' }]}
          dropdownIconColor={colors.textSecondary}
          accessibilityLabel="Lettertype kiezen"
        >
          {FONT_FAMILIES.map((f) => (
            <Picker.Item key={f} label={f} value={f} color="#000000" />
          ))}
        </Picker>
      </View>

      <Row label={`Grootte: ${st.fontSize}px`}>
        <Slider
          style={styles.slider}
          minimumValue={12}
          maximumValue={36}
          step={1}
          value={st.fontSize}
          onValueChange={(v) => updateStyle({ fontSize: Math.round(v) })}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel="Lettergrootte"
        />
      </Row>

      {/* ── Text colour ── */}
      <SectionTitle text="TEKSTKLEUR" />
      <View style={styles.swatchRow}>
        {TEXT_SWATCHES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.swatch, { backgroundColor: c }, st.textColor === c && styles.swatchActive]}
            onPress={() => updateStyle({ textColor: c })}
            accessibilityLabel={`Tekstkleur ${c}`}
          />
        ))}
      </View>

      {/* ── Background colour + opacity ── */}
      <SectionTitle text="ACHTERGROND" />
      <View style={styles.swatchRow}>
        {BG_SWATCHES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.swatch,
              { backgroundColor: c === 'transparent' ? 'rgba(0,0,0,0)' : c },
              st.backgroundColor === c && styles.swatchActive,
              c === 'transparent' && styles.transparentSwatch,
            ]}
            onPress={() => updateStyle({ backgroundColor: c })}
            accessibilityLabel={c === 'transparent' ? 'Transparant' : `Achtergrond ${c}`}
          >
            {c === 'transparent' && <Text style={styles.transparentIcon}>∅</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Row label={`Dekking: ${Math.round(st.backgroundOpacity * 100)}%`}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          value={st.backgroundOpacity}
          onValueChange={(v) => updateStyle({ backgroundOpacity: v })}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel="Achtergrond dekking"
        />
      </Row>

      {/* ── Text style toggles ── */}
      <SectionTitle text="STIJL" />
      {(
        [
          { key: 'bold',      label: 'Vet' },
          { key: 'italic',    label: 'Cursief' },
          { key: 'underline', label: 'Onderstreept' },
          { key: 'shadow',    label: 'Schaduw' },
          { key: 'outline',   label: 'Omlijn' },
          { key: 'allCaps',   label: 'HOOFDLETTERS' },
        ] as const
      ).map(({ key, label }) => (
        <Row key={key} label={label}>
          <Switch
            value={Boolean(st[key])}
            onValueChange={(v) => updateStyle({ [key]: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel={label}
          />
        </Row>
      ))}

      {/* ── Position ── */}
      <SectionTitle text="POSITIE" />
      <View style={styles.posRow}>
        {(['top', 'center', 'bottom'] as const).map((pos) => (
          <TouchableOpacity
            key={pos}
            style={[styles.posBtn, st.position === pos && styles.posBtnActive]}
            onPress={() => updateStyle({ position: pos })}
            accessibilityLabel={pos === 'top' ? 'Boven' : pos === 'center' ? 'Midden' : 'Onder'}
            accessibilityRole="radio"
            accessibilityState={{ selected: st.position === pos }}
          >
            <Text style={[styles.posBtnText, st.position === pos && styles.posBtnTextActive]}>
              {pos === 'top' ? 'Boven' : pos === 'center' ? 'Midden' : 'Onder'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Reset ── */}
      <TouchableOpacity
        style={styles.resetBtn}
        onPress={() => update(DEFAULT_SETTINGS)}
        accessibilityLabel="Instellingen resetten naar standaard"
        accessibilityRole="button"
      >
        <Text style={styles.resetBtnText}>Resetten naar standaard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  rowLabel: { color: colors.textSecondary, fontSize: 13, width: 110 },
  rowControl: { flex: 1 },
  slider: { width: '100%' },
  pickerWrapper: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 6,
  },
  picker: { color: colors.text, height: 44 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: { borderColor: colors.white },
  transparentSwatch: {
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentIcon: { color: colors.textTertiary, fontSize: 14 },
  posRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  posBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  posBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(255,51,102,0.12)' },
  posBtnText: { color: colors.textSecondary, fontSize: 12 },
  posBtnTextActive: { color: colors.primary, fontWeight: '600' },
  resetBtn: {
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetBtnText: { color: colors.textSecondary, fontSize: 13 },
});

export default SettingsPanel;
