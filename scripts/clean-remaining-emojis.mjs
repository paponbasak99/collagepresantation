import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const p = (rel) => join(process.cwd(), 'public', rel);

function clean(file, fn) {
  const path = p(file);
  const src = readFileSync(path, 'utf8');
  const out = fn(src);
  writeFileSync(path, out, 'utf8');
  console.log(`Cleaned emojis in ${file}`);
}

// 1. 404.html
clean('404.html', s => {
  return s
    .replace(/⚡\s*ASYSTOLE/g, 'ASYSTOLE')
    .replace(/<link rel="icon" href="data:image\/svg\+xml,<svg[^>]*>.*?<\/svg>">/g, `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300984a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 12h-4l-3 9L9 3l-3 9H2'/></svg>">`)
    .replace(/background:\s*#070b14/g, 'background: var(--color-bg-base, #000000)')
    .replace(/border:\s*1\.5px\s*solid\s*#1e293b/g, 'border: 1.5px solid var(--color-border-subtle, #1f1f1f)')
    .replace(/stroke="#14b8a6"/g, 'stroke="var(--color-brand, #00984a)"');
});

// 2. booking.html
clean('booking.html', s => {
  return s
    .replace(/🔒\s*256-Bit SSL/g, '256-Bit SSL')
    .replace(/<span style="color: var\(--color-teal-700\);">✓<\/span>/g, '<span style="color: var(--color-brand, #00984a); font-weight: bold;">✓</span>');
});

// 3. doctor-panel.html
clean('doctor-panel.html', s => {
  return s
    .replace(/🔬\s*Diagnostic Lab Vault/g, 'Diagnostic Lab Vault')
    .replace(/🔬\s*Patient Lab History/g, 'Patient Lab History')
    .replace(/⚠️\s*Clinical Drug Safety Alert/g, 'Clinical Drug Safety Alert');
});

// 4. index.html
clean('index.html', s => {
  return s.replace(/⚡\s*38 verified consultations/g, '38 verified consultations');
});

// 5. my-appointments.html
clean('my-appointments.html', s => {
  return s
    .replace(/🔬\s*Diagnostic Lab Vault/g, 'Diagnostic Lab Vault')
    .replace(/👉\s*Proceed to Consultation Chamber/g, 'Proceed to Consultation Chamber')
    .replace(/✓\s*Reviewed/g, 'Reviewed');
});

// 6. prescription-slip.html
clean('prescription-slip.html', s => {
  return s
    .replace(/🖨️\s*Print \/ Save as PDF/g, 'Print / Save as PDF')
    .replace(/🔬\s*Diagnostic Lab Investigations:/g, 'Diagnostic Lab Investigations:');
});

// 7. tv-display.html
clean('tv-display.html', s => {
  return s
    .replace(/<div class="tv-logo-box">.*?<\/div>/g, '<div class="tv-logo-box"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></div>')
    .replace(/⛶\s*Fullscreen/g, 'Fullscreen')
    .replace(/soundEnabled \? '🔊' : '🔇'/g, `soundEnabled ? 'Audio On' : 'Muted'`)
    .replace(/✓\s*Checked In/g, 'Checked In')
    .replace(/✓\s*All checked-in/g, 'All checked-in')
    .replace(/⚠️\s*Chamber Delay Notice/g, 'Chamber Delay Notice')
    .replace(/--tv-bg:\s*#070b14;/g, '--tv-bg: #000000;')
    .replace(/--tv-card:\s*#0d1527;/g, '--tv-card: #0a0a0a;')
    .replace(/--tv-card-border:\s*rgba\(255,\s*255,\s*255,\s*0\.08\);/g, '--tv-card-border: #1f1f1f;')
    .replace(/--tv-accent:\s*#0ea5e9;/g, '--tv-accent: #00984a;')
    .replace(/--tv-emerald:\s*#10b981;/g, '--tv-emerald: #00984a;')
    .replace(/background:\s*#0d1527;/g, 'background: #0a0a0a;')
    .replace(/color:\s*#38bdf8;/g, 'color: var(--color-brand, #00984a);')
    .replace(/#10b981/g, '#00984a')
    .replace(/#34d399/g, '#00984a')
    .replace(/#0284c7/g, '#007a3d')
    .replace(/#0d9488/g, '#00984a');
});

// 8. video-consultation.html
clean('video-consultation.html', s => {
  const micSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
  const micOffSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
  const camSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>`;
  const camOffSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="m22 8-6 4 6 4V8Z"/><path d="M14 6H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12"/></svg>`;

  return s
    .replace(/<div style="font-size: 1\.6rem;">.*?<\/div>/g, '<div style="color: var(--color-brand, #00984a); display: flex;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>')
    .replace(/✍️\s*Write E-Prescription/g, 'Write E-Prescription')
    .replace(/e\.currentTarget\.textContent\s*=\s*isMicMuted\s*\?\s*'🔇'\s*:\s*'🎤';/g, `e.currentTarget.innerHTML = isMicMuted ? '${micOffSvg}' : '${micSvg}';`)
    .replace(/e\.currentTarget\.textContent\s*=\s*isCamOff\s*\?\s*'🚫'\s*:\s*'📷';/g, `e.currentTarget.innerHTML = isCamOff ? '${camOffSvg}' : '${camSvg}';`)
    .replace(/background:\s*#090d16;/g, 'background: #000000;')
    .replace(/background:\s*#0e1526;/g, 'background: #0a0a0a;')
    .replace(/background:\s*#050811;/g, 'background: #000000;')
    .replace(/background:\s*#090e1d;/g, 'background: #050505;')
    .replace(/background:\s*#0d1424;/g, 'background: #0a0a0a;')
    .replace(/color:\s*#38bdf8;/g, 'color: var(--color-brand, #00984a);')
    .replace(/rgba\(14,\s*165,\s*233,\s*0\.12\)/g, 'rgba(0, 152, 74, 0.12)')
    .replace(/rgba\(14,\s*165,\s*233,\s*0\.3\)/g, 'rgba(0, 152, 74, 0.3)');
});
