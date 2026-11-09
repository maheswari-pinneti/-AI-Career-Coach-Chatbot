/**
 * Design Tokens — Breakpoints
 * Validated against responsiveness spec:
 * 360px mobile, 390px mobile, 768px tablet, 1024px laptop, 1440px desktop, 1920px large desktop.
 */

export const breakpointTokens = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
    xxl: 1920,
  },
} as const;

export const mediaQuery = {
  mobileXs: '@media (max-width: 389px)', // 360px
  mobileSm: '@media (max-width: 599px)', // 390px
  tablet: '@media (min-width: 600px) and (max-width: 899px)', // 768px
  laptop: '@media (min-width: 900px) and (max-width: 1199px)', // 1024px
  desktop: '@media (min-width: 1200px) and (max-width: 1535px)', // 1440px
  desktopLg: '@media (min-width: 1536px)', // 1920px
} as const;
