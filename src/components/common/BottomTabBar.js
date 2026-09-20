/**
 * Custom Bottom Tab Bar with Liquid Glass Effect
 * Inspired by Apple's macOS design language
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function BottomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    
    console.log('🎯 BottomTabBar: Rendering with routes:', state.routes.map(r => r.name));

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    const iconMap = {
                        Home: 'home',
                        Process: 'play-circle',
                        Download: 'download',
                        Library: 'videocam',
                        History: 'albums',
                        CaptionEditor: 'text',
                    };

                    const iconName = iconMap[route.name] || 'ellipse';

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.tabContent, isFocused && styles.tabContentActive]}>
                                <Ionicons
                                    name={iconName}
                                    size={24}
                                    color={isFocused ? colors.primary : colors.textTertiary}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingHorizontal: 16,
    },
    tabBar: {
        flexDirection: 'row',
        borderRadius: 28,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 8,
        paddingVertical: 8,
        minHeight: 64,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        opacity: 1,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 2,
        minHeight: 56,
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 16,
    },
    tabContentActive: {
        backgroundColor: colors.primary + '20',
    },
});
