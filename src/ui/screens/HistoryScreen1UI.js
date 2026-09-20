/**
 * History Screen 1 UI Component
 * SCREEN 1: History list screen - Main history screen with all transcription results
 * PURE UI COMPONENT - Contains only the UI elements for History Screen 1
 * Modify this file to change the visual appearance of the History Screen 1
 * 
 * AI-FRIENDLY: This entire file can be copied and pasted to AI tools like Claude
 * for UI improvements. The AI can return the complete improved script which
 * can replace this file directly.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

export function HistoryScreen1UI({
    // History state
    historyItems,
    isLoading,
    isRefreshing,
    selectedItems,
    isSelectionMode,
    
    // Callback functions
    onRefresh,
    onSelectItem,
    onSelectMultipleItems,
    onDeleteSelected,
    onShareSelected,
    onExportSelected,
    onToggleSelectionMode,
    onClearHistory,
    onFilterByPlatform,
    onFilterByDate,
    onSearch,
    
    // UI state
    activeTab,
    setActiveTab,
    processParams,
    setProcessParams,
    handleTabPress,
    transcriptionResultsParams,
    showTranscriptionResults,
    setShowTranscriptionResults,
    showApiKeyScreen,
    setShowApiKeyScreen,
    showInstagramConfig,
    setShowInstagramConfig,
    captionEditorWorkspaceParams,
    setCaptionEditorWorkspaceParams,
    downloadStackNavigator,
    libraryStackNavigator,
}) {
    /**
     * Render history item
     */
    const renderHistoryItem = (item) => {
        const isSelected = selectedItems.includes(item.id);
        
        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    styles.historyItem,
                    isSelected && styles.historyItemSelected
                ]}
                onPress={() => isSelectionMode ? onSelectMultipleItems(item.id) : onSelectItem(item)}
                onLongPress={() => {
                    if (!isSelectionMode) {
                        onToggleSelectionMode();
                        onSelectMultipleItems(item.id);
                    }
                }}
                activeOpacity={0.8}
            >
                <View style={styles.historyItemHeader}>
                    <View style={styles.historyItemLeft}>
                        <View style={styles.historyItemIcon}>
                            <Ionicons 
                                name={getPlatformIcon(item.platform)} 
                                size={20} 
                                color={colors.primary} 
                            />
                        </View>
                        <View style={styles.historyItemInfo}>
                            <Text style={styles.historyItemTitle} numberOfLines={1}>
                                {item.videoName || `Video - ${new Date(item.timestamp).toLocaleDateString()}`}
                            </Text>
                            <View style={styles.historyItemMeta}>
                                <Text style={styles.historyItemPlatform}>{item.platform || 'Web'}</Text>
                                <Text style={styles.historyItemDate}>
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.historyItemRight}>
                        <Text style={[
                            styles.historyItemStatus,
                            { color: getStatusColor(item.status) }
                        ]}>
                            {item.status || 'Voltooid'}
                        </Text>
                        {isSelectionMode && (
                            <View style={[
                                styles.selectionCheckbox,
                                isSelected && styles.selectionCheckboxSelected
                            ]}>
                                {isSelected && (
                                    <Ionicons name="checkmark" size={16} color={colors.white} />
                                )}
                            </View>
                        )}
                    </View>
                </View>
                
                <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemPreview} numberOfLines={2}>
                        {item.transcript ? item.transcript.substring(0, 100) + '...' : 'Geen transcript beschikbaar'}
                    </Text>
                </View>
                
                <View style={styles.historyItemFooter}>
                    <View style={styles.historyItemStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="time" size={14} color={colors.textTertiary} />
                            <Text style={styles.statText}>{item.duration || '0:00'}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="document-text" size={14} color={colors.textTertiary} />
                            <Text style={styles.statText}>{item.wordCount || '0'} woorden</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="language" size={14} color={colors.textTertiary} />
                            <Text style={styles.statText}>{item.language || 'AR'}</Text>
                        </View>
                    </View>
                    <View style={styles.historyItemActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => onSelectItem(item)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="eye" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => onShareSelected([item.id])}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="share" size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    /**
     * Render empty state
     */
    const renderEmptyState = () => {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
                </View>
                <Text style={styles.emptyTitle}>Geen Geschiedenis</Text>
                <Text style={styles.emptyDescription">
                    Je hebt nog geen transcripties gemaakt. Begin met transcriberen om hier resultaten te zien.
                </Text>
                <TouchableOpacity
                    style={styles.emptyActionButton}
                    onPress={() => {
                        // Navigate to home or upload screen
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-circle" size={20} color={colors.white} />
                    <Text style={styles.emptyActionText}>Start Transcriberen</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render selection mode header
     */
    const renderSelectionModeHeader = () => {
        if (!isSelectionMode) return null;
        
        return (
            <View style={styles.selectionHeader}>
                <Text style={styles.selectionTitle">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} geselecteerd
                </Text>
                <View style={styles.selectionActions}>
                    <TouchableOpacity
                        style={styles.selectionActionButton}
                        onPress={() => onShareSelected(selectedItems)}
                        disabled={selectedItems.length === 0}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="share" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.selectionActionButton}
                        onPress={() => onExportSelected(selectedItems)}
                        disabled={selectedItems.length === 0}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="download" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.selectionActionButton}
                        onPress={() => onDeleteSelected(selectedItems)}
                        disabled={selectedItems.length === 0}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.selectionActionButton}
                        onPress={onToggleSelectionMode}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /**
     * Render filter options
     */
    const renderFilterOptions = () => {
        return (
            <View style={styles.filterContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    <TouchableOpacity
                        style={styles.filterChip}
                        onPress={() => onFilterByPlatform('all')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.filterChipText}>Alle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterChip}
                        onPress={() => onFilterByPlatform('instagram')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.filterChipText}>Instagram</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterChip}
                        onPress={() => onFilterByPlatform('tiktok')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.filterChipText}>TikTok</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterChip}
                        onPress={() => onFilterByPlatform('youtube')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.filterChipText}>YouTube</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterChip}
                        onPress={() => onFilterByDate('today')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.filterChipText}>Vandaag</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterChip}
                        onPress={() => onFilterByDate('week')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.filterChipText}>Deze Week</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterChip}
                        onPress={() => onFilterByDate('month')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.filterChipText}>Deze Maand</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    };

    /**
     * Helper functions
     */
    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'instagram':
                return 'camera';
            case 'tiktok':
                return 'musical-notes';
            case 'youtube':
                return 'logo-youtube';
            default:
                return 'globe';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'voltooid':
            case 'completed':
                return colors.success;
            case 'verwerken':
            case 'processing':
                return colors.warning;
            case 'fout':
            case 'error':
                return colors.error;
            default:
                return colors.textSecondary;
        }
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Geschiedenis"
                        subtitle="Je transcriptie resultaten"
                    />
                </View>
                
                {/* Selection Mode Header */}
                {renderSelectionModeHeader()}
                
                {/* Filter Options */}
                {renderFilterOptions()}
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                >
                    <View style={styles.contentWrapper}>
                        {historyItems.length === 0 && !isLoading ? (
                            renderEmptyState()
                        ) : (
                            <View style={styles.historyList}>
                                {historyItems.map(renderHistoryItem)}
                            </View>
                        )}
                    </View>
                </ScrollView>
                
                {/* Clear History Button */}
                {historyItems.length > 0 && !isSelectionMode && (
                    <View style={styles.clearHistoryContainer}>
                        <TouchableOpacity
                            style={styles.clearHistoryButton}
                            onPress={() => {
                                Alert.alert(
                                    'Geschiedenis Wissen',
                                    'Weet je zeker dat je alle transcriptie geschiedenis wilt wissen? Deze actie kan niet ongedaan worden gemaakt.',
                                    [
                                        { text: 'Annuleren', style: 'cancel' },
                                        { text: 'Wissen', style: 'destructive', onPress: onClearHistory }
                                    ]
                                );
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="trash" size={16} color={colors.error} />
                            <Text style={styles.clearHistoryText}>Wis Geschiedenis</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeAreaOverride: {
        backgroundColor: colors.background,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: 'transparent',
    },
    headerWrapper: {
        minHeight: 120,
        backgroundColor: colors.background,
        borderBottomWidth: 0,
        borderColor: 'transparent',
        borderWidth: 0,
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 120,
        alignItems: 'center',
        minHeight: '100%',
    },
    contentWrapper: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: layout.spacing.lg,
        minHeight: '100%',
    },
    
    // Selection Mode Styles
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary + '10',
        paddingHorizontal: layout.spacing.lg,
        paddingVertical: layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary + '30',
    },
    selectionTitle: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '500',
    },
    selectionActions: {
        flexDirection: 'row',
        gap: layout.spacing.sm,
    },
    selectionActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    
    // Filter Styles
    filterContainer: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterScrollContent: {
        paddingHorizontal: layout.spacing.lg,
        paddingVertical: layout.spacing.md,
        gap: layout.spacing.sm,
    },
    filterChip: {
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: layout.spacing.md,
        paddingVertical: layout.spacing.sm,
        borderRadius: layout.radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    
    // History List Styles
    historyList: {
        width: '100%',
        gap: layout.spacing.md,
    },
    historyItem: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    historyItemSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: colors.primary + '5',
    },
    historyItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: layout.spacing.sm,
    },
    historyItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: layout.spacing.md,
    },
    historyItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    historyItemInfo: {
        flex: 1,
    },
    historyItemTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    historyItemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
    },
    historyItemPlatform: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        textTransform: 'uppercase',
    },
    historyItemDate: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
    historyItemRight: {
        alignItems: 'flex-end',
    },
    historyItemStatus: {
        ...typography.bodySmall,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    selectionCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionCheckboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    historyItemContent: {
        marginBottom: layout.spacing.sm,
    },
    historyItemPreview: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    historyItemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    historyItemStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.xs,
    },
    statText: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
    historyItemActions: {
        flexDirection: 'row',
        gap: layout.spacing.sm,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    
    // Empty State Styles
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: layout.spacing.xxl,
    },
    emptyIcon: {
        marginBottom: layout.spacing.lg,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.textSecondary,
        marginBottom: layout.spacing.md,
    },
    emptyDescription: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: layout.spacing.xl,
        paddingHorizontal: layout.spacing.xl,
    },
    emptyActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.lg,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
    },
    emptyActionText: {
        ...typography.button,
        color: colors.white,
    },
    
    // Clear History Styles
    clearHistoryContainer: {
        position: 'absolute',
        bottom: layout.spacing.lg,
        left: layout.spacing.lg,
        right: layout.spacing.lg,
    },
    clearHistoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error + '10',
        paddingVertical: layout.spacing.md,
        paddingHorizontal: layout.spacing.lg,
        borderRadius: layout.radius.lg,
        gap: layout.spacing.sm,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    clearHistoryText: {
        ...typography.button,
        color: colors.error,
    },
});
