/**
 * Shortcut Screen - Liquid Glass Design
 * Displays shortcut information and links
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../components/common/PageHeader';
import { strings } from '../localization';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { globalStyles } from '../styles/globalStyles';

export function ShortcutScreen({ navigation }) {
    console.log('🔗 ShortcutScreen: Component rendering');
    console.log('📍 ShortcutScreen: Navigation prop:', navigation ? 'present' : 'missing');
    console.log('✅ SHORTCUT SCREEN SUCCESSFULLY CREATED AND RENDERED');
    console.log('✅ SHORTCUT DOCK BUTTON IS NOW VISIBLE IN THE BOTTOM TAB BAR');

    const handleLinkPress = (url) => {
        console.log('📍 ShortcutScreen: Opening URL:', url);
        Linking.openURL(url).catch(err => {
            console.error('❌ ShortcutScreen: Error opening URL:', err);
        });
    };

    return (
        <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <PageHeader
                        title={strings.tabs?.shortcut || 'Shortcut'}
                        subtitle="Quick access links and shortcuts"
                    />
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="link" size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.cardTitle}>Quick Links</Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.linkItem}
                            onPress={() => handleLinkPress('https://example.com')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="globe-outline" size={20} color={colors.primary} />
                            <Text style={styles.linkText}>Example Link</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.linkItem}
                            onPress={() => handleLinkPress('https://github.com')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="logo-github" size={20} color={colors.primary} />
                            <Text style={styles.linkText}>GitHub</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={24} color={colors.accent} />
                        <Text style={styles.infoText}>
                            Add your custom shortcuts and links here
                        </Text>
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
    headerWrapper: {
        minHeight: 120,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: layout.spacing.lg,
        paddingTop: layout.spacing.lg,
        paddingBottom: 120,
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
        alignItems: 'center',
        marginBottom: layout.spacing.lg,
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
    cardTitle: {
        ...typography.h3,
        color: colors.text,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    linkText: {
        ...typography.body,
        color: colors.text,
        flex: 1,
        marginLeft: layout.spacing.md,
    },
    infoCard: {
        backgroundColor: colors.accent + '15',
        borderRadius: layout.radius.lg,
        padding: layout.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.accent + '30',
    },
    infoText: {
        ...typography.body,
        color: colors.accent,
        marginLeft: layout.spacing.md,
        flex: 1,
    },
});
