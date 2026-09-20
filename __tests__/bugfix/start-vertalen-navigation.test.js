/**
 * Test for Start Vertalen Navigation Fix
 * Bug: Page going blank after clicking start vertalen button on homepage
 * Fix: Updated StackNavigator to handle initialRouteName based on initialParams
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StackNavigator } from '../../src/navigation/StackNavigator';

// Mock the components to avoid import issues
jest.mock('../../src/screens/UploadScreen', () => ({
  UploadScreen: () => 'UploadScreen',
}));

jest.mock('../../src/screens/ProcessingScreen', () => ({
  ProcessingScreen: ({ route }) => `ProcessingScreen - URL: ${route.params?.reelUrl || 'none'}`,
}));

jest.mock('../../src/screens/ResultsScreen', () => ({
  ResultsScreen: () => 'ResultsScreen',
}));

jest.mock('../../src/screens/TranscriptionResultsScreen', () => ({
  TranscriptionResultsScreen: () => 'TranscriptionResultsScreen',
}));

jest.mock('../../src/screens/CaptionEditorScreen', () => ({
  CaptionEditorScreen: () => 'CaptionEditorScreen',
}));

jest.mock('../../src/screens/CaptionEditorWorkspace', () => ({
  CaptionEditorWorkspace: () => 'CaptionEditorWorkspace',
}));

describe('Start Vertalen Navigation Fix', () => {
  test('should start with Upload screen when no reelUrl provided', () => {
    const initialParams = {};
    
    const { getByText } = render(
      <NavigationContainer>
        <StackNavigator initialParams={initialParams} />
      </NavigationContainer>
    );
    
    expect(getByText('UploadScreen')).toBeTruthy();
  });

  test('should start with Processing screen when reelUrl is provided (quick start)', () => {
    const initialParams = {
      reelUrl: 'https://www.instagram.com/reel/test123',
      platform: 'instagram',
      duaEnabled: true,
      instagramEnabled: false
    };
    
    const { getByText } = render(
      <NavigationContainer>
        <StackNavigator initialParams={initialParams} />
      </NavigationContainer>
    );
    
    expect(getByText('ProcessingScreen - URL: https://www.instagram.com/reel/test123')).toBeTruthy();
  });

  test('should pass initialParams to Processing screen correctly', () => {
    const initialParams = {
      reelUrl: 'https://www.tiktok.com/test',
      platform: 'tiktok',
      duaEnabled: false,
      instagramEnabled: true
    };
    
    const { getByText } = render(
      <NavigationContainer>
        <StackNavigator initialParams={initialParams} />
      </NavigationContainer>
    );
    
    expect(getByText('ProcessingScreen - URL: https://www.tiktok.com/test')).toBeTruthy();
  });

  test('should handle empty initialParams gracefully', () => {
    const initialParams = null;
    
    const { getByText } = render(
      <NavigationContainer>
        <StackNavigator initialParams={initialParams} />
      </NavigationContainer>
    );
    
    expect(getByText('UploadScreen')).toBeTruthy();
  });
});
