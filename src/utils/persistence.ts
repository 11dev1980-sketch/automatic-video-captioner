/**
 * Persistence Layer — AsyncStorage wrappers with LZ compression
 *
 * Provides save/load functions for caption data and settings.
 * Uses lz-string for compression to minimise storage footprint.
 * Implements 30-day auto-cleanup for stale caption data.
 *
 * Requirements: 11.5, 11.6, 11.7, 11.8
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import LZString from 'lz-string';
import type { Caption_Object } from '../types/caption';
import type { Caption_Style } from '../types/captionStyle';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAPTION_KEY_PREFIX = '@caption_editor:captions:';
const SETTINGS_KEY = '@caption_editor:settings';
const PROJECT_KEY_PREFIX = '@caption_editor:project:';
const INDEX_KEY = '@caption_editor:index';         // tracks all stored videoIds + timestamps
const TTL_MS = 30 * 24 * 60 * 60 * 1000;          // 30 days

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface StoredCaptionEntry {
  captions: Caption_Object[];
  savedAt: number;   // Unix timestamp ms
  version: number;
}

export interface CaptionProject {
  videoId: string;
  videoUrl: string;
  originalVideoUrl?: string;
  videoName?: string;
  captions: Caption_Object[];
  captionStyle?: Caption_Style;
  wordsPerCaption?: number;
  savedAt: number;
}

interface IndexEntry {
  videoId: string;
  savedAt: number;
}

// ---------------------------------------------------------------------------
// Caption data persistence
// ---------------------------------------------------------------------------

/**
 * Saves caption data for a video, compressed with LZ-string.
 * Also updates the storage index for cleanup tracking.
 *
 * @param videoId - Unique identifier for the video (e.g. URL hash or title)
 * @param captions - Array of Caption_Object to save
 */
export async function saveCaptionData(
  videoId: string,
  captions: Caption_Object[]
): Promise<void> {
  try {
    const entry: StoredCaptionEntry = {
      captions,
      savedAt: Date.now(),
      version: 1,
    };
    const json = JSON.stringify(entry);
    const compressed = LZString.compressToUTF16(json);

    await AsyncStorage.setItem(`${CAPTION_KEY_PREFIX}${videoId}`, compressed);
    await _updateIndex(videoId);
  } catch (error) {
    console.error('[persistence] saveCaptionData error:', error);
  }
}

/**
 * Loads caption data for a video, decompresses and parses.
 *
 * @param videoId - Unique identifier for the video
 * @returns Array of Caption_Object or null if not found / error
 */
export async function loadCaptionData(
  videoId: string
): Promise<Caption_Object[] | null> {
  try {
    const compressed = await AsyncStorage.getItem(`${CAPTION_KEY_PREFIX}${videoId}`);
    if (!compressed) return null;

    const json = LZString.decompressFromUTF16(compressed);
    if (!json) return null;

    const entry: StoredCaptionEntry = JSON.parse(json);
    return entry.captions ?? null;
  } catch (error) {
    console.error('[persistence] loadCaptionData error:', error);
    return null;
  }
}

export async function saveCaptionProject(project: CaptionProject): Promise<void> {
  try {
    const json = JSON.stringify({ ...project, savedAt: Date.now() });
    const compressed = LZString.compressToUTF16(json);
    await AsyncStorage.setItem(`${PROJECT_KEY_PREFIX}${project.videoId}`, compressed);
    await _updateIndex(project.videoId);
  } catch (error) {
    console.error('[persistence] saveCaptionProject error:', error);
  }
}

export async function loadCaptionProject(videoId: string): Promise<CaptionProject | null> {
  try {
    const compressed = await AsyncStorage.getItem(`${PROJECT_KEY_PREFIX}${videoId}`);
    if (!compressed) return null;

    const json = LZString.decompressFromUTF16(compressed);
    if (!json) return null;

    return JSON.parse(json);
  } catch (error) {
    console.error('[persistence] loadCaptionProject error:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Settings persistence
// ---------------------------------------------------------------------------

/**
 * Saves the caption editor settings object.
 *
 * @param settings - Settings object (any shape)
 */
export async function saveSettings(settings: object): Promise<void> {
  try {
    const json = JSON.stringify(settings);
    const compressed = LZString.compressToUTF16(json);
    await AsyncStorage.setItem(SETTINGS_KEY, compressed);
  } catch (error) {
    console.error('[persistence] saveSettings error:', error);
  }
}

/**
 * Loads the caption editor settings object.
 *
 * @returns Settings object or null if not found / error
 */
export async function loadSettings(): Promise<object | null> {
  try {
    const compressed = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!compressed) return null;

    const json = LZString.decompressFromUTF16(compressed);
    if (!json) return null;

    return JSON.parse(json);
  } catch (error) {
    console.error('[persistence] loadSettings error:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cleanup — remove entries older than 30 days
// ---------------------------------------------------------------------------

/**
 * Removes all caption data entries that are older than 30 days.
 * Reads the storage index, checks each entry's age, and deletes stale ones.
 *
 * Requirements: 11.8
 */
export async function clearOldData(): Promise<void> {
  try {
    const index = await _loadIndex();
    const now = Date.now();
    const stale: string[] = [];
    const fresh: IndexEntry[] = [];

    for (const entry of index) {
      if (now - entry.savedAt > TTL_MS) {
        stale.push(`${CAPTION_KEY_PREFIX}${entry.videoId}`);
      } else {
        fresh.push(entry);
      }
    }

    if (stale.length > 0) {
      await AsyncStorage.multiRemove(stale);
      await _saveIndex(fresh);
      console.log(`[persistence] Cleared ${stale.length} stale caption entries.`);
    }
  } catch (error) {
    console.error('[persistence] clearOldData error:', error);
  }
}

/**
 * Removes ALL caption editor data (captions + settings + index).
 * Use for "reset" / logout scenarios.
 */
export async function clearAllData(): Promise<void> {
  try {
    const index = await _loadIndex();
    const keys = [
      SETTINGS_KEY,
      INDEX_KEY,
      ...index.map((e) => `${CAPTION_KEY_PREFIX}${e.videoId}`),
    ];
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('[persistence] clearAllData error:', error);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function _loadIndex(): Promise<IndexEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function _saveIndex(entries: IndexEntry[]): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(entries));
}

async function _updateIndex(videoId: string): Promise<void> {
  const index = await _loadIndex();
  const existing = index.findIndex((e) => e.videoId === videoId);
  const now = Date.now();

  if (existing !== -1) {
    index[existing].savedAt = now;
  } else {
    index.push({ videoId, savedAt: now });
  }

  await _saveIndex(index);
}
