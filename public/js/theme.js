// DocBook Theme Manager — Dark Clinical Green
// Single high-contrast, professional medical theme with contrast & motion controls.

export const PALETTES = [
  { id: 'green', name: 'Clinical Green', labelBn: 'ক্লিনিক্যাল গ্রিন', primary: '#00984a', accent: '#006642' }
];

export function getTheme() {
  return 'dark';
}

export function setTheme(_theme) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

export function toggleTheme() {
  // Always dark clinical green for optimal contrast and brand identity
  setTheme('dark');
}

export function getPalette() {
  return 'green';
}

export function setPalette(_id) {
  document.documentElement.setAttribute('data-palette', 'green');
}

// Immediate initial execution
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.setAttribute('data-palette', 'green');

if (typeof window !== 'undefined') {
  window.getTheme = getTheme;
  window.setTheme = setTheme;
  window.toggleTheme = toggleTheme;
  window.getPalette = getPalette;
  window.setPalette = setPalette;
}
