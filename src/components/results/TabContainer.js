/**
 * Tab Container Component - Liquid Glass Design
 * Manages tabbed results display
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TranscriptView } from './TranscriptView';

import { TranslationView } from './TranslationView';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function TabContainer({ results, onCopy }) {
    // Helper to capitalize first letter
    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const sourceLang = results?.sourceLanguage ? capitalize(results.sourceLanguage) : 'Original';
    const targetLang = results?.targetLanguage ? capitalize(results.targetLanguage) : 'Translation';

    const TABS = [
        { id: 'source', label: `${sourceLang} Transcript` },
        { id: 'target', label: `${targetLang}` },
    ];

    const [activeTab, setActiveTab] = useState(TABS[0].id);

    const renderContent = () => {
        switch (activeTab) {
            case 'source':
                return (
                    <TranscriptView
                        text={results?.arabicTranscript}
                        onCopy={onCopy}
                    />
                );
            case 'target':
                return (
                    <TranslationView
                        text={results?.translatedText || results?.dutchTranslation || results?.translation || results?.text?.translationAndDuas}
                        onCopy={onCopy}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            activeTab === tab.id && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === tab.id && styles.tabTextActive,
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.content}>
                {renderContent()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Removed flex: 1 to allow content to flow with page-level scroll
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.glassLight,
        borderRadius: layout.radius.lg,
        padding: layout.spacing.xs,
        marginBottom: layout.spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    tab: {
        flex: 1,
        paddingVertical: layout.spacing.sm,
        paddingHorizontal: layout.spacing.xs,
        borderRadius: layout.radius.md,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        ...typography.caption,
        color: colors.textTertiary,
        fontWeight: '500',
    },
    tabTextActive: {
        color: colors.text,
        fontWeight: '600',
    },
    content: {
        // Removed flex: 1 to allow content to flow with page-level scroll
    },
});
