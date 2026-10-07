import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const p = (rel) => join(process.cwd(), 'public', rel);

function clean(file, fn) {
  const path = p(file);
  const src = readFileSync(path, 'utf8');
  const out = fn(src);
  writeFileSync(path, out, 'utf8');
  console.log(`Updated icons in ${file}`);
}

// 1. admin-dashboard.html
clean('admin-dashboard.html', s => {
  return s
    .replace(/<link rel="icon" href="data:image\/svg\+xml,<svg[^>]*>.*?<\/svg>">/g, '')
    .replace(/<button type="button" id="chart-mode-3d-btn"[^>]*>.*?<\/button>/g, '')
    .replace(/<div id="daily-chart-3d-mount"[^>]*><\/div>/g, '')
    .replace(/\s*let admin3dCtx = null;[\s\S]*?mount3d\.style\.display = 'block';[\s\S]*?\}\);/g, '');
});

// 2. 404.html
clean('404.html', s => {
  return s.replace(/[^\w\s/.:;="<>\-_#(),%]*ASYSTOLE/g, 'ASYSTOLE');
});

// 3. index.html
clean('index.html', s => {
  return s
    .replace(/<div data-scene="hero"[\s\S]*?<\/div>/g, '')
    .replace(/<div class="canvas-scrim-layer"><\/div>/g, '')
    .replace(/[^\w\s/.:;="<>\-_#(),%]*38 verified consultations/g, '38 verified consultations');
});

// 4. booking.html
clean('booking.html', s => {
  return s
    .replace(/<div data-scene="timer"[^>]*><\/div>/g, '')
    .replace(/<span class="payment-tile-badge">.*?<\/span>/g, '<span class="payment-tile-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>')
    .replace(/<span>[^\w\s/.:;="<>\-_#(),%]*256-Bit SSL/g, '<span>256-Bit SSL');
});

// 5. doctor-panel.html
clean('doctor-panel.html', s => {
  return s
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Diagnostic Lab Vault/g, 'Diagnostic Lab Vault')
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Patient Lab History/g, 'Patient Lab History')
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Clinical Drug Safety Alert/g, 'Clinical Drug Safety Alert');
});

// 6. doctors.html
clean('doctors.html', s => {
  return s.replace(/<span style="font-weight: 800; opacity: 0.8; display: flex;">.*?<\/span>/g, '<span style="font-weight: 800; opacity: 0.8; display: flex;">&times;</span>');
});

// 7. my-appointments.html
clean('my-appointments.html', s => {
  return s
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Diagnostic Lab Vault/g, 'Diagnostic Lab Vault')
    .replace(/<span id="refresh-spin-icon"[^>]*>.*?<\/span>/g, '<span id="refresh-spin-icon" style="display:inline-flex;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></span>')
    .replace(/Proceed to Doctor Room/g, 'Proceed to Consultation Chamber')
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Reviewed/g, 'Reviewed');
});

// 8. prescription-slip.html
clean('prescription-slip.html', s => {
  return s
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Print \/ Save as PDF/g, 'Print / Save as PDF')
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Diagnostic Lab Investigations:/g, 'Diagnostic Lab Investigations:');
});

// 9. tv-display.html
clean('tv-display.html', s => {
  return s
    .replace(/<span id="audio-icon">.*?<\/span>/g, '<span id="audio-icon">Vol</span>')
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Fullscreen/g, 'Fullscreen')
    .replace(/<span>[^\w\s/.:;="<>\-_#(),%]*<\/span> Next In Queue/g, 'Next In Queue')
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Chamber Delay Notice/g, 'Chamber Delay Notice');
});

// 10. video-consultation.html
clean('video-consultation.html', s => {
  return s
    .replace(/<button id="toggle-mic-btn"[^>]*>.*?<\/button>/g, '<button id="toggle-mic-btn" class="ctrl-btn" title="Mute/Unmute Mic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg></button>')
    .replace(/<button id="toggle-cam-btn"[^>]*>.*?<\/button>/g, '<button id="toggle-cam-btn" class="ctrl-btn" title="Camera On/Off"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg></button>')
    .replace(/<button id="toggle-screen-btn"[^>]*>.*?<\/button>/g, '<button id="toggle-screen-btn" class="ctrl-btn" title="Share Screen"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg></button>')
    .replace(/<button id="hangup-btn"[^>]*>.*?<\/button>/g, '<button id="hangup-btn" class="ctrl-btn hangup" title="End Call"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="22" x2="2" y1="2" y2="22"/></svg></button>')
    .replace(/[^\w\s/.:;="<>\-_#(),%]*Write E-Prescription/g, 'Write E-Prescription');
});
