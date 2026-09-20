/**
 * Centralized Theme System
 * Provides consistent styling across all components and screens
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';

// Base spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Base typography scale
export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  xxxxl: 32,
  
  // Font weights
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  
  // Font families (platform-specific)
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

// Border radius scale
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
};

// Shadow styles for depth
export const shadows = {
  none: {
    elevation: 0,
    boxShadow: 'none',
  },
  sm: {
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  md: {
    elevation: 6,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  },
  lg: {
    elevation: 10,
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
  },
  xl: {
    elevation: 15,
    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25)',
  },
};

// Glass effect styles
export const glassEffects = {
  light: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.sm,
  },
  medium: {
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.md,
  },
  heavy: {
    backgroundColor: colors.glassHover,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.lg,
  },
};

// Common component styles
export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerSecondary: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardGlass: {
    ...glassEffects.medium,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  
  // Button styles
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    ...shadows.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  buttonAccent: {
    backgroundColor: colors.accent,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Button text styles
  buttonText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  buttonTextSecondary: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  
  // Text styles
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.lg,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.md,
    fontWeight: typography.normal,
    color: colors.text,
    lineHeight: 22,
  },
  caption: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    color: colors.textTertiary,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.md,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  // Status styles
  success: {
    backgroundColor: colors.success,
    color: colors.white,
  },
  error: {
    backgroundColor: colors.error,
    color: colors.white,
  },
  warning: {
    backgroundColor: colors.warning,
    color: colors.white,
  },
  info: {
    backgroundColor: colors.info,
    color: colors.white,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Spacing utilities
  m_xs: { margin: spacing.xs },
  m_sm: { margin: spacing.sm },
  m_md: { margin: spacing.md },
  m_lg: { margin: spacing.lg },
  m_xl: { margin: spacing.xl },
  
  mt_xs: { marginTop: spacing.xs },
  mt_sm: { marginTop: spacing.sm },
  mt_md: { marginTop: spacing.md },
  mt_lg: { marginTop: spacing.lg },
  mt_xl: { marginTop: spacing.xl },
  
  mb_xs: { marginBottom: spacing.xs },
  mb_sm: { marginBottom: spacing.sm },
  mb_md: { marginBottom: spacing.md },
  mb_lg: { marginBottom: spacing.lg },
  mb_xl: { marginBottom: spacing.xl },
  
  p_xs: { padding: spacing.xs },
  p_sm: { padding: spacing.sm },
  p_md: { padding: spacing.md },
  p_lg: { padding: spacing.lg },
  p_xl: { padding: spacing.xl },
  
  // Utility styles
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  flex1: {
    flex: 1,
  },
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  hidden: {
    display: 'none',
  },
});

// Theme object for easy access
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  glassEffects,
  styles: commonStyles,
};

export default theme;
