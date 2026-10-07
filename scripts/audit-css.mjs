import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const files = readdirSync('public').filter(f => f.endsWith('.html'));
for (const f of files) {
  const content = readFileSync(join('public', f), 'utf8');
  const styleMatches = [...content.matchAll(/<style[\s\S]*?<\/style>/gi)];
  if (styleMatches.length > 0) {
    const totalChars = styleMatches.reduce((acc, m) => acc + m[0].length, 0);
    console.log(`${f}: ${styleMatches.length} <style> block(s), ${totalChars} chars`);
  }
}
