import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { radiiTokens } from './tokens/radii';
import { breakpointTokens } from './tokens/breakpoints';
import { lightShadows, darkShadows } from './tokens/shadows';
import { ThemeMode } from '../types';

export const createAppTheme = (mode: ThemeMode): Theme => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  const isDark = mode === 'dark';
  const customShadows = isDark ? darkShadows : lightShadows;

  let theme = createTheme({
    palette,
    typography,
    breakpoints: breakpointTokens,
    shape: {
      borderRadius: parseInt(radiiTokens.lg, 10), // 12px
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            scrollBehavior: 'smooth',
          },
          body: {
            backgroundColor: palette.background?.default,
            color: palette.text?.primary,
            overflowX: 'hidden',
          },
          // Accessibility: Reduced motion support
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
          // Accessibility: High contrast focus visible rings
          ':focus-visible': {
            outline: `2px solid ${isDark ? '#818cf8' : '#4f46e5'}`,
            outlineOffset: '2px',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: radiiTokens.md,
            padding: '8px 18px',
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:active': {
              transform: 'scale(0.98)',
            },
          },
          containedPrimary: {
            boxShadow: customShadows.xs,
            '&:hover': {
              boxShadow: customShadows.sm,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            transition: 'box-shadow 200ms ease, border-color 200ms ease',
          },
          rounded: {
            borderRadius: radiiTokens.lg,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radiiTokens.lg,
            border: `1px solid ${palette.divider}`,
            boxShadow: customShadows.xs,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: customShadows.sm,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radiiTokens.xl,
            boxShadow: customShadows.dialog,
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${palette.divider}`,
            backdropFilter: 'blur(8px)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radiiTokens.sm,
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radiiTokens.md,
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#6366f1' : '#4f46e5',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: palette.action?.hover,
            '& th': {
              fontWeight: 600,
              color: palette.text?.secondary,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 150ms ease',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#0f172a',
            color: '#f8fafc',
            fontSize: '0.75rem',
            borderRadius: radiiTokens.sm,
            boxShadow: customShadows.dropdown,
            padding: '6px 10px',
          },
          arrow: {
            color: isDark ? '#1e293b' : '#0f172a',
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
};
