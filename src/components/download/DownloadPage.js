import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PageHeader } from '../common/PageHeader';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { strings } from '../../localization';
import { globalStyles } from '../../styles/globalStyles';
import { extractInstagramVideoUrl } from '../../services/instagramDownloaderService';

export function DownloadPage({ navigation }) {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const trimmedUrl = url.trim();
    
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║              DOWNLOAD PAGE - DOWNLOAD INITIATED                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('[DOWNLOAD-PAGE] 🎬 User initiated download');
    console.log('[DOWNLOAD-PAGE] 🔗 Input URL:', trimmedUrl);
    console.log('[DOWNLOAD-PAGE] ⏰ Timestamp:', new Date().toISOString());
    
    if (!trimmedUrl) {
      console.log('[DOWNLOAD-PAGE] ❌ Validation Failed: Empty URL');
      Alert.alert(strings.common.error, strings.errors.noVideoSelected);
      return;
    }

    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(reel|p|tv)\/[A-Za-z0-9_-]+/;
    console.log('[DOWNLOAD-PAGE] 🔍 Validating URL format...');
    console.log('[DOWNLOAD-PAGE] 📝 Regex Pattern:', instagramRegex.toString());
    
    if (!instagramRegex.test(trimmedUrl)) {
      console.log('[DOWNLOAD-PAGE] ❌ Validation Failed: Invalid Instagram URL format');
      console.log('[DOWNLOAD-PAGE] 📝 Expected format: https://www.instagram.com/reel/[ID]');
      console.log('[DOWNLOAD-PAGE] 📝 Received:', trimmedUrl);
      Alert.alert(strings.common.error, 'Please enter a valid Instagram Reel URL');
      return;
    }

    console.log('[DOWNLOAD-PAGE] ✅ URL validation passed');
    setIsDownloading(true);
    console.log('[DOWNLOAD-PAGE] 🔄 Download state set to: true');
    console.log('[DOWNLOAD-PAGE] 🚀 Starting video extraction pipeline...');
    
    try {
      // Use new Instagram service with video pipeline
      console.log('[DOWNLOAD-PAGE] 📞 Calling extractInstagramVideoUrl service...');
      const extractedVideoUrl = await extractInstagramVideoUrl(trimmedUrl);
      
      console.log('[DOWNLOAD-PAGE] 📥 Extraction completed');
      console.log('[DOWNLOAD-PAGE] 🔗 Extracted URL:', extractedVideoUrl);
      console.log('[DOWNLOAD-PAGE] 📊 URL Length:', extractedVideoUrl?.length || 0, 'characters');
      
      if (!extractedVideoUrl) {
        console.log('[DOWNLOAD-PAGE] ❌ Extraction Failed: No URL returned');
        throw new Error('Failed to extract video URL');
      }
      
      // Check if we got back the original URL (indicating failure)
      if (extractedVideoUrl === trimmedUrl) {
        console.log('[DOWNLOAD-PAGE] ❌ Extraction Failed: Original URL returned unchanged');
        console.log('[DOWNLOAD-PAGE] 📝 This indicates the extraction pipeline failed');
        throw new Error('Video extraction failed - original URL returned');
      }

      console.log('[DOWNLOAD-PAGE] ✅ Valid video URL extracted');
      console.log('[DOWNLOAD-PAGE] 🌐 Platform:', Platform.OS);

      // For iOS PWA and web platform, navigate to video player
      if (Platform.OS === 'web') {
        console.log('[DOWNLOAD-PAGE] 🌐 Web Platform Detected');
        console.log('[DOWNLOAD-PAGE] 🎬 Navigating to VideoPlayer screen...');
        console.log('[DOWNLOAD-PAGE] 📦 Navigation params:', {
          videoUri: extractedVideoUrl.substring(0, 50) + '...',
          videoName: `Instagram Reel ${Date.now()}`,
          duration: 0
        });
        
        // Navigate to VideoPlayerScreen which will display the video
        // For iOS PWA users, the VideoPlayerScreen will show a "Save to Library" button
        // after the video is displayed, allowing them to save the video to their library
        navigation.navigate('VideoPlayer', {
          videoUri: extractedVideoUrl,
          videoName: `Instagram Reel ${Date.now()}`,
          duration: 0,
        });
        
        console.log('[DOWNLOAD-PAGE] ✅ Navigation successful');
        console.log('[DOWNLOAD-PAGE] 🧹 Clearing URL input field');
        setUrl('');
        return;
      } else {
        console.log('[DOWNLOAD-PAGE] 📱 Mobile Platform Detected');
        console.log('[DOWNLOAD-PAGE] 💾 Starting file download process...');
        
        // For mobile, download using the new File API
        const filename = `instagram_reel_${Date.now()}.mp4`;
        console.log('[DOWNLOAD-PAGE] 📝 Generated filename:', filename);
        
        // Create a temporary directory for downloads
        console.log('[DOWNLOAD-PAGE] 📁 Creating download directory...');
        const downloadDir = new Directory(Paths.cache, 'downloads');
        console.log('[DOWNLOAD-PAGE] 📂 Download path:', downloadDir.uri);
        
        try {
          downloadDir.create();
          console.log('[DOWNLOAD-PAGE] ✅ Download directory created');
        } catch (error) {
          console.log('[DOWNLOAD-PAGE] ℹ️  Directory already exists (this is fine)');
        }
        
        // Download the video using the new API
        console.log('[DOWNLOAD-PAGE] ⬇️  Downloading video file...');
        console.log('[DOWNLOAD-PAGE] 🔗 Source URL:', extractedVideoUrl.substring(0, 100) + '...');
        
        const downloadStartTime = Date.now();
        const downloadedFile = await File.downloadFileAsync(extractedVideoUrl, downloadDir);
        const downloadEndTime = Date.now();
        const downloadDuration = downloadEndTime - downloadStartTime;
        
        console.log('[DOWNLOAD-PAGE] ✅ Video downloaded successfully');
        console.log('[DOWNLOAD-PAGE] ⏱️  Download time:', downloadDuration + 'ms');
        console.log('[DOWNLOAD-PAGE] 📊 File info:', downloadedFile.uri);
        
        // Rename the file to have a proper name
        console.log('[DOWNLOAD-PAGE] 📝 Renaming file to:', filename);
        const targetFile = new File(downloadDir, filename);
        await downloadedFile.move(targetFile);
        console.log('[DOWNLOAD-PAGE] ✅ File renamed successfully');
        console.log('[DOWNLOAD-PAGE] 📂 Final path:', targetFile.uri);
        
        // Check if sharing is available
        console.log('[DOWNLOAD-PAGE] 🔍 Checking if sharing is available...');
        const isSharingAvailable = await Sharing.isAvailableAsync();
        console.log('[DOWNLOAD-PAGE] 📊 Sharing available:', isSharingAvailable);
        
        if (isSharingAvailable) {
          console.log('[DOWNLOAD-PAGE] 📤 Opening share dialog...');
          // Share the downloaded video
          await Sharing.shareAsync(targetFile.uri, {
            mimeType: 'video/mp4',
            dialogTitle: 'Save Instagram Reel',
            UTI: 'public.movie',
          });
          
          console.log('[DOWNLOAD-PAGE] ✅ Share dialog opened successfully');
          Alert.alert(
            strings.common.success,
            'Video downloaded! Use the share menu to save it to your device.',
            [{ text: strings.common.ok }]
          );
        } else {
          console.log('[DOWNLOAD-PAGE] ℹ️  Sharing not available, showing file path');
          Alert.alert(
            strings.common.success,
            `Video downloaded to: ${targetFile.uri}`,
            [{ text: strings.common.ok }]
          );
        }
      }
      
      console.log('[DOWNLOAD-PAGE] 🧹 Clearing URL input field');
      setUrl('');
      console.log('[DOWNLOAD-PAGE] ✅ Download process completed successfully');
      
    } catch (error) {
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║                  ❌ DOWNLOAD FAILED                            ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.error('[DOWNLOAD-PAGE] 💥 Error Type:', error.name);
      console.error('[DOWNLOAD-PAGE] 💥 Error Message:', error.message);
      console.error('[DOWNLOAD-PAGE] 💥 Error Stack:', error.stack);
      console.error('[DOWNLOAD-PAGE] 📝 Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      Alert.alert(
        strings.common.error, 
        error.message || 'Failed to download video. Please check the URL and try again.'
      );
    } finally {
      console.log('[DOWNLOAD-PAGE] 🔄 Resetting download state...');
      setIsDownloading(false);
      console.log('[DOWNLOAD-PAGE] ✅ Download state set to: false');
      console.log('[DOWNLOAD-PAGE] 🏁 Download process finished');
      console.log('');
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <PageHeader
            title={strings.instagram.title}
            subtitle={strings.instagram.subtitle}
          />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="link" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={strings.instagram.pasteUrl}
            placeholderTextColor={colors.textSecondary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isDownloading}
          />
          {url.length > 0 && (
            <TouchableOpacity onPress={() => setUrl('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.downloadButton, (isDownloading || !url.trim()) && styles.downloadButtonDisabled]}
        onPress={handleDownload}
        disabled={isDownloading || !url.trim()}
      >
        {isDownloading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="download-outline" size={24} color={colors.white} />
            <Text style={styles.downloadButtonText}>{strings.instagram.download}</Text>
          </>
        )}
      </TouchableOpacity>
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
  headerWrapper: {
    minHeight: 120, // Fixed height to match all pages
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: layout.spacing.lg,
    paddingTop: layout.spacing.lg,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: layout.spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: layout.spacing.md,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: layout.spacing.sm,
  },
  input: {
    flex: 1,
    height: 52,
    ...typography.body,
    color: colors.text,
    outlineStyle: 'none',
  },
  clearButton: {
    padding: layout.spacing.xs,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: layout.radius.lg,
    paddingVertical: layout.spacing.md,
    paddingHorizontal: layout.spacing.lg,
    minHeight: 52,
    gap: layout.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  downloadButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
