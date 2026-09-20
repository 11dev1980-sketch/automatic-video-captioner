/**
 * Traditional Bottom Tab Bar
 * Fixed navbar at bottom without floating effect
 * Traditional mobile app navigation style
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';
import { typography } from '../../styles/typography';

export function TraditionalTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    
    console.log('🎯 TraditionalTabBar: Rendering with routes:', state.routes.map(r => r.name));

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
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
                        CaptionEditor: 'text',
                        Download: 'download',
                        Library: 'videocam',
                        Process: 'play-circle',
                        History: 'albums',
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
                            <View style={styles.tabContent}>
                                <Ionicons
                                    name={iconName}
                                    size={24}
                                    color={isFocused ? colors.primary : colors.textTertiary}
                                />
                                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                                    {label}
                                </Text>
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
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        paddingVertical: 8,
        minHeight: 60,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    tabLabel: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        fontSize: 11,
        marginTop: 2,
    },
    tabLabelActive: {
        color: colors.primary,
        fontWeight: '600',
    },
});
