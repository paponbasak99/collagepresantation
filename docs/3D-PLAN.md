# DocBook 3D Experience Plan & Engineering Specification

## 1. Executive Summary & Art Direction
DocBook's **3D Upgrade** transforms the outpatient booking journey into a calm, depth-driven, tactile digital environment. The visual target is **"Apple product page meets modern medical-tech"**:
- **Aesthetic Tone:** Clean, reassuring, precise, and clinically grounded.
- **Strictly Prohibited:** No gaming aesthetics, no neon glows, no spinning logos, no plastic bubbles, no rainbow gradients, and no frivolous floating shapes that lack clinical meaning.
- **Palette & Lighting:** 
  - Primary Clinical Teal (`#0d7a71` / `#0f766e`), warm off-white surfaces (`#f8fafc` / `#ffffff`), deep ink typography (`#0f172a`), and rare amber clinical alerts (`#d97706`).
  - Lighting: Top-left key light, soft cool rim light, neutral ambient fill, and realistic soft contact ambient occlusion.
  - Materials: Matte ceramic, frosted optical glass, brushed surgical aluminum, and micro-embossed tactile card stock.

---

## 2. Technical Architecture & Tech Rules
1. **Zero External Runtime CDN:** Three.js is self-hosted in `/public/vendor/three/three.module.js` and wired via standard browser `<script type="importmap">`.
2. **Vanilla Stack:** Pure ES modules, Native Web Animations API, CSS 3D transforms (`preserve-3d`, `perspective`), and `requestAnimationFrame`. No React, no Three-fiber, no GSAP.
3. **Module Structure:**
   - `/public/js/3d/core.js`: Shared engine (centralized lifecycle, capability detection, performance tiers, reduced-motion listener, single render loop coordinator, and memory disposal).
   - `/public/js/3d/hero-scene.js`: Home hero anatomical heart and floating care cards.
   - `/public/js/3d/tilt-cards.js`: CSS 3D tilt engine with specular light for specialties and doctors.
   - `/public/js/3d/slot-scene.js`: Tactile 3D slot key press matrix and cascade animations.
   - `/public/js/3d/timer-scene.js`: 3D clinical countdown dial for slot reservation.
   - `/public/js/3d/slip-scene.js`: Physical ticket release and dynamic depth inspection.
   - `/public/js/3d/login-scene.js`: Split-screen medical primitive orbit.
   - `/public/js/3d/queue-scene.js`: Physical queue token carousel and checkmark settle.
   - `/public/js/3d/admin-scene.js`: 3D daily consultation bar matrix with 2D/3D toggle.
   - `/public/css/3d.css`: Depth tokens, perspective classes, specular highlights, and hardware acceleration hints.
4. **HTML & i18n Inviolability:**
   - Text remains real, selectable, translatable HTML (English & Bengali).
   - Three.js canvases are `aria-hidden="true"` and `pointer-events: none` by default.
   - All existing IDs, forms, buttons, and APIs remain 100% intact.

---

## 3. Scene Inventory, Asset Budget & Poly Count

| Scene Name | Implementation | Triangles | Asset Budget | Fallback Mode |
| :--- | :--- | :--- | :--- | :--- |
| **1. Home Hero (Heart + Cards)** | Three.js WebGL | 2,800 tris | < 120 KB (procedural low-poly cardiac mesh + canvas text textures) | High-fidelity SVG illustration with CSS pulse |
| **2. Specialty Tilt Cards** | CSS 3D Transforms | 0 (DOM) | 0 KB (CSS only) | Flat card with subtle elevation shadow |
| **3. Doctor Cards Depth Hover** | CSS 3D Z-Layers | 0 (DOM) | 0 KB (CSS only) | Standard 2D hover lift |
| **4. Slot Matrix 3D Keys** | CSS 3D Keycap | 0 (DOM) | 0 KB (CSS only) | Flat button state |
| **5. Slot Hold Timer** | WebGL / CSS 3D Ring | 1,200 tris | < 30 KB | SVG circular progress bar |
| **6. Appointment Slip Reveal** | CSS 3D + Gyro Tilt | 0 (DOM) | 0 KB (CSS only) | Flat slip fade-in |
| **7. Login Scene Primitives** | Three.js WebGL | 3,200 tris | < 45 KB (capsule, shield, calendar plate) | Static healthcare vector branding |
| **8. Queue Token & Success** | CSS 3D / WebGL | 1,600 tris | < 25 KB | Flat token stack + checkmark |
| **9. Admin 3D Bar Chart** | Three.js WebGL | 4,500 tris | < 40 KB (instanced bars) | Default 2D Canvas Chart |
| **10. 404 & Verify Slip** | WebGL / CSS 3D | 800 tris | < 20 KB | SVG ECG pulse line & static badge |

*All 3D assets remain well below the 300KB and 60,000 triangle hard budget limits.*

---

## 4. Hardware Detection, Performance Budget & Fallbacks

### Device Capability Tiers
- **Tier 1 (High Performance):** `hardwareConcurrency > 4`, `deviceMemory > 4`, WebGL 2 supported, battery non-constrained. $\rightarrow$ Full WebGL scenes, interactive parallax, dynamic specular lighting.
- **Tier 2 (Balanced / Mid-Range):** `hardwareConcurrency <= 4`, `deviceMemory <= 4`, or mobile screen $< 768\text{px}$. $\rightarrow$ Simplified WebGL (static heart rotation without floating cards), full CSS 3D tilt.
- **Tier 3 (Ultra-Lite / Fallback):** WebGL disabled/crashed, `prefers-reduced-motion: reduce`, or user enabled `"Reduce 3D Effects"` toggle. $\rightarrow$ WebGL canvases skipped completely; high-fidelity SVG/CSS static layouts rendered.

### Performance Controls
- **IntersectionObserver:** Every canvas is attached to an observer; render loop stops when the canvas exits the viewport.
- **VisibilityState:** Rendering pauses immediately when the browser tab loses focus.
- **Capped DPR:** `Math.min(window.devicePixelRatio, 1.75)` to prevent 4K mobile GPU thermal throttling.
- **Target Metrics:** 60 FPS steady; < 15% CPU load on mid-range laptops; zero memory leaks via explicit recursive disposal on page unload.

---

## 5. Accessibility & Internationalization (i18n)
- **Contrast Ratios:** Text layers overlaid on 3D scenes have guaranteed WCAG AA contrast ($\ge 4.5:1$) through calibrated frosted backdrop scrims.
- **Bengali Typography:** Floating text textures dynamically detect active language (`bn` or `en`) and render using `Hind Siliguri` font when active.
- **"Reduce Effects" Setting:** Global toggle integrated into the website navbar and saved in `localStorage['docbook_reduce_motion']`.

---

## 6. Implementation Rollout Order
1. **Core Infrastructure:**
   - Vendor Three.js module setup (`/public/vendor/three/`) and import map.
   - `/public/js/3d/core.js` and `/public/css/3d.css`.
   - "Reduce Effects" toggle in navbar.
2. **Hero Scene & Cardiac Form:**
   - `/public/js/3d/hero-scene.js` with scroll scrub and cursor parallax.
3. **CSS 3D Components:**
   - `/public/js/3d/tilt-cards.js` (Specialties & Doctor cards).
   - `/public/js/3d/slot-scene.js` (Tactile 3D keycaps).
4. **Interactive Micro-Scenes:**
   - 3D Slot countdown timer in booking modal.
   - 3D Appointment ticket reveal on slip pages.
   - Split-screen medical orbit on login page.
   - Queue token stack & checkmark moment.
   - Admin 3D chart switch.
   - 404 heartbeat line & verify slip stamp.
5. **Validation & Verification:**
   - Test suite execution (`npm test`).
   - Multi-device verification (light/dark, en/bn, reduced motion, WebGL fallback).
