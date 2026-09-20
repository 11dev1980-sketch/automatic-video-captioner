/**
 * Download Stack Navigator Configuration
 * Handles navigation within the Download tab
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DownloadPage } from '../components/download/DownloadPage';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { colors } from '../styles/colors';

const Stack = createStackNavigator();

export function DownloadStackNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="DownloadPage"
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: '600',
                },
                cardStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Stack.Screen
                name="DownloadPage"
                component={DownloadPage}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="VideoPlayer"
                component={VideoPlayerScreen}
                options={{ title: 'Video Player' }}
            />
        </Stack.Navigator>
    );
}
