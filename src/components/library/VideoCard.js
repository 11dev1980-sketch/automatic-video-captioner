/**
 * VideoCard Component - Liquid Glass Design
 * Displays individual video in library with thumbnail, metadata, and actions
 * Includes fade-in animations and lazy loading
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { formatDuration } from '../../utils/videoUtils';
import { lightHaptic } from '../../utils/haptics';

/**
 * VideoCard Component
 * @param {Object} props
 * @param {Object} props.video - Video metadata object
 * @param {string} props.video.id - Unique video identifier
 * @param {string} props.video.uri - Video file URI
 * @param {string} props.video.filename - Video filename
 * @param {number} props.video.duration - Video duration in seconds
 * @param {string} props.video.thumbnailUri - Thumbnail image URI
 * @param {boolean} props.video.error - Error state flag
 * @param {Object} props.video.transcriptionResults - Transcription results (optional)
 * @param {Function} props.onPress - Handler for video selection
 * @param {Function} props.onLongPress - Handler for long press (delete mode)
 * @param {Function} props.onDelete - Handler for individual delete
 * @param {Function} props.onViewTranscription - Handler for viewing transcription results
 * @param {boolean} props.isSelectionMode - Whether in selection mode
 * @param {boolean} props.isSelected - Whether this video is selected
 * @param {Function} props.onToggleSelect - Handler for selection toggle
 */
export function VideoCard({ video, onPress, onLongPress, onDelete, onViewTranscription, isSelectionMode, isSelected, onToggleSelect }) {
    const [showDeleteButton, setShowDeleteButton] = React.useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    
    const hasTranscription = video.transcriptionResults &&
        (video.transcriptionResults.arabicTranscript ||
         video.transcriptionResults.dutchTranslation ||
         video.transcriptionResults.translatedText);

    // Fade in animation on mount
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false, // Use JS driver for web compatibility
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: false, // Use JS driver for web compatibility
            }),
        ]).start();
    }, []);

    const handlePress = () => {
        lightHaptic();
        if (isSelectionMode) {
            // In selection mode, toggle selection
            onToggleSelect?.(video.id);
        } else if (!video.error && onPress) {
            // Normal mode, play video
            onPress(video.id);
        }
    };

    const handleTranscriptionPress = (e) => {
        lightHaptic();
        // Stop event propagation to prevent video from playing
        e?.stopPropagation?.();
        
        if (onViewTranscription && hasTranscription) {
            onViewTranscription(video.id);
        }
    };

    const handleLongPress = () => {
        lightHaptic();
        if (!video.error) {
            if (onLongPress) {
                onLongPress(video.id);
            }
            // Show delete button on long press
            setShowDeleteButton(true);
        }
    };

    const handleDelete = (e) => {
        lightHaptic();
        // Stop event propagation to prevent video from playing
        e?.stopPropagation?.();
        
        if (onDelete) {
            onDelete(video.id);
        }
    };

    const handleMouseEnter = () => {
        if (!isSelectionMode && !video.error) {
            setShowDeleteButton(true);
        }
    };

    const handleMouseLeave = () => {
        setShowDeleteButton(false);
    };

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[
                    styles.container, 
                    video.error && styles.containerError,
                    isSelected && styles.containerSelected
                ]}
                onPress={handlePress}
                onLongPress={handleLongPress}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                activeOpacity={video.error ? 1 : 0.7}
                disabled={video.error}
            >
                {/* Thumbnail Container */}
                <View style={styles.thumbnailContainer}>
                    {video.error ? (
                        <View style={styles.errorThumbnail}>
                            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
                        </View>
                    ) : (
                        <>
                            {/* Lazy loaded image */}
                            <Image
                                source={{ uri: video.thumbnailUri || video.uri }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                                onLoad={() => setImageLoaded(true)}
                                fadeDuration={200}
                            />
                            {!imageLoaded && (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="image-outline" size={24} color={colors.textTertiary} />
                                </View>
                            )}
                            {/* Play Icon Overlay */}
                            {!isSelectionMode && (
                                <View style={styles.playOverlay}>
                                    <Ionicons name="play-circle" size={36} color="rgba(255, 255, 255, 0.9)" />
                                </View>
                            )}
                        
                        {/* Selection Checkbox */}
                        {isSelectionMode && (
                            <View style={styles.selectionOverlay}>
                                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                    {isSelected && (
                                        <Ionicons name="checkmark" size={20} color={colors.white} />
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Individual Delete Button */}
                        {!isSelectionMode && showDeleteButton && onDelete && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.white} />
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* Duration Badge */}
                {!video.error && video.duration > 0 && !isSelectionMode && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                            {formatDuration(video.duration)}
                        </Text>
                    </View>
                )}

                {/* Transcription Badge */}
                {!video.error && hasTranscription && !isSelectionMode && (
                    <TouchableOpacity
                        style={styles.transcriptionBadge}
                        onPress={handleTranscriptionPress}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="document-text" size={16} color={colors.white} />
                    </TouchableOpacity>
                )}

                {/* Video Info Overlay */}
                {!isSelectionMode && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.filename} numberOfLines={2} ellipsizeMode="tail">
                            {video.filename}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 4,
        maxWidth: '31%', // 3 columns with spacing
        aspectRatio: 9 / 16, // Maintain video aspect ratio
    },
    containerError: {
        opacity: 0.6,
        borderColor: colors.error,
    },
    containerSelected: {
        opacity: 0.8,
    },
    thumbnailContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.backgroundTertiary,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    selectionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    checkbox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.white,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    errorThumbnail: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
    },
    durationBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    durationText: {
        fontSize: 10,
        color: colors.text,
        fontWeight: '600',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    filename: {
        fontSize: 10,
        color: colors.white,
        fontWeight: '500',
        lineHeight: 14,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    transcriptionBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});
