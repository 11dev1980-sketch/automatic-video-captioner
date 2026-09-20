/**
 * Caption Editing Session Persistence
 *
 * Saves a lightweight session record to AsyncStorage so the user can
 * resume exactly where they left off after a page refresh or tab switch.
 * Captions themselves are stored separately by saveCaptionData() /
 * loadCaptionData() (in src/utils/persistence); this module only stores
 * the metadata needed to re-open the correct workspace.
 *
 * Session expires automatically after 7 days.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'CAPTION_EDITING_SESSION';
const EXPIRY_MS   = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Persist a new editing session.
 * Call this inside handleStartEditing(), before navigating to the workspace.
 *
 * @param {{ originalVideoUrl: string, videoUri: string, videoName: string, videoId: string }} data
 */
export async function saveEditingSession({ originalVideoUrl, videoUri, videoName, videoId }) {
    try {
        const session = {
            originalVideoUrl: originalVideoUrl || '',
            videoUri:         videoUri         || '',
            videoName:        videoName        || 'Naamloze video',
            videoId:          videoId          || '',
            savedAt:          Date.now(),
        };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
        console.log('[captionSession] ✅ Session saved — videoId:', videoId);
    } catch (err) {
        // Non-fatal: if storage fails the user just loses persistence
        console.warn('[captionSession] ⚠️ Failed to save session:', err.message);
    }
}

/**
 * Load the most recent editing session.
 * Returns null when no session exists or when it has expired.
 */
export async function loadEditingSession() {
    try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!raw) return null;

        const session = JSON.parse(raw);

        // Discard expired sessions
        if (!session.savedAt || Date.now() - session.savedAt > EXPIRY_MS) {
            await clearEditingSession();
            console.log('[captionSession] 🕐 Session expired — cleared');
            return null;
        }

        // Require at minimum a videoId and at least one URL
        if (!session.videoId || (!session.originalVideoUrl && !session.videoUri)) {
            await clearEditingSession();
            console.log('[captionSession] ❌ Session invalid — cleared');
            return null;
        }

        console.log('[captionSession] 📂 Session loaded — videoId:', session.videoId,
                    '| age:', formatSessionAge(session.savedAt));
        return session;
    } catch (err) {
        console.warn('[captionSession] ⚠️ Failed to load session:', err.message);
        return null;
    }
}

/**
 * Refresh the savedAt timestamp of the current session.
 * Call this whenever captions are auto-saved so the session stays alive
 * as long as the user is actively editing.
 * This is best-effort — never throws.
 */
export async function touchEditingSession() {
    try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const session = JSON.parse(raw);
        session.savedAt = Date.now();
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (_) {
        // Silent — touching is non-critical
    }
}

/**
 * Delete the current editing session.
 * Call this when the user deliberately starts a fresh video (so a stale
 * session does not auto-restore the previous one unexpectedly).
 * This is best-effort — never throws.
 */
export async function clearEditingSession() {
    try {
        await AsyncStorage.removeItem(SESSION_KEY);
        console.log('[captionSession] 🗑️ Session cleared');
    } catch (err) {
        console.warn('[captionSession] ⚠️ Failed to clear session:', err.message);
    }
}

/**
 * Human-readable age of a session timestamp (in Dutch).
 * e.g. "5 minuten geleden", "2 uur geleden", "3 dagen geleden"
 */
export function formatSessionAge(savedAt) {
    const diffMs    = Date.now() - (savedAt || 0);
    const diffMins  = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays  = Math.floor(diffMs / 86_400_000);

    if (diffMins  < 2)  return 'zojuist';
    if (diffMins  < 60) return `${diffMins} minuten geleden`;
    if (diffHours < 24) return `${diffHours} uur geleden`;
    if (diffDays  === 1) return 'gisteren';
    return `${diffDays} dagen geleden`;
}
