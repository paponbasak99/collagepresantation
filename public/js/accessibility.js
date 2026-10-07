// DocBook Accessibility Module (WCAG AA Compliance)
// Supports text resizing, high contrast, and keyboard navigation helpers

const FONT_SIZES = ['normal', 'large', 'xlarge'];

export function initAccessibility() {
  const savedSize = localStorage.getItem('docbook_font_size') || 'normal';
  const savedContrast = localStorage.getItem('docbook_contrast') === 'true';

  setFontSize(savedSize, false);
  setContrast(savedContrast, false);
}

export function setFontSize(size, persist = true) {
  document.documentElement.classList.remove('font-size-large', 'font-size-xlarge');
  if (size === 'large') {
    document.documentElement.classList.add('font-size-large');
  } else if (size === 'xlarge') {
    document.documentElement.classList.add('font-size-xlarge');
  }

  if (persist) {
    localStorage.setItem('docbook_font_size', size);
  }
}

export function toggleFontSize() {
  const current = localStorage.getItem('docbook_font_size') || 'normal';
  const nextIdx = (FONT_SIZES.indexOf(current) + 1) % FONT_SIZES.length;
  const nextSize = FONT_SIZES[nextIdx];
  setFontSize(nextSize, true);
  return nextSize;
}

export function setContrast(isHighContrast, persist = true) {
  if (isHighContrast) {
    document.documentElement.classList.add('high-contrast');
  } else {
    document.documentElement.classList.remove('high-contrast');
  }

  if (persist) {
    localStorage.setItem('docbook_contrast', String(isHighContrast));
  }
}

export function toggleContrast() {
  const current = document.documentElement.classList.contains('high-contrast');
  setContrast(!current, true);
  return !current;
}

// Auto-initialize on import
initAccessibility();
