import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const publicDir = join(process.cwd(), 'public');
const files = readdirSync(publicDir).filter(f => f.endsWith('.html'));

const fontTags = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">`;

const brandFavicon = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300984a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3Cpolyline points='9 12 11 14 15 10'/%3E%3C/svg%3E">`;

for (const file of files) {
  const filePath = join(publicDir, file);
  let html = readFileSync(filePath, 'utf8');

  // 1. Remove 3d.css
  html = html.replace(/\s*<link rel="stylesheet" href="\/css\/3d\.css">\r?\n?/g, '');

  // 2. Remove Tailwind CDN and tailwind-config
  html = html.replace(/\s*<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\r?\n?/g, '');
  html = html.replace(/\s*<script src="\/js\/tailwind-config\.js"><\/script>\r?\n?/g, '');

  // 3. Remove 3D core script
  html = html.replace(/\s*<script type="module" src="\/js\/3d\/core\.js"><\/script>\r?\n?/g, '');

  // 4. Remove importmap if present
  html = html.replace(/\s*<script type="importmap">[\s\S]*?<\/script>\r?\n?/g, '');

  // 5. Replace emoji favicons with brandFavicon
  html = html.replace(/<link rel="icon"[^>]*emoji[^>]*>/gi, brandFavicon);
  html = html.replace(/<link rel="icon"[^>]*%2290%22>.*?<\/text><\/svg>">/gi, brandFavicon);
  if (!html.includes('rel="icon"')) {
    html = html.replace('</head>', `  ${brandFavicon}\n</head>`);
  }

  // 6. Ensure Google Fonts link is in <head>
  if (!html.includes('fonts.googleapis.com')) {
    html = html.replace('<link rel="stylesheet" href="/css/main.css">', `${fontTags}\n  <link rel="stylesheet" href="/css/main.css">`);
  }

  // 7. Remove any dynamic 3D import calls
  html = html.replace(/import\('\/js\/3d\/[^']+'\)\.then\([^)]+\)\.catch\([^)]+\);?/g, '');

  writeFileSync(filePath, html, 'utf8');
  console.log(`Cleaned ${file}`);
}
