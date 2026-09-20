# UI Components - Arabic Video Translator

## Component Library

This document details all UI components needed to match the React/Vite web app design.

---

## 1. GlassCard Component

### Description
A glass morphism card component with blur effects and subtle borders.

### Props
- `children` (ReactNode): Card content
- `style` (StyleProp): Additional styles
- `dark` (boolean): Use dark glass variant

### Code
```javascript
// src/components/common/GlassCard.js
import { StyleSheet, View } from 'react-native';
import { colors, borderRadius } from '../../styles';

export default function GlassCard({ children, style, dark = false, ...props }) {
  return (
    <View style={[styles.glassCard, dark && styles.glassCardDark, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: colors.glass.light,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glass.medium,
  },
  glassCardDark: {
    backgroundColor: colors.glass.dark,
  },
});
```

### Usage
```javascript
<GlassCard style={{ padding: 24 }}>
  <Text>Card content</Text>
</GlassCard>

<GlassCard dark style={{ padding: 16 }}>
  <Text>Dark glass card</Text>
</GlassCard>
```

---

## 2. RedGradientButton Component

### Description
A primary action button with red gradient and glow shadow effect.

### Props
- `title` (string): Button text
- `onPress` (function): Press handler
- `loading` (boolean): Show loading indicator
- `disabled` (boolean): Disable button
- `icon` (ReactNode): Optional icon
- `style` (StyleProp): Additional styles

### Code
```javascript
// src/components/common/RedGradientButton.js
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, typography, borderRadius } from '../../styles';
import { LinearGradient } from 'react-native-linear-gradient';

export default function RedGradientButton({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  icon,
  style
}) {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.gradient.red.start, colors.gradient.red.end]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={styles.buttonText}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.fontSize.lg,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  iconContainer: {
    marginRight: 12,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

### Usage
```javascript
<RedGradientButton
  title="Start Verwerking"
  onPress={handleStart}
  disabled={!url}
/>

<RedGradientButton
  title="Verwerk nog een video"
  onPress={handleProcessAgain}
  icon={<Icon name="play" size={20} color={colors.text.primary} />}
/>
```

---

## 3. BottomDock Component

### Description
Fixed bottom navigation dock with glass morphism effect and 5 navigation items.

### Props
- `activeTab` (string): Currently active tab
- `onTabChange` (function): Tab change handler

### Code
```javascript
// src/components/common/BottomDock.js
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors, borderRadius, typography } from '../../styles';
import GlassCard from './GlassCard';
import Icon from 'react-native-vector-icons/Ionicons';

export default function BottomDock({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'translate', icon: 'languages', label: 'Vertalen' },
    { id: 'history', icon: 'history', label: 'Geschiedenis' },
    { id: 'downloads', icon: 'download', label: 'Downloads' },
    { id: 'settings', icon: 'settings', label: 'Instellingen' },
  ];

  return (
    <View style={styles.dockContainer}>
      <GlassCard dark style={styles.dock}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
            onPress={() => onTabChange(tab.id)}
          >
            <View style={[styles.iconContainer, activeTab === tab.id && styles.iconContainerActive]}>
              <Icon 
                name={tab.icon} 
                size={22} 
                color={activeTab === tab.id ? colors.primary : colors.text.tertiary} 
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.id && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </GlassCard>
      <View style={styles.homeIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 8,
    width: '90%',
    maxWidth: 380,
    borderRadius: borderRadius['3xl'],
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabItemActive: {
    color: colors.primary,
  },
  iconContainer: {
    marginBottom: 4,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 128,
    height: 4,
    backgroundColor: colors.glass.medium,
    borderRadius: 2,
  },
});
```

### Usage
```javascript
<BottomDock activeTab={activeTab} onTabChange={setActiveTab} />
```

---

## 4. CircularProgress Component

### Description
Circular progress indicator with animated SVG stroke and percentage display.

### Props
- `progress` (number): Progress value (0-100)
- `size` (number): Circle diameter (default: 192)
- `strokeWidth` (number): Stroke width (default: 4)

### Code
```javascript
// src/components/common/CircularProgress.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../../styles';

export default function CircularProgress({ progress, size = 192, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          stroke={colors.glass.light}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <AnimatedCircle
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255, 59, 92, 0.5))' }}
        />
      </Svg>
      <View style={styles.percentageContainer}>
        <Animated.Text style={styles.percentage}>
          {Math.round(progress)}%
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  percentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    ...typography.fontSize['3xl'],
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
```

### Usage
```javascript
<CircularProgress progress={progress} size={192} />
```

---

## 5. GlassInput Component

### Description
Glass morphism input field with icon and clear button.

### Props
- `placeholder` (string): Placeholder text
- `value` (string): Input value
- `onChangeText` (function): Text change handler
- `icon` (ReactNode): Optional icon
- `style` (StyleProp): Additional styles

### Code
```javascript
// src/components/common/GlassInput.js
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../styles';
import Icon from 'react-native-vector-icons/Ionicons';

export default function GlassInput({ 
  placeholder, 
  value, 
  onChangeText, 
  icon,
  style 
}) {
  return (
    <View style={[styles.inputContainer, style]}>
      {icon && <Icon name={icon} size={18} color={colors.text.tertiary} style={styles.inputIcon} />}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
      />
      {value && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Icon name="close-circle" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.light,
    borderRadius: borderRadius['2xl'],
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.glass.medium,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.fontSize.base,
    color: colors.text.primary,
  },
});
```

### Usage
```javascript
<GlassInput
  placeholder="Plak Instagram Reel URL hier..."
  value={url}
  onChangeText={setUrl}
  icon="link-outline"
/>
```

---

## 6. TabButton Component

### Description
Tab button for switching between content views.

### Props
- `active` (boolean): Active state
- `label` (string): Button label
- `onPress` (function): Press handler

### Code
```javascript
// src/components/common/TabButton.js
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../../styles';

export default function TabButton({ active, label, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
});
```

### Usage
```javascript
<View style={styles.tabs}>
  <TabButton active={activeTab === 'ar'} label="Arabisch Script" onPress={() => setActiveTab('ar')} />
  <TabButton active={activeTab === 'nl'} label="Nederlandse Vertaling" onPress={() => setActiveTab('nl')} />
  <TabButton active={activeTab === 'dua'} label="Dua Extractie" onPress={() => setActiveTab('dua')} />
</View>
```

---

## 7. ActionButton Component

### Description
Small action button with icon and label.

### Props
- `icon` (string): Icon name
- `label` (string): Button label
- `onPress` (function): Press handler

### Code
```javascript
// src/components/common/ActionButton.js
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors, typography, borderRadius } from '../../styles';
import GlassCard from './GlassCard';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ActionButton({ icon, label, onPress }) {
  return (
    <GlassCard style={styles.actionButton}>
      <TouchableOpacity style={styles.actionButtonContent} onPress={onPress}>
        <Icon name={icon} size={18} color={colors.text.secondary} />
        <Text style={styles.actionButtonLabel}>{label}</Text>
      </TouchableOpacity>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonContent: {
    alignItems: 'center',
  },
  actionButtonLabel: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: 8,
  },
});
```

### Usage
```javascript
<View style={styles.actionButtons}>
  <ActionButton icon="share-outline" label="Delen" />
  <ActionButton icon="bookmark-outline" label="Opslaan" />
  <ActionButton icon="library-outline" label="Bibliotheek" />
</View>
```

---

## 8. RecentItem Component

### Description
Card displaying recent processed item with icon, title, time, and description.

### Props
- `title` (string): Item title
- `time` (string): Timestamp
- `desc` (string): Description
- `onPress` (function): Press handler

### Code
```javascript
// src/components/common/RecentItem.js
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../styles';
import GlassCard from './GlassCard';
import Icon from 'react-native-vector-icons/Ionicons';

export default function RecentItem({ title, time, desc, onPress }) {
  return (
    <GlassCard style={styles.recentItem}>
      <TouchableOpacity style={styles.recentItemContent} onPress={onPress}>
        <View style={styles.recentItemIcon}>
          <Icon name="document-text-outline" size={24} color={colors.text.secondary} />
          <View style={styles.playBadge}>
            <Icon name="play" size={8} color={colors.text.primary} />
          </View>
        </View>
        <View style={styles.recentItemText}>
          <Text style={styles.recentItemTitle}>{title}</Text>
          <Text style={styles.recentItemTime}>{time}</Text>
          <Text style={styles.recentItemDesc} numberOfLines={2}>
            {desc}
          </Text>
        </View>
      </TouchableOpacity>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  recentItem: {
    padding: spacing.lg,
  },
  recentItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recentItemIcon: {
    width: 56,
    height: 56,
    backgroundColor: colors.glass.light,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  playBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.glass.medium,
    borderRadius: 12,
    padding: 4,
  },
  recentItemText: {
    flex: 1,
  },
  recentItemTitle: {
    ...typography.fontSize.base,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  recentItemTime: {
    ...typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  recentItemDesc: {
    ...typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: typography.lineHeight.relaxed,
  },
});
```

### Usage
```javascript
<RecentItem 
  title="Doc: Recept voor Knafeh" 
  time="09:30 • Vandaag" 
  desc="De sleutel is de juiste hoeveelheid boter..."
  onPress={handlePress}
/>
```

---

## 9. VideoGridItem Component

### Description
Grid item for video library with thumbnail, play button, duration badge.

### Props
- `video` (object): Video data
- `onPress` (function): Press handler

### Code
```javascript
// src/components/common/VideoGridItem.js
import { TouchableOpacity, StyleSheet, Text, Image, View } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../styles';
import GlassCard from './GlassCard';
import Icon from 'react-native-vector-icons/Ionicons';

export default function VideoGridItem({ video, onPress }) {
  return (
    <TouchableOpacity style={styles.videoItem} onPress={onPress}>
      <GlassCard style={styles.videoCard}>
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Icon name="play" size={16} color={colors.text.primary} />
          </View>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        <View style={styles.docBadge}>
          <Icon name="document-text-outline" size={10} color={colors.text.primary} />
        </View>
      </GlassCard>
      <Text style={styles.videoTitle}>{video.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  videoItem: {
    width: '31%',
  },
  videoCard: {
    aspectRatio: 3/4,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: colors.glass.medium,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
  docBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.glass.medium,
    borderRadius: 8,
    padding: 4,
  },
  videoTitle: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
```

### Usage
```javascript
<View style={styles.videoGrid}>
  {videos.map(video => (
    <VideoGridItem key={video.id} video={video} onPress={handlePress} />
  ))}
</View>
```

---

## 10. Breadcrumb Component

### Description
Breadcrumb navigation for multi-step processes.

### Props
- `steps` (array): Step objects with label and active state
- `activeStep` (number): Currently active step index

### Code
```javascript
// src/components/common/Breadcrumb.js
import { View, StyleSheet, Text } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../styles';
import GlassCard from './GlassCard';

export default function Breadcrumb({ steps, activeStep }) {
  return (
    <GlassCard style={styles.breadcrumbs}>
      {steps.map((step, index) => (
        <View 
          key={index} 
          style={[
            styles.breadcrumb, 
            index === activeStep && styles.breadcrumbActive,
            index !== activeStep && styles.breadcrumbInactive
          ]}
        >
          <Text style={styles.breadcrumbText}>{step.label}</Text>
        </View>
      ))}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: borderRadius.full,
    width: '100%',
    maxWidth: 300,
  },
  breadcrumb: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
  },
  breadcrumbActive: {
    backgroundColor: colors.primary,
  },
  breadcrumbInactive: {
    opacity: 0.4,
  },
  breadcrumbText: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
```

### Usage
```javascript
<Breadcrumb 
  steps={[
    { label: 'Upload' },
    { label: 'Configuratie' },
    { label: 'Verwerken' },
    { label: 'Resultaten' }
  ]}
  activeStep={2}
/>
```

---

## 11. CopyButton Component

### Description
Small copy button with icon.

### Props
- `onPress` (function): Copy handler
- `style` (StyleProp): Additional styles

### Code
```javascript
// src/components/common/CopyButton.js
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../styles';
import GlassCard from './GlassCard';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CopyButton({ onPress, style }) {
  return (
    <GlassCard style={[styles.copyButton, style]}>
      <TouchableOpacity style={styles.copyButtonContent} onPress={onPress}>
        <Icon name="copy-outline" size={12} color={colors.text.primary} />
        <Text style={styles.copyButtonText}>Kopieer</Text>
      </TouchableOpacity>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButtonText: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
```

### Usage
```javascript
<CopyButton onPress={handleCopy} style={styles.positionAbsolute} />
```

---

## 12. StatusBar Component

### Description
Status bar placeholder with time and system icons.

### Code
```javascript
// src/components/common/StatusBar.js
import { View, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../../styles';

export default function StatusBar() {
  return (
    <View style={styles.statusBar}>
      <Text style={styles.timeText}>10:09</Text>
      <View style={styles.statusIcons}>
        <View style={styles.batteryIcon}>
          <View style={styles.batteryLevel} />
        </View>
        <View style={styles.signalIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  timeText: {
    ...typography.fontSize.xs,
    ...typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  batteryIcon: {
    width: 16,
    height: 8,
    backgroundColor: colors.glass.medium,
    borderRadius: 2,
    overflow: 'hidden',
  },
  batteryLevel: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.text.primary,
  },
  signalIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.glass.medium,
  },
});
```

### Usage
```javascript
<StatusBar />
```

---

## Component Dependencies

### Required Packages
```json
{
  "react-native-linear-gradient": "^2.8.3",
  "react-native-svg": "^15.0.0",
  "react-native-vector-icons": "^10.0.0",
  "@react-native-community/blur": "^4.4.0"
}
```

### Installation
```bash
npm install react-native-linear-gradient react-native-svg react-native-vector-icons @react-native-community/blur
```

---

## Component Testing

### Unit Tests
```javascript
// __tests__/components/GlassCard.test.js
import { render } from '@testing-library/react-native';
import GlassCard from '../../src/components/common/GlassCard';

describe('GlassCard', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <GlassCard><Text>Test</Text></GlassCard>
    );
    expect(getByText('Test')).toBeTruthy();
  });

  it('applies dark variant when dark prop is true', () => {
    const { getByTestId } = render(
      <GlassCard dark><Text>Test</Text></GlassCard>
    );
    // Test dark variant styles
  });
});
```

---

## Component Priority

### Phase 1: Core Components (Week 2)
1. GlassCard
2. RedGradientButton
3. BottomDock
4. GlassInput

### Phase 2: Display Components (Week 3)
5. CircularProgress
6. TabButton
7. ActionButton
8. Breadcrumb

### Phase 3: Content Components (Week 4)
9. RecentItem
10. VideoGridItem
11. CopyButton
12. StatusBar
