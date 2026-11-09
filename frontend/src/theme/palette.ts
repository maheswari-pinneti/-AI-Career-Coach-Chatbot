import { PaletteOptions } from '@mui/material/styles';
import { colors } from './tokens/colors';

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: colors.primary[600],
    light: colors.primary[400],
    dark: colors.primary[700],
    contrastText: colors.primary.contrastText,
  },
  secondary: {
    main: colors.secondary[600],
    light: colors.secondary[400],
    dark: colors.secondary[800],
    contrastText: colors.secondary.contrastText,
  },
  success: {
    main: colors.success[500],
    light: colors.success[300],
    dark: colors.success[700],
    contrastText: colors.success.contrastText,
  },
  warning: {
    main: colors.warning[500],
    light: colors.warning[300],
    dark: colors.warning[700],
    contrastText: colors.warning.contrastText,
  },
  error: {
    main: colors.error[500],
    light: colors.error[300],
    dark: colors.error[700],
    contrastText: colors.error.contrastText,
  },
  info: {
    main: colors.info[500],
    light: colors.info[300],
    dark: colors.info[700],
    contrastText: colors.info.contrastText,
  },
  background: {
    default: colors.light.bgDefault,
    paper: colors.light.bgPaper,
  },
  text: {
    primary: colors.light.textPrimary,
    secondary: colors.light.textSecondary,
    disabled: colors.light.textDisabled,
  },
  divider: colors.light.border,
  action: {
    hover: 'rgba(15, 23, 42, 0.04)',
    selected: 'rgba(79, 70, 229, 0.08)',
    focus: 'rgba(79, 70, 229, 0.12)',
  },
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: colors.primary[500],
    light: colors.primary[300],
    dark: colors.primary[700],
    contrastText: colors.primary.contrastText,
  },
  secondary: {
    main: colors.secondary[500],
    light: colors.secondary[300],
    dark: colors.secondary[700],
    contrastText: colors.secondary.contrastText,
  },
  success: {
    main: colors.success[400],
    light: colors.success[200],
    dark: colors.success[600],
    contrastText: colors.success.contrastText,
  },
  warning: {
    main: colors.warning[400],
    light: colors.warning[200],
    dark: colors.warning[600],
    contrastText: colors.warning.contrastText,
  },
  error: {
    main: colors.error[400],
    light: colors.error[200],
    dark: colors.error[600],
    contrastText: colors.error.contrastText,
  },
  info: {
    main: colors.info[400],
    light: colors.info[200],
    dark: colors.info[600],
    contrastText: colors.info.contrastText,
  },
  background: {
    default: colors.dark.bgDefault,
    paper: colors.dark.bgPaper,
  },
  text: {
    primary: colors.dark.textPrimary,
    secondary: colors.dark.textSecondary,
    disabled: colors.dark.textDisabled,
  },
  divider: colors.dark.border,
  action: {
    hover: 'rgba(255, 255, 255, 0.05)',
    selected: 'rgba(99, 102, 241, 0.16)',
    focus: 'rgba(99, 102, 241, 0.24)',
  },
};
