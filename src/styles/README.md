# Centralized Styling System

This project uses a centralized styling system to ensure consistent UI across all components and screens.

## Files Structure

```
src/styles/
├── colors.js          # Color palette
├── theme.js           # Main theme system
└── README.md          # This guide

src/components/ui/
└── ThemedComponents.js # Pre-styled component library
```

## Usage

### 1. Import the Theme

```javascript
import { theme } from '../styles/theme';
```

### 2. Use Theme Colors

```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.primary,
  },
});
```

### 3. Use Theme Spacing

```javascript
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
  },
});
```

### 4. Use Themed Components

```javascript
import { themed } from '../components/ui/ThemedComponents';

// Instead of:
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
  <TouchableOpacity style={styles.button}>
    <Text style={styles.buttonText}>Button</Text>
  </TouchableOpacity>
</View>

// Use:
<themed.Container>
  <themed.Text variant="title">Title</themed>
  <themed.Button onPress={handlePress}>
    Press Me
  </themed.Button>
</themed.Container>
```

## Available Themed Components

### Container Components
- `themed.Container` - Main container with background color
- `themed.Container` (secondary) - Secondary background
- `themed.Card` - Standard card
- `themed.Card` (glass) - Glass effect card
- `themed.GlassContainer` - Glass container with intensity levels

### Text Components
- `themed.Text` - Text with variants: title, subtitle, body, caption

### Button Components
- `themed.Button` - Button with variants: primary, secondary, accent, ghost

### Layout Components
- `themed.Row` - Horizontal layout (between, center options)
- `themed.Column` - Vertical layout (center option)
- `themed.Center` - Center content
- `themed.Spacer` - Add spacing (size and horizontal options)

### Input Components
- `themed.Input` - Styled text input

### Status Components
- `themed.StatusBadge` - Status badges (success, error, warning, info)
- `themed.Separator` - Visual separator (horizontal/vertical)

## Theme Structure

### Colors
```javascript
theme.colors = {
  primary: '#ff3366',
  accent: '#ffb020',
  background: '#0a0e1a',
  // ... more colors
}
```

### Spacing
```javascript
theme.spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64
}
```

### Typography
```javascript
theme.typography = {
  xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 28, xxxxl: 32
}
```

### Common Styles
```javascript
theme.styles = {
  container, card, button, title, subtitle, body, caption, input, // ... more
}
```

## Migration Guide

To migrate existing components to use the centralized theme:

### Before
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#ff3366',
    padding: 16,
    borderRadius: 12,
  },
});
```

### After
```javascript
import { themed } from '../components/ui/ThemedComponents';

// Use themed components directly
<themed.Container>
  <themed.Text variant="title">Title</themed.Text>
  <themed.Button onPress={handlePress}>
    Press Me
  </themed.Button>
</themed.Container>

// Or use theme with StyleSheet
const styles = StyleSheet.create({
  container: [
    theme.styles.container,
    theme.styles.p_md,
  ],
  title: theme.styles.title,
  button: theme.styles.buttonPrimary,
});
```

## Benefits

1. **Consistency**: All components use the same colors, spacing, and typography
2. **Maintainability**: Change styles in one place to update the entire app
3. **Developer Experience**: Pre-styled components reduce boilerplate code
4. **Theme Switching**: Easy to implement dark/light themes in the future
5. **Design System**: Proper spacing scale and design tokens

## Best Practices

1. Always import from the theme instead of hardcoding values
2. Use themed components when possible for consistency
3. Follow the spacing scale (xs, sm, md, lg, xl, xxl, xxxl)
4. Use appropriate text variants (title, subtitle, body, caption)
5. Choose button variants based on importance (primary, secondary, accent, ghost)
6. Use glass effects for modern, macOS-style UI elements
