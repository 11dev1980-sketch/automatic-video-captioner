/**
 * History Screen - Liquid Glass Design
 * Displays saved transcription results and caption editor projects.
 * Enhanced to include full caption history with restoration capability from Google Drive.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../components/common/PageHeader';
import { loadResultsHistory, saveResultsHistory } from '../utils/storage';
import { strings } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

export function HistoryScreen({ isFocused, navigation }) {
    const [items, setItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadHistory = React.useCallback(async () => {
        try {
            setLoading(true);
            const localHistory = await loadResultsHistory();
            
            // Try to load from Google Drive API if available
            try {
                const googleDriveHistory = await fetchFromGoogleDrive();
                const combinedHistory = [...localHistory, ...googleDriveHistory];
                // Remove duplicates based on ID
                const uniqueHistory = combinedHistory.filter((item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id)
                );
                setItems(uniqueHistory);
            } catch (driveError) {
                console.log('HistoryScreen: Google Drive not available, using local only:', driveError.message);
                setItems(localHistory || []);
            }
        } catch (error) {
            console.error('HistoryScreen: Error loading history:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFromGoogleDrive = async () => {
        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/drive/history`);
            if (response.ok) {
                const data = await response.json();
                return data.history || [];
            }
            return [];
        } catch (error) {
            console.log('HistoryScreen: Google Drive not available, using local only:', error.message);
            return [];
        }
    };

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    useEffect(() => {
        if (isFocused) loadHistory();
    }, [isFocused, loadHistory]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    }, [loadHistory]);

    const openItem = (item) => {
        if (!navigation) return;

        if (item.type === 'caption_editor' || item.type === 'captioned_video') {
            // Restore full caption editor state
            navigation.navigate('CaptionEditorWorkspace', {
                videoUri: item.videoUrl,
                originalVideoUrl: item.originalVideoUrl,
                videoName: item.videoName || 'Caption editor',
                title: item.videoName || 'Caption editor',
                videoId: item.videoId,
                returnTo: 'History',
                // Restore caption data
                captionData: item.captionData,
                captionStyle: item.captionStyle,
                processedResults: item.processedResults,
            });
            return;
        }

        navigation.navigate('TranscriptionResults', {
            results: item,
            videoName: item.videoName || 'Historical Result',
        });
    };

    const deleteItem = (item) => {
        Alert.alert(
            strings.history.deleteConfirm,
            strings.history.deleteConfirmDesc,
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
                            // Try to delete from Google Drive if it's a Drive item
                            if (item.driveFileId) {
                                try {
                                    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
                                    await fetch(`${apiUrl}/api/drive/delete/${item.driveFileId}`, {
                                        method: 'DELETE',
                                    });
                                } catch (driveError) {
                                    console.error('Failed to delete from Drive:', driveError);
                                }
                            }
                            
                            // Delete from local storage
                            const updatedHistory = items.filter(i => i.id !== item.id);
                            await saveResultsHistory(updatedHistory);
                            setItems(updatedHistory);
                        } catch (error) {
                            console.error('HistoryScreen: Error deleting item:', error);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isCaptionProject = item.type === 'caption_editor';
        const isCaptionedVideo = item.type === 'captioned_video';
        
        let title, meta, icon;
        
        if (isCaptionProject) {
            title = `Caption editor: ${item.videoName || item.originalVideoUrl || 'Video'}`;
            meta = `${item.captionCount || 0} captions`;
            icon = 'text';
        } else if (isCaptionedVideo) {
            title = item.videoName || 'Captioned Video';
            meta = `${item.captionCount || 0} captions • ${item.totalDuration || 0}s`;
            icon = 'videocam';
        } else {
            title = item.translatedText?.slice(0, 80) || strings.history.transcriptionResult;
            meta = item.originalUrl ? item.originalUrl.replace(/(^https?:\/\/)|(\/.+$)/g, '') : '';
            icon = 'document-text';
        }

        return (
            <TouchableOpacity style={styles.card} onPress={() => openItem(item)} activeOpacity={0.7}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, (isCaptionProject || isCaptionedVideo) && styles.captionIconContainer]}>
                        <Ionicons
                            name={icon}
                            size={20}
                            color={(isCaptionProject || isCaptionedVideo) ? colors.accent : colors.primary}
                        />
                    </View>
                    <View style={styles.cardHeaderText}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                        <Text style={styles.cardMeta}>
                            {new Date(item.timestamp).toLocaleString()} - {meta}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => deleteItem(item)}
                        style={styles.deleteButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="trash-outline" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                {isCaptionProject && (
                    <View style={styles.captionSection}>
                        <Ionicons name="create" size={16} color={colors.accent} />
                        <Text style={styles.captionText} numberOfLines={2}>
                            Saved caption editor project. Opens with your captions and style settings.
                        </Text>
                    </View>
                )}

                {isCaptionedVideo && (
                    <View style={styles.captionSection}>
                        <Ionicons name="videocam" size={16} color={colors.accent} />
                        <Text style={styles.captionText} numberOfLines={2}>
                            Captioned video with timestamps and custom styling.
                        </Text>
                    </View>
                )}

                {!isCaptionProject && !isCaptionedVideo && item.arabicTranscript && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>{strings.history.arabicText}</Text>
                        <Text style={styles.arabicText} numberOfLines={3}>{item.arabicTranscript}</Text>
                    </View>
                )}

                {!isCaptionProject && !isCaptionedVideo && item.translatedText && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>{strings.history.translation}</Text>
                        <Text style={styles.bodyText} numberOfLines={3}>{item.translatedText}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader title={strings.history.title} subtitle={strings.history.subtitle} />
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>History laden...</Text>
                    </View>
                )}

                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ ...styles.listContent, paddingBottom: 120 }}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="albums-outline" size={64} color={colors.textTertiary} />
                                <Text style={styles.emptyText}>{strings.history.empty}</Text>
                                <Text style={styles.emptySubtext}>{strings.history.emptyDesc}</Text>
                            </View>
                        ) : null
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                />
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
        minHeight: 120,
    },
    listContent: {
        paddingHorizontal: layout.spacing.lg,
        paddingTop: layout.spacing.lg,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.xl,
        padding: layout.spacing.lg,
        marginBottom: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: layout.spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: layout.radius.md,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    captionIconContainer: {
        backgroundColor: colors.accent + '15',
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
        marginBottom: layout.spacing.xs,
    },
    cardMeta: {
        ...typography.caption,
        color: colors.textTertiary,
    },
    section: {
        marginTop: layout.spacing.md,
        paddingTop: layout.spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    sectionLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
        marginBottom: layout.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    arabicText: {
        ...typography.arabic,
        fontSize: 16,
        lineHeight: 24,
    },
    bodyText: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    captionSection: {
        flexDirection: 'row',
        marginTop: layout.spacing.md,
        paddingTop: layout.spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'flex-start',
    },
    captionText: {
        ...typography.bodySmall,
        color: colors.accent,
        marginLeft: layout.spacing.sm,
        flex: 1,
        fontStyle: 'italic',
    },
    deleteButton: {
        padding: layout.spacing.xs,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: layout.spacing.xxl * 2,
        paddingHorizontal: layout.spacing.xl,
    },
    emptyText: {
        ...typography.h3,
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.xs,
        color: colors.textSecondary,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: layout.spacing.xxl * 2,
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: layout.spacing.md,
    },
});
