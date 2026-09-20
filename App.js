import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Suppress React Native Web deprecation warnings from third-party libraries
import './src/utils/suppressWarnings';

// Version component for top-left corner display
const VersionDisplay = () => {
  // Configuration - Easy toggle for auto version increment
  const AUTO_INCREMENT_ENABLED = true; // Toggle this to enable/disable auto increment
  
  // Auto-increment version system for Vercel deployments
  const getVersion = () => {
    if (!AUTO_INCREMENT_ENABLED) {
      // Manual mode - return hardcoded version
      return "1.0.0";
    }
    
    // Auto mode - detect Vercel deployment and increment
    try {
      // Check if running on Vercel
      const isVercel = typeof window !== 'undefined' && 
                      (window.location.hostname.includes('vercel.app') || 
                       process.env.VERCEL === '1');
      
      if (isVercel) {
        // Get current version from build time or environment
        const buildTime = new Date().getTime();
        const baseVersion = "1.0";
        
        // Generate patch number from build timestamp (changes each deploy)
        const patchNumber = Math.floor(buildTime / 100000) % 100;
        
        return `${baseVersion}.${patchNumber}`;
      } else {
        // Local development - return base version
        return "1.0.0";
      }
    } catch (error) {
      console.error('Version error:', error);
      return "1.0.0";
    }
  };
  
  const version = getVersion();
  
  return (
    <View style={styles.versionContainer}>
      <Text style={styles.versionText}>v{version}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  versionContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  versionText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },
});

export default function App() {
  console.log(' App.js: Real app with navigation executing');
  console.log(' App.js: About to render ErrorBoundary');
  
  try {
    console.log(' App.js: ErrorBoundary rendered, about to render SafeAreaProvider');
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar style="light" />
          {process.env.EXPO_PUBLIC_SHOW_VERSION_BANNER === 'true' && <VersionDisplay />}
          {console.log(' App.js: StatusBar rendered, about to render AppNavigator') || <AppNavigator />}
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error(' App.js: Error during render:', error);
    console.error(' App.js: Error stack:', error.stack);
    console.error(' App.js: Error stack:', error.stack);
    return null;
  }
}
