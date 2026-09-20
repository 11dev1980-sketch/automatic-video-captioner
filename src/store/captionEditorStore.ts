/**
 * Caption Editor Zustand Store
 *
 * Central state management for the caption editor.
 * Covers video state, captions, appearance settings, and export state.
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

import { create } from 'zustand';
import type { Caption_Object } from '../types/caption';
import type { Caption_Style } from '../types/captionStyle';
import { CAPTION_STYLE_PRESETS } from '../types/captionStyle';
import { generateCaptionId } from '../types/caption';

// ---------------------------------------------------------------------------
// Sub-state types
// ---------------------------------------------------------------------------

export interface VideoState {
  url: string | null;
  duration: number; // milliseconds
  title: string;
}

export interface CaptionSettings {
  wordsPerCaption: number;        // 1-10
  fontFamily: 'Arial' | 'Helvetica' | 'Roboto' | 'Open Sans';
  fontSize: number;               // 12-36
  textColor: string;              // hex
  backgroundColor: string;        // hex or 'transparent'
  backgroundOpacity: number;      // 0-1
  bold: boolean;
  italic: boolean;
  underline: boolean;
  shadow: boolean;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  allCaps: boolean;
  position: 'top' | 'center' | 'bottom';
  verticalOffset: number;
  selectedPreset: string;
}

export interface ExportState {
  isExporting: boolean;
  exportProgress: number;         // 0-100
  exportFormat: 'srt' | 'video' | 'both';
  lastExportPath: string | null;
  exportError: string | null;
}

export interface GenerationState {
  isGenerating: boolean;
  generationStep: 'idle' | 'extracting' | 'transcribing' | 'translating' | 'segmenting' | 'done' | 'error';
  generationProgress: number;     // 0-100
  generationError: string | null;
}

export interface LanguageState {
  sourceLanguage: string | null;  // 'arabic' | 'turkish' | 'english' | null (auto)
  targetLanguage: string;         // 'dutch' | 'english'
  detectedLanguage: string | null;
  detectedConfidence: number;
}

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: CaptionSettings = {
  wordsPerCaption: 5,
  fontFamily: 'Roboto',
  fontSize: 24,
  textColor: '#FFFFFF',
  backgroundColor: '#000000',
  backgroundOpacity: 0.7,
  bold: false,
  italic: false,
  underline: false,
  shadow: true,
  outline: false,
  outlineColor: '#000000',
  outlineWidth: 2,
  allCaps: false,
  position: 'bottom',
  verticalOffset: 50,
  selectedPreset: 'modern',
};

const DEFAULT_EXPORT: ExportState = {
  isExporting: false,
  exportProgress: 0,
  exportFormat: 'srt',
  lastExportPath: null,
  exportError: null,
};

const DEFAULT_GENERATION: GenerationState = {
  isGenerating: false,
  generationStep: 'idle',
  generationProgress: 0,
  generationError: null,
};

const DEFAULT_LANGUAGE: LanguageState = {
  sourceLanguage: null,
  targetLanguage: 'dutch',
  detectedLanguage: null,
  detectedConfidence: 0,
};

// ---------------------------------------------------------------------------
// Full store state + actions
// ---------------------------------------------------------------------------

export interface CaptionEditorState {
  // Sub-states
  video: VideoState;
  captions: Caption_Object[];
  settings: CaptionSettings;
  captionStyle: Caption_Style;
  export: ExportState;
  generation: GenerationState;
  language: LanguageState;

  // --- Video actions ---
  setVideoUrl: (url: string) => void;
  setVideoDuration: (duration: number) => void;
  setVideoTitle: (title: string) => void;
  clearVideo: () => void;

  // --- Caption actions ---
  setCaptions: (captions: Caption_Object[]) => void;
  addCaption: (caption: Omit<Caption_Object, 'id'>) => void;
  updateCaption: (id: string, updates: Partial<Caption_Object>) => void;
  deleteCaption: (id: string) => void;
  splitCaption: (id: string, splitTimeMs: number) => void;
  mergeCaption: (id: string) => void; // merges with next adjacent caption
  reorderCaptions: () => void;        // re-sorts by startTime
  clearCaptions: () => void;

  // --- Settings actions ---
  setSettings: (settings: Partial<CaptionSettings>) => void;
  resetSettings: () => void;
  applyPreset: (presetName: string) => void;

  // --- Style actions ---
  setCaptionStyle: (style: Partial<Caption_Style>) => void;

  // --- Export actions ---
  setExportFormat: (format: 'srt' | 'video' | 'both') => void;
  setExportState: (state: Partial<ExportState>) => void;
  resetExport: () => void;

  // --- Generation actions ---
  setGenerationState: (state: Partial<GenerationState>) => void;
  resetGeneration: () => void;

  // --- Language actions ---
  setSourceLanguage: (lang: string | null) => void;
  setTargetLanguage: (lang: string) => void;
  setDetectedLanguage: (lang: string, confidence: number) => void;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useCaptionEditorStore = create<CaptionEditorState>((set, get) => ({
  // Initial state
  video: { url: null, duration: 0, title: '' },
  captions: [],
  settings: { ...DEFAULT_SETTINGS },
  captionStyle: { ...CAPTION_STYLE_PRESETS.modern },
  export: { ...DEFAULT_EXPORT },
  generation: { ...DEFAULT_GENERATION },
  language: { ...DEFAULT_LANGUAGE },

  // --- Video actions ---
  setVideoUrl: (url) =>
    set((state) => ({ video: { ...state.video, url } })),

  setVideoDuration: (duration) =>
    set((state) => ({ video: { ...state.video, duration } })),

  setVideoTitle: (title) =>
    set((state) => ({ video: { ...state.video, title } })),

  clearVideo: () =>
    set({ video: { url: null, duration: 0, title: '' }, captions: [] }),

  // --- Caption actions ---
  setCaptions: (captions) => set({ captions }),

  addCaption: (captionData) => {
    const newCaption: Caption_Object = { ...captionData, id: generateCaptionId() };
    set((state) => ({
      captions: [...state.captions, newCaption].sort((a, b) => a.startTime - b.startTime),
    }));
  },

  updateCaption: (id, updates) =>
    set((state) => ({
      captions: state.captions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteCaption: (id) =>
    set((state) => ({
      captions: state.captions.filter((c) => c.id !== id),
    })),

  splitCaption: (id, splitTimeMs) => {
    const { captions } = get();
    const index = captions.findIndex((c) => c.id === id);
    if (index === -1) return;

    const original = captions[index];
    if (splitTimeMs <= original.startTime || splitTimeMs >= original.endTime) return;

    const firstHalf: Caption_Object = {
      ...original,
      id: generateCaptionId(),
      endTime: splitTimeMs,
      text: original.text,
    };
    const secondHalf: Caption_Object = {
      ...original,
      id: generateCaptionId(),
      startTime: splitTimeMs,
      text: original.text,
    };

    const newCaptions = [...captions];
    newCaptions.splice(index, 1, firstHalf, secondHalf);
    set({ captions: newCaptions });
  },

  mergeCaption: (id) => {
    const { captions } = get();
    const index = captions.findIndex((c) => c.id === id);
    if (index === -1 || index >= captions.length - 1) return;

    const current = captions[index];
    const next = captions[index + 1];

    const merged: Caption_Object = {
      ...current,
      id: generateCaptionId(),
      endTime: next.endTime,
      text: `${current.text} ${next.text}`.trim(),
    };

    const newCaptions = [...captions];
    newCaptions.splice(index, 2, merged);
    set({ captions: newCaptions });
  },

  reorderCaptions: () =>
    set((state) => ({
      captions: [...state.captions].sort((a, b) => a.startTime - b.startTime),
    })),

  clearCaptions: () => set({ captions: [] }),

  // --- Settings actions ---
  setSettings: (updates) =>
    set((state) => ({ settings: { ...state.settings, ...updates } })),

  resetSettings: () => set({ settings: { ...DEFAULT_SETTINGS } }),

  applyPreset: (presetName) => {
    const preset = CAPTION_STYLE_PRESETS[presetName];
    if (!preset) return;
    set((state) => ({
      captionStyle: { ...preset },
      settings: { ...state.settings, selectedPreset: presetName },
    }));
  },

  // --- Style actions ---
  setCaptionStyle: (updates) =>
    set((state) => ({ captionStyle: { ...state.captionStyle, ...updates } })),

  // --- Export actions ---
  setExportFormat: (format) =>
    set((state) => ({ export: { ...state.export, exportFormat: format } })),

  setExportState: (updates) =>
    set((state) => ({ export: { ...state.export, ...updates } })),

  resetExport: () => set({ export: { ...DEFAULT_EXPORT } }),

  // --- Generation actions ---
  setGenerationState: (updates) =>
    set((state) => ({ generation: { ...state.generation, ...updates } })),

  resetGeneration: () => set({ generation: { ...DEFAULT_GENERATION } }),

  // --- Language actions ---
  setSourceLanguage: (lang) =>
    set((state) => ({ language: { ...state.language, sourceLanguage: lang } })),

  setTargetLanguage: (lang) =>
    set((state) => ({ language: { ...state.language, targetLanguage: lang } })),

  setDetectedLanguage: (lang, confidence) =>
    set((state) => ({
      language: { ...state.language, detectedLanguage: lang, detectedConfidence: confidence },
    })),
}));

// ---------------------------------------------------------------------------
// Selector helpers (use these in components for targeted subscriptions)
// ---------------------------------------------------------------------------

export const selectCaptions = (state: CaptionEditorState) => state.captions;
export const selectVideo = (state: CaptionEditorState) => state.video;
export const selectSettings = (state: CaptionEditorState) => state.settings;
export const selectCaptionStyle = (state: CaptionEditorState) => state.captionStyle;
export const selectExport = (state: CaptionEditorState) => state.export;
export const selectGeneration = (state: CaptionEditorState) => state.generation;
export const selectLanguage = (state: CaptionEditorState) => state.language;
