/**
 * SimulatedCaptionWorkspaceScreen
 *
 * A pixel-accurate, fully interactive simulation of the Caption Editor
 * Workspace — the screen that appears after clicking "Ondertitel bewerken"
 * and waiting for the loading indicator.
 *
 * Everything here is real functionality with DEMO_CAPTIONS and DEMO_VIDEO_URL.
 * Zero API calls are made.
 *
 * Features:
 *  - HTML5 video player with live caption overlay
 *  - Progress scrubber with caption marker dots
 *  - Bewerken tab: full caption timeline — tap-to-seek, inline edit, split, delete, add
 *  - Stijl tab:    font size, text colour, background, position — live preview
 *  - Export tab:   copy SRT, download SRT / VTT, formatted preview
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../styles/colors';
import { DEMO_CAPTIONS, DEMO_VIDEO_URL, DEMO_VIDEO_NAME } from '../demo/demoData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function msToDisplay(ms) {
  const totalSec = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function pad(n, len = 2) {
  return String(Math.floor(Math.abs(n))).padStart(len, '0');
}

function toSrtTime(ms) {
  const h   = Math.floor(ms / 3_600_000);
  const m   = Math.floor((ms % 3_600_000) / 60_000);
  const s   = Math.floor((ms % 60_000) / 1_000);
  const ms3 = ms % 1_000;
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms3, 3)}`;
}

function generateSrt(caps) {
  return caps
    .map((c, i) => `${i + 1}\n${toSrtTime(c.startTime)} --> ${toSrtTime(c.endTime)}\n${c.text}`)
    .join('\n\n');
}

function generateVtt(caps) {
  const rows = ['WEBVTT', ''];
  caps.forEach((c, i) => {
    rows.push(String(i + 1));
    rows.push(`${toSrtTime(c.startTime).replace(',', '.')} --> ${toSrtTime(c.endTime).replace(',', '.')}`);
    rows.push(c.text, '');
  });
  return rows.join('\n');
}

function downloadText(content, filename, mime) {
  if (Platform.OS !== 'web') {
    Alert.alert('Download', 'Downloaden is alleen beschikbaar in de webbrowser.');
    return;
  }
  try {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    Alert.alert('Fout', 'Downloaden mislukt: ' + e.message);
  }
}

async function copyToClipboard(text) {
  if (Platform.OS === 'web' && navigator?.clipboard) {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Style options
// ─────────────────────────────────────────────────────────────────────────────

const FONT_SIZES = [
  { label: 'S',  value: 13 },
  { label: 'M',  value: 17 },
  { label: 'L',  value: 22 },
  { label: 'XL', value: 28 },
];

const TEXT_COLORS = [
  { label: 'Wit',   value: '#ffffff', dark: false },
  { label: 'Geel',  value: '#fbbf24', dark: false },
  { label: 'Cyaan', value: '#22d3ee', dark: false },
  { label: 'Groen', value: '#4ade80', dark: false },
];

const BACKGROUNDS = [
  { label: 'Geen',     value: 'transparent' },
  { label: 'Half',     value: 'rgba(0,0,0,0.60)' },
  { label: 'Donker',   value: 'rgba(0,0,0,0.90)' },
];

const POSITIONS = [
  { label: 'Boven',  value: 'top',    icon: 'arrow-up-outline' },
  { label: 'Midden', value: 'center', icon: 'remove-outline' },
  { label: 'Onder',  value: 'bottom', icon: 'arrow-down-outline' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SimulatedCaptionWorkspaceScreen({ onBack }) {
  const videoRef = useRef(null);

  /* ── Caption state ── */
  const [captions, setCaptions] = useState(() =>
    DEMO_CAPTIONS.map(c => ({ ...c }))
  );
  const [editingId,   setEditingId]   = useState(null);
  const [editingText, setEditingText] = useState('');

  /* ── Playback state ── */
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [isPlaying,   setIsPlaying]   = useState(false);

  /* ── UI ── */
  const [activeTab, setActiveTab] = useState('edit');

  /* ── Style settings ── */
  const [fontSize,   setFontSize]   = useState(17);
  const [textColor,  setTextColor]  = useState('#ffffff');
  const [bgColor,    setBgColor]    = useState('rgba(0,0,0,0.60)');
  const [position,   setPosition]   = useState('bottom');

  /* ── Export feedback ── */
  const [copyStatus, setCopyStatus] = useState(null); // 'ok' | 'fail' | null

  /* ── Active caption ── */
  const activeCaption = captions.find(
    c => currentTime >= c.startTime / 1000 && currentTime < c.endTime / 1000
  ) ?? null;

  /* ── Caption mutations ── */
  const startEdit = useCallback((cap) => {
    setEditingId(cap.id);
    setEditingText(cap.text);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingId) return;
    setCaptions(prev =>
      prev.map(c => (c.id === editingId ? { ...c, text: editingText.trim() || c.text } : c))
    );
    setEditingId(null);
    setEditingText('');
  }, [editingId, editingText]);

  const deleteCaption = useCallback((id) => {
    setCaptions(prev => prev.filter(c => c.id !== id));
  }, []);

  const splitCaption = useCallback((cap) => {
    const words = cap.text.trim().split(/\s+/);
    if (words.length < 2) return;
    const half    = Math.ceil(words.length / 2);
    const midMs   = Math.round((cap.startTime + cap.endTime) / 2);
    const now     = Date.now();
    setCaptions(prev => {
      const idx  = prev.findIndex(c => c.id === cap.id);
      const next = [...prev];
      next.splice(idx, 1,
        { ...cap, text: words.slice(0, half).join(' '), endTime: midMs,   id: `${cap.id}_a${now}` },
        { ...cap, text: words.slice(half).join(' '),    startTime: midMs, id: `${cap.id}_b${now}` },
      );
      return next;
    });
  }, []);

  const addCaption = useCallback(() => {
    const last   = captions[captions.length - 1];
    const start  = last ? last.endTime : 0;
    setCaptions(prev => [
      ...prev,
      { id: `cap_new_${Date.now()}`, text: 'Nieuw bijschrift', startTime: start, endTime: start + 3000 },
    ]);
  }, [captions]);

  const seekTo = useCallback((ms) => {
    if (videoRef.current) videoRef.current.currentTime = ms / 1000;
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    isPlaying ? v.pause() : v.play().catch(() => {});
  }, [isPlaying]);

  /* ── Copy SRT ── */
  const handleCopySrt = useCallback(async () => {
    const ok = await copyToClipboard(generateSrt(captions));
    setCopyStatus(ok ? 'ok' : 'fail');
    setTimeout(() => setCopyStatus(null), 2200);
    if (!ok) Alert.alert('Gekopieerd', 'SRT naar klembord gekopieerd.');
  }, [captions]);

  /* ── Seek-bar click (web only) ── */
  const handleSeekBarClick = useCallback((evt) => {
    if (Platform.OS !== 'web' || !videoRef.current || !duration) return;
    const rect   = evt.currentTarget.getBoundingClientRect();
    const ratio  = (evt.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * duration;
  }, [duration]);

  /* ── Derived ── */
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const videoHeight     = Math.min(SCREEN_HEIGHT * 0.30, 210);

  const TABS = [
    { id: 'edit',   label: 'Bewerken', icon: 'create-outline' },
    { id: 'style',  label: 'Stijl',    icon: 'color-palette-outline' },
    { id: 'export', label: 'Export',   icon: 'download-outline' },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack} accessibilityLabel="Terug">
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 8 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>Bijschriften editor</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {captions.length} bijschriften · {DEMO_VIDEO_NAME}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Opnieuw genereren">
            <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Video player ────────────────────────────────────────────────── */}
        <View style={[styles.playerWrap, { height: videoHeight }]}>
          {Platform.OS === 'web' ? (
            /* HTML5 video on web */
            <video
              ref={videoRef}
              src={DEMO_VIDEO_URL}
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
              playsInline
              preload="metadata"
              onLoadedMetadata={e => setDuration(e.target.duration)}
              onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            /* Native placeholder */
            <View style={styles.playerPlaceholder}>
              <Ionicons name="film-outline" size={36} color={colors.textTertiary} />
              <Text style={styles.playerPlaceholderText}>Video (web only in preview)</Text>
            </View>
          )}

          {/* Caption overlay */}
          {activeCaption && (
            <View
              style={[
                styles.captionOverlay,
                position === 'top'    && styles.capTop,
                position === 'center' && styles.capMid,
                position === 'bottom' && styles.capBot,
              ]}
              pointerEvents="none"
            >
              <Text
                style={[
                  styles.captionOverlayText,
                  { fontSize, color: textColor, backgroundColor: bgColor },
                ]}
              >
                {activeCaption.text}
              </Text>
            </View>
          )}

          {/* Playback controls bar */}
          <View style={styles.controlsBar}>
            <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.timeLabel}>
              {msToDisplay(currentTime * 1000)} / {msToDisplay(duration * 1000)}
            </Text>

            {/* Seek bar */}
            {Platform.OS === 'web' ? (
              <View
                style={styles.seekBar}
                onClick={handleSeekBarClick}
                accessibilityRole="slider"
              >
                <View style={[styles.seekFill, { width: `${progressPercent}%` }]} />
                {/* Caption start markers */}
                {captions.map(c => (
                  <View
                    key={c.id}
                    style={[
                      styles.seekMarker,
                      { left: duration > 0 ? `${(c.startTime / 1000 / duration) * 100}%` : '0%' },
                    ]}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.seekBar}>
                <View style={[styles.seekFill, { width: `${progressPercent}%` }]} />
              </View>
            )}
          </View>
        </View>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.id }}
            >
              <Ionicons
                name={tab.icon}
                size={15}
                color={activeTab === tab.id ? colors.primary : colors.textTertiary}
              />
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab content ─────────────────────────────────────────────────── */}
        <View style={{ flex: 1 }}>

          {/* ═══ BEWERKEN ═══════════════════════════════════════════════════ */}
          {activeTab === 'edit' && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.editContent}
              keyboardShouldPersistTaps="handled"
            >
              {captions.map((cap) => {
                const isActive  = activeCaption?.id === cap.id;
                const isEditing = editingId === cap.id;

                return (
                  <TouchableOpacity
                    key={cap.id}
                    activeOpacity={0.8}
                    onPress={() => seekTo(cap.startTime)}
                    style={[styles.capCard, isActive && styles.capCardActive]}
                  >
                    {/* Active indicator dot */}
                    {isActive && <View style={styles.activeDot} />}

                    {/* Timestamp */}
                    <View style={styles.capTimestampRow}>
                      <Ionicons name="time-outline" size={11} color={colors.textTertiary} />
                      <Text style={styles.capTimestamp}>{msToDisplay(cap.startTime)}</Text>
                      <Text style={styles.capTimestampSep}>→</Text>
                      <Text style={styles.capTimestamp}>{msToDisplay(cap.endTime)}</Text>
                      <View style={{ flex: 1 }} />
                      <Text style={styles.capDuration}>
                        {((cap.endTime - cap.startTime) / 1000).toFixed(1)}s
                      </Text>
                    </View>

                    {/* Caption text or input */}
                    {isEditing ? (
                      <TextInput
                        style={styles.capInput}
                        value={editingText}
                        onChangeText={setEditingText}
                        onBlur={commitEdit}
                        onSubmitEditing={commitEdit}
                        autoFocus
                        multiline
                        returnKeyType="done"
                      />
                    ) : (
                      <Text style={[styles.capText, isActive && styles.capTextActive]}>
                        {cap.text}
                      </Text>
                    )}

                    {/* Actions */}
                    <View style={styles.capActions}>
                      <TouchableOpacity style={styles.capAction} onPress={() => startEdit(cap)}>
                        <Ionicons name="pencil-outline" size={14} color={colors.primary} />
                        <Text style={[styles.capActionLabel, { color: colors.primary }]}>Bewerken</Text>
                      </TouchableOpacity>
                      <View style={styles.capActionSep} />
                      <TouchableOpacity style={styles.capAction} onPress={() => splitCaption(cap)}>
                        <Ionicons name="cut-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.capActionLabel}>Splitsen</Text>
                      </TouchableOpacity>
                      <View style={styles.capActionSep} />
                      <TouchableOpacity style={styles.capAction} onPress={() => deleteCaption(cap.id)}>
                        <Ionicons name="trash-outline" size={14} color={colors.error} />
                        <Text style={[styles.capActionLabel, { color: colors.error }]}>Verwijderen</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Add caption */}
              <TouchableOpacity style={styles.addBtn} onPress={addCaption}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.addBtnLabel}>Bijschrift toevoegen</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ═══ STIJL ══════════════════════════════════════════════════════ */}
          {activeTab === 'style' && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.styleContent}>

              {/* Font size */}
              <Text style={styles.sectionLabel}>LETTERGROOTTE</Text>
              <View style={styles.chipRow}>
                {FONT_SIZES.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, fontSize === opt.value && styles.chipActive]}
                    onPress={() => setFontSize(opt.value)}
                  >
                    <Text style={[
                      styles.chipText,
                      { fontSize: 10 + opt.value * 0.35 },
                      fontSize === opt.value && styles.chipTextActive,
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Text colour */}
              <Text style={styles.sectionLabel}>TEKSTKLEUR</Text>
              <View style={styles.chipRow}>
                {TEXT_COLORS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.colorSwatch, { backgroundColor: opt.value }, textColor === opt.value && styles.colorSwatchActive]}
                    onPress={() => setTextColor(opt.value)}
                    accessibilityLabel={opt.label}
                  >
                    {textColor === opt.value && (
                      <Ionicons name="checkmark" size={14} color={opt.dark ? '#fff' : '#000'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Background */}
              <Text style={styles.sectionLabel}>ACHTERGROND</Text>
              <View style={styles.chipRow}>
                {BACKGROUNDS.map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.chip, bgColor === opt.value && styles.chipActive]}
                    onPress={() => setBgColor(opt.value)}
                  >
                    <Text style={[styles.chipText, bgColor === opt.value && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Position */}
              <Text style={styles.sectionLabel}>POSITIE</Text>
              <View style={styles.chipRow}>
                {POSITIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, position === opt.value && styles.chipActive]}
                    onPress={() => setPosition(opt.value)}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={13}
                      color={position === opt.value ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.chipText, position === opt.value && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Live preview */}
              <Text style={styles.sectionLabel}>VOORBEELD</Text>
              <View style={styles.previewBox}>
                <Text
                  style={[
                    styles.previewText,
                    { fontSize, color: textColor, backgroundColor: bgColor },
                  ]}
                >
                  In naam van Allah
                </Text>
              </View>

            </ScrollView>
          )}

          {/* ═══ EXPORT ═════════════════════════════════════════════════════ */}
          {activeTab === 'export' && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.exportContent}>

              <Text style={styles.exportHeading}>Exporteer {captions.length} bijschriften</Text>
              <Text style={styles.exportSub}>
                Download of kopieer de bijschriften als SRT- of VTT-bestand.
              </Text>

              {/* Buttons */}
              <View style={styles.exportBtns}>
                {/* Copy SRT */}
                <TouchableOpacity style={styles.exportBtnPrimary} onPress={handleCopySrt}>
                  <Ionicons
                    name={copyStatus === 'ok' ? 'checkmark-circle-outline' : 'copy-outline'}
                    size={19}
                    color="#fff"
                  />
                  <Text style={styles.exportBtnPrimaryText}>
                    {copyStatus === 'ok' ? 'Gekopieerd!' : 'Kopieer SRT'}
                  </Text>
                </TouchableOpacity>

                {/* Download SRT */}
                <TouchableOpacity
                  style={styles.exportBtnSecondary}
                  onPress={() => downloadText(generateSrt(captions), 'bijschriften.srt', 'text/plain')}
                >
                  <Ionicons name="download-outline" size={19} color={colors.primary} />
                  <Text style={styles.exportBtnSecondaryText}>Download SRT</Text>
                </TouchableOpacity>

                {/* Download VTT */}
                <TouchableOpacity
                  style={styles.exportBtnSecondary}
                  onPress={() => downloadText(generateVtt(captions), 'bijschriften.vtt', 'text/vtt')}
                >
                  <Ionicons name="cloud-download-outline" size={19} color={colors.primary} />
                  <Text style={styles.exportBtnSecondaryText}>Download WebVTT</Text>
                </TouchableOpacity>
              </View>

              {/* SRT preview */}
              <Text style={styles.sectionLabel}>SRT VOORVERTONING</Text>
              <View style={styles.srtBox}>
                <Text style={styles.srtText} selectable>
                  {generateSrt(captions.slice(0, 4))}
                  {captions.length > 4 ? `\n\n... (${captions.length - 4} meer)` : ''}
                </Text>
              </View>

            </ScrollView>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 36, height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  headerSub:   { color: colors.textTertiary, fontSize: 11, marginTop: 1 },

  /* Video player */
  playerWrap: {
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  playerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  playerPlaceholderText: { color: colors.textTertiary, fontSize: 13 },

  /* Caption overlay on video */
  captionOverlay: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 5,
  },
  capTop: { top: 8 },
  capMid: { top: '38%' },
  capBot: { bottom: 38 },
  captionOverlayText: {
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 28,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 5,
    overflow: 'hidden',
  },

  /* Playback controls */
  controlsBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  playBtn: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: { color: '#fff', fontSize: 11, minWidth: 82 },
  seekBar: {
    flex: 1, height: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
    cursor: 'pointer',
  },
  seekFill: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  seekMarker: {
    position: 'absolute',
    top: -3, bottom: -3,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 1,
  },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,    borderTopColor: colors.border,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabLabel:       { color: colors.textTertiary, fontSize: 12 },
  tabLabelActive: { color: colors.primary,      fontSize: 12, fontWeight: '600' },

  /* ── BEWERKEN tab ── */
  editContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 120,
  },
  capCard: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  capCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,51,102,0.07)',
  },
  activeDot: {
    position: 'absolute',
    top: 10, right: 10,
    width: 7, height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  capTimestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  capTimestamp:    { color: colors.textTertiary, fontSize: 11, fontVariant: ['tabular-nums'] },
  capTimestampSep: { color: colors.textTertiary, fontSize: 10 },
  capDuration:     { color: colors.textTertiary, fontSize: 11 },
  capText:         { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  capTextActive:   { color: colors.text },
  capInput: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
    marginBottom: 4,
    outlineStyle: 'none',
  },
  capActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  capAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  capActionLabel:  { color: colors.textSecondary, fontSize: 12 },
  capActionSep: {
    width: 1, height: 14,
    backgroundColor: colors.border,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
    marginTop: 4,
  },
  addBtnLabel: { color: colors.primary, fontSize: 14 },

  /* ── STIJL tab ── */
  styleContent: { padding: 16, paddingBottom: 120 },
  sectionLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
    marginTop: 20,
    marginBottom: 10,
  },
  chipRow:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundTertiary,
  },
  chipActive:     { borderColor: colors.primary, backgroundColor: 'rgba(255,51,102,0.10)' },
  chipText:       { color: colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  colorSwatch: {
    width: 34, height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: { borderColor: colors.primary },
  previewBox: {
    height: 80,
    backgroundColor: '#1a1f2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    fontWeight: '600',
    overflow: 'hidden',
  },

  /* ── EXPORT tab ── */
  exportContent: { padding: 16, paddingBottom: 120 },
  exportHeading: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  exportSub:     { color: colors.textSecondary, fontSize: 13, marginBottom: 20 },
  exportBtns:    { gap: 10 },
  exportBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exportBtnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  exportBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportBtnSecondaryText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  srtBox: {
    backgroundColor: '#0d1117',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  srtText: {
    color: '#4ade80',
    fontSize: 12,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
