/**
 * Shimmer Loading Effect Component
 * Displays animated shimmer effect while content is loading
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../styles/colors';
import { layout } from '../../styles/layout';

export function ShimmerLoader({ width = '100%', height = 100, borderRadius = layout.radius.md, style }) {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false, // Use JS driver for web compatibility
                }),
                Animated.timing(shimmerAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false, // Use JS driver for web compatibility
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={[styles.container, { width, height, borderRadius }, style]}>
            <Animated.View style={[styles.shimmer, { opacity }]} />
        </View>
    );
}

export function VideoCardShimmer() {
    return (
        <View style={styles.videoCardContainer}>
            <ShimmerLoader width="100%" height={120} borderRadius={layout.radius.md} />
            <ShimmerLoader width="80%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
            <ShimmerLoader width="60%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        overflow: 'hidden',
    },
    shimmer: {
        flex: 1,
        backgroundColor: colors.primary + '20',
    },
    videoCardContainer: {
        padding: layout.spacing.sm,
        width: '33.33%',
    },
});
