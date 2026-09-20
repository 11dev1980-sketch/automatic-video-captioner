/**
 * Share Service
 * Handles sharing transcription results and generating shareable content
 */

import { Platform, Share } from 'react-native';

// Dynamically import optional dependencies
let Sharing = null;
let FileSystem = null;
let captureRef = null;

try {
    Sharing = require('expo-sharing');
    FileSystem = require('expo-file-system');
} catch (e) {
    console.log('Sharing modules not available');
}

try {
    const viewShot = require('react-native-view-shot');
    captureRef = viewShot.captureRef;
} catch (e) {
    
}

/**
 * Share transcription results as text
 */
export async function shareTranscriptionText(results, videoName = 'Transcription') {
    try {
        const { arabicTranscript, translatedText, dutchTranslation, duas } = results;
        
        let shareText = `📹 ${videoName}\n\n`;
        
        if (arabicTranscript) {
            shareText += `🕌 Arabic:\n${arabicTranscript}\n\n`;
        }
        
        const translation = translatedText || dutchTranslation;
        if (translation) {
            shareText += `🌐 Translation:\n${translation}\n\n`;
        }
        
        if (duas) {
            shareText += `🤲 Duas:\n${duas}\n\n`;
        }
        
        shareText += `\n✨ Shared from Arabic Video Translator`;
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            await Share.share({
                message: shareText,
                title: videoName,
            });
        } else {
            // Web fallback - copy to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
                return { success: true, method: 'clipboard' };
            }
        }
        
        return { success: true, method: 'share' };
    } catch (error) {
        console.error('Error sharing transcription:', error);
        throw new Error('Failed to share transcription');
    }
}

/**
 * Share specific section (Arabic, Dutch, or Duas only)
 */
export async function shareSection(content, sectionName) {
    try {
        const shareText = `${content}\n\n✨ Shared from Arabic Video Translator`;
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            await Share.share({
                message: shareText,
                title: sectionName,
            });
        } else {
            // Web fallback
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
                return { success: true, method: 'clipboard' };
            }
        }
        
        return { success: true, method: 'share' };
    } catch (error) {
        console.error('Error sharing section:', error);
        throw new Error('Failed to share section');
    }
}

/**
 * Copy specific section to clipboard
 */
export async function copyToClipboard(content) {
    try {
        if (Platform.OS === 'web') {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(content);
                return true;
            }
        } else {
            try {
                // Use expo-clipboard
                const Clipboard = require('expo-clipboard').Clipboard;
                Clipboard.setString(content);
                return true;
            } catch (clipboardError) {
                console.error('Clipboard module not available:', clipboardError);
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
}

/**
 * Generate shareable link for transcription result
 * Format: app-url.com/shared/{resultId}
 */
export function generateShareableLink(resultId) {
    // This would be your PWA domain
    const baseUrl = 'https://your-pwa-domain.com';
    return `${baseUrl}/shared/${resultId}`;
}

/**
 * Save transcription result for sharing
 * Returns a shareable ID that can be used in links
 */
export async function saveSharedTranscription(results, videoName) {
    try {
        // Generate unique ID
        const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Save to AsyncStorage with share prefix
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const sharedData = {
            id: shareId,
            results,
            videoName,
            sharedAt: Date.now(),
        };
        
        await AsyncStorage.setItem(`@shared_${shareId}`, JSON.stringify(sharedData));
        
        return shareId;
    } catch (error) {
        console.error('Error saving shared transcription:', error);
        throw new Error('Failed to save shared transcription');
    }
}

/**
 * Load shared transcription by ID
 */
export async function loadSharedTranscription(shareId) {
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const data = await AsyncStorage.getItem(`@shared_${shareId}`);
        
        if (!data) {
            return null;
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading shared transcription:', error);
        return null;
    }
}

/**
 * Share transcription with shareable link
 */
export async function shareTranscriptionWithLink(results, videoName) {
    try {
        // Save transcription and get share ID
        const shareId = await saveSharedTranscription(results, videoName);
        
        // Generate shareable link
        const shareLink = generateShareableLink(shareId);
        
        const shareText = `Check out this transcription: ${videoName}\n\n${shareLink}\n\n✨ Shared from Arabic Video Translator`;
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            await Share.share({
                message: shareText,
                title: videoName,
                url: shareLink,
            });
        } else {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareLink);
                return { success: true, method: 'clipboard', link: shareLink };
            }
        }
        
        return { success: true, method: 'share', link: shareLink };
    } catch (error) {
        console.error('Error sharing with link:', error);
        throw new Error('Failed to share with link');
    }
}

/**
 * Capture view as image and share
 */
export async function shareAsImage(viewRef, filename = 'transcription') {
    try {
        if (!captureRef) {
            throw new Error('View capture not available');
        }
        
        // Capture the view as image
        const uri = await captureRef(viewRef, {
            format: 'png',
            quality: 1,
        });
        
        // Share the image
        if (Sharing && await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Share Transcription',
            });
            return { success: true };
        } else {
            throw new Error('Sharing is not available on this device');
        }
    } catch (error) {
        console.error('Error sharing as image:', error);
        throw new Error('Failed to share as image');
    }
}
