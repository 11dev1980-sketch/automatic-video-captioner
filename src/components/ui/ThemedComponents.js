/**
 * Themed Component Library
 * Pre-styled components that use the centralized theme system
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

// Themed Container Component
export const ThemedContainer = ({ 
  children, 
  style, 
  secondary = false, 
  ...props 
}) => {
  const containerStyle = secondary 
    ? [theme.styles.containerSecondary, style]
    : [theme.styles.container, style];
    
  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

// Themed Card Component
export const ThemedCard = ({ 
  children, 
  style, 
  glass = false, 
  ...props 
}) => {
  const cardStyle = glass 
    ? [theme.styles.cardGlass, style]
    : [theme.styles.card, style];
    
  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

// Themed Button Component
export const ThemedButton = ({ 
  children, 
  onPress, 
  variant = 'primary', // primary, secondary, accent, ghost
  style, 
  textStyle,
  disabled = false,
  ...props 
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return theme.styles.buttonSecondary;
      case 'accent':
        return theme.styles.buttonAccent;
      case 'ghost':
        return theme.styles.buttonGhost;
      default:
        return theme.styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
      case 'ghost':
        return theme.styles.buttonTextSecondary;
      default:
        return theme.styles.buttonText;
    }
  };

  const buttonStyle = [
    theme.styles.button,
    getButtonStyle(),
    disabled && { opacity: 0.5 },
    style,
  ];

  const buttonTextStyle = [
    getTextStyle(),
    disabled && { opacity: 0.7 },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={buttonTextStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

// Themed Text Components
export const ThemedText = ({ 
  children, 
  variant = 'body', // title, subtitle, body, caption
  style, 
  ...props 
}) => {
  const getTextStyle = () => {
    switch (variant) {
      case 'title':
        return theme.styles.title;
      case 'subtitle':
        return theme.styles.subtitle;
      case 'caption':
        return theme.styles.caption;
      default:
        return theme.styles.body;
    }
  };

  return (
    <Text style={[getTextStyle(), style]} {...props}>
      {children}
    </Text>
  );
};

// Themed Input Component
export const ThemedInput = ({ 
  style, 
  focused = false,
  ...props 
}) => {
  const inputStyle = [
    theme.styles.input,
    focused && theme.styles.inputFocused,
    style,
  ];

  return (
    <TextInput
      style={inputStyle}
      placeholderTextColor={theme.colors.textMuted}
      {...props}
    />
  );
};

// Themed Layout Components
export const ThemedRow = ({ 
  children, 
  between = false, 
  center = false,
  style, 
  ...props 
}) => {
  const getRowStyle = () => {
    if (between) return theme.styles.rowBetween;
    if (center) return theme.styles.rowCenter;
    return theme.styles.row;
  };

  return (
    <View style={[getRowStyle(), style]} {...props}>
      {children}
    </View>
  );
};

export const ThemedColumn = ({ 
  children, 
  center = false,
  style, 
  ...props 
}) => {
  const columnStyle = center 
    ? theme.styles.columnCenter 
    : theme.styles.column;

  return (
    <View style={[columnStyle, style]} {...props}>
      {children}
    </View>
  );
};

// Themed Status Badge Component
export const ThemedStatusBadge = ({ 
  children, 
  status = 'info', // success, error, warning, info
  style, 
  ...props 
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'success':
        return theme.styles.success;
      case 'error':
        return theme.styles.error;
      case 'warning':
        return theme.styles.warning;
      default:
        return theme.styles.info;
    }
  };

  return (
    <View style={[
      {
        backgroundColor: getStatusStyle().backgroundColor,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        minWidth: 60,
        alignItems: 'center',
      },
      style
    ]} {...props}>
      <Text style={[
        {
          color: getStatusStyle().color,
          fontSize: theme.typography.sm,
          fontWeight: theme.typography.medium,
        }
      ]}>
        {children}
      </Text>
    </View>
  );
};

// Themed Separator Component
export const ThemedSeparator = ({ 
  style, 
  horizontal = true,
  ...props 
}) => {
  const separatorStyle = horizontal
    ? {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.sm,
      }
    : {
        width: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.sm,
      };

  return (
    <View style={[separatorStyle, style]} {...props} />
  );
};

// Themed Glass Container Component
export const ThemedGlassContainer = ({ 
  children, 
  intensity = 'medium', // light, medium, heavy
  style, 
  ...props 
}) => {
  const getGlassStyle = () => {
    switch (intensity) {
      case 'light':
        return theme.glassEffects.light;
      case 'heavy':
        return theme.glassEffects.heavy;
      default:
        return theme.glassEffects.medium;
    }
  };

  return (
    <View style={[getGlassStyle(), style]} {...props}>
      {children}
    </View>
  );
};

// Utility Components
export const ThemedSpacer = ({ size = 'md', horizontal = false }) => {
  const spacing = theme.spacing[size] || theme.spacing.md;
  const style = horizontal 
    ? { width: spacing }
    : { height: spacing };

  return <View style={style} />;
};

export const ThemedCenter = ({ children, style, ...props }) => (
  <View style={[theme.styles.center, style]} {...props}>
    {children}
  </View>
);

// Export all components
export const themed = {
  Container: ThemedContainer,
  Card: ThemedCard,
  Button: ThemedButton,
  Text: ThemedText,
  Input: ThemedInput,
  Row: ThemedRow,
  Column: ThemedColumn,
  StatusBadge: ThemedStatusBadge,
  Separator: ThemedSeparator,
  GlassContainer: ThemedGlassContainer,
  Spacer: ThemedSpacer,
  Center: ThemedCenter,
};

export default themed;
