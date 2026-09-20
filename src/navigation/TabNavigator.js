/**
 * Custom Tab Navigator Implementation
 * Uses Stack Navigator with custom bottom tab bar overlay
 */

import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { StackNavigator } from "./StackNavigator";
import { LibraryStackNavigator } from "./LibraryStackNavigator";
import { DownloadStackNavigator } from "./DownloadStackNavigator";
import { HomeScreen } from "../screens/HomeScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { TranscriptionResultsScreen } from "../screens/TranscriptionResultsScreen";
import ApiKeyScreen from "../screens/ApiKeyScreen";
import { InstagramConfigScreen } from "../screens/InstagramConfigScreen";
import { CaptionEditorScreen } from "../screens/CaptionEditorScreen";
import { CaptionEditorWorkspace } from "../screens/CaptionEditorWorkspace";
import { BottomTabBar } from "../components/common/BottomTabBar";
import { TraditionalTabBar } from "../components/common/TraditionalTabBar";
import { ShortcutScreen } from "../screens/ShortcutScreen";
import { DevPreviewScreen } from "../screens/DevPreviewScreen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors } from "../styles/colors";
import { strings } from "../localization";

const TranscriptionResultsStack = createStackNavigator();

// PRIMARY HOMEPAGE TAB NAME - This overrides all other tab names on homepage
const PRIMARY_HOMEPAGE_TAB_NAME = "Arabic Video Translator";

// Create a simple state manager for tabs
const TabStateContext = React.createContext();

export function TabNavigator() {
  console.log("🧭 TabNavigator: Component starting to render");

  const [activeTab, setActiveTab] = useState("Home");
  const dockMode = "traditional"; // Hardcoded to traditional dock
  const [historyStack, setHistoryStack] = React.useState(null);
  const [processParams, setProcessParams] = React.useState(null);
  const [transcriptionResultsParams, setTranscriptionResultsParams] =
    React.useState(null);
  const [showTranscriptionResults, setShowTranscriptionResults] =
    React.useState(false);
  const [showApiKeyScreen, setShowApiKeyScreen] = React.useState(false);
  const [showInstagramConfig, setShowInstagramConfig] = React.useState(false);
  const [captionEditorWorkspaceParams, setCaptionEditorWorkspaceParams] =
    React.useState(null);
  const [showDevPreview, setShowDevPreview] = React.useState(false);
  const [tabKeys, setTabKeys] = React.useState({
    Home: 0,
    Process: 0,
    Download: 0,
    Library: 0,
    CaptionEditor: 0,
    History: 0,
  });

  console.log("📍 TabNavigator: State initialized, activeTab:", activeTab);

  // Set proper document title and prevent undefined titles
  React.useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const safeSetTitle = (t) => {
          if (typeof t === "string" && t.trim()) document.title = t;
        };

        // Set initial title safely
        safeSetTitle(PRIMARY_HOMEPAGE_TAB_NAME);

        // Expose a small helper for other parts of the app to set a safe title
        // (keeps existing code working while preventing empty/undefined values)
        window.__AVT_setTitle = safeSetTitle;
      } catch (error) {
        console.log("📍 TabNavigator: Document title setup failed:", error.message);
      }
    }
  }, []);

  const handleTabPress = useCallback((tabName, params) => {
    if (tabName === "TranscriptionResults") {
      setTranscriptionResultsParams(params);
      setShowTranscriptionResults(true);
    } else if (tabName === "ApiKey") {
      setShowApiKeyScreen(true);
    } else if (tabName === "InstagramConfig") {
      setShowInstagramConfig(true);
    } else if (tabName === "DevPreview") {
      setShowDevPreview(true);
    } else if (tabName === "CaptionEditorWorkspace") {
      setCaptionEditorWorkspaceParams(params);
      setActiveTab("CaptionEditor");
    } else {
      setTabKeys((prev) => ({
        ...prev,
        [tabName]: (prev[tabName] || 0) + 1,
      }));
      setActiveTab(tabName);
      if (tabName === "Process") {
        setProcessParams(params || null);
      }
      if (tabName === "CaptionEditor") {
        setCaptionEditorWorkspaceParams(params || null);
      }
    }
  }, []);

  const tabState = {
    index:
      activeTab === "Home"
        ? 0
        : activeTab === "CaptionEditor"
          ? 1
          : activeTab === "Download"
            ? 2
            : activeTab === "Library"
              ? 3
              : activeTab === "Process"
                ? 4
                : 5,
    routes: [
      { key: "Home", name: "Home" },
      { key: "CaptionEditor", name: "CaptionEditor" },
      { key: "Download", name: "Download" },
      { key: "Library", name: "Library" },
      { key: "Process", name: "Process" },
      { key: "History", name: "History" },
    ],
  };

  const tabDescriptors = {
    Home: {
      options: {
        title: PRIMARY_HOMEPAGE_TAB_NAME, // Override with constant
        tabBarLabel: strings.tabs.home,
      },
    },
    Process: {
      options: {
        title: strings.tabs.process,
        tabBarLabel: strings.tabs.process,
      },
    },
    Download: {
      options: {
        title: strings.tabs.download,
        tabBarLabel: strings.tabs.download,
      },
    },
    Library: {
      options: {
        title: strings.tabs.library,
        tabBarLabel: strings.tabs.library,
      },
    },
    History: {
      options: {
        title: strings.tabs.history,
        tabBarLabel: strings.tabs.history,
      },
    },
    Shortcut: {
      options: {
        title: strings.tabs.shortcut || "Shortcut",
        tabBarLabel: strings.tabs.shortcut || "Shortcut",
      },
    },
    CaptionEditor: {
      options: {
        title: "Ondertitel Editor",
        tabBarLabel: strings.tabs.captionEditor,
      },
    },
  };

  const TranscriptionResultsStackComponent = () => (
    <TranscriptionResultsStack.Navigator screenOptions={{ headerShown: false }}>
      <TranscriptionResultsStack.Screen
        name="TranscriptionResults"
        initialParams={transcriptionResultsParams}
      >
        {(props) => (
          <TranscriptionResultsScreen
            {...props}
            navigation={{
              ...props.navigation,
              goBack: () => {
                setShowTranscriptionResults(false);
                setTranscriptionResultsParams(null);
                setActiveTab("History");
              },
            }}
          />
        )}
      </TranscriptionResultsStack.Screen>
    </TranscriptionResultsStack.Navigator>
  );

  const navigation = {
    navigate: (routeName, params) => {
      handleTabPress(routeName, params);
    },
    goBack: () => {
      if (showDevPreview) {
        setShowDevPreview(false);
      } else if (showTranscriptionResults) {
        setShowTranscriptionResults(false);
        setTranscriptionResultsParams(null);
      } else if (showApiKeyScreen) {
        setShowApiKeyScreen(false);
      } else if (showInstagramConfig) {
        setShowInstagramConfig(false);
      } else if (captionEditorWorkspaceParams) {
        const returnTo = captionEditorWorkspaceParams.returnTo;
        setCaptionEditorWorkspaceParams(null);
        if (returnTo === "History") {
          setActiveTab("History");
        }
      }
    },
    emit: () => ({ defaultPrevented: false }),
  };

  console.log("📍 TabNavigator: About to render, activeTab:", activeTab);
  console.log(
    "📍 TabNavigator: showTranscriptionResults:",
    showTranscriptionResults,
  );
  console.log("📍 TabNavigator: showApiKeyScreen:", showApiKeyScreen);
  console.log("📍 TabNavigator: showInstagramConfig:", showInstagramConfig);

  try {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {showDevPreview
            ? (() => {
                console.log("📍 TabNavigator: Rendering DevPreviewScreen");
                return (
                  <DevPreviewScreen onClose={() => setShowDevPreview(false)} />
                );
              })()
            : showTranscriptionResults
              ? (() => {
                  console.log(
                    "📍 TabNavigator: Rendering TranscriptionResultsStackComponent",
                  );
                  return <TranscriptionResultsStackComponent />;
                })()
              : showApiKeyScreen
                ? (() => {
                    console.log("📍 TabNavigator: Rendering ApiKeyScreen");
                    return <ApiKeyScreen navigation={navigation} />;
                  })()
                : showInstagramConfig
                  ? (() => {
                      console.log(
                        "📍 TabNavigator: Rendering InstagramConfigScreen",
                      );
                      return <InstagramConfigScreen navigation={navigation} />;
                    })()
                  : (() => {
                      console.log(
                        "📍 TabNavigator: Rendering main tab content for activeTab:",
                        activeTab,
                      );
                      return (
                        <>
                          {activeTab === "Home" &&
                            (() => {
                              console.log(
                                "📍 TabNavigator: Rendering HomeScreen",
                              );
                              return <HomeScreen key={`Home-${tabKeys.Home}`} navigation={navigation} />;
                            })()}
                          {activeTab === "Process" &&
                            (() => {
                              console.log(
                                "📍 TabNavigator: Rendering StackNavigator",
                              );
                              return (
                                <StackNavigator
                                  key={`Process-${tabKeys.Process}`}
                                  initialParams={processParams}
                                />
                              );
                            })()}
                          {activeTab === "Download" &&
                            (() => {
                              console.log(
                                "📍 TabNavigator: Rendering DownloadStackNavigator",
                              );
                              return <DownloadStackNavigator key={`Download-${tabKeys.Download}`} />;
                            })()}
                          {activeTab === "Library" &&
                            (() => {
                              console.log(
                                "📍 TabNavigator: Rendering LibraryStackNavigator",
                              );
                              return <LibraryStackNavigator key={`Library-${tabKeys.Library}`} />;
                            })()}
                          {activeTab === "CaptionEditor" &&
                            (() => {
                              console.log(
                                "📍 TabNavigator: Rendering CaptionEditor",
                              );
                              console.log("📍 TabNavigator: captionEditorWorkspaceParams:", captionEditorWorkspaceParams);
                              if (captionEditorWorkspaceParams) {
                                return (
                                  <CaptionEditorWorkspace
                                    key={`CaptionEditorWorkspace-${captionEditorWorkspaceParams?.videoId || tabKeys.CaptionEditor}`}
                                    navigation={navigation}
                                    route={{
                                      params: captionEditorWorkspaceParams,
                                    }}
                                  />
                                );
                              } else {
                                return (
                                  <CaptionEditorScreen
                                    key={`CaptionEditor-${tabKeys.CaptionEditor}`}
                                    navigation={navigation}
                                  />
                                );
                              }
                            })()}
                          {activeTab === "History" &&
                            (() => {
                              console.log(
                                "📍 TabNavigator: Rendering HistoryScreen",
                              );
                              return (
                                <HistoryScreen
                                  key={`History-${tabKeys.History}`}
                                  isFocused={activeTab === "History"}
                                  navigation={navigation}
                                />
                              );
                            })()}
                          {activeTab === "Shortcut" &&
                            (() => {
                              console.log(
                                "📍 TabNavigator: Rendering ShortcutScreen",
                              );
                              return <ShortcutScreen navigation={navigation} />;
                            })()}
                        </>
                      );
                    })()}
        </View>
        {!showDevPreview &&
          !showTranscriptionResults &&
          !showApiKeyScreen &&
          !showInstagramConfig && (
            <View
              style={[styles.tabBarContainer, { pointerEvents: "box-none" }]}
            >
              {dockMode === 'traditional' ? (
                <TraditionalTabBar
                  state={tabState}
                  descriptors={tabDescriptors}
                  navigation={navigation}
                />
              ) : (
                <BottomTabBar
                  state={tabState}
                  descriptors={tabDescriptors}
                  navigation={navigation}
                />
              )}
            </View>
          )}
      </View>
    );
  } catch (error) {
    console.error("❌ TabNavigator: Error during render:", error);
    console.error("❌ TabNavigator: Error stack:", error.stack);
    return (
      <View style={styles.container}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 50 }}>
          TabNavigator Error: {error.message}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 1000,
  },
});
