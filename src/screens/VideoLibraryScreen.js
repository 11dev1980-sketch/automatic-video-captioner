/**
 * Video Library Screen - Liquid Glass Design
 * Displays all imported videos in a browsable grid/list interface
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../components/common/PageHeader';
import { VideoCard } from '../components/library/VideoCard';
import { VideoCardShimmer } from '../components/common/ShimmerLoader';
import { getAllVideos, deleteVideo } from '../services/videoStorageService';
import { pickMultipleVideos, extractVideoMetadata } from '../services/videoPickerService';
import { generateVideoId, getFileFormat } from '../utils/videoUtils';
import { strings, formatString } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

export function VideoLibraryScreen({ navigation }) {
    console.log('📚 VideoLibraryScreen: Component starting to render');
    console.log('📍 VideoLibraryScreen: Navigation prop:', navigation ? 'present' : 'missing');
    
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedVideos, setSelectedVideos] = useState([]);

    // Load videos on mount
    useEffect(() => {
        console.log('📍 VideoLibraryScreen: Initial useEffect running');
        loadVideos();
    }, []);

    /**
     * Load videos from storage
     */
    const loadVideos = async () => {
        console.log('📍 VideoLibraryScreen: loadVideos called');
        try {
            setError(null);
            const loadedVideos = await getAllVideos();
            console.log('📍 VideoLibraryScreen: Videos loaded:', loadedVideos);
            console.log('📍 VideoLibraryScreen: Videos type:', typeof loadedVideos);
            console.log('📍 VideoLibraryScreen: Videos isArray:', Array.isArray(loadedVideos));
            setVideos(loadedVideos);
        } catch (err) {
            setError(err.message || 'Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle pull-to-refresh
     */
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadVideos();
        setRefreshing(false);
    };

    /**
     * Handle video import
     */
    const handleImportVideos = async () => {
        try {
            setError(null);
            
            // Pick videos from device
            const selectedFiles = await pickMultipleVideos();
            
            if (selectedFiles.length === 0) {
                return; // User cancelled
            }

            // Show loading state
            setLoading(true);

            // Process each selected video
            const newVideos = [];
            const errors = [];

            for (const file of selectedFiles) {
                try {
                    // Extract metadata (this won't throw, returns defaults on error)
                    const metadata = await extractVideoMetadata(file.uri);
                    
                    // Create video object
                    const video = {
                        id: generateVideoId(),
                        uri: file.uri,
                        filename: file.name,
                        duration: metadata.duration || 0,
                        thumbnailUri: metadata.thumbnailUri || file.uri,
                        dateAdded: Date.now(),
                        size: file.size || metadata.size || 0,
                        format: getFileFormat(file.name),
                    };

                    // Save to storage
                    const { saveVideo } = require('../services/videoStorageService');
                    await saveVideo(video);
                    
                    newVideos.push(video);
                } catch (err) {
                    errors.push(file.name);
                }
            }

            // Reload videos
            await loadVideos();

            // Show success/error messages
            if (newVideos.length > 0) {
                const message = newVideos.length === 1 
                    ? formatString(strings.library.importSuccess, newVideos.length)
                    : formatString(strings.library.importSuccessPlural, newVideos.length);
                Alert.alert(
                    strings.common.success,
                    message,
                    [{ text: strings.common.ok }]
                );
            }

            if (errors.length > 0) {
                const message = errors.length === 1
                    ? formatString(strings.library.importErrorsDesc, errors.length) + `: ${errors.join(', ')}`
                    : formatString(strings.library.importErrorsDescPlural, errors.length) + `: ${errors.join(', ')}`;
                Alert.alert(
                    strings.library.importErrors,
                    message,
                    [{ text: strings.common.ok }]
                );
            }
        } catch (err) {
            // Handle specific error types
            if (err.message.includes('Permission')) {
                Alert.alert(
                    strings.library.permissionRequired,
                    strings.library.permissionRequiredDesc,
                    [{ text: strings.common.ok }]
                );
            } else if (err.message.includes('Unsupported')) {
                Alert.alert(
                    strings.library.unsupportedFormat,
                    strings.library.unsupportedFormatDesc,
                    [{ text: strings.common.ok }]
                );
            } else {
                Alert.alert(
                    strings.library.importFailed,
                    err.message || strings.errors.uploadFailed,
                    [{ text: strings.common.ok }]
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle video selection - navigate to player
     */
    const handleVideoSelect = (videoId) => {
        const video = videos.find(v => v.id === videoId);
        if (video) {
            // For local videos, navigate to caption editor directly
            if (video.uri && (video.uri.startsWith('file://') || video.uri.startsWith('content://') || video.uri.startsWith('blob:'))) {
                navigation.navigate('CaptionEditor', {
                    reelUrl: video.uri,
                    fromLibrary: true,
                    videoId: video.id,
                });
            } else {
                // For other videos, navigate to player
                navigation.navigate('VideoPlayer', {
                    videoId: video.id,
                    videoUri: video.uri,
                    videoName: video.filename,
                    duration: video.duration,
                });
            }
        }
    };

    /**
     * Handle view transcription results
     */
    const handleViewTranscription = (videoId) => {
        const video = videos.find(v => v.id === videoId);
        if (video && video.transcriptionResults) {
            navigation.navigate('TranscriptionResults', {
                results: video.transcriptionResults,
                videoName: video.filename,
            });
        }
    };

    /**
     * Toggle selection mode
     */
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedVideos([]);
    };

    /**
     * Toggle video selection
     */
    const toggleVideoSelection = (videoId) => {
        setSelectedVideos(prev => {
            if (prev.includes(videoId)) {
                return prev.filter(id => id !== videoId);
            } else {
                return [...prev, videoId];
            }
        });
    };

    /**
     * Handle long press - enter selection mode and select video
     */
    const handleLongPress = (videoId) => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedVideos([videoId]);
        }
    };

    /**
     * Handle individual video delete
     */
    const handleIndividualDelete = (videoId) => {
        const video = videos.find(v => v.id === videoId);
        if (!video) return;

        Alert.alert(
            strings.library.deleteConfirm,
            formatString(strings.library.deleteConfirmDesc, video.filename),
            [
                {
                    text: strings.common.cancel,
                    style: 'cancel',
                },
                {
                    text: strings.common.delete,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteVideo(videoId);
                            
                            // Update local state
                            setVideos(prevVideos =>
                                prevVideos.filter(v => v.id !== videoId)
                            );

                            Alert.alert(strings.common.success, strings.library.deleted, [{ text: strings.common.ok }]);
                        } catch (err) {
                            Alert.alert(
                                strings.library.deleteFailed,
                                err.message || strings.library.deleteFailedDesc,
                                [{ text: strings.common.ok }]
                            );
                        }
                    },
                },
            ]
        );
    };

    /**
     * Delete selected videos
     */
    const handleDeleteSelected = async () => {
        if (selectedVideos.length === 0) return;

        const count = selectedVideos.length;
        const message = count === 1
            ? strings.library.deleteConfirm
            : formatString(strings.library.deleteConfirmDesc, `${count} video's`);

        Alert.alert(
            strings.library.deleteConfirm,
            message,
            [
                {
                    text: strings.common.cancel,
                    style: 'cancel',
                },
                {
                    text: strings.common.delete,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete all selected videos
                            for (const videoId of selectedVideos) {
                                await deleteVideo(videoId);
                            }

                            // Update local state
                            setVideos(prevVideos =>
                                prevVideos.filter(v => !selectedVideos.includes(v.id))
                            );

                            // Exit selection mode
                            setIsSelectionMode(false);
                            setSelectedVideos([]);

                            // Show success message
                            const successMsg = count === 1
                                ? strings.library.deleted
                                : formatString(strings.library.deleted, `${count} video's`);
                            Alert.alert(strings.common.success, successMsg, [{ text: strings.common.ok }]);
                        } catch (err) {
                            Alert.alert(
                                strings.library.deleteFailed,
                                err.message || strings.library.deleteFailedDesc,
                                [{ text: strings.common.ok }]
                            );
                        }
                    },
                },
            ]
        );
    };

    /**
     * Select all videos
     */
    const handleSelectAll = () => {
        if (selectedVideos.length === videos.length) {
            setSelectedVideos([]);
        } else {
            setSelectedVideos(videos.map(v => v.id));
        }
    };

    /**
     * Render empty state
     */
    const renderEmptyState = () => {
        if (loading) {
            return null;
        }

        return (
            <View style={styles.emptyState}>
                <Ionicons name="videocam-outline" size={80} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>{strings.library.empty}</Text>
                <Text style={styles.emptyDescription}>
                    {strings.library.emptyDesc}
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleImportVideos}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                    <Text style={styles.emptyButtonText}>{strings.library.import}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render header
     */
    const renderHeader = () => {
        const subtitle = videos.length === 1 
            ? formatString(strings.library.subtitle, videos.length)
            : formatString(strings.library.subtitlePlural, videos.length);
        
        if (isSelectionMode) {
            return (
                <View style={styles.selectionHeader}>
                    <TouchableOpacity onPress={toggleSelectionMode} style={styles.cancelButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.selectionTitle}>
                        {selectedVideos.length} {strings.library.selected}
                    </Text>
                    <View style={styles.selectionActions}>
                        <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
                            <Text style={styles.selectAllText}>
                                {selectedVideos.length === videos.length ? strings.library.deselectAll : strings.library.selectAll}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDeleteSelected}
                            style={[styles.deleteButton, selectedVideos.length === 0 && styles.deleteButtonDisabled]}
                            disabled={selectedVideos.length === 0}
                        >
                            <Ionicons name="trash-outline" size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        
        return (
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{strings.library.title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
                <View style={styles.headerActions}>
                    {videos.length > 0 && (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={toggleSelectionMode}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleImportVideos}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add-circle" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /**
     * Render video item
     */
    const renderVideoItem = ({ item }) => (
        <VideoCard
            video={item}
            onPress={handleVideoSelect}
            onLongPress={handleLongPress}
            onDelete={handleIndividualDelete}
            onViewTranscription={handleViewTranscription}
            isSelectionMode={isSelectionMode}
            isSelected={selectedVideos.includes(item.id)}
            onToggleSelect={toggleVideoSelection}
        />
    );

    return (
        <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
            <View style={globalStyles.container}>
                {/* Header */}
                {renderHeader()}

                {/* Error Message */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color={colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Loading Indicator with Shimmer */}
                {loading && !refreshing && (
                    <View style={styles.shimmerContainer}>
                        <View style={styles.shimmerRow}>
                            <VideoCardShimmer />
                            <VideoCardShimmer />
                            <VideoCardShimmer />
                        </View>
                        <View style={styles.shimmerRow}>
                            <VideoCardShimmer />
                            <VideoCardShimmer />
                            <VideoCardShimmer />
                        </View>
                    </View>
                )}

                {/* Video Grid */}
                {!loading && (
                    <FlatList
                        data={videos}
                        renderItem={renderVideoItem}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={colors.primary}
                                colors={[colors.primary]}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: layout.spacing.lg,
        paddingTop: layout.spacing.lg,
        paddingBottom: layout.spacing.lg,
        backgroundColor: colors.background,
        minHeight: 120, // Fixed height to match PageHeader
    },
    headerText: {
        flex: 1,
        minHeight: 60, // Fixed height for text area
        justifyContent: 'center',
    },
    title: {
        ...typography.h2,
        marginBottom: layout.spacing.xs,
        lineHeight: 32,
    },
    subtitle: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        minHeight: 20, // Fixed height for subtitle
        lineHeight: 20,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error + '20',
        marginHorizontal: layout.spacing.lg,
        marginTop: layout.spacing.md,
        padding: layout.spacing.md,
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.error,
    },
    errorText: {
        ...typography.bodySmall,
        color: colors.error,
        marginLeft: layout.spacing.sm,
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: layout.spacing.md,
    },
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.spacing.lg,
        paddingTop: layout.spacing.lg,
        paddingBottom: layout.spacing.lg,
        backgroundColor: colors.background,
        minHeight: 120, // Fixed height to match other headers
    },
    cancelButton: {
        padding: layout.spacing.xs,
    },
    selectionTitle: {
        ...typography.h3,
        flex: 1,
        textAlign: 'center',
    },
    selectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
    },
    selectAllButton: {
        paddingHorizontal: layout.spacing.md,
        paddingVertical: layout.spacing.sm,
    },
    selectAllText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonDisabled: {
        opacity: 0.5,
    },
    listContent: {
        padding: layout.spacing.sm,
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'flex-start',
        paddingHorizontal: layout.spacing.xs,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl * 2,
    },
    emptyTitle: {
        ...typography.h3,
        marginTop: layout.spacing.md,
        marginBottom: layout.spacing.sm,
    },
    emptyDescription: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: layout.spacing.lg,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: layout.spacing.lg,
        paddingVertical: layout.spacing.md,
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyButtonText: {
        ...typography.body,
        fontWeight: '600',
        color: colors.primary,
        marginLeft: layout.spacing.sm,
    },
    shimmerContainer: {
        padding: layout.spacing.sm,
    },
    shimmerRow: {
        flexDirection: 'row',
        marginBottom: layout.spacing.sm,
    },
});
