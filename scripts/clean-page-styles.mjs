import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const p = (rel) => join(process.cwd(), 'public', rel);

function clean(file, fn) {
  const path = p(file);
  const src = readFileSync(path, 'utf8');
  const out = fn(src);
  writeFileSync(path, out, 'utf8');
  console.log(`Cleaned and polished styles in ${file}`);
}

// 1. admin-dashboard.html
clean('admin-dashboard.html', s => {
  return s
    .replaceAll('var(--primary-600)', 'var(--color-brand)')
    .replaceAll('var(--primary-700)', 'var(--color-brand-strong)')
    .replaceAll('var(--primary-400)', 'var(--color-brand-bright)')
    .replaceAll('rgba(20, 184, 166, 0.18)', 'var(--color-brand-soft-2)')
    .replaceAll('rgba(45, 212, 191, 0.45)', 'var(--color-brand-line)')
    .replaceAll('var(--text-main)', 'var(--color-text-primary)')
    .replaceAll('var(--text-muted)', 'var(--color-text-muted-on-dark)')
    .replaceAll('var(--bg-surface)', 'var(--color-surface-card)')
    .replaceAll('var(--bg-muted)', 'var(--color-surface-elevated)')
    .replaceAll('var(--border)', 'var(--color-border-subtle)');
});

// 2. doctors.html
clean('doctors.html', s => {
  return s
    .replaceAll('rgba(14, 20, 34, 0.98)', 'var(--color-surface-card)')
    .replaceAll('rgba(45, 212, 191, 0.12)', 'var(--color-brand-soft)')
    .replaceAll('rgba(45, 212, 191, 0.3)', 'var(--color-brand-line)')
    .replaceAll('var(--color-teal-50)', 'var(--color-brand-soft)')
    .replaceAll('var(--color-teal-800)', 'var(--color-brand-bright)')
    .replaceAll('var(--color-teal-300)', 'var(--color-brand-bright)')
    .replaceAll('var(--color-ink-600)', 'var(--color-text-muted-on-dark)')
    .replaceAll('var(--color-surface)', 'var(--color-surface-card)')
    .replaceAll('var(--color-border)', 'var(--color-border-subtle)');
});

// 3. doctor-panel.html
clean('doctor-panel.html', s => {
  return s
    .replaceAll('rgba(13, 122, 113, 0.12)', 'var(--color-brand-soft)')
    .replaceAll('rgba(45, 212, 191, 0.1)', 'var(--color-brand-soft)')
    .replaceAll('rgba(45, 212, 191, 0.25)', 'var(--color-brand-line)')
    .replaceAll('var(--color-teal-700)', 'var(--color-brand)')
    .replaceAll('var(--color-teal-800)', 'var(--color-brand-bright)')
    .replaceAll('var(--color-teal-50)', 'var(--color-brand-soft)')
    .replaceAll('var(--color-teal-200)', 'var(--color-brand-line)')
    .replaceAll('var(--color-teal-300)', 'var(--color-brand-bright)')
    .replaceAll('var(--color-ink-950)', 'var(--color-text-primary)')
    .replaceAll('var(--color-ink-600)', 'var(--color-text-muted-on-dark)')
    .replaceAll('var(--color-surface)', 'var(--color-surface-card)')
    .replaceAll('var(--color-border)', 'var(--color-border-subtle)');
});

// 4. login.html
clean('login.html', s => {
  return s
    .replaceAll('var(--color-teal-800)', 'var(--color-brand-strong)')
    .replaceAll('var(--color-teal-600)', 'var(--color-brand)')
    .replaceAll('var(--color-teal-300)', 'var(--color-brand-bright)')
    .replaceAll('var(--color-teal-50)', 'var(--color-brand-soft)')
    .replaceAll('rgba(45, 212, 191, 0.12)', 'var(--color-brand-soft)')
    .replaceAll('var(--color-ink-950)', 'var(--color-surface-base)')
    .replaceAll('var(--color-ink-700)', 'var(--color-text-secondary)')
    .replaceAll('var(--color-surface)', 'var(--color-surface-card)')
    .replaceAll('var(--color-border)', 'var(--color-border-subtle)');
});

// 5. my-appointments.html
clean('my-appointments.html', s => {
  return s
    .replaceAll('var(--color-ink-950)', 'var(--color-text-primary)')
    .replaceAll('var(--color-ink-600)', 'var(--color-text-muted-on-dark)')
    .replaceAll('var(--color-ink-500)', 'var(--color-text-subtle)')
    .replaceAll('var(--color-border)', 'var(--color-border-subtle)');
});

// 6. reception-panel.html
clean('reception-panel.html', s => {
  return s
    .replaceAll('var(--color-ink-950)', 'var(--color-text-primary)')
    .replaceAll('var(--color-ink-600)', 'var(--color-text-muted-on-dark)')
    .replaceAll('var(--color-border)', 'var(--color-border-subtle)');
});

// 7. symptom-checker.html
clean('symptom-checker.html', s => {
  return s
    .replaceAll('var(--color-ink-950)', 'var(--color-text-primary)')
    .replaceAll('var(--color-ink-600)', 'var(--color-text-muted-on-dark)')
    .replaceAll('var(--color-border)', 'var(--color-border-subtle)');
});

// 8. doctor-profile.html
clean('doctor-profile.html', s => {
  return s
    .replaceAll('var(--color-ink-950)', 'var(--color-text-primary)')
    .replaceAll('var(--color-ink-600)', 'var(--color-text-muted-on-dark)')
    .replaceAll('var(--color-border)', 'var(--color-border-subtle)');
});

// 9. booking.html
clean('booking.html', s => {
  return s
    .replaceAll('var(--color-teal-700)', 'var(--color-brand)')
    .replaceAll('var(--color-border)', 'var(--color-border-subtle)');
});
