---
name: LexiLearn Leitner SRS
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-focus, low-friction cognitive environment for rigorous language acquisition and spaced repetition system (SRS) memorization. Engineered specifically for thumb-driven mobile ergonomics, the aesthetic blends utilitarian clarity with tactile feedback loops.

The visual style merges modern precision with restrained deep-canvas elevation: crisp translucent borders define bounds on top of layered obsidian surfaces, while vibrant chromatic indicators (emerald, amber, and indigo) signal retention status, confidence thresholds, and review cadences without introducing visual fatigue during lengthy study sessions. Interfaces feel responsive, kinetic, and mathematically ordered.

## Colors

The palette is engineered around dark-mode visual hierarchy and immediate state attribution:

- **Primary Canvas & Surfaces**: Deep slate (`#0F172A`) forms the base viewport canvas, layered with elevated surface slate (`#1E293B`) for interactive cards, sheets, and persistent bars. Sub-surfaces use `#334155` for active states and subtle divider boundaries.
- **Accents & Progression**:
  - `Indigo Accent` (`#6366F1`): Primary actions, study progression markers, focus highlights, and system-level cues.
  - `Emerald Success` (`#10B981`): Correct retention, graduation to higher Leitner boxes, and mastered vocabulary streaks.
  - `Amber Warning` (`#F59E0B`): Hesitation states, review-due prompts, and mid-tier Leitner box retention tiers.
  - `Red Error` (`#EF4444`): Lapse indicators, box demotions, and forgotten word resets.
- **Typography & Content Hierarchy**: Primary high-contrast readability is maintained via main text (`#F8FAFC`), muted descriptive text (`#94A3B8`), and disabled state slate (`#64748B`).

## Typography

The type scale combines **Plus Jakarta Sans** for structural headers and lexical hero words with **Inter** for phonetic transcriptions, grammatical annotations, sample contexts, and interaction labels. 

Large vocabulary display words are set with tightened tracking (`-0.02em`) to maintain geometric density on flashcard fronts. Secondary definitions and sentence examples utilize Inter's tabular-friendly and highly legible body scales to prevent eye fatigue over extended study periods.

## Layout & Spacing

The layout is optimized for single-handed mobile usage. Primary interactive targets (flip trigger, rating answers, box reassignment) are clustered within the bottom 40% of the viewport (the thumb zone).

- **Grid & Safe Regions**: A single-column fluid card layout on mobile with standard `1rem` (16px) margins and gutters, adjusting to centered fixed-width content containers (`max-w-md`) on larger viewports to preserve card proportions.
- **Vertical Rhythm**: Spacing scales strictly along a 4px-derived baseline. Structural component gaps favor `space-md` (16px) and `space-lg` (24px), preserving visual distinction between the active flashcard surface and persistent session controls.

## Elevation & Depth

Visual depth is built through structured surface steps combined with translucent crisp outlines rather than heavy drop shadows:

- **Canvas Base**: `#0F172A` provides the absolute floor.
- **Card Tier 1**: `#1E293B` paired with a 1px border of `rgba(255, 255, 255, 0.08)` to deliver sharp edge definition against dark backgrounds.
- **Floating Controls & Modals**: `#334155` with an ambient glow (`box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5)`) and a refined border of `rgba(255, 255, 255, 0.12)`.
- **Card State Feedback**: Selected or actively swiped cards emit subtle chromatic rim glows matching their status (e.g., `#10B981` at 20% opacity for retention promotions, `#EF4444` at 20% opacity for box demotions).

## Shapes

The interface employs a balanced rounded aesthetic (Level 2), grounding the systematic nature of spaced repetition with organic, approachable tactile touchpoints:

- **Cards & Surfaces**: Set to `rounded-xl` (1.5rem / 24px) to mimic physical tactile study cards.
- **Action Buttons & Inputs**: Standardized to `rounded-lg` (1rem / 16px) for distinct target clarity.
- **Pill Badges & Counters**: Pill-shaped (`border-radius: 9999px`) for Leitner box tags, difficulty chips, and streak indicators.

## Components

### Vocabulary Flashcards
- **Structure**: Multi-sided container set on `#1E293B` with 1px border `rgba(255, 255, 255, 0.08)` and `rounded-xl` (24px) corners.
- **Dimensions**: Min-height of 360px on mobile, responsive full-width minus margins.
- **Interaction**: Tap-to-flip trigger with clean flip physics, or dual swipe gesture with visual indicator thresholds.

### Leitner 5-Stage Progress Indicator
- **Geometry**: Horizontal cluster of 5 segmented pill containers representing Boxes 1 through 5.
- **States**:
  - Inactive/Empty: Background `rgba(51, 65, 85, 0.4)`, border 1px solid `rgba(255, 255, 255, 0.05)`.
  - Active/Occupied: Filled dynamically across the 5 stages: Box 1 (Red/Demotion), Box 2 & 3 (Amber/Review), Box 4 & 5 (Emerald/Mastery).
  - Current Box Target: Highlighted with an indigo or stage-colored pulse ring (`ring-2 ring-offset-2 ring-offset-[#0F172A]`).

### Ergonomic Action Buttons
- **Touch Target**: Minimum height 54px to satisfy thumb ergonomics.
- **Primary**: Solid `#6366F1` background, `#F8FAFC` text, soft hover/pressed scale animation (`scale-98`).
- **SRS Scoring Buttons**: 3-button or 4-button horizontal bottom row (Again, Hard, Good, Easy) color-coded with semantic undertones (Red, Amber, Emerald, Indigo) utilizing elevated slate surfaces and colored borders.

### Pill Badges & Chips
- **Geometry**: Fully rounded pill shapes (`rounded-full`), padding `0.25rem 0.75rem`.
- **Styling**: Semi-transparent background fills (e.g., `rgba(99, 102, 241, 0.15)`) with matching 1px border and high-contrast text label (`label-sm` or `label-md`).

### Form Inputs & Text Fields
- **Background**: `#0F172A` set into `#1E293B` containers, border 1px `rgba(255, 255, 255, 0.12)`.
- **Focus**: Transitions to border `#6366F1` with an ambient indigo ring (`ring-1 ring-[#6366F1]`). Height is locked to 48px minimum.