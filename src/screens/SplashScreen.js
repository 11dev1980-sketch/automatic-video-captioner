/**
 * Splash Screen
 * App launch screen with video background (if available)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';

export function SplashScreen({ navigation }) {
    useEffect(() => {
        // Navigate to Upload screen after 2 seconds
        const timer = setTimeout(() => {
            navigation.replace('Upload');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>🕌</Text>
                <Text style={styles.title}>Arabic Video Translator</Text>
                <Text style={styles.subtitle}>Transcribe • Translate • Extract Duas</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    icon: {
        fontSize: 64,
        marginBottom: layout.spacing.lg,
    },
    title: {
        ...typography.h1,
        marginBottom: layout.spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
