/**
 * Processing Screen - Liquid Glass Design
 * Step 3: Video processing with progress
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../components/common/PageHeader';
import { ProcessingStatus } from '../components/processing/ProcessingStatus';
import { StepIndicator } from '../components/processing/StepIndicator';
import { ErrorDisplay } from '../components/processing/ErrorDisplay';
import { Button } from '../components/common/Button';
import { useProcessing } from '../hooks/useProcessing';
import { strings } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

const PROCESSING_STEPS = [
    'Uploaden',
    'Instellen',
    'Verwerken',
    'Resultaten',
];

export function ProcessingScreen({ route, navigation }) {
    console.log('⚙️ ProcessingScreen: Component starting to render');
    console.log('📍 ProcessingScreen: Navigation prop:', navigation ? 'present' : 'missing');
    
    const params = route.params || {};
    const { reelUrl, instagramEnabled, instagramPostConfig, localFile, targetLanguage = 'dutch' } = params;

    console.log('⚙️ ProcessingScreen: Screen params:', params);
    console.log('📍 ProcessingScreen: reelUrl:', reelUrl);
    console.log('📍 ProcessingScreen: localFile:', localFile);
    console.log('📍 ProcessingScreen: instagramEnabled:', instagramEnabled);
    console.log('📍 ProcessingScreen: instagramPostConfig:', instagramPostConfig);
    const [localError, setLocalError] = useState(null);
    
    // Validate required parameters
    if (!reelUrl && !localFile) {
        console.error('[PROCESSING-SCREEN] Missing reelUrl and localFile parameters');
        return (
            <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
                <View style={styles.container}>
                    <View style={styles.headerWrapper}>
                        <PageHeader
                            title="Fout"
                            subtitle="Verwerkingsparameters ontbreken"
                        />
                    </View>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.fallbackContainer}>
                            <Text style={styles.fallbackText}>Er is geen video-URL of bestand opgegeven.</Text>
                            <View style={styles.cancelContainer}>
                                <Button
                                    title="Terug"
                                    onPress={() => navigation.goBack()}
                                    variant="primary"
                                    size="medium"
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
    const {
        processing,
        progress,
        currentStep,
        error,
        results,
        processVideo,
        cancelProcessing,
        reset,
    } = useProcessing();

    const displayError = error || localError;

    useEffect(() => {
        console.log('🔍 [PROCESSING-SCREEN] Component mounted with params:', JSON.stringify(route.params, null, 2));
        console.log('🔍 [PROCESSING-SCREEN] Processing state:', { 
            processing, 
            error: error ? `${error.code || 'NO_CODE'}: ${error.message || 'NO_MESSAGE'}` : 'null', 
            progress, 
            currentStep 
        });
        
        if (localFile) {
            console.log('🔍 [PROCESSING-SCREEN] Local file selected, showing not implemented message');
            setLocalError({
                code: 9001,
                message: 'Lokale bestandsverwerking is nog niet geïmplementeerd. Gebruik een URL van Instagram, YouTube of TikTok.',
                userMessage: 'Lokale bestanden nog niet ondersteund'
            });
            return;
        }
        
        if (reelUrl) {
            console.log('🔍 [PROCESSING-SCREEN] Starting video processing for:', reelUrl);
            console.log('🔍 [PROCESSING-SCREEN] Processing options:', {
                instagramEnabled,
                instagramPostConfig: instagramPostConfig ? 'present' : 'missing'
            });

            processVideo(reelUrl, targetLanguage, instagramEnabled, instagramPostConfig)
                .then((processedResults) => {
                    console.log('✅ [PROCESSING-SCREEN] Processing completed successfully:', processedResults);
                    if (processedResults) {
                        // Pass videoId if available (for library videos)
                        const params = { results: processedResults };
                        if (route.params?.videoId) {
                            params.videoId = route.params.videoId;
                            params.videoName = route.params.videoName;
                            console.log('🔍 [PROCESSING-SCREEN] Added library video info:', { videoId: route.params.videoId, videoName: route.params.videoName });
                        }
                        console.log('🔍 [PROCESSING-SCREEN] Navigating to Results with params:', JSON.stringify(params, null, 2));
                        navigation.replace('Results', params);
                    } else {
                        console.log('⚠️ [PROCESSING-SCREEN] No results from processing - this is unexpected');
                    }
                })
                .catch((err) => {
                    console.error('❌ [PROCESSING-SCREEN] Processing error caught:', err);
                    console.error('❌ [PROCESSING-SCREEN] Error details:', {
                        message: err?.message,
                        code: err?.code,
                        stack: err?.stack,
                        name: err?.name,
                        toString: err?.toString()
                    });
                    console.log('❌ [PROCESSING-SCREEN] Error type:', typeof err);
                    console.log('❌ [PROCESSING-SCREEN] Error keys:', Object.keys(err || {}));
                    // Error handled by processing hook
                });
        } else {
            console.log('⚠️ [PROCESSING-SCREEN] No reelUrl provided, going back');
            navigation.goBack();
        }

        return () => {
            console.log('🔍 [PROCESSING-SCREEN] Component unmounting, resetting');
            reset();
        };
    }, [reelUrl, instagramEnabled, instagramPostConfig, processVideo, navigation, reset]);

    const handleCancel = () => {
        console.log('🚫 [PROCESSING-SCREEN] Cancel button pressed');
        cancelProcessing();
        navigation.goBack();
    };

    const handleRetry = () => {
        console.log('🔄 [PROCESSING-SCREEN] Retry button pressed');
        console.log('🔄 [PROCESSING-SCREEN] Retry with params:', { reelUrl, instagramEnabled });
        reset();
        if (reelUrl) {
            console.log('🔄 [PROCESSING-SCREEN] Starting retry processing');
            processVideo(reelUrl, targetLanguage, instagramEnabled, instagramPostConfig)
                .then((processedResults) => {
                    console.log('✅ [PROCESSING-SCREEN] Retry processing completed:', processedResults);
                    if (processedResults) {
                        // Pass videoId if available (for library videos)
                        const params = { results: processedResults };
                        if (route.params?.videoId) {
                            params.videoId = route.params.videoId;
                            params.videoName = route.params.videoName;
                        }
                        navigation.replace('Results', params);
                    }
                })
                .catch((err) => {
                    console.error('❌ [PROCESSING-SCREEN] Retry processing error:', err);
                    console.error('❌ [PROCESSING-SCREEN] Retry error details:', {
                        message: err?.message,
                        code: err?.code,
                        stack: err?.stack,
                        name: err?.name,
                        toString: err?.toString()
                    });
                    // Error handled by processing hook
                });
        } else {
            console.error('❌ [PROCESSING-SCREEN] Retry failed - no reelUrl available');
        }
    };

    try {
        console.log('🎨 [PROCESSING-SCREEN] Rendering screen, state:', { 
            processing, 
            error: error ? `${error.code || 'NO_CODE'}: ${error.message || 'NO_MESSAGE'}` : 'null', 
            progress, 
            currentStep 
        });
        console.log('🎨 [PROCESSING-SCREEN] Error object details:', error ? {
            code: error.code,
            message: error.message,
            name: error.name,
            stack: error.stack,
            toString: error.toString(),
            keys: Object.keys(error)
        } : 'No error');
        
        return (
            <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
                <View style={styles.container}>
                    <View style={styles.headerWrapper}>
                        <PageHeader
                            title={strings.processing?.title || 'Video wordt verwerkt'}
                            subtitle={strings.processing?.subtitle || 'Even geduld...'}
                        />
                    </View>
                    
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <StepIndicator steps={PROCESSING_STEPS} currentStep={2} />

                        {displayError ? (
                            <>
                                {console.log('🎨 [PROCESSING-SCREEN] Rendering error display for:', displayError)}
                                <ErrorDisplay
                                    error={displayError}
                                    onRetry={handleRetry}
                                    onCancel={handleCancel}
                                />
                            </>
                        ) : (
                            <>
                                {console.log('🎨 [PROCESSING-SCREEN] Rendering processing status')}
                                <ProcessingStatus progress={progress} currentStep={currentStep} />
                            </>
                        )}

                        {!error && processing && (
                            <View style={styles.cancelContainer}>
                                <Button
                                    title="Annuleren"
                                    onPress={handleCancel}
                                    variant="secondary"
                                    size="medium"
                                />
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    } catch (renderError) {
        console.error('💥 [PROCESSING-SCREEN] Render error:', renderError);
        console.error('💥 [PROCESSING-SCREEN] Render error details:', {
            message: renderError?.message,
            stack: renderError?.stack,
            name: renderError?.name,
            toString: renderError?.toString()
        });
        console.error('💥 [PROCESSING-SCREEN] Render error type:', typeof renderError);
        console.error('💥 [PROCESSING-SCREEN] Render error keys:', Object.keys(renderError || {}));
        
        // Fallback UI to prevent blank page
        return (
            <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
                <View style={styles.container}>
                    <View style={styles.headerWrapper}>
                        <PageHeader
                            title="Fout"
                            subtitle="Er is een fout opgetreden bij het weergeven van dit scherm"
                        />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.errorText}>Probeer de app opnieuw te starten.</Text>
                        <Button
                            title="Terug"
                            onPress={() => navigation.goBack()}
                            variant="primary"
                            size="medium"
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }
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
        padding: layout.spacing.lg,
        paddingBottom: 120,
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: layout.spacing.xl,
    },
    fallbackText: {
        ...typography.body,
        color: colors.text,
        textAlign: 'center',
        marginBottom: layout.spacing.xl,
    },
    cancelContainer: {
        marginTop: layout.spacing.xl,
        alignItems: 'center',
    },
});
