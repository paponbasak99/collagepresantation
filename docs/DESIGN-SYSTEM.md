# DocBook Dark Clinical Green Design System

## 1. Overview & Philosophy
DocBook's **Dark Clinical Green** design system is engineered for high-consequence medical workflows in Dinajpur clinics and outpatient departments. It replaces distracting gradients, unstandardized colors, and heavy client-side animation runtimes with a calm, authoritative, high-performance interface.

### Core Principles
- **Clinical Precision**: High-contrast OLED black surfaces (`#000000`, `#0a0a0a`) paired with clinical surgical green accents (`#00984a`, `#007a3d`) inspire trust and minimize optical fatigue in diagnostic environments.
- **Zero Unnecessary Bloat**: No heavy external styling or 3D runtimes (removed Tailwind CDN and Three.js runtime). Native modern CSS variables, CSS grid/flexbox, and lightweight vanilla ES modules.
- **Inclusive Accessibility**: Strict WCAG 2.2 AA compliance across all components, supporting high-contrast focus rings, screen readers (`aria-*`), and bilingual typography (English + Bengali).
- **Tactile Feedback**: Every interactive control implements comprehensive states: Default, Hover, Focus-Visible, Active, Disabled, Loading, and Error.

---

## 2. Color Palette & Design Tokens

Defined centrally in [`public/css/tokens.css`](file:///c:/Users/basak/Downloads/Doctor%20Appointment%20Booking%20System/public/css/tokens.css).

### Primitives & Surfaces
| Token | Value | Purpose |
|---|---|---|
| `--color-bg-base` | `#000000` | True black base canvas & body background |
| `--color-bg-surface` | `#0a0a0a` | Primary elevation for cards, modals, sheets |
| `--color-bg-elevated` | `#141414` | Secondary elevation for dropdowns, tooltips |
| `--color-bg-subtle` | `#1c1c1c` | Hover highlights, inactive slot keys |
| `--color-border-subtle` | `#1f1f1f` | Default card and container borders |
| `--color-border-strong` | `#333333` | Interactive borders, dividers, table headers |

### Brand & Interactive Colors
| Token | Value | Contrast vs `#ffffff` | Purpose |
|---|---|---|---|
| `--color-brand` | `#00984a` | 3.8:1 | Primary brand green, badges, borders, glowing rings, titles |
| `--color-brand-strong` | `#007a3d` | **5.4:1 (WCAG AA)** | High-contrast button fills & interactive text on dark backgrounds |
| `--color-brand-surface` | `rgba(0, 152, 74, 0.12)` | N/A | Subtly tinted chips, selected states, active items |
| `--color-brand-glow` | `rgba(0, 152, 74, 0.35)` | N/A | Ambient atmospheric backdrops and active focus indicators |

### Text & Content Tokens
| Token | Value | Purpose |
|---|---|---|
| `--color-text-primary` | `#ffffff` | Headings, primary labels, selected slot numbers |
| `--color-text-secondary` | `#d4d4d8` | Body text, doctor qualifications, consultation details |
| `--color-text-muted` | `#9ca3af` | Secondary timestamps, helper labels, disclaimers |
| `--color-text-disabled` | `#6b7280` | Inactive elements, expired slots |

### Semantic Feedback Tokens
| Token | Value | Usage |
|---|---|---|
| `--color-success` | `#00984a` | Confirmed bookings, verified credentials, successful transactions |
| `--color-warning` | `#f59e0b` | Chamber delays, 5-minute hold timer warning |
| `--color-danger` | `#ef4444` | Emergency alerts, 404 flatline waveform, failed payments |
| `--color-info` | `#38bdf8` | Live queue status, telemed room connection |

---

## 3. Typography & Bengali Script Support

DocBook uses fluid responsive typography with full bilingual rendering:
- **Primary Display & Headings**: `Poppins`, sans-serif (weights: 500, 600, 700)
- **Bengali Language Support**: `Hind Siliguri`, sans-serif (weights: 400, 500, 600, 700)
- **Clinical Codes & Monospace**: `JetBrains Mono`, `Consolas`, monospace (used for token serials, BMDC numbers, timestamps)

---

## 4. Interactive Components & The 7-State Rule

All buttons, inputs, doctor booking cards, and slot keys adhere strictly to 7 distinct states:

1. **Default**: Crisp border, high-contrast readable typography.
2. **Hover**: Smooth elevation (`transform: translateY(-2px)`), enhanced brand border, subtle radial glow.
3. **Focus-Visible**: High-visibility 2px outline with 2px offset (`outline: 2px solid var(--color-brand); outline-offset: 2px`).
4. **Active**: Depressed feel (`transform: translateY(0) scale(0.98)`).
5. **Disabled**: Reduced opacity (`0.4`), `cursor: not-allowed`, no hover or active triggers.
6. **Loading**: Element is marked `aria-busy="true"`, with non-blocking spinner and button text preservation.
7. **Error**: High-visibility warning border (`--color-danger`), `aria-invalid="true"`, and clear error summary.

---

## 5. Motion & Animation Standards

Managed natively in [`public/js/animations.js`](file:///c:/Users/basak/Downloads/Doctor%20Appointment%20Booking%20System/public/js/animations.js):
- **Zero Heavy Runtime**: Removed Framer Motion CDN and Three.js runtime. Built purely with native `IntersectionObserver` and CSS keyframes.
- **Reduced Motion Support**: Automatically disables transformations when `@media (prefers-reduced-motion: reduce)` is detected or the user toggles the Motion switch in the navigation bar.
- **Subtle Medical Polish**:
  - Ambient glowing green orbs in hero sections with slow, organic pulses.
  - Smooth card reveal animations on scroll.
  - Interactive tactile ripple feedback on primary button actions.
  - Subtle card tilt effect (`max 4deg`) on desktop pointers.

---

## 6. Icons & Media Guidelines

- **Zero Unicode Emojis as UI Icons**: All UI iconography is implemented as clean, scalable vector SVGs (`public/js/icons.js` and inline SVG elements).
- **Optimized Media Assets**: All medical practitioner photos and facility banners in `public/images/` are compressed under 100KB with 82% bicubic bicubic quality, preserving retina sharpness while reducing payload from 6.9MB to ~540KB.
