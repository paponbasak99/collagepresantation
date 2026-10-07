# DocBook — Design System Specification (DESIGN.md)

**Product:** DocBook Healthcare Scheduling & Clinic Management  
**Version:** 2.0 (Studio Redesign)  
**Philosophy:** Editorial Gravitas, Restrained Palette, Precision Utility, Hand-Crafted Clinical Trust.  
**Strict Mandate:** Zero AI-generated clichés. No purple-pink gradients, no emoji icons, no repetitive 3-column cards, no neon glowing drop shadows, no pill-shaped everything.

---

## 1. Brand Aesthetics & Art Direction

DocBook is redesigned to feel like an authoritative, funded, hand-crafted healthcare platform built specifically for Bangladesh. It departs completely from generic "startup-in-a-box" templates.

### The Dynamic Palette System (Teal, Sapphire, Midnight, Violet)
DocBook supports 4 distinct clinical color themes switchable at runtime via the navbar palette dropdown, plus bi-directional Light & Dark modes:
1. **Primary Anchor (Clinical Deep Teal):**  
   - Light: `--color-teal-700` (`#0d7a71`) and `--color-teal-800` (`#0a5c55`)
   - Dark: `--color-teal-400` (`#2dd4bf`) and `--color-teal-500` (`#14b8a6`)
   Provides medical authority without feeling cold or clinical.
2. **Royal Sapphire Blue (`sapphire`):**
   - High-trust institutional hospital blue (`#1d4ed8` / `#2563eb`) with ice sky accents (`#0284c7` / `#38bdf8`).
3. **Neon Mint & Midnight (`midnight`):**
   - Sleek dark-first health-tech with radiant emerald (`#047857` / `#059669`) and neon mint accents (`#10b981` / `#34d399`).
4. **Violet Health-Tech (`violet`):**
   - Deep indigo (`#4f46e5` / `#6366f1`) and cosmic violet (`#7c3aed` / `#9333ea`) for modern digital health and AI triage.
5. **Atmospheric Canvas (Warm Off-White / Natural Stone):**  
   - Light: `--color-canvas` (`#faf8f5`), `--color-surface` (`#ffffff`), `--color-subtle` (`#f4f1ea`)
   - Dark: `--color-canvas-dark` (`#0e1217`), `--color-surface-dark` (`#151a22`), `--color-subtle-dark` (`#1c222c`)
   Replaces harsh blue-gray backgrounds with warm, tactile paper-like warmth that softens long clinical reading sessions.
3. **Typography & Ink (Deep Obsidian & Muted Charcoal):**  
   - High-contrast ink: `--color-ink-900` (`#111827`)
   - Secondary text: `--color-ink-600` (`#4b5563`)
   - Tertiary / Labels: `--color-ink-400` (`#9ca3af`)
4. **Restrained Functional Accents:**  
   - *Urgent/Emergency:* `--color-danger` (`#b91c1c` / `#dc2626`)
   - *Hold Countdown/Caution:* `--color-warning` (`#b45309` / `#d97706`)
   - *Clinical Verification:* `--color-success` (`#15803d` / `#16a34a`)
   - *Info & Consultation:* `--color-info` (`#0369a1` / `#0284c7`)

---

## 2. Typography System

### 2.1 Typefaces
- **Editorial Display (Headlines & Editorial Callouts):**  
  `'Fraunces', 'Georgia', serif`  
  Loaded with optical sizing (`opsz` 36-144) and soft contrast. Used for hero display headlines, section titles, and key value propositions to impart editorial prestige.
- **Precision UI Workhorse (Body, Inputs, Navigation, Labels):**  
  `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`  
  High x-height, open counters, optimized for legibility at small sizes and high-density clinical data tables.
- **Bengali Typography:**  
  `'Hind Siliguri', 'Plus Jakarta Sans', sans-serif`  
  Balanced vertical rhythm, matched line heights, and optical weights.

### 2.2 Fluid Type Scale
```css
--font-display-hero: clamp(2.5rem, 5vw + 1rem, 3.75rem); /* 40px - 60px */
--font-display-1:    clamp(2rem, 3.5vw + 0.5rem, 2.75rem); /* 32px - 44px */
--font-display-2:    clamp(1.5rem, 2.5vw + 0.25rem, 2rem); /* 24px - 32px */
--font-title-1:      1.25rem;   /* 20px */
--font-title-2:      1.125rem;  /* 18px */
--font-body-lead:    1.0625rem; /* 17px */
--font-body:         0.9375rem; /* 15px */
--font-caption:      0.8125rem; /* 13px */
--font-micro:        0.75rem;   /* 12px */
```

### 2.3 Numeric Formatting
All fees, serial numbers, times, dates, and queue numbers use tabular numerals:
```css
font-variant-numeric: tabular-nums lining-nums;
letter-spacing: -0.01em;
```

---

## 3. Spatial, Radius & Depth Scale

### 3.1 8px Grid Spacing
- `--space-1`: `4px`
- `--space-2`: `8px`
- `--space-3`: `12px`
- `--space-4`: `16px`
- `--space-5`: `20px`
- `--space-6`: `24px`
- `--space-8`: `32px`
- `--space-10`: `40px`
- `--space-12`: `48px`
- `--space-16`: `64px`
- `--space-20`: `80px`

### 3.2 Restrained Radius Scale
- `--radius-xs`: `4px` (micro badges, tags)
- `--radius-sm`: `6px` (form inputs, buttons, chips, tabs)
- `--radius-md`: `10px` (cards, slot tiles, ticket items)
- `--radius-lg`: `16px` (modals, drawers, hero cards)
- `--radius-full`: `9999px` (avatar circles, status indicator dots only)

### 3.3 Subtle Depth & Hairline Borders
No heavy or colored drop shadows. Elevation is achieved through 1px border contrast and soft ambient shadows:
- `--border-hairline`: `1px solid var(--color-border)` (`#e7e4dc` / dark: `#222933`)
- `--border-subtle`: `1px solid var(--color-border-subtle)` (`#ded9ce` / dark: `#2d3542`)
- `--shadow-subtle`: `0 1px 2px rgba(18, 24, 38, 0.04)`
- `--shadow-card`: `0 2px 4px rgba(18, 24, 38, 0.04), 0 8px 16px -4px rgba(18, 24, 38, 0.04)`
- `--shadow-floating`: `0 8px 24px -4px rgba(18, 24, 38, 0.08), 0 20px 48px -8px rgba(18, 24, 38, 0.12)` (modals, drawers, dropdowns only)

---

## 4. Animation & Motion Architecture

All motion adheres to high-end editorial interaction standards: 60fps, GPU-accelerated (`transform`, `opacity`), and full fallback for `prefers-reduced-motion`.

### 4.1 Motion Tokens
- `--motion-instant`: `120ms ease` (hover feedback, micro button press)
- `--motion-fast`: `200ms cubic-bezier(0.25, 1, 0.5, 1)` (selection states, chips, tooltips)
- `--motion-base`: `320ms cubic-bezier(0.25, 1, 0.5, 1)` (dropdowns, drawers, slot transitions)
- `--motion-enter`: `450ms cubic-bezier(0.16, 1, 0.3, 1)` (modal pop, hero reveal, page entry)
- `--motion-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (soft tactile pop for checkmarks and tokens)

### 4.2 Signature Interactions
1. **Hero Entry Stagger:** Headline words slide up from mask, command search bar raises +4px, supporting trust figures count up on scroll view.
2. **Circular 5-Minute Hold Countdown:** Pure SVG countdown circle with dynamic stroke-dashoffset calculated via `requestAnimationFrame`. Shifts from calm teal (`#0d7a71`) to warning amber (`#d97706`), then pulsing critical red (`#dc2626`) when under 60 seconds.
3. **Slot Picker Flow:** Slots cascade in with 20ms staggered delay. Selected slot scales to `0.98` on click, morphs to filled ink background, and draws an inline SVG checkmark via `stroke-dashoffset`.
4. **Live OPD Queue Counter:** Digits roll/fade upward when queue updates; live chamber badge features a subtle 1.5s breathing pulse.
5. **Physical Ticket Perforation:** The appointment slip features a CSS radial-gradient circular notch pattern along its edges with a dashed separator that mimics an authentic clinic token.
6. **Tabs & Filters:** A physical sliding ink pill follows the active tab; list reordering uses the FLIP technique for smooth position shifting.
7. **View Transitions:** Uses native `document.startViewTransition` when available for seamless multi-page crossfades.

---

## 5. Inline SVG Icon System (`public/js/icons.js`)

**Zero Emojis Policy:** Every emoji in DocBook is systematically replaced by an inline SVG icon built on a 24x24 grid with a consistent 1.5px stroke and rounded caps/joins.

Exported icon functions:
- `iconStethoscope(size, cls)`
- `iconHeart(size, cls)`
- `iconCalendar(size, cls)`
- `iconClock(size, cls)`
- `iconUser(size, cls)`
- `iconShieldCheck(size, cls)` (BMDC verification)
- `iconSearch(size, cls)`
- `iconStar(size, cls)` (Crisp geometric 5-point star)
- `iconPhone(size, cls)`
- `iconBuilding(size, cls)`
- `iconReceipt(size, cls)`
- `iconFileText(size, cls)`
- `iconPill(size, cls)`
- `iconAlertCircle(size, cls)`
- `iconCheckCircle(size, cls)`
- `iconArrowRight(size, cls)`
- `iconChevronDown(size, cls)`
- `iconFilter(size, cls)`
- `iconSparkles(size, cls)` (AI triage engine)
- `iconSun(size, cls)` / `iconMoon(size, cls)`
- `iconMenu(size, cls)` / `iconX(size, cls)`
- `iconCopy(size, cls)` / `iconPrinter(size, cls)`

---

## 6. Doctor Monogram Avatars & Accreditation

Stock photo faces are removed in favor of a deterministic, dignified monogram avatar system:
- **Two-letter initials:** Generated from doctor's legal name (e.g. "Prof. Dr. Tariq Rahman" -> "TR", "Dr. Fatima Begum" -> "FB").
- **Deterministic Hue Palette:** Seeded from the doctor's user ID into one of five muted clinical colors (Deep Teal, Slate Indigo, Warm Ochre, Pine, Plum).
- **Accreditation Badge:** An embedded SVG shield checkmark affixed to the avatar corner signifying verified BMDC registration.

---

## 7. Component Library Specifications

### 7.1 Buttons
- **Primary:** Solid deep ink (`#111827`) or deep teal (`#0d7a71`) with crisp white text. Active state `transform: scale(0.98)`. No gradient backgrounds.
- **Secondary:** Warm canvas surface with hairline border (`1px solid var(--color-border)`).
- **Ghost:** Transparent with subtle hover tint.
- **Danger:** Controlled crimson (`#b91c1c`) for irreversible actions (cancellations).
- **Loading State:** Stable width maintained while an inline SVG spinner animates.

### 7.2 Form Controls
- Top-aligned concise labels with microcopy hints.
- 44px minimum touch targets on mobile.
- Focus ring: `2px solid var(--color-teal-700)` with `2px offset`.
- Valid state shows subtle green check; invalid state displays immediate, helpful microcopy.

### 7.3 Segmented OTP Input
- Six separate, auto-advancing single-character input boxes with monospace font, auto-focus, paste listener, and backspace auto-retreat.

### 7.4 Payment Selection
- Distinct selectable tiles for **bKash**, **Nagad**, **Card**, and **Pay at Clinic** with authentic monochrome or restrained brand accents, clear zero-fee badges, and a check indicator.

### 7.5 Status Badges
- Small, uppercase, tabular tracking:
  - `CONFIRMED`: Soft sage green (`#eef7ee`), text `#166534`, border `#d1e7d1`.
  - `ARRIVED`: Soft azure (`#f0f7ff`), text `#075985`, border `#d4e7f8`.
  - `IN_CONSULTATION`: Soft purple/violet (`#f5f3ff`), text `#5b21b6`, border `#ddd6fe`.
  - `COMPLETED`: Warm neutral slate (`#f3f4f6`), text `#374151`, border `#e5e7eb`.
  - `CANCELLED`: Soft rose (`#fff1f2`), text `#9f1239`, border `#fecdd3`.

### 7.6 Live Queue Widget
- Displayed prominently on patient view:
  ```
  [ LIVE CHAMBER OPD ] ── Now Serving: SL-02 ── Your Turn: SL-05 ── 2 Ahead (~18m wait)
  ```
- Pulsing green status indicator and animated digit refresh.

### 7.7 Refund Tier Visual Bar
- Replaces plain text refund policy with a 3-stage visual progress meter:
  - `> 24h` (90% Refund) | `6 - 24h` (50% Refund) | `< 6h` (No Refund)
  - Dynamically highlights the patient's current applicable tier based on time until consultation.

---

## 8. What Was Removed & Why (AI Cliché Inventory)

| Cliché Element Removed | Why It Was Removed | Replacement Hand-Crafted Solution |
|---|---|---|
| **Emoji UI icons** (`🩺`, `⭐`, `🚨`, etc.) | Inconsistent rendering, cheap prototype look | Custom inline SVG icon system with uniform 1.5px stroke |
| **Neon drop shadows & glow** (`--shadow-glow`) | Artificial, futuristic AI aesthetic | 1px hairline borders, layered neutral surfaces, subtle natural shadows |
| **Saturated teal-to-cyan gradients** | Visually fatiguing, generic tech template feel | Deepened single clinical teal anchored by warm off-white canvas |
| **Floating stat badges on hero** (★4.9, 100% BMDC) | Overused Dribbble/AI landing page trope | Grounded, high-trust statistics band integrated into narrative flow |
| **Stock photo doctor portraits** | Staged, unrealistic, breaks local credibility | Deterministic monogram avatars with BMDC verified shield seal |
| **Repetitive 3-column icon grids** | Visual monotony across home & directories | Asymmetric layout with department prioritization & horizontal scroller |
| **Static yellow countdown banner** | Low urgency feedback, looks like a warning error | Smooth circular SVG countdown timer with progressive color shift |
| **Plain text refund policy** | Hard to parse during cancellation anxiety | Visual 3-segment tier bar showing exact refundable taka amount |
| **Generic slogans** ("Future of Healthcare") | Filler buzzwords, zero patient utility | Concrete, localized microcopy with exact chamber and hospital context |

---

## 9. Implementation Phasing

1. **Tokens & Base CSS:** Rebuild `main.css` and `components.css`.
2. **SVG Icon Library:** Create `/public/js/icons.js`.
3. **Core Shell:** Upgrade `navbar.js` and global footer.
4. **Patient Booking Journey:** `index.html` -> `doctors.html` -> `doctor-profile.html` -> `booking.html` -> `appointment-slip.html` -> `my-appointments.html` -> `login.html`.
5. **Operational Workspaces:** `doctor-panel.html` -> `reception-panel.html` -> `admin-dashboard.html`.
6. **Utility Views:** `verify-slip.html` -> `404.html` -> `symptom-checker.html`.
7. **Regression Testing:** Automated test suite verification (`npm.cmd test`).
