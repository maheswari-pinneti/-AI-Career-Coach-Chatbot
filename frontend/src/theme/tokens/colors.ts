/**
 * Design Tokens — Colors
 * Primary: Indigo/Violet
 * Secondary: Blue
 * Neutral Backgrounds: Pure & Warm Whites / Charcoal
 * Feedback: Success (Green), Warning (Amber), Error (Red)
 */

export const colors = {
  // Brand Primary (Indigo/Violet)
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Primary brand base
    600: '#4f46e5', // Primary main
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    contrastText: '#ffffff',
  },

  // Secondary Accent (Sky / Blue)
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Secondary brand base
    600: '#0284c7', // Secondary main
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    contrastText: '#ffffff',
  },

  // Feedback Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Success main
    600: '#059669',
    700: '#047857',
    contrastText: '#ffffff',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Warning main
    600: '#d97706',
    700: '#b45309',
    contrastText: '#0f172a',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Error main
    600: '#dc2626',
    700: '#b91c1c',
    contrastText: '#ffffff',
  },

  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0284c7', // Info main
    600: '#0369a1',
    700: '#075985',
    contrastText: '#ffffff',
  },

  // Neutrals (Slate / Gray)
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Dark Charcoal palette
  dark: {
    bgDefault: '#0b0f19', // Main viewport background
    bgPaper: '#111827',   // Surface / Card background
    bgSubtle: '#1e293b',  // Hover / sub-layer
    border: '#1f2937',    // Card & divider borders
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
  },

  // Light Palette
  light: {
    bgDefault: '#f8fafc', // Main viewport background
    bgPaper: '#ffffff',   // Surface / Card background
    bgSubtle: '#f1f5f9',  // Hover / sub-layer
    border: '#e2e8f0',    // Card & divider borders
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textDisabled: '#94a3b8',
  },
} as const;
