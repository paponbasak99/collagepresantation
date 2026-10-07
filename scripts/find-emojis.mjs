import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Unicode emoji range regex
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

const files = readdirSync('public').filter(f => f.endsWith('.html'));
let count = 0;
for (const f of files) {
  const content = readFileSync(join('public', f), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      console.log(`${f}:${idx + 1}: ${line.trim()}`);
      count++;
    }
  });
}
console.log(`\nTotal remaining emoji instances: ${count}`);
