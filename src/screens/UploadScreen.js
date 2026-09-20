/**
 * Upload Screen - Liquid Glass Design
 * Step 1: Video file selection
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { useEffect, useState } from 'react';
import { validateSupportedUrl } from '../utils/validators';
import { useShareUrl } from '../hooks/useShareUrl';
import { useClipboardUrl } from '../hooks/useClipboardUrl';
import { strings } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

export function UploadScreen({ navigation, route }) {
    console.log('📤 UploadScreen: Component starting to render');
    console.log('📍 UploadScreen: Navigation prop:', navigation ? 'present' : 'missing');
    console.log('📍 UploadScreen: Route params:', route?.params);
    
    const [reelUrl, setReelUrl] = useState(route?.params?.reelUrl || '');
    const [error, setError] = useState(null);
    const { sharedUrl, clearSharedUrl } = useShareUrl();
    const { clipboardUrl, platform, clearClipboardUrl, readClipboardUrl } = useClipboardUrl();
    
    console.log('📍 UploadScreen: State initialized, reelUrl:', reelUrl);
    console.log('📍 UploadScreen: sharedUrl:', sharedUrl);
    console.log('📍 UploadScreen: clipboardUrl:', clipboardUrl);

    const handleContinue = () => {
        console.log('📍 UploadScreen: handleContinue called with reelUrl:', reelUrl);
        const validation = validateSupportedUrl(reelUrl);
        console.log('📍 UploadScreen: URL validation result:', validation);
        if (!validation.valid) {
            console.log('❌ UploadScreen: URL validation failed:', validation.error);
            setError(validation.error);
            return;
        }
        // Use cleaned URL and navigate to Configure screen where user picks language/options
        const cleanUrl = validation.cleaned || reelUrl.trim();
        console.log('✅ UploadScreen: Navigating to Configure with:', { reelUrl: cleanUrl, platform: validation.platform });
        navigation.navigate('Configure', { reelUrl: cleanUrl, platform: validation.platform });
    };

    const handlePickVideo = async () => {
        try {
            console.log('📤 UploadScreen: Opening document picker');
            const result = await DocumentPicker.getDocumentAsync({
                type: ['video/*'],
                copyToCacheDirectory: true,
            });
            
            console.log('📤 UploadScreen: Document picker result:', result);
            
            if (result.canceled === false && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                console.log('📤 UploadScreen: Selected video:', asset);
                
                // Navigate to Processing with local file info
                navigation.navigate('Processing', {
                    localFile: asset,
                    platform: 'local',
                });
            }
        } catch (err) {
            console.error('📤 UploadScreen: Error picking document:', err);
            setError('Fout bij selecteren van video: ' + err.message);
        }
    };

    useEffect(() => {
        console.log('📍 UploadScreen: useEffect running, route.params?.reelUrl:', route?.params?.reelUrl);
        if (route?.params?.reelUrl) {
            console.log('📍 UploadScreen: Prefilling reelUrl from route params without auto-navigation:', route.params.reelUrl);
            setReelUrl(route.params.reelUrl);
            setError(null);
        }
    }, [route?.params?.reelUrl]);

    useEffect(() => {
        console.log('📍 UploadScreen: sharedUrl useEffect, sharedUrl:', sharedUrl);
        if (sharedUrl) {
            console.log('📍 UploadScreen: Prefilling reelUrl from sharedUrl without auto-navigation:', sharedUrl);
            setReelUrl(sharedUrl);
            setError(null);
            clearSharedUrl();
        }
    }, [sharedUrl, clearSharedUrl]);

    useEffect(() => {
        console.log('📍 UploadScreen: clipboardUrl useEffect, clipboardUrl:', clipboardUrl);
        if (clipboardUrl) {
            console.log('📍 UploadScreen: Prefilling reelUrl from clipboardUrl without auto-navigation:', clipboardUrl);
            setReelUrl(clipboardUrl);
            setError(null);
            clearClipboardUrl();
        }
    }, [clipboardUrl, clearClipboardUrl]);

    const detected = validateSupportedUrl(reelUrl);

    console.log('📍 UploadScreen: Rendering component with reelUrl:', reelUrl);

    return (
        <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title={strings.upload.titleReel}
                        subtitle={strings.upload.description}
                    />
                </View>
                
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={{ ...styles.content, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                >

                <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>{strings.upload.reelUrl}</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.inputWithButton}
                            placeholder={strings.upload.reelUrlPlaceholder}
                            placeholderTextColor={colors.textTertiary}
                            value={reelUrl}
                            onChangeText={(t) => {
                                setError(null);
                                setReelUrl(t);
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            style={styles.filePickerButton}
                            onPress={handlePickVideo}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="folder-open" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                    <Button
                        title={strings.upload.continueToConfig}
                        onPress={handleContinue}
                        variant="primary"
                        size="large"
                        style={styles.continueButton}
                    />
                    {Platform.OS === 'web' && (
                        <Button
                            title={strings.upload.pasteFromClipboard}
                            onPress={readClipboardUrl}
                            variant="secondary"
                            size="medium"
                            style={{ marginTop: 16 }}
                        />
                    )}
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
    headerWrapper: {
        minHeight: 120, // Fixed height to match all pages
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: layout.spacing.lg,
        paddingTop: layout.spacing.lg,
        paddingBottom: 100,
    },
    continueButton: {
        marginTop: layout.spacing.lg,
    },
    inputCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.md,
        padding: layout.spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: layout.spacing.lg,
    },
    inputLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: layout.spacing.sm,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        ...typography.body,
        color: colors.text,
        backgroundColor: colors.background,
        outlineStyle: 'none',
        minHeight: 52,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
    },
    inputWithButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.radius.md,
        padding: layout.spacing.md,
        ...typography.body,
        color: colors.text,
        backgroundColor: colors.background,
        outlineStyle: 'none',
        minHeight: 52,
    },
    filePickerButton: {
        width: 52,
        height: 52,
        borderRadius: layout.radius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        marginTop: layout.spacing.md,
        padding: layout.spacing.md,
        backgroundColor: colors.error + '20',
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.error,
    },
    errorText: {
        ...typography.bodySmall,
        color: colors.error,
    },
    banner: {
        marginTop: layout.spacing.md,
        padding: layout.spacing.md,
        backgroundColor: colors.primary + '20',
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    bannerText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
    },
});
