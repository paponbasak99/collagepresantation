import { readFileSync, writeFileSync } from 'node:fs';

const fontHead = '<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">';

// tv-display.html
let tv = readFileSync('public/tv-display.html', 'utf8');
tv = tv.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans[^>]*>/, fontHead);
tv = tv.replaceAll("'Outfit', sans-serif", "var(--font-display, 'Poppins', sans-serif)");
tv = tv.replaceAll("'Outfit', monospace", "var(--font-mono, monospace)");
tv = tv.replaceAll("'Outfit'", "var(--font-display, 'Poppins', sans-serif)");
writeFileSync('public/tv-display.html', tv, 'utf8');

// video-consultation.html
let vc = readFileSync('public/video-consultation.html', 'utf8');
vc = vc.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans[^>]*>/, fontHead);
vc = vc.replaceAll("'Outfit', monospace", "var(--font-mono, monospace)");
vc = vc.replaceAll("'Outfit'", "var(--font-display, 'Poppins', sans-serif)");
writeFileSync('public/video-consultation.html', vc, 'utf8');

console.log('Fonts updated successfully!');
