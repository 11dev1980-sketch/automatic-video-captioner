/**
 * Library Screen 1 UI Component
 * SCREEN 1: Library screen - Main library with saved transcripts and collections
 * PURE UI COMPONENT - Contains only the UI elements for Library Screen 1
 * Modify this file to change the visual appearance of the Library Screen 1
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
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';
import { globalStyles } from '../../styles/globalStyles';
import { PageHeader } from '../../components/common/PageHeader';

export function LibraryScreen1UI({
    // Library state
    libraryItems,
    collections,
    isLoading,
    isRefreshing,
    searchQuery,
    selectedCategory,
    selectedItems,
    isSelectionMode,
    
    // Callback functions
    onRefresh,
    onSearch,
    onSelectItem,
    onSelectMultipleItems,
    onDeleteSelected,
    onShareSelected,
    onExportSelected,
    onToggleSelectionMode,
    onCreateCollection,
    onEditCollection,
    onDeleteCollection,
    onFilterByCategory,
    onSortBy,
    
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
     * Render library item
     */
    const renderLibraryItem = (item) => {
        const isSelected = selectedItems.includes(item.id);
        
        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    styles.libraryItem,
                    isSelected && styles.libraryItemSelected
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
                <View style={styles.libraryItemHeader}>
                    <View style={styles.libraryItemLeft}>
                        <View style={styles.libraryItemIcon}>
                            <Ionicons 
                                name={getCategoryIcon(item.category)} 
                                size={20} 
                                color={colors.primary} 
                            />
                        </View>
                        <View style={styles.libraryItemInfo}>
                            <Text style={styles.libraryItemTitle} numberOfLines={1}>
                                {item.title || `Transcriptie - ${new Date(item.createdAt).toLocaleDateString()}`}
                            </Text>
                            <View style={styles.libraryItemMeta}>
                                <Text style={styles.libraryItemCategory}>{item.category || 'Algemeen'}</Text>
                                <Text style={styles.libraryItemDate}>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.libraryItemRight}>
                        {item.isFavorite && (
                            <Ionicons name="heart" size={16} color={colors.error} />
                        )}
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
                
                <View style={styles.libraryItemContent}>
                    <Text style={styles.libraryItemPreview} numberOfLines={2}>
                        {item.content ? item.content.substring(0, 100) + '...' : 'Geen inhoud beschikbaar'}
                    </Text>
                </View>
                
                <View style={styles.libraryItemFooter}>
                    <View style={styles.libraryItemStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="document-text" size={14} color={colors.textTertiary} />
                            <Text style={styles.statText}>{item.wordCount || '0'} woorden</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="language" size={14} color={colors.textTertiary} />
                            <Text style={styles.statText}>{item.language || 'AR'}</Text>
                        </View>
                        {item.duration && (
                            <View style={styles.statItem}>
                                <Ionicons name="time" size={14} color={colors.textTertiary} />
                                <Text style={styles.statText}>{item.duration}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.libraryItemActions}>
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
     * Render collection
     */
    const renderCollection = (collection) => {
        return (
            <TouchableOpacity
                key={collection.id}
                style={styles.collectionItem}
                onPress={() => onEditCollection(collection)}
                activeOpacity={0.8}
            >
                <View style={styles.collectionHeader}>
                    <View style={styles.collectionLeft}>
                        <View style={styles.collectionIcon}>
                            <Ionicons name="folder" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.collectionInfo}>
                            <Text style={styles.collectionTitle} numberOfLines={1}>
                                {collection.name}
                            </Text>
                            <Text style={styles.collectionCount}>
                                {collection.itemCount || 0} item{collection.itemCount !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.collectionMenu}
                        onPress={() => onEditCollection(collection)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="ellipsis-vertical" size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>
                
                {collection.description && (
                    <Text style={styles.collectionDescription} numberOfLines={2}>
                        {collection.description}
                    </Text>
                )}
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
                    <Ionicons name="library-outline" size={64} color={colors.textTertiary} />
                </View>
                <Text style={styles.emptyTitle}>Lege Bibliotheek</Text>
                <Text style={styles.emptyDescription}>
                    Je bibliotheek is leeg. Sla transcripties op om hier je collectie te bouwen.
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
     * Render search bar
     */
    const renderSearchBar = () => {
        return (
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={onSearch}
                        placeholder="Zoek in bibliotheek..."
                        placeholderTextColor={colors.textTertiary}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearSearch}
                            onPress={() => onSearch('')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    /**
     * Render category filter
     */
    const renderCategoryFilter = () => {
        const categories = ['Alle', 'Algemeen', 'Educatief', 'Religieus', 'Zakelijk', 'Persoonlijk'];
        
        return (
            <View style={styles.categoryContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category && styles.categoryChipSelected
                            ]}
                            onPress={() => onFilterByCategory(category)}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                selectedCategory === category && styles.categoryChipTextSelected
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
     * Render collections section
     */
    const renderCollectionsSection = () => {
        if (collections.length === 0) return null;
        
        return (
            <View style={styles.collectionsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Collecties</Text>
                    <TouchableOpacity
                        style={styles.createCollectionButton}
                        onPress={onCreateCollection}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.collectionsScrollContent}
                >
                    {collections.map(renderCollection)}
                </ScrollView>
            </View>
        );
    };

    /**
     * Helper functions
     */
    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'educatief':
                return 'school';
            case 'religieus':
                return 'heart';
            case 'zakelijk':
                return 'briefcase';
            case 'persoonlijk':
                return 'person';
            default:
                return 'document';
        }
    };

    return (
        <SafeAreaView style={[globalStyles.safeArea, styles.safeAreaOverride]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title="Bibliotheek"
                        subtitle="Je opgeslagen transcripties"
                    />
                </View>
                
                {/* Search Bar */}
                {renderSearchBar()}
                
                {/* Category Filter */}
                {renderCategoryFilter()}
                
                {/* Selection Mode Header */}
                {renderSelectionModeHeader()}
                
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
                        {/* Collections Section */}
                        {renderCollectionsSection()}
                        
                        {/* Library Items */}
                        {libraryItems.length === 0 && !isLoading ? (
                            renderEmptyState()
                        ) : (
                            <View style={styles.libraryList}>
                                {libraryItems.map(renderLibraryItem)}
                            </View>
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
    
    // Search Styles
    searchContainer: {
        paddingHorizontal: layout.spacing.lg,
        paddingVertical: layout.spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: layout.radius.lg,
        paddingHorizontal: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: layout.spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...typography.body,
        color: colors.text,
        paddingVertical: layout.spacing.sm,
    },
    clearSearch: {
        marginLeft: layout.spacing.sm,
    },
    
    // Category Filter Styles
    categoryContainer: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    categoryScrollContent: {
        paddingHorizontal: layout.spacing.lg,
        paddingVertical: layout.spacing.md,
        gap: layout.spacing.sm,
    },
    categoryChip: {
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: layout.spacing.md,
        paddingVertical: layout.spacing.sm,
        borderRadius: layout.radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryChipText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    categoryChipTextSelected: {
        color: colors.white,
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
    
    // Collections Styles
    collectionsSection: {
        width: '100%',
        marginBottom: layout.spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: layout.spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
    },
    createCollectionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    collectionsScrollContent: {
        gap: layout.spacing.md,
    },
    collectionItem: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 200,
        maxWidth: 250,
    },
    collectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: layout.spacing.sm,
    },
    collectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    collectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.sm,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    collectionCount: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
    collectionMenu: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    collectionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 16,
    },
    
    // Library List Styles
    libraryList: {
        width: '100%',
        gap: layout.spacing.md,
    },
    libraryItem: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    libraryItemSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: colors.primary + '5',
    },
    libraryItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: layout.spacing.sm,
    },
    libraryItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: layout.spacing.md,
    },
    libraryItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: layout.spacing.md,
    },
    libraryItemInfo: {
        flex: 1,
    },
    libraryItemTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
        marginBottom: layout.spacing.xs,
    },
    libraryItemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.spacing.sm,
    },
    libraryItemCategory: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        textTransform: 'uppercase',
    },
    libraryItemDate: {
        ...typography.bodySmall,
        color: colors.textTertiary,
    },
    libraryItemRight: {
        alignItems: 'flex-end',
        gap: layout.spacing.sm,
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
    libraryItemContent: {
        marginBottom: layout.spacing.sm,
    },
    libraryItemPreview: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    libraryItemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    libraryItemStats: {
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
    libraryItemActions: {
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
});
