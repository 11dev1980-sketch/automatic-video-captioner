/**
 * useProcessing Hook
 * Manages video processing state and workflow
 */

import { useState, useCallback } from 'react';
import { preprocessArabicText } from '../utils/textProcessor';
import { PROCESSING_STEPS } from '../utils/constants';
import { saveResultToHistory } from '../utils/storage';
import { transcribeReel } from '../services/supadataService';
import { mapError, formatErrorMessage } from '../utils/errorCodes';
import { postToInstagram } from '../services/instagramService';

// Lightweight ID generator (avoids adding a new dependency)
const makeId = () => `res_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

const MAX_RETRIES = 10;
const RETRY_DELAY = 3000; // 3 seconds

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function useProcessing() {
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [cancelled, setCancelled] = useState(false);

    /**
     * Updates processing progress
     */
    const updateProgress = useCallback((progressValue, stepMessage) => {
        setProgress(progressValue);
        setCurrentStep(stepMessage);
    }, []);

    /**
     * Fetch with retry logic for 503 errors
     */
    const fetchWithRetry = useCallback(async (url, options, retryCount = 0) => {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorData = await response.json();
                
                // If 503 error and we have retries left, retry
                if (response.status === 503 && retryCount < MAX_RETRIES) {
                    console.log(`API returned 503, retrying in ${RETRY_DELAY/1000}s... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
                    updateProgress(
                        PROCESSING_STEPS.TRANSCRIBING.progress,
                        `AI service bezig. Opnieuw proberen... (${retryCount + 1}/${MAX_RETRIES})`
                    );
                    await sleep(RETRY_DELAY);
                    return fetchWithRetry(url, options, retryCount + 1);
                }
                
                throw new Error(errorData.error || 'Request failed');
            }
            
            return response;
        } catch (err) {
            // If network error and we have retries left, retry
            if (retryCount < MAX_RETRIES && err.message.includes('fetch')) {
                console.log(`Network error, retrying in ${RETRY_DELAY/1000}s... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
                updateProgress(
                    PROCESSING_STEPS.TRANSCRIBING.progress,
                    `Netwerkfout. Opnieuw proberen... (${retryCount + 1}/${MAX_RETRIES})`
                );
                await sleep(RETRY_DELAY);
                return fetchWithRetry(url, options, retryCount + 1);
            }
            throw err;
        }
    }, [updateProgress]);

    /**
     * Processes a video file through the complete pipeline
     */
    const processVideo = useCallback(async (reelUrl, targetLanguage = 'dutch', sourceLanguage = 'auto', instagramEnabled = false, instagramPostConfig = null) => {
        try {
            setProcessing(true);
            setProgress(0);
            setError(null);
            setResults(null);
            setCancelled(false);

            // Step 1: Transcribe and process via Supadata API
            updateProgress(
                PROCESSING_STEPS.TRANSCRIBING.progress,
                PROCESSING_STEPS.TRANSCRIBING.message
            );

            const transcriptionResult = await transcribeReel(reelUrl, targetLanguage, sourceLanguage);
            const data = {
                arabicTranscript: transcriptionResult.text,
                segments: transcriptionResult.segments,
                providers: {
                    transcription: 'supadata'
                },
                // Include full response and AI response for processing
                text: transcriptionResult.fullResponse?.text || null,
                aiResponse: transcriptionResult.aiResponse || null
            };

            if (cancelled) {
                setProcessing(false);
                return null;
            }

            // Step 2: Preprocess Arabic text
            updateProgress(
                PROCESSING_STEPS.PREPROCESSING.progress,
                PROCESSING_STEPS.PREPROCESSING.message
            );
            const arabicText = preprocessArabicText(data.arabicTranscript || transcriptionResult.text);

            if (cancelled) {
                setProcessing(false);
                return null;
            }

            // Step 3: Parse AI response (translation only)
            updateProgress(
                PROCESSING_STEPS.TRANSLATING.progress,
                PROCESSING_STEPS.TRANSLATING.message
            );

            let translatedText = '';

            // Parse AI response - just get the translation
            const rawAiResponse = data.text?.translationAndDuas || data.aiResponse;
            if (rawAiResponse) {
                console.log('AI response available, using translation...');
                translatedText = rawAiResponse.trim();

                if (!translatedText || translatedText.length < 5) {
                    throw new Error('Translation could not be generated. Please try again.');
                }

                console.log('Parsed Translation:', translatedText.substring(0, 50) + '...');
            } else {
                console.log('No AI processing available in response - using raw transcription as fallback');
                // Use the original transcript as-is if translation is not available
                translatedText = arabicText;
                // Set a flag to indicate this is a fallback
                data.isFallbackTranslation = true;
            }

            if (cancelled) {
                setProcessing(false);
                return null;
            }

            // Complete
            updateProgress(
                PROCESSING_STEPS.COMPLETE.progress,
                PROCESSING_STEPS.COMPLETE.message
            );

            const finalResults = {
                id: makeId(),
                timestamp: new Date().toISOString(),
                model: data.providers?.transcription || 'supadata',
                originalUrl: reelUrl,
                originalVideoUrl: reelUrl,
                videoUrl: reelUrl,
                arabicTranscript: arabicText,
                translatedText: translatedText,
                targetLanguage: targetLanguage,
                sourceLanguage: sourceLanguage,
                segments: transcriptionResult.segments || [],
                isFallbackTranslation: data.isFallbackTranslation || false,
            };

            setResults(finalResults);
            // Save to history (best effort; non-blocking)
            saveResultToHistory(finalResults);

            // Upload to Instagram if enabled
            if (instagramEnabled && instagramPostConfig && reelUrl) {
                updateProgress(95, 'Uploading to Instagram...');
                try {
                    const instagramResult = await postToInstagram(reelUrl, instagramPostConfig);
                    if (instagramResult.success) {
                        console.log('Instagram upload successful:', instagramResult);
                        finalResults.instagramPostId = instagramResult.postId;
                    } else {
                        console.error('Instagram upload failed:', instagramResult.error);
                        // Don't fail the entire process if Instagram upload fails
                    }
                } catch (error) {
                    console.error('Instagram upload error:', error);
                    // Don't fail the entire process if Instagram upload fails
                }
            }

            setProcessing(false);
            return finalResults;
        } catch (err) {
            console.error('🔍 [USE-PROCESSING] Caught error in processVideo:', err);
            console.error('🔍 [USE-PROCESSING] Error details:', {
                message: err?.message,
                stack: err?.stack,
                name: err?.name,
                toString: err?.toString(),
                code: err?.code,
                status: err?.status,
                statusText: err?.statusText
            });
            console.error('🔍 [USE-PROCESSING] Error type:', typeof err);
            console.error('🔍 [USE-PROCESSING] Error keys:', Object.keys(err || {}));
            
            const errorInfo = mapError(err);
            console.error('🔍 [USE-PROCESSING] Mapped error info:', errorInfo);
            
            const errorMessage = formatErrorMessage(errorInfo);
            console.error('🔍 [USE-PROCESSING] Formatted error message:', errorMessage);
            console.error('🔍 [USE-PROCESSING] Error code:', errorInfo?.code);
            console.error('🔍 [USE-PROCESSING] Is this error 9001?', errorInfo?.code === 9001);
            
            setError(errorMessage);
            setProcessing(false);
            throw err;
        }
    }, [cancelled, updateProgress, fetchWithRetry]);

    /**
     * Cancels ongoing processing
     */
    const cancelProcessing = useCallback(() => {
        setCancelled(true);
        setProcessing(false);
        setProgress(0);
        setCurrentStep('');
    }, []);

    /**
     * Resets processing state
     */
    const reset = useCallback(() => {
        setProcessing(false);
        setProgress(0);
        setCurrentStep('');
        setError(null);
        setResults(null);
        setCancelled(false);
    }, []);

    return {
        processing,
        progress,
        currentStep,
        error,
        results,
        processVideo,
        cancelProcessing,
        reset,
    };
}
