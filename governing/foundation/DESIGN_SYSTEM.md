# The Experience Platform
## Design System

**Status**: Published  
**Version**: 1.0.0  
**Date**: 2026-07-08  
**Repository**: https://github.com/ITTYBITTYBITES/ITTYBITTYBITES.github.io  

---

## Purpose

This document defines the visual and interaction language of the platform.

It is the single source of truth for how the platform looks and feels.

---

## 1. Design Tokens

### Spacing & Layout
We use an 8px base spacing scale.
- `--space-1`: 0.25rem (4px)
- `--space-2`: 0.5rem (8px)
- `--space-3`: 0.75rem (12px)
- `--space-4`: 1rem (16px)
- `--space-6`: 1.5rem (24px)
- `--space-8`: 2rem (32px)
- `--space-12`: 3rem (48px)
- `--measure`: 65ch (optimal reading width)

### Typography
- **Sans**: System-ui stack (clean, legible, native)
- **Mono**: System-mono stack (for code and technical data)
- **Hero Title**: Responsive `clamp(2.5rem, 5vw, 4rem)`
- **Lead Text**: `1.25rem`

### Shape
- `--radius`: 0.25rem (4px)
- `--radius-lg`: 0.5rem (8px)

### Elevation
- `--shadow-sm`: Subtle depth for cards on hover.
- `--shadow-md`: Medium depth for dropdowns and navigation.
- `--shadow-lg`: Deep shadow for search results and overlays.

### Motion
- `--duration-fast`: 100ms (Immediate feedback, transforms)
- `--duration-mid`: 150ms (Button transitions, small UI changes)
- `--duration-base`: 200ms (Standard view changes)
- `--duration-slow`: 300ms (Larger entrances)
- `--easing-standard`: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Color & Branding

### Platform Shell
The shell is intentionally neutral and respectful of content.
- `color-scheme`: Light and Dark supported via system colors.
- `Canvas` / `CanvasText`: Base colors.
- `AccentColor`: System-defined accent for focus and primary actions.

### ITTYBITTYBITES Branding
- **Logo/Brand**: Bold weight, `1.125rem`, no decoration.
- **Tone**: "Interactive collections worth returning to."

---

## 3. Collection Identity System

Each collection has a unique visual theme applied to its container.

| Collection | Icon | Primary Color | Gradient Start |
|------------|------|---------------|----------------|
| Foundations| 🏛️ | #6B7280 | #F9FAFB |
| History | 📜 | #92400E | #FEF3C7 |
| Science | 🔬 | #1E40AF | #DBEAFE |
| Nature | 🌿 | #065F46 | #D1FAE5 |
| Creativity | 🎨 | #7C2D12 | #FEF3C7 |
| Engineering| ⚙️ | #1E3A8A | #EFF6FF |

---

## 4. Accessibility Standards

- **WCAG 2.2 AA Baseline**
- **Keyboard**: Skip links provided, focus management on route changes, `:focus-visible` enforced.
- **Motion**: `prefers-reduced-motion` resets all animations to 0.01ms.
- **Contrast**: `prefers-contrast: more` increases border weights.
- **Touch**: Mobile touch targets at `min-height: 3rem` (48px).

---

## 5. Components

- **Cards**: Surface information with subtle hover transitions.
- **Buttons**: Accessible touch targets with distinct Primary and Subtle variants.
- **Badges**: Status indicators for completion and progress.
- **Search**: Instant-filtering input with high-elevation results overlay.

---

**Last Audit: 2026-07-08**  
**Compliance: 100% (Tokens finalized)**
