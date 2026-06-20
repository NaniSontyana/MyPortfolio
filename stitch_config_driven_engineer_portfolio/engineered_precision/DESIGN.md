---
name: Engineered Precision
colors:
  surface: '#12131a'
  surface-dim: '#12131a'
  surface-bright: '#383941'
  surface-container-lowest: '#0d0e15'
  surface-container-low: '#1a1b22'
  surface-container: '#1e1f26'
  surface-container-high: '#292931'
  surface-container-highest: '#33343c'
  on-surface: '#e3e1ec'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e3e1ec'
  inverse-on-surface: '#2f3038'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#c9c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#12131a'
  on-background: '#e3e1ec'
  surface-variant: '#33343c'
typography:
  display:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 96px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

This design system is built for high-performance software engineering portfolios, prioritizing technical precision, clarity, and a sophisticated aesthetic. It draws inspiration from the industry-leading interfaces of Vercel, Stripe, and Linear, blending ultra-functional minimalism with premium "developer-first" visual cues.

The style is characterized by:
- **Atmospheric Depth:** Using subtle gradients and backdrop blurs to create a sense of three-dimensional space without visual clutter.
- **Micro-Detailing:** Focus on 1px borders, subtle inner glows, and refined typography to signal high-quality craftsmanship.
- **Functional Professionalism:** A layout that feels like a high-end dashboard—efficient, organized, and intentional.

The target audience consists of hiring managers, technical founders, and fellow engineers who value performance and obsessive attention to detail.

## Colors

The palette is anchored in a "True Dark" philosophy. By using absolute black (#000000) for the primary background, we achieve infinite contrast ratios on OLED displays and create a canvas where content feels like it's floating.

- **Primary (Electric Violet):** Used sparingly for interactive elements, focus states, and key call-to-actions to ensure they pop against the dark backdrop.
- **Surface Tiers:** We use a hierarchy of deep charcoals to define depth. Surfaces "lift" from the background by becoming slightly lighter.
- **Borders:** Instead of solid grays, we utilize low-opacity white (8-12%) for borders. This allows background colors/gradients to bleed through slightly, maintaining a "glass" feel.
- **Text:** High-contrast white for headers, transitioning to muted zinc/gray for secondary information to reduce cognitive load.

## Typography

This design system utilizes **Geist** for its core identity—a typeface designed specifically for developers and designers who value legibility and geometric purity. 

- **Display & Headlines:** Use tight letter-spacing (-0.02em to -0.04em) and heavy weights to create a commanding presence. Headlines should use a "balance" text-wrap to avoid awkward orphans.
- **Body Text:** Standard weight (400) with generous line-height (1.6) ensures long-form case studies remain readable.
- **Technical Labels:** **JetBrains Mono** is introduced for metadata, tags, and code snippets. This provides a clear visual distinction between narrative content and technical data.

## Layout & Spacing

The layout follows a rigorous 4px grid system to ensure mathematical harmony. 

- **Grid Model:** A 12-column fluid grid for desktop with a maximum container width of 1200px. For portfolio work, use asymmetrical layouts (e.g., a 4-column sidebar with an 8-column content area) to mimic modern SaaS dashboards.
- **Whitespace:** We embrace "negative space" as a luxury. Use `xxl` (96px) spacing between major sections to allow the eye to rest and emphasize the importance of each project.
- **Mobile Adaptation:** On mobile, margins reduce to `md` (16px) and the grid collapses to a single column. All interactive targets maintain a minimum height of 44px for accessibility.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

1.  **Level 0 (Base):** Absolute Black (#000000).
2.  **Level 1 (Cards/Sections):** Surface (#0A0A0A) with a 1px border of `rgba(255, 255, 255, 0.08)`.
3.  **Level 2 (Modals/Popovers):** Surface-elevated (#171717) with a subtle `Backdrop Blur` (20px).

**Shadows:** Use a single, highly diffused "Ambient Glow" for elevated elements.
- *Shadow Token:* `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)`.
The inclusion of a 1px inner stroke within the shadow makes the element feel physically present in a dark environment.

## Shapes

The shape language is "Modern Rounded," utilizing large corner radii to soften the technical nature of the content and create a premium, approachable feel.

- **Standard Components:** Buttons and inputs use a 0.5rem (8px) radius.
- **Content Containers:** Cards and project modules use `radius_2xl` (16px) for a distinct "Stripe-like" container feel.
- **Feature Hero Blocks:** Use `radius_3xl` (24px) for large hero sections or featured image wrappers to create high visual impact.

## Components

### Buttons
- **Primary:** Solid Electric Violet background, white text. No border. On hover: subtle brightness increase and a soft violet outer glow.
- **Secondary:** Transparent background with the 1px white-opacity border. On hover: background becomes `rgba(255, 255, 255, 0.05)`.

### Glassmorphic Cards
- Background: `rgba(10, 10, 10, 0.7)`.
- Filter: `backdrop-filter: blur(12px)`.
- Border: 1px solid `rgba(255, 255, 255, 0.1)`.
- Transition: 200ms ease-out. On hover, the border opacity should increase to 0.2.

### Input Fields
- Darkest charcoal background with a 1px border. Focus state: border changes to Electric Violet with a 2px outer ring of the same color at 20% opacity.

### Chips / Badges
- Small, uppercase labels using **JetBrains Mono**. Background should be `accent-soft` with violet text to denote technical tags (e.g., "REACT", "TYPESCRIPT").

### Micro-interactions
- Use a "Spring" preset for all hover states (stiffness: 400, damping: 25).
- Interactive elements should have a slight "lift" effect (translateY: -2px) on hover to signify depth.