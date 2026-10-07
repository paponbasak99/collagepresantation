/**
 * DocBook Custom SVG Icon System (icons.js)
 * Consistent 1.5px stroke, 24x24 grid, round joins/caps.
 * Replaces every emoji across the entire platform.
 */

function svg(paths, size = 20, cls = '', strokeWidth = 1.75) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="docbook-icon ${cls}">${paths}</svg>`;
}

export const icons = {
  stethoscope: (s = 20, c = '') => svg(
    `<path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3"/><path d="M9 3v2"/><path d="M4.5 3H3"/><path d="M15 3h-1.5"/><path d="M9 12.5v2a3.5 3.5 0 0 0 7 0v-1"/><circle cx="18" cy="10" r="3"/><circle cx="18" cy="10" r="1"/>`, s, c
  ),

  shieldCheck: (s = 20, c = '') => svg(
    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`, s, c
  ),

  heart: (s = 20, c = '') => svg(
    `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`, s, c
  ),

  calendar: (s = 20, c = '') => svg(
    `<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>`, s, c
  ),

  clock: (s = 20, c = '') => svg(
    `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`, s, c
  ),

  user: (s = 20, c = '') => svg(
    `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`, s, c
  ),

  users: (s = 20, c = '') => svg(
    `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`, s, c
  ),

  search: (s = 20, c = '') => svg(
    `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`, s, c
  ),

  star: (s = 20, c = '') => svg(
    `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`, s, c
  ),

  starFilled: (s = 20, c = '') => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" class="docbook-icon ${c}">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>`,

  phone: (s = 20, c = '') => svg(
    `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`, s, c
  ),

  building: (s = 20, c = '') => svg(
    `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>`, s, c
  ),

  hospital: (s = 20, c = '') => svg(
    `<path d="M12 6v4"/><path d="M14 8h-4"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/><path d="M18 14h4v8h-4"/><path d="M2 22h4v-8H2"/>`, s, c
  ),

  ticket: (s = 20, c = '') => svg(
    `<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>`, s, c
  ),

  fileText: (s = 20, c = '') => svg(
    `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>`, s, c
  ),

  prescription: (s = 20, c = '') => svg(
    `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h3a2 2 0 0 0 0-4H9v7"/><path d="m11 13 3 3"/>`, s, c
  ),

  pill: (s = 20, c = '') => svg(
    `<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>`, s, c
  ),

  sparkles: (s = 20, c = '') => svg(
    `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M19 3v4"/><path d="M21 5h-4"/>`, s, c
  ),

  alertCircle: (s = 20, c = '') => svg(
    `<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>`, s, c
  ),

  alertTriangle: (s = 20, c = '') => svg(
    `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>`, s, c
  ),

  check: (s = 20, c = '') => svg(
    `<polyline points="20 6 9 17 4 12"/>`, s, c
  ),

  checkCircle: (s = 20, c = '') => svg(
    `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`, s, c
  ),

  x: (s = 20, c = '') => svg(
    `<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>`, s, c
  ),

  arrowRight: (s = 20, c = '') => svg(
    `<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>`, s, c
  ),

  arrowLeft: (s = 20, c = '') => svg(
    `<line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/>`, s, c
  ),

  chevronDown: (s = 20, c = '') => svg(
    `<polyline points="6 9 12 15 18 9"/>`, s, c
  ),

  chevronRight: (s = 20, c = '') => svg(
    `<polyline points="9 18 15 12 9 6"/>`, s, c
  ),

  filter: (s = 20, c = '') => svg(
    `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`, s, c
  ),

  sun: (s = 20, c = '') => svg(
    `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`, s, c
  ),

  moon: (s = 20, c = '') => svg(
    `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`, s, c
  ),

  menu: (s = 20, c = '') => svg(
    `<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>`, s, c
  ),

  printer: (s = 20, c = '') => svg(
    `<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>`, s, c
  ),

  copy: (s = 20, c = '') => svg(
    `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`, s, c
  ),

  download: (s = 20, c = '') => svg(
    `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>`, s, c
  ),

  refresh: (s = 20, c = '') => svg(
    `<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>`, s, c
  ),

  creditCard: (s = 20, c = '') => svg(
    `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>`, s, c
  ),

  banknote: (s = 20, c = '') => svg(
    `<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>`, s, c
  ),

  mapPin: (s = 20, c = '') => svg(
    `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`, s, c
  ),

  activity: (s = 20, c = '') => svg(
    `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`, s, c
  ),

  // Organ systems
  lungs: (s = 20, c = '') => svg(
    `<path d="M12 4v16M12 9a4 4 0 0 0-4-4c-2.5 0-5 2.5-5 7 0 4.5 2.5 6 5 6h4M12 9a4 4 0 0 1 4-4c2.5 0 5 2.5 5 7 0 4.5-2.5 6-5 6h-4"/>`, s, c
  ),

  bone: (s = 20, c = '') => svg(
    `<path d="M17 10c.7-.7 1.6-1 2.5-1a3.5 3.5 0 1 0-5 5c0 .9-.3 1.8-1 2.5l-4 4c-.7.7-1.6 1-2.5 1a3.5 3.5 0 1 0 5-5c0-.9.3-1.8 1-2.5Z"/>`, s, c
  ),

  eye: (s = 20, c = '') => svg(
    `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`, s, c
  ),

  droplet: (s = 20, c = '') => svg(
    `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>`, s, c
  ),

  verified: (s = 18, c = '') => svg(
    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`, s, c, 2
  ),

  specialty: function(slug, s = 20, c = '') {
    switch (slug) {
      case 'cardiology': return this.heart(s, c);
      case 'medicine': return this.stethoscope(s, c);
      case 'chest-medicine': return this.lungs(s, c);
      case 'orthopedics':
      case 'rheumatology': return this.bone(s, c);
      case 'ophthalmology': return this.eye(s, c);
      case 'dermatology': return this.sparkles(s, c);
      case 'pediatrics': return this.users(s, c);
      case 'haematology':
      case 'nephrology':
      case 'endocrinology':
      case 'urology': return this.droplet(s, c);
      case 'dentistry':
      case 'hepatology': return this.shieldCheck(s, c);
      default: return this.activity(s, c);
    }
  }
};

/**
 * Deterministic doctor initials & palette generator
 * Generates an elegant, tactile monogram avatar with consistent palette
 */
export function getDoctorMonogram(name) {
  if (!name) return 'DR';
  const clean = name.replace(/^(Prof\.|Dr\.|Md\.|Mr\.|Mrs\.|Ms\.)\s+/gi, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

const AVATAR_PALETTES = [
  { bg: 'var(--color-teal-100)', color: 'var(--color-teal-800)', border: 'var(--color-teal-200)' },
  { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' },
  { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
  { bg: '#fae8ff', color: '#86198f', border: '#f5d0fe' },
  { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }
];

export function getDoctorPalette(nameOrId) {
  let hash = 0;
  const str = String(nameOrId || 'Doctor');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

/**
 * Renders an inline doctor photo avatar with verified badge & graceful monogram fallback
 */
export function renderDoctorAvatar(name, id, size = 64, isVerified = true, avatarUrl = null) {
  const monogram = getDoctorMonogram(name);
  const palette = getDoctorPalette(id || name);
  const fontSize = Math.round(size * 0.36);
  const badgeSize = Math.max(16, Math.round(size * 0.32));

  const defaultAvatars = [
    '/images/doctor-male-1.jpg',
    '/images/doctor-female-1.jpg',
    '/images/doctor-male-2.jpg',
    '/images/doctor-female-2.jpg',
    '/images/doctor-male-3.jpg',
    '/images/doctor-female-3.jpg',
    '/images/doctor-male-4.jpg',
    '/images/doctor-female-4.jpg'
  ];
  const photoUrl = avatarUrl || defaultAvatars[Math.abs(Number(id) || 1) % defaultAvatars.length];

  return `
    <div class="doctor-avatar-wrap" style="width: ${size}px; height: ${size}px; position: relative; flex-shrink: 0; user-select: none;">
      <img src="${photoUrl}" alt="${name || 'Doctor'}" 
        style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-lg); border: 1.5px solid var(--color-border-subtle); box-shadow: var(--shadow-1); display: block;" 
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        loading="lazy" />
      <div class="doctor-monogram-avatar" style="display: none; width: 100%; height: 100%; border-radius: var(--radius-lg); background: ${palette.bg}; color: ${palette.color}; border: 1.5px solid ${palette.border}; font-size: ${fontSize}px; font-weight: 700; align-items: center; justify-content: center;">
        <span>${monogram}</span>
      </div>
      ${isVerified ? `
        <span class="avatar-verified-badge" title="BMDC Verified Practitioner" style="position: absolute; bottom: -3px; right: -3px; background: var(--color-brand-strong); color: var(--color-text-on-brand); width: ${badgeSize}px; height: ${badgeSize}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--color-surface-card); box-shadow: var(--shadow-4);">
          ${icons.check(badgeSize * 0.62)}
        </span>
      ` : ''}
    </div>
  `;
}

