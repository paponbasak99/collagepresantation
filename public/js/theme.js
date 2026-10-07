// DocBook Universal Theme & Palette Manager — v2.0
// Controls Dark/Light mode and Dynamic Palettes: Teal, Sapphire, Midnight Mint, and Violet Health-Tech.

export const PALETTES = [
  { id: 'teal', name: 'Clinical Teal', labelBn: 'ক্লিনিক্যাল টিল', primary: '#0d7a71', accent: '#0ea5e9', emoji: '🩺' },
  { id: 'sapphire', name: 'Royal Sapphire', labelBn: 'রয়্যাল স্যাফায়ার', primary: '#1d4ed8', accent: '#38bdf8', emoji: '💎' },
  { id: 'midnight', name: 'Neon Mint', labelBn: 'নিয়ন মিন্ট', primary: '#059669', accent: '#34d399', emoji: '⚡' },
  { id: 'violet', name: 'Violet HealthTech', labelBn: 'ভায়োলেট হেলথটেক', primary: '#6366f1', accent: '#a855f7', emoji: '🧬' }
];

export function getTheme() {
  return localStorage.getItem('docbook_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('docbook_theme', theme);
  updateThemeIcons(theme);
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

export function getPalette() {
  return localStorage.getItem('docbook_palette') || 'teal';
}

export function setPalette(paletteId) {
  const valid = PALETTES.find(p => p.id === paletteId) ? paletteId : 'teal';
  document.documentElement.setAttribute('data-palette', valid);
  localStorage.setItem('docbook_palette', valid);
  updatePaletteActiveIndicators(valid);
  window.dispatchEvent(new CustomEvent('paletteChanged', { detail: { palette: valid } }));
}

function updateThemeIcons(theme) {
  const sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="docbook-icon"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="docbook-icon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  document.querySelectorAll('.theme-toggle-icon').forEach(el => {
    el.innerHTML = theme === 'dark' ? sunSvg : moonSvg;
  });
}

function updatePaletteActiveIndicators(activeId) {
  document.querySelectorAll('.palette-option-btn').forEach(btn => {
    const id = btn.getAttribute('data-palette-id');
    if (id === activeId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Immediate initial execution to prevent flash of wrong styling
const initialTheme = getTheme();
const initialPalette = getPalette();
document.documentElement.setAttribute('data-theme', initialTheme);
document.documentElement.setAttribute('data-palette', initialPalette);

document.addEventListener('DOMContentLoaded', () => {
  updateThemeIcons(initialTheme);
  updatePaletteActiveIndicators(initialPalette);
});

if (typeof window !== 'undefined') {
  window.getTheme = getTheme;
  window.setTheme = setTheme;
  window.toggleTheme = toggleTheme;
  window.getPalette = getPalette;
  window.setPalette = setPalette;
}
