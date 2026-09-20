/**
 * Stack Navigator Configuration
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { UploadScreen } from '../screens/UploadScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { TranscriptionResultsScreen } from '../screens/TranscriptionResultsScreen';
import { CaptionEditorScreen } from '../screens/CaptionEditorScreen';
import { CaptionEditorWorkspace } from '../screens/CaptionEditorWorkspace';
import { ConfigureScreen } from '../screens/ConfigureScreen';
import { DownloadScreen } from '../screens/DownloadScreen';
import { colors } from '../styles/colors';

const Stack = createStackNavigator();

export function StackNavigator({ initialParams }) {
    return (
        <Stack.Navigator
            initialRouteName={initialParams && (initialParams.reelUrl || initialParams.localFile) ? 'Processing' : 'Upload'}
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
                name="Upload"
                component={UploadScreen}
                options={{ headerShown: false }}
                initialParams={initialParams}
            />
            <Stack.Screen
                name="Configure"
                component={ConfigureScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Download"
                component={DownloadScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Processing"
                component={ProcessingScreen}
                options={{
                    headerShown: false,
                    headerLeft: null, // Prevent going back during processing
                }}
                initialParams={initialParams}
            />
            <Stack.Screen
                name="Results"
                component={ResultsScreen}
                options={{
                    headerShown: false,
                    headerLeft: null, // Use custom navigation in Results screen
                }}
            />
            <Stack.Screen
                name="TranscriptionResults"
                component={TranscriptionResultsScreen}
                options={{
                    headerShown: false,
                    headerLeft: null, // Use custom navigation in TranscriptionResults screen
                }}
            />
            <Stack.Screen
                name="CaptionEditor"
                component={CaptionEditorScreen}
                options={{
                    headerShown: false,
                    headerLeft: null,
                }}
            />
            <Stack.Screen
                name="CaptionEditorWorkspace"
                component={CaptionEditorWorkspace}
                options={{
                    headerShown: false,
                    headerLeft: null,
                }}
            />
        </Stack.Navigator>
    );
}
