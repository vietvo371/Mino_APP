import { StyleSheet } from 'react-native';
import { theme } from './colors';

export const componentStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.layout.containerPadding,
  },
  containerDark: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
    paddingHorizontal: theme.layout.containerPadding,
  },

  // Card Styles
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardDark: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },

  // Button Styles
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.yellow,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.transparent,
    borderRadius: theme.borderRadius.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semibold,
  },
  buttonTextSecondary: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semibold,
  },

  // Input Styles
  input: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  inputDark: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textDark,
    backgroundColor: theme.colors.secondary,
  },

  // Text Styles
  heading1: {
    fontSize: theme.typography.fontSize['4xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  heading2: {
    fontSize: theme.typography.fontSize['3xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  heading3: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  body: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.normal,
  },
  caption: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textLight,
    lineHeight: theme.typography.lineHeight.normal,
  },

  // Header Styles
  header: {
    height: theme.layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.containerPadding,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  headerDark: {
    height: theme.layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.containerPadding,
    backgroundColor: theme.colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
  },

  // Bottom Tab Styles
  bottomTab: {
    height: theme.layout.bottomTabHeight,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  bottomTabDark: {
    height: theme.layout.bottomTabHeight,
    backgroundColor: theme.colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDark,
  },

  // Modal Styles
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    minHeight: 200,
  },
  modalContentDark: {
    backgroundColor: theme.colors.secondary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    minHeight: 200,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },

  // Loading & Status Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
});
