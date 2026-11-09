import { TypographyOptions } from '@mui/material/styles/createTypography';
import { typographyTokens } from './tokens/typography';

export const typography: TypographyOptions = {
  fontFamily: typographyTokens.fontFamily.primary,
  h1: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.bold,
    fontSize: typographyTokens.fontSize['4xl'],
    lineHeight: typographyTokens.lineHeight.tight,
    letterSpacing: typographyTokens.letterSpacing.tight,
  },
  h2: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.bold,
    fontSize: typographyTokens.fontSize['3xl'],
    lineHeight: typographyTokens.lineHeight.tight,
    letterSpacing: typographyTokens.letterSpacing.tight,
  },
  h3: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.semiBold,
    fontSize: typographyTokens.fontSize['2xl'],
    lineHeight: typographyTokens.lineHeight.snug,
    letterSpacing: typographyTokens.letterSpacing.tight,
  },
  h4: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.semiBold,
    fontSize: typographyTokens.fontSize.xl,
    lineHeight: typographyTokens.lineHeight.snug,
  },
  h5: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.semiBold,
    fontSize: typographyTokens.fontSize.lg,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  h6: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.semiBold,
    fontSize: typographyTokens.fontSize.md,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  subtitle1: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.medium,
    fontSize: typographyTokens.fontSize.base,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  subtitle2: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.medium,
    fontSize: typographyTokens.fontSize.sm,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  body1: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.regular,
    fontSize: typographyTokens.fontSize.base,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  body2: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.regular,
    fontSize: typographyTokens.fontSize.sm,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  caption: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.regular,
    fontSize: typographyTokens.fontSize.xs,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  button: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontWeight: typographyTokens.fontWeight.semiBold,
    fontSize: typographyTokens.fontSize.sm,
    textTransform: 'none',
    letterSpacing: typographyTokens.letterSpacing.normal,
  },
};
