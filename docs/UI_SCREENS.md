# UI Screens - Arabic Video Translator

## Screen Redesign Plan

This document details all screen redesigns to match the React/Vite web app design.

---

## 1. HomeScreen

### Current State
- Basic layout with Liquid Glass Design
- Blue/purple color scheme
- Simple navigation

### Target Design
- Dark theme with glass morphism
- Personalized greeting ("Hallo, Karim!")
- Quick start section with URL input
- Recent processed items list
- Bottom navigation dock

### Key Features
- Status bar placeholder
- Personalized greeting
- Quick start card with red gradient button
- Recent items with icons and descriptions
- Bottom navigation dock

### Implementation
```javascript
// src/screens/HomeScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import GlassCard from '../components/common/GlassCard';
import RedGradientButton from '../components/common/RedGradientButton';
import BottomDock from '../components/common/BottomDock';
import GlassInput from '../components/common/GlassInput';
import RecentItem from '../components/common/RecentItem';
import StatusBar from '../components/common/StatusBar';

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');
  const [url, setUrl] = useState('');

  const recentItems = [
    { title: 'Doc: Recept voor Knafeh', time: '09:30 • Vandaag', desc: 'De sleutel is de juiste hoeveelheid boter...' },
    { title: 'Doc: Nieuwsupdate uit Dubai', time: 'Gisteren • 14:15', desc: 'De economische groei in de regio overtreft...' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hallo, Karim!</Text>
          <Text style={styles.subtitle}>Je Arabische video-vertaalassistent</Text>
        </View>

        <GlassCard style={styles.quickStartCard}>
          <Text style={styles.sectionTitle}>Snel Starten</Text>
          <GlassInput
            placeholder="Plak Instagram Reel URL hier..."
            value={url}
            onChangeText={setUrl}
            icon="link-outline"
          />
          <RedGradientButton
            title="Start Verwerking"
            onPress={() => navigation.navigate('Processing', { url })}
            disabled={!url}
          />
        </GlassCard>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Verwerkt</Text>
          <View style={styles.recentList}>
            {recentItems.map((item, index) => (
              <RecentItem key={index} {...item} />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomDock activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
```

### Styles
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.fontSize['4xl'],
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.fontSize.lg,
    color: colors.text.secondary,
    marginTop: 4,
  },
  quickStartCard: {
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.fontSize.xl,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  recentSection: {
    marginBottom: spacing['2xl'],
  },
  recentList: {
    gap: spacing.md,
  },
});
```

---

## 2. ProcessingScreen

### Target Design
- Breadcrumb navigation (Upload → Configuratie → Verwerken → Resultaten)
- Large circular progress indicator (192px)
- Red gradient progress bar
- Centered card layout
- Percentage display
- Progress description

### Key Features
- Step-by-step breadcrumbs
- Animated circular progress
- Linear progress bar with glow
- Dutch progress text
- Auto-advance to results at 70%

### Implementation
```javascript
// src/screens/ProcessingScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import GlassCard from '../components/common/GlassCard';
import CircularProgress from '../components/common/CircularProgress';
import Breadcrumb from '../components/common/Breadcrumb';

export default function ProcessingScreen({ route, navigation }) {
  const { url } = route.params;
  const [progress, setProgress] = useState(0);
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 70) {
          clearInterval(interval);
          return 70;
        }
        return prev + 1;
      });
    }, 30);

    if (progress === 70) {
      const timer = setTimeout(() => {
        navigation.navigate('Results');
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const steps = [
    { label: 'Upload' },
    { label: 'Configuratie' },
    { label: 'Verwerken' },
    { label: 'Resultaten' }
  ];

  return (
    <View style={styles.container}>
      <Breadcrumb steps={steps} activeStep={2} />
      
      <GlassCard dark style={styles.progressCard}>
        <CircularProgress progress={progress} size={192} />
        
        <View style={styles.progressBarContainer}>
          <Text style={styles.progressBarText}>{progress}%</Text>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.progressTextContainer}>
          <Text style={styles.progressTitle}>
            Vertalen naar het{'\n'}Nederlands... ({progress}%)
          </Text>
          <Text style={styles.progressDescription}>
            Een moment geduld a.u.b. terwijl wij uw video verwerken
          </Text>
        </View>
      </GlassCard>
    </View>
  );
}
```

### Styles
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  progressCard: {
    width: '100%',
    aspectRatio: 4/5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    borderRadius: borderRadius['4xl'],
    overflow: 'hidden',
  },
  progressBarContainer: {
    width: '100%',
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  progressBarText: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.glass.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  progressTextContainer: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  progressTitle: {
    ...typography.fontSize['2xl'],
    ...typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  progressDescription: {
    ...typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 200,
  },
});
```

---

## 3. ResultsScreen

### Target Design
- Back button header
- Action buttons grid (Share, Save, Library)
- Tab-based content (Arabic, Dutch, Dua)
- Copy button on card
- Process again button with icon

### Key Features
- Back navigation
- Three action buttons
- Three content tabs
- Copy functionality
- Red gradient CTA button

### Implementation
```javascript
// src/screens/ResultsScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import GlassCard from '../components/common/GlassCard';
import RedGradientButton from '../components/common/RedGradientButton';
import ActionButton from '../components/common/ActionButton';
import TabButton from '../components/common/TabButton';
import CopyButton from '../components/common/CopyButton';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ResultsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('nl');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultaten</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.actionButtons}>
        <ActionButton icon="share-outline" label="Delen" />
        <ActionButton icon="bookmark-outline" label="Opslaan" />
        <ActionButton icon="library-outline" label="Bibliotheek" />
      </View>

      <View style={styles.tabs}>
        <TabButton active={activeTab === 'ar'} label="Arabisch Script" onPress={() => setActiveTab('ar')} />
        <TabButton active={activeTab === 'nl'} label="Nederlandse Vertaling" onPress={() => setActiveTab('nl')} />
        <TabButton active={activeTab === 'dua'} label="Dua Extractie" onPress={() => setActiveTab('dua')} />
      </View>

      <GlassCard style={styles.contentCard}>
        <CopyButton onPress={handleCopy} style={styles.copyButton} />
        
        <View style={styles.content}>
          <Text style={styles.contentText}>
            Dit is de geverifieerde Nederlandse vertaling van de verwerkte video...
          </Text>
        </View>
      </GlassCard>

      <RedGradientButton
        title="Verwerk nog een video"
        onPress={() => navigation.navigate('Processing')}
        icon={<Icon name="play" size={20} color={colors.text.primary} />}
      />
    </ScrollView>
  );
}
```

### Styles
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.glass.light,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.fontSize.xl,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.glass.light,
    borderRadius: borderRadius.full,
    padding: 4,
    gap: 4,
    marginBottom: spacing.xl,
  },
  contentCard: {
    padding: spacing.xl,
    minHeight: 300,
    borderRadius: borderRadius['3xl'],
    marginBottom: spacing.xl,
  },
  copyButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  content: {
    marginTop: 32,
  },
  contentText: {
    ...typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
  },
});
```

---

## 4. HistoryScreen

### Target Design
- Grid layout for video thumbnails
- Selection and Import buttons
- Video count display
- Play button overlay
- Duration badge
- Document icon indicator

### Key Features
- 3-column grid layout
- Video thumbnails with play overlay
- Duration badges
- Selection mode
- Import functionality

### Implementation
```javascript
// src/screens/HistoryScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import GlassCard from '../components/common/GlassCard';
import VideoGridItem from '../components/common/VideoGridItem';

export default function HistoryScreen() {
  const videos = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    title: `Video Titel ${(i % 3) + 1}`,
    duration: `${Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
    thumbnail: `https://picsum.photos/seed/video${i}/300/400`,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Video Bibliotheek</Text>
          <Text style={styles.subtitle}>12 video's</Text>
        </View>
        <View style={styles.headerActions}>
          <GlassCard style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Selectie</Text>
          </GlassCard>
          <GlassCard style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Importeren</Text>
          </GlassCard>
        </View>
      </View>

      <View style={styles.videoGrid}>
        {videos.map((video) => (
          <VideoGridItem key={video.id} video={video} />
        ))}
      </View>
    </ScrollView>
  );
}
```

### Styles
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerContent: {
    gap: 4,
  },
  title: {
    ...typography.fontSize['3xl'],
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  headerButtonText: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
```

---

## 5. DownloadsScreen

### Target Design
- Centered layout
- Instagram Downloader title
- URL input with icon
- Download button with icon
- Success message card

### Key Features
- Simple, focused layout
- Large download button
- Success feedback
- URL validation

### Implementation
```javascript
// src/screens/DownloadsScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import GlassCard from '../components/common/GlassCard';
import GlassInput from '../components/common/GlassInput';
import RedGradientButton from '../components/common/RedGradientButton';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DownloadsScreen() {
  const [url, setUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Instagram Downloader</Text>
      </View>

      <View style={styles.content}>
        <GlassCard style={styles.inputCard}>
          <Icon name="link" size={24} color={colors.blue} style={styles.inputIcon} />
          <GlassInput
            placeholder="Plak Instagram Reel URL..."
            value={url}
            onChangeText={setUrl}
            style={{ flex: 1, backgroundColor: 'transparent' }}
          />
        </GlassCard>

        <RedGradientButton
          title="Video Downloaden"
          onPress={() => setShowSuccess(true)}
          icon={<Icon name="download" size={24} color={colors.text.primary} />}
        />

        {showSuccess && (
          <GlassCard style={styles.successCard}>
            <View style={styles.successIcon}>
              <Icon name="checkmark-circle" size={24} color={colors.success} />
            </View>
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>URL succesvol gekopieerd!</Text>
              <Text style={styles.successSubtitle}>Klaar om te downloaden.</Text>
            </View>
          </GlassCard>
        )}
      </View>
    </View>
  );
}
```

### Styles
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.fontSize.xl,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    width: '100%',
    gap: spacing.xl,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  inputIcon: {
    marginRight: spacing.lg,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.light,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    gap: 2,
  },
  successTitle: {
    ...typography.fontSize.sm,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  successSubtitle: {
    ...typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});
```

---

## 6. SettingsScreen

### Target Design
- Sectioned layout
- Account section (Profile, Language)
- App section (Saved Duas, Clear History)
- Settings items with icons and chevrons
- Grouped in glass cards

### Key Features
- Grouped settings sections
- Icon-based navigation
- Destructive action styling (Clear History)
- Chevron indicators

### Implementation
```javascript
// src/screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import GlassCard from '../components/common/GlassCard';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Instellingen</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <GlassCard style={styles.settingsCard}>
          <SettingsItem icon="person-outline" label="Profiel Bewerken" />
          <SettingsItem icon="language-outline" label="Taal Voorkeuren" />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APP</Text>
        <GlassCard style={styles.settingsCard}>
          <SettingsItem icon="bookmark-outline" label="Opgeslagen Dua's" />
          <SettingsItem icon="time-outline" label="Wis Geschiedenis" color="text-red-400" />
        </GlassCard>
      </View>
    </View>
  );
}

function SettingsItem({ icon, label, color }) {
  return (
    <TouchableOpacity style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        <Icon name={icon} size={18} color={color || colors.text.secondary} />
        <Text style={styles.settingsItemLabel}>{label}</Text>
      </View>
      <Icon name="chevron-forward" size={16} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}
```

### Styles
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.fontSize['3xl'],
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  settingsCard: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: 20,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  settingsItemLabel: {
    ...typography.fontSize.base,
    ...typography.fontWeight.medium,
    color: colors.text.primary,
  },
});
```

---

## Screen Priority

### Phase 1: Core Screens (Week 4-5)
1. HomeScreen
2. ProcessingScreen
3. ResultsScreen

### Phase 2: Secondary Screens (Week 6-7)
4. HistoryScreen
5. DownloadsScreen
6. SettingsScreen

---

## Navigation Flow

```
HomeScreen
  ↓ (URL input + Start)
ProcessingScreen
  ↓ (Progress complete)
ResultsScreen
  ↓ (Process again)
ProcessingScreen

HomeScreen
  ↓ (History tab)
HistoryScreen

HomeScreen
  ↓ (Downloads tab)
DownloadsScreen

HomeScreen
  ↓ (Settings tab)
SettingsScreen
```

---

## Screen Transitions

### Forward Navigation
- Slide from right (300ms)
- Fade in (300ms)
- Scale in (optional)

### Back Navigation
- Slide from left (300ms)
- Fade in (300ms)

### Tab Navigation
- No animation (instant)
- Active indicator animation (300ms)
