/**
 * CaptionTimeline
 *
 * Virtualized, scrollable list of all captions with inline editing,
 * delete, split, merge, and timing adjustment controls.
 * Auto-scrolls to the currently active caption during playback.
 *
 * Requirements: 4.1-4.9, 10.2-10.5
 */

import React, { useCallback, useRef, useEffect, memo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ListRenderItemInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Caption_Object } from '../types/caption';
import { colors } from '../styles/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CaptionTimelineProps {
  captions: Caption_Object[];
  currentTime: number;
  onCaptionPress: (caption: Caption_Object, index: number) => void;
  onCaptionEdit: (id: string, text: string) => void;
  onCaptionDelete: (id: string) => void;
  onCaptionSplit: (id: string) => void;
  onCaptionMerge: (id: string, nextId: string) => void;
}

// ---------------------------------------------------------------------------
// Time formatter
// ---------------------------------------------------------------------------

function formatTimeShort(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const msRemainder = Math.floor((ms % 1000) / 10);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(msRemainder).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// CaptionItem — memoised row
// ---------------------------------------------------------------------------

interface CaptionItemProps {
  caption: Caption_Object;
  index: number;
  isActive: boolean;
  isLast: boolean;
  onPress: (caption: Caption_Object, index: number) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onSplit: (id: string) => void;
  onMerge: (id: string, nextId: string) => void;
  nextCaption: Caption_Object | null;
}

const CaptionItem = memo(function CaptionItem({
  caption,
  index,
  isActive,
  isLast,
  onPress,
  onEdit,
  onDelete,
  onSplit,
  onMerge,
  nextCaption,
}: CaptionItemProps) {
  const [editText, setEditText] = useState(caption.text);
  const [isEditing, setIsEditing] = useState(false);

  // Keep editText in sync with caption.text from outside
  useEffect(() => {
    if (!isEditing) setEditText(caption.text);
  }, [caption.text, isEditing]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const trimmed = editText.trim();
    if (trimmed && trimmed !== caption.text) {
      onEdit(caption.id, trimmed);
    } else {
      setEditText(caption.text); // revert if empty or unchanged
    }
  }, [editText, caption, onEdit]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Bijschrift verwijderen',
      'Weet je zeker dat je dit bijschrift wilt verwijderen?',
      [
        { text: 'Annuleer', style: 'cancel' },
        { text: 'Verwijder', style: 'destructive', onPress: () => onDelete(caption.id) },
      ]
    );
  }, [caption.id, onDelete]);

  return (
    <TouchableOpacity
      onPress={() => onPress(caption, index)}
      style={[styles.itemContainer, isActive && styles.itemActive]}
      accessibilityLabel={`Bijschrift ${index + 1}: ${caption.text}`}
      accessibilityRole="button"
    >
      {/* Index + timestamps */}
      <View style={styles.itemHeader}>
        <Text style={styles.indexText}>{index + 1}</Text>
        <Text style={styles.timeText}>
          {formatTimeShort(caption.startTime)} → {formatTimeShort(caption.endTime)}
        </Text>
      </View>

      {/* Text editor */}
      {isEditing ? (
        <TextInput
          style={styles.textInput}
          value={editText}
          onChangeText={setEditText}
          onBlur={handleBlur}
          multiline
          autoFocus
          accessibilityLabel="Bijschrift tekst bewerken"
        />
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={[styles.captionText, isActive && styles.captionTextActive]}>
            {caption.text}
          </Text>
        </TouchableOpacity>
      )}

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => onSplit(caption.id)}
          style={styles.actionBtn}
          accessibilityLabel="Bijschrift splitsen"
        >
          <Ionicons name="cut-outline" size={16} color={colors.accent} />
        </TouchableOpacity>

        {!isLast && nextCaption && (
          <TouchableOpacity
            onPress={() => onMerge(caption.id, nextCaption.id)}
            style={styles.actionBtn}
            accessibilityLabel="Samenvoegen met volgend bijschrift"
          >
            <Ionicons name="git-merge-outline" size={16} color={colors.info} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleDelete}
          style={styles.actionBtn}
          accessibilityLabel="Bijschrift verwijderen"
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

// ---------------------------------------------------------------------------
// CaptionTimeline
// ---------------------------------------------------------------------------

const ITEM_HEIGHT = 110;

const CaptionTimeline = memo(function CaptionTimeline({
  captions,
  currentTime,
  onCaptionPress,
  onCaptionEdit,
  onCaptionDelete,
  onCaptionSplit,
  onCaptionMerge,
}: CaptionTimelineProps) {
  const listRef = useRef<FlatList>(null);

  // Find active caption index
  const activeIndex = captions.findIndex(
    (c) => currentTime >= c.startTime && currentTime < c.endTime
  );

  // Auto-scroll to active caption
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      listRef.current.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [activeIndex]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Caption_Object>) => (
      <CaptionItem
        caption={item}
        index={index}
        isActive={index === activeIndex}
        isLast={index === captions.length - 1}
        nextCaption={index < captions.length - 1 ? captions[index + 1] : null}
        onPress={onCaptionPress}
        onEdit={onCaptionEdit}
        onDelete={onCaptionDelete}
        onSplit={onCaptionSplit}
        onMerge={onCaptionMerge}
      />
    ),
    [activeIndex, captions, onCaptionPress, onCaptionEdit, onCaptionDelete, onCaptionSplit, onCaptionMerge]
  );

  const keyExtractor = useCallback((item: Caption_Object) => item.id, []);

  if (captions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="text-outline" size={40} color={colors.textTertiary} />
        <Text style={styles.emptyText}>Nog geen bijschriften</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={captions}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
      onScrollToIndexFailed={() => {}}
      accessibilityLabel="Bijschriften tijdlijn"
    />
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    backgroundColor: colors.backgroundTertiary,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indexText: {
    color: colors.textTertiary,
    fontSize: 11,
    marginRight: 8,
    minWidth: 24,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  captionText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 2,
  },
  captionTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  textInput: {
    color: colors.text,
    fontSize: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
    marginVertical: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  actionBtn: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 14,
    marginTop: 12,
  },
});

export default CaptionTimeline;
