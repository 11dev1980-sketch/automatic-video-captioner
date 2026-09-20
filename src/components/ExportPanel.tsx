/**
 * ExportPanel
 *
 * UI panel for exporting captions as SRT or as a real video with burned-in
 * captions. Video export is rendered in the browser so the downloaded file
 * contains the captions in the video frames.
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Caption_Object } from '../types/caption';
import type { Caption_Style } from '../types/captionStyle';
import { validateCaptionArray } from '../types/caption';
import {
  burnCaptionsInBrowser,
  canBurnVideoInBrowser,
  downloadBurnedVideo,
  convertWebMToMP4,
} from '../services/browserVideoBurner';
import { colors } from '../styles/colors';

interface ExportPanelProps {
  captions: Caption_Object[];
  videoUrl: string;
  captionStyle: Caption_Style;
  onExportComplete?: (path: string) => void;
}

const ExportPanel = memo(function ExportPanel({
  captions,
  videoUrl,
  captionStyle,
  onExportComplete,
}: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const validateBeforeExport = useCallback((): boolean => {
    if (captions.length === 0) {
      Alert.alert('Geen bijschriften', 'Er zijn geen bijschriften om te exporteren.');
      return false;
    }

    const validation = validateCaptionArray(captions);
    if (!validation.isValid) {
      Alert.alert(
        'Ongeldige bijschriften',
        `Sommige bijschriften zijn ongeldig:\n${validation.errors.slice(0, 3).map((e) => e.message).join('\n')}`,
      );
      return false;
    }

    return true;
  }, [captions]);

  const finishExport = useCallback(() => {
    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
      setExportStep('');
    }, 2000);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      // Burn captions into video (may be WebM)
      const result = await burnCaptionsInBrowser(videoUrl, captions, captionStyle, {
        onProgress: (percent, message) => {
          setExportProgress(percent);
          setExportStep(message);
        },
        signal: undefined,
      });

      let finalResult = result;
      // If the resulting mime type is not MP4, transcode to MP4 using ffmpeg.wasm
      if (!result.mimeType.includes('mp4')) {
        setExportStep('Converteren naar MP4...');
        const mp4Result = await convertWebMToMP4(result.blob);
        finalResult = {
          ...result,
          blob: mp4Result.blob,
          url: mp4Result.url,
          filename: `${result.filename.replace(/\.webm?$/i, '.mp4')}`,
          mimeType: 'video/mp4',
        };
      }

      downloadBurnedVideo(finalResult);
      setLastResult('Export voltooid');
      
      // Save caption metadata to Google Drive for history
      try {
        setExportStep('Opslaan naar geschiedenis...');
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
        
        await fetch(`${apiUrl}/api/drive/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            captionData: {
              captions: captions,
              style: captionStyle,
              totalDuration: captions[captions.length - 1]?.endTime || 0,
            },
            videoId: `export_${Date.now()}`,
            videoName: finalResult.filename,
          }),
        });
        
        console.log('[EXPORT] Saved caption metadata to Google Drive history');
      } catch (driveError) {
        console.error('[EXPORT] Failed to save to Google Drive:', driveError);
        // Continue even if Drive save fails
      }
      
      onExportComplete?.(finalResult.url);
    } catch (e) {
      Alert.alert('Export fout', e instanceof Error ? e.message : String(e));
    } finally {
      finishExport();
    }
  }, [videoUrl, captions, captionStyle, onExportComplete, finishExport]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Downloaden</Text>

      <Text style={styles.infoText}>
        {captions.length} bijschrift{captions.length !== 1 ? 'en' : ''} klaar voor export
      </Text>

      {isExporting && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.progressText}>{exportStep}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${exportProgress}%` as any }]} />
          </View>
          <Text style={styles.progressPct}>{exportProgress}%</Text>
        </View>
      )}

      {lastResult && !isExporting && (
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.successText}>Exporteren geslaagd</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.exportBtn, (isExporting || captions.length === 0) && styles.exportBtnDisabled]}
        onPress={handleExport}
        disabled={isExporting || captions.length === 0}
        accessibilityLabel="Bijschriften exporteren"
        accessibilityRole="button"
      >
        {isExporting ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons name="download-outline" size={18} color={colors.white} />
            <Text style={styles.exportBtnText}>Download</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoText: { color: colors.textTertiary, fontSize: 12, marginBottom: 12 },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  progressText: { color: colors.textSecondary, fontSize: 12 },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressPct: { color: colors.textTertiary, fontSize: 11 },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    marginBottom: 12,
  },
  successText: { color: colors.success, fontSize: 12 },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  exportBtnDisabled: { opacity: 0.5 },
  exportBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});

export default ExportPanel;
