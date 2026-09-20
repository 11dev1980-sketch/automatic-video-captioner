/**
 * Library Stack Navigator Configuration
 * Handles navigation within the Library tab
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { VideoLibraryScreen } from '../screens/VideoLibraryScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { TranscriptionResultsScreen } from '../screens/TranscriptionResultsScreen';
import { colors } from '../styles/colors';

const Stack = createStackNavigator();

export function LibraryStackNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="VideoLibrary"
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
                name="VideoLibrary"
                component={VideoLibraryScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="VideoPlayer"
                component={VideoPlayerScreen}
                options={{ title: 'Video Player' }}
            />
            <Stack.Screen
                name="TranscriptionResults"
                component={TranscriptionResultsScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
