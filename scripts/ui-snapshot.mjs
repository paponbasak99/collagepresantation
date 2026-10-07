// Snapshot every element id and i18n key per public HTML page.
// Usage: node scripts/ui-snapshot.mjs > out.json   |   node scripts/ui-snapshot.mjs --diff before.json
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'public');
const pages = readdirSync(root).filter(f => f.endsWith('.html'));
const snap = {};
for (const page of pages) {
  const html = readFileSync(join(root, page), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"$`{}]+)"/g)].map(m => m[1]));
  const keys = new Set([...html.matchAll(/data-i18n(?:-placeholder|-aria|-title)?="([^"]+)"/g)].map(m => m[1]));
  snap[page] = { ids: [...ids].sort(), i18n: [...keys].sort() };
}

const diffIdx = process.argv.indexOf('--diff');
if (diffIdx > -1) {
  let raw = readFileSync(process.argv[diffIdx + 1], 'utf8');
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const before = JSON.parse(raw);
  // Elements intentionally removed with the 3D layer / palette picker.
  const allowed = new Set(['chart-mode-3d-btn', 'daily-chart-3d-mount', 'chart-mode-2d-btn']);
  let missing = 0;
  for (const [page, data] of Object.entries(before)) {
    const now = snap[page];
    if (!now) { console.log(`PAGE REMOVED: ${page}`); missing++; continue; }
    for (const id of data.ids) if (!now.ids.includes(id) && !allowed.has(id)) { console.log(`${page}: missing id #${id}`); missing++; }
    for (const k of data.i18n) if (!now.i18n.includes(k)) { console.log(`${page}: missing i18n ${k}`); missing++; }
  }
  console.log(missing ? `\n${missing} missing item(s)` : 'OK: no ids or i18n keys lost');
  process.exit(missing ? 1 : 0);
} else {
  process.stdout.write(JSON.stringify(snap, null, 2));
}
