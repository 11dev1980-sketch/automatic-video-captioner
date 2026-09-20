/**
 * Download Screen - Liquid Glass Design
 * Allows users to download videos from Instagram, TikTok, and other platforms using RapidAPI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';
import {
  downloadInstagramReel,
  downloadTikTokVideo,
  extractVideoUrl,
  detectPlatform,
  downloadVideoFile,
} from '../services/videoDownloadService';

export function DownloadScreen({ navigation }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const platform = detectPlatform(url);
      console.log('[DownloadScreen] Detected platform:', platform);

      let downloadResult;
      
      if (platform === 'instagram') {
        downloadResult = await downloadInstagramReel(url);
      } else if (platform === 'tiktok') {
        downloadResult = await downloadTikTokVideo(url);
      } else {
        // Try generic extraction
        downloadResult = await extractVideoUrl(url);
      }

      setResult(downloadResult);
    } catch (err) {
      console.error('[DownloadScreen] Download failed:', err);
      setError(err.message || 'Failed to download video');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!result?.videoUrl) return;

    try {
      await downloadVideoFile(result.videoUrl, `video_${Date.now()}.mp4`);
      Alert.alert('Success', 'Video downloaded successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to download video');
    }
  };

  const getPlatformIcon = () => {
    const platform = detectPlatform(url);
    switch (platform) {
      case 'instagram':
        return 'logo-instagram';
      case 'tiktok':
        return 'musical-notes';
      case 'direct':
        return 'videocam';
      default:
        return 'link';
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <PageHeader
          title="Video Download"
          subtitle="Download videos from Instagram, TikTok, and more"
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* URL Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Video URL</Text>
            <View style={styles.inputContainer}>
              <Ionicons name={getPlatformIcon()} size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Paste Instagram or TikTok URL..."
                placeholderTextColor={colors.textTertiary}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Download Button */}
          <TouchableOpacity
            style={[styles.downloadButton, loading && styles.downloadButtonDisabled]}
            onPress={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color={colors.text} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Download Video</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Result */}
          {result && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text style={styles.resultTitle}>Video Found!</Text>
              </View>

              <View style={styles.resultInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Platform:</Text>
                  <Text style={styles.infoValue}>{result.platform || 'Unknown'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Method:</Text>
                  <Text style={styles.infoValue}>{result.method || 'Unknown'}</Text>
                </View>
                {result.thumbnail && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Thumbnail:</Text>
                    <Text style={styles.infoValue}>Available</Text>
                  </View>
                )}
              </View>

              <View style={styles.resultActions}>
                <Button
                  title="Save to Library"
                  onPress={handleSaveToLibrary}
                  variant="primary"
                  size="large"
                />
              </View>
            </View>
          )}

          {/* Supported Platforms */}
          <View style={styles.platformsSection}>
            <Text style={styles.platformsTitle}>Supported Platforms</Text>
            <View style={styles.platformList}>
              <View style={styles.platformItem}>
                <Ionicons name="logo-instagram" size={24} color={colors.primary} />
                <Text style={styles.platformName}>Instagram Reels</Text>
              </View>
              <View style={styles.platformItem}>
                <Ionicons name="musical-notes" size={24} color={colors.accent} />
                <Text style={styles.platformName}>TikTok</Text>
              </View>
              <View style={styles.platformItem}>
                <Ionicons name="logo-youtube" size={24} color={colors.error} />
                <Text style={styles.platformName}>YouTube (coming soon)</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: layout.spacing.lg,
    paddingBottom: 120,
  },
  inputSection: {
    marginBottom: layout.spacing.lg,
  },
  inputLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: layout.spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: layout.spacing.md,
  },
  inputIcon: {
    marginRight: layout.spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: layout.spacing.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: layout.radius.md,
    paddingVertical: layout.spacing.md,
    paddingHorizontal: layout.spacing.lg,
    marginBottom: layout.spacing.lg,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: layout.spacing.sm,
  },
  buttonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    marginBottom: layout.spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginLeft: layout.spacing.sm,
  },
  resultContainer: {
    backgroundColor: colors.glassLight,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: layout.spacing.md,
  },
  resultTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginLeft: layout.spacing.sm,
  },
  resultInfo: {
    marginBottom: layout.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  infoValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  resultActions: {
    marginTop: layout.spacing.md,
  },
  platformsSection: {
    marginTop: layout.spacing.xl,
  },
  platformsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: layout.spacing.md,
  },
  platformList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.spacing.md,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: layout.radius.md,
    padding: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  platformName: {
    ...typography.caption,
    color: colors.text,
    marginLeft: layout.spacing.sm,
  },
});
