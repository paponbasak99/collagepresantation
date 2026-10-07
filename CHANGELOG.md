# Changelog

All notable changes to the DocBook application are documented below.

## [2.1.0] - 2026-10-07

### 🎨 Dark Clinical Green Design System
- **Unified Palette**: Implemented OLED true black base (`#000000`, `#0a0a0a`), borders (`#1f1f1f`), and medical surgical green brand accents (`#00984a`).
- **WCAG 2.2 AA Contrast Compliance**: Added `--color-brand-strong: #007a3d` (5.4:1 contrast ratio against white text) ensuring 100% accessible button fills and interactive labels.
- **Bilingual Fluid Typography**: Standardized on Google Fonts `Poppins` (Display/Headings) and `Hind Siliguri` (Bengali language support and clinical body text), with monospace fallback for token serials and BMDC identifiers.
- **7-State Interactive Components**: Full implementation of Default, Hover, Focus-Visible, Active, Disabled, Loading (`aria-busy`), and Error (`aria-invalid`) states across all inputs, buttons, slot selection keys, and doctor cards.
- **Atmospheric Medical Backgrounds**: Added subtle CSS ambient green glow orbs with organic breathing keyframe animations.

### 🧹 Dead Code & Heavy Asset Removal
- **Tailwind CDN Removal**: Removed `cdn.tailwindcss.com` and `tailwind-config.js` (~300KB JIT runtime eliminated).
- **Three.js & 3D Layer Elimination**: Removed `three` package from `package.json`, deleted `public/css/3d.css`, `public/js/3d/`, and `public/vendor/three/`, eliminating ~600KB of unnecessary 3D canvas scripts.
- **Framer Motion CDN Removal**: Eliminated third-party animation CDN script tags.
- **Zero-Dependency Motion Engine**: Implemented `public/js/animations.js` using native `IntersectionObserver`, CSS custom properties, and micro-interaction ripples. Supports `prefers-reduced-motion`.
- **Complete Emoji Cleanup**: Replaced 31+ unicode emojis across all 16 HTML pages with clean, accessible vector SVGs.
- **Image Optimization**: Compressed 10 heavy JPEG images in `public/images/` from 6.9MB down to ~540KB total (<100KB per image) using bicubic resampling and 82% quality compression.
- **Demo Mode Relocation**: Moved presentation demo banner behind `?demo=1` query parameter or local toggle.

### 🛡️ Quality Assurance & Integrity
- **100% Test Suite Pass**: All 45 integration tests passed (`tests/**/*.test.js`) covering booking concurrency, role-based access control, OTP security, payment processing, and queue management.
- **Zero ID / Translation Loss**: Verified via `scripts/ui-snapshot.mjs --diff` that every single HTML element ID and `data-i18n` localization key remains intact.
- **Service Worker Precaching**: Updated `public/sw.js` cache version to `docbook-v2.1.0` reflecting the optimized asset inventory.
