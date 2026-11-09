# 03 — Frontend Setup & Design System Guide

## Overview

The AI Career Coach frontend is built with **React 18**, **TypeScript 5 (Strict Mode)**, **Vite 5**, and a custom-architected design system implemented on top of **Material UI v5**.

---

## Design System & Token Hierarchy

The design system is centralized in `src/theme/tokens/`:

| Token Group | File | Description |
|---|---|---|
| **Colors** | `colors.ts` | Primary (Indigo/Violet), Secondary (Blue), Neutral White, Charcoal Dark (`#0b0f19`, `#111827`), Success, Warning, Error. |
| **Typography** | `typography.ts` | Inter & Plus Jakarta Sans, 400/500/600/700/800 font weights, strict heading hierarchy (h1 through h6). |
| **Spacing** | `spacing.ts` | 4px baseline system (`4px` to `96px`). |
| **Border Radii** | `radii.ts` | `4px`, `6px`, `8px`, `12px`, `16px`, `24px`, `9999px` (pill). |
| **Shadows** | `shadows.ts` | Tailored elevation shadows for both light mode and charcoal dark mode. |
| **Breakpoints** | `breakpoints.ts` | `xs: 0`, `sm: 600`, `md: 900`, `lg: 1200`, `xl: 1536`, `xxl: 1920`. Tested against 360px, 390px, 768px, 1024px, 1440px, 1920px. |

---

## 20 Reusable Atomic Components

All components are available from `src/components/common/`:

1. `AppButton`: Variants (`primary`, `secondary`, `outlined`, `ghost`, `danger`), loading spinner, left/right icons.
2. `AppInput`: Form control with labels, helper text, error state, and character counter.
3. `AppSelect`: Accessible dropdown selector with options and placeholder.
4. `AppTextarea`: Multiline input with row constraints and character counting.
5. `AppCard`: Clean card container with header, divider, content, and footer.
6. `AppDialog`: Accessible modal with focus trapping, mobile full-screen, title, and actions.
7. `AppDrawer`: Slide-in side drawer with header, body, and action footer.
8. `AppTabs`: Tab bar with notification badges and icons.
9. `AppTooltip`: Custom arrow tooltip with title and description support.
10. `AppBadge`: Semantic status chips (`subtle`, `solid`, `outlined`) across 7 color variants.
11. `AppAvatar`: User avatar with initials fallback and status dot (`online`, `offline`, `busy`, `away`).
12. `AppTable`: Responsive data table with hover rows and sort headers.
13. `AppPagination`: Pagination controls with page size selector.
14. `AppSearch`: Debounced search input with clear icon.
15. `AppFilter`: Interactive filter tag chips with clear-all trigger.
16. `AppSkeleton`: Loading skeletons for cards, tables, text, and dashboards.
17. `AppEmptyState`: Clean illustration, message, and call-to-action button.
18. `AppErrorState`: Error alert with retry button and collapsible technical details.
19. `AppToast`: Auto-dismissing slide-up snackbar alert.
20. `AppPageHeader`: Breadcrumb trail, title, subtitle, status chips, and action buttons.

---

## Verified Page Shells

| Route | Page Component | Category | Features |
|---|---|---|---|
| `/` | `DashboardPage` | Overview | Executive command center, hero banner, quick tools grid, system telemetry. |
| `/chat` | `ChatPage` | AI Career Tools | Interactive AI coach, chat history, prompt templates, copy action. |
| `/resume` | `ResumeAnalyzerPage` | AI Career Tools | Drag & drop upload, 88% ATS score breakdown, keyword matches, feedback tabs. |
| `/linkedin` | `LinkedInOptimizerPage` | AI Career Tools | Headline generator, summary enhancer, recruiter search keywords. |
| `/interview` | `InterviewPrepPage` | AI Career Tools | Role & seniority selectors, behavioral STAR question simulator, rubric score. |
| `/skills` | `SkillGapPage` | AI Career Tools | Role benchmark selector, competency gap matrix, accelerated bridge plan. |
| `/roadmap` | `RoadmapPage` | Career Management | Multi-stage learning timeline (Weeks 1–10) with progress tracking. |
| `/jobs` | `JobTrackerPage` | Career Management | Application pipeline table with status badges, search, filter tags, Add dialog. |
| `/analytics` | `AnalyticsPage` | Career Management | KPI summary metrics, weekly practice frequency chart, readiness line chart. |
| `/profile` | `ProfilePage` | Account | User identity card, career alignment form, avatar with status dot, save toast. |
| `/settings` | `SettingsPage` | Account | Dark mode switcher, password update, active sessions, AI provider choice, delete dialog. |
| `/help` | `HelpSupportPage` | Account | FAQs accordion, contact support form, documentation links. |
| `/health` | `HealthPage` | Telemetry | Live backend REST API health verification (`GET /api/v1/health`). |

---

## Verification Commands

```bash
cd frontend

# TypeScript strict type check
npx tsc --noEmit

# ESLint code quality
npm run lint

# Vitest component & shell tests
npm test

# Production bundle build
npm run build
```
