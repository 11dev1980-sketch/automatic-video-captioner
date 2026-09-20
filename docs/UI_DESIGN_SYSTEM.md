# UI Design System - Arabic Video Translator

## Executive Summary

**Objective:** Match the React/Vite web app design system for the React Native application.

**Target Design:** Dark-themed glass morphism with red accent color (#FF3B5C)

---

## Color Palette

### Primary Colors
```javascript
// src/styles/colors.js
export const colors = {
  // Primary accent (Red/Coral)
  primary: '#FF3B5C',
  
  // Background colors (Dark theme)
  background: '#0A0A0A',
  backgroundLight: '#1A1A1A',
  
  // Glass effect colors
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
  },
  
  // Semantic colors
  success: '#22C55E',
  blue: '#3B82F6',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Gradient colors
  gradient: {
    red: {
      start: '#FF3B5C',
      end: '#FF6B8A',
    },
  },
};
```

### Color Usage Guidelines

**Primary (#FF3B5C):**
- Active navigation items
- Progress indicators
- Call-to-action buttons
- Active tab states
- Accent elements

**Background (#0A0A0A):**
- Main app background
- Screen backgrounds
- Modal backgrounds

**Glass Effects:**
- Light (rgba(255, 255, 255, 0.05)): Subtle backgrounds
- Medium (rgba(255, 255, 255, 0.1)): Card backgrounds
- Dark (rgba(0, 0, 0, 0.3)): Navigation dock

**Text:**
- Primary: Headings, important text
- Secondary: Body text, descriptions
- Tertiary: Labels, secondary information

---

## Typography System

### Font Families
```javascript
export const fontFamily = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};
```

### Font Sizes
```javascript
export const fontSize = {
  xs: 12,    // Labels, buttons
  sm: 14,    // Secondary text
  base: 16,  // Body text
  lg: 18,    // Subheadings
  xl: 20,    // Section titles
  '2xl': 24, // Page titles
  '3xl': 30, // Large headings
  '4xl': 36, // Hero text
};
```

### Font Weights
```javascript
export const fontWeight = {
  regular: '400',
  medium: '500',
  bold: '700',
};
```

### Line Heights
```javascript
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};
```

### Typography Usage

**4xl (36px):** Hero greeting on Home screen
**3xl (30px):** Page titles
**2xl (24px):** Section titles
**xl (20px):** Card titles
**lg (18px):** Subtitles
**base (16px):** Body text, input fields
**sm (14px):** Descriptions
**xs (12px):** Labels, navigation text

---

## Spacing System

### Spacing Scale
```javascript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};
```

### Spacing Usage

**xs (4px):** Small gaps, icon padding
**sm (8px):** Icon margins, small gaps
**md (12px):** Button padding, moderate gaps
**lg (16px):** Card padding, standard gaps
**xl (24px):** Section margins, large gaps
**2xl (32px):** Container padding
**3xl (40px):** Large container padding
**4xl (48px):** Hero section padding

---

## Border Radius System

### Border Radius Scale
```javascript
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 40,
  full: 9999,
};
```

### Border Radius Usage

**sm (8px):** Small elements, badges
**md (12px):** Input fields, small buttons
**lg (16px):** Standard cards
**xl (24px):** Large cards
**2xl (28px):** Quick start cards
**3xl (32px):** Navigation dock
**4xl (40px):** Large feature cards
**full:** Circular elements, pills

---

## Glass Morphism Effects

### Glass Card Styles
```javascript
// Light glass (subtle backgrounds)
const glassLight = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
};

// Medium glass (card backgrounds)
const glassMedium = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.15)',
};

// Dark glass (navigation dock)
const glassDark = {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
};
```

### Blur Effects
```javascript
// Web (CSS)
backdrop-filter: blur(10px);

// React Native (with blur-view)
<BlurView blurType="dark" blurAmount={10} />
```

---

## Shadows

### Shadow Scale
```javascript
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};
```

---

## Icon System

### Icon Library
- **React Native:** React Native Vector Icons (Ionicons)
- **Web:** Lucide React

### Icon Sizes
```javascript
export const iconSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};
```

### Icon Usage
**xs (12px):** Copy button icons
**sm (14px):** Small indicators
**md (16px):** Standard icons
**lg (18px):** Action button icons
**xl (20px):** Navigation icons
**2xl (24px):** Large icons
**3xl (32px):** Feature icons
**4xl (48px):** Hero icons

---

## Animation System

### Transition Durations
```javascript
export const durations = {
  fast: 150,
  normal: 300,
  slow: 500,
};
```

### Easing Functions
```javascript
export const easings = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};
```

### Animation Types

**Page Transitions:**
- Slide from right (forward navigation)
- Slide from left (back navigation)
- Fade in/out
- Scale in/out

**Component Animations:**
- Button press (scale 0.98)
- Hover effects (opacity change)
- Progress bar (width change)
- Circular progress (stroke-dashoffset)

---

## Layout System

### Container Widths
```javascript
export const containerWidths = {
  full: '100%',
  '90%': '90%',
  '80%': '80%',
  md: 768,
  lg: 1024,
  xl: 1280,
};
```

### Grid System
```javascript
export const grid = {
  columns: {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
  },
  gap: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};
```

---

## Component Patterns

### Card Pattern
```javascript
// Standard glass card
<GlassCard style={padding: spacing.lg, borderRadius: borderRadius['2xl']}>
  {/* Content */}
</GlassCard>

// Dark glass card (navigation dock)
<GlassCard dark style={padding: spacing.md, borderRadius: borderRadius['3xl']}>
  {/* Content */}
</GlassCard>
```

### Button Pattern
```javascript
// Primary red gradient button
<RedGradientButton title="Action" onPress={handlePress} />

// Glass button (secondary)
<GlassButton title="Action" onPress={handlePress} />
```

### Input Pattern
```javascript
// Glass input field
<GlassInput
  placeholder="Enter text..."
  value={text}
  onChangeText={setText}
/>
```

---

## Responsive Design

### Breakpoints
```javascript
export const breakpoints = {
  small: 375,
  medium: 768,
  large: 1024,
};
```

### Responsive Utilities
```javascript
// Use hook
import { useResponsive } from '../hooks/useResponsive';

const { isSmall, isMedium, isLarge } = useResponsive();
```

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements have sufficient contrast
- Focus states are clearly visible

### Touch Targets
- Minimum touch target size: 44x44px
- Buttons: 56px minimum height
- Navigation items: 48x48px minimum

### Screen Reader
- All images have alt text
- Buttons have accessible labels
- Form fields have labels
- Semantic HTML elements used

---

## Design Tokens Summary

| Token Category | Values |
|----------------|--------|
| Colors | Primary, Background, Glass, Text, Semantic, Gradient |
| Typography | Font sizes 12-36px, Weights 400-700, Line heights 1.2-1.75 |
| Spacing | 4-48px scale |
| Border Radius | 8-40px + full |
| Shadows | Small, Medium, Large, Glow |
| Icons | 12-48px sizes |
| Animations | 150-500ms durations |
| Layout | Full width to 1280px |
| Grid | 1-4 columns, 8-24px gaps |
| Breakpoints | 375, 768, 1024px |

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Color palette implementation
2. Typography system
3. Spacing system
4. Border radius system
5. Shadow system

### Phase 2: Components (Week 2-3)
1. Glass card component
2. Red gradient button
3. Input fields
4. Navigation dock
5. Progress indicators

### Phase 3: Screens (Week 4-8)
1. Home screen redesign
2. Processing screen redesign
3. Results screen redesign
4. History screen redesign
5. Settings screen redesign

### Phase 4: Polish (Week 9-12)
1. Animations
2. Responsive design
3. Accessibility
4. Performance optimization
5. Testing
