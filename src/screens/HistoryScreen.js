/**
 * History Screen - Liquid Glass Design
 * Displays saved transcription results and caption editor projects.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../components/common/PageHeader';
import { loadResultsHistory } from '../utils/storage';
import { strings } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

export function HistoryScreen({ isFocused, navigation }) {
    const [items, setItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = React.useCallback(async () => {
        try {
            const history = await loadResultsHistory();
            setItems(history || []);
        } catch (error) {
            console.error('HistoryScreen: Error loading history:', error);
            setItems([]);
        }
    }, []);

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

        if (item.type === 'caption_editor') {
            navigation.navigate('CaptionEditorWorkspace', {
                videoUri: item.videoUrl,
                originalVideoUrl: item.originalVideoUrl,
                videoName: item.videoName || 'Caption editor',
                title: item.videoName || 'Caption editor',
                videoId: item.videoId,
                returnTo: 'History',
            });
            return;
        }

        navigation.navigate('TranscriptionResults', {
            results: item,
            videoName: item.videoName || 'Historical Result',
        });
    };

    const renderItem = ({ item }) => {
        const isCaptionProject = item.type === 'caption_editor';
        const title = isCaptionProject
            ? `Caption editor: ${item.videoName || item.originalVideoUrl || 'Video'}`
            : item.translatedText?.slice(0, 80) || strings.history.transcriptionResult;
        const meta = isCaptionProject
            ? `${item.captionCount || 0} captions`
            : item.originalUrl ? item.originalUrl.replace(/(^https?:\/\/)|(\/.+$)/g, '') : '';

        return (
            <TouchableOpacity style={styles.card} onPress={() => openItem(item)} activeOpacity={0.7}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, isCaptionProject && styles.captionIconContainer]}>
                        <Ionicons
                            name={isCaptionProject ? 'text' : 'document-text'}
                            size={20}
                            color={isCaptionProject ? colors.accent : colors.primary}
                        />
                    </View>
                    <View style={styles.cardHeaderText}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                        <Text style={styles.cardMeta}>
                            {new Date(item.timestamp).toLocaleString()} - {meta}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>

                {isCaptionProject && (
                    <View style={styles.duaSection}>
                        <Ionicons name="create" size={16} color={colors.accent} />
                        <Text style={styles.duaText} numberOfLines={2}>
                            Saved caption editor project. Opens with your captions and style settings.
                        </Text>
                    </View>
                )}

                {!isCaptionProject && item.arabicTranscript && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>{strings.history.arabicText}</Text>
                        <Text style={styles.arabicText} numberOfLines={3}>{item.arabicTranscript}</Text>
                    </View>
                )}

                {!isCaptionProject && item.translatedText && (
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

                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ ...styles.listContent, paddingBottom: 120 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="albums-outline" size={64} color={colors.textTertiary} />
                            <Text style={styles.emptyText}>{strings.history.empty}</Text>
                            <Text style={styles.emptySubtext}>{strings.history.emptyDesc}</Text>
                        </View>
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
    duaSection: {
        flexDirection: 'row',
        marginTop: layout.spacing.md,
        paddingTop: layout.spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'flex-start',
    },
    duaText: {
        ...typography.bodySmall,
        color: colors.accent,
        marginLeft: layout.spacing.sm,
        flex: 1,
        fontStyle: 'italic',
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
});
