import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = join(process.cwd(), 'public', 'css', 'components.css');
let css = readFileSync(file, 'utf8');

// Check if section 18 is already present
if (!css.includes('18. KPI STAT CARDS & METRICS SUITE')) {
  const additions = `
/* --------------------------------------------------------------------------
   18. KPI STAT CARDS & METRICS SUITE
   -------------------------------------------------------------------------- */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.kpi-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-6) var(--space-5);
  position: relative;
  overflow: hidden;
  box-shadow: var(--specular-card), var(--shadow-1);
  transition: transform var(--motion-fast) var(--ease-out), box-shadow var(--motion-fast) var(--ease-out), border-color var(--motion-fast) var(--ease-out);
}

.kpi-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-border-brand);
  box-shadow: var(--specular-card), var(--shadow-glow), var(--shadow-2);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--color-brand);
  border-radius: var(--radius-pill);
}

.kpi-card.warning::before { background: var(--color-warning); }
.kpi-card.danger::before  { background: var(--color-danger); }
.kpi-card.success::before { background: var(--color-success); }
.kpi-card.info::before    { background: var(--color-info); }

.kpi-sub-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted-on-dark);
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-val {
  font-family: var(--font-family-base);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
  margin: var(--space-1) 0 var(--space-2);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.kpi-foot {
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* --------------------------------------------------------------------------
   19. TAB BARS & SEGMENTED CONTROLS
   -------------------------------------------------------------------------- */
.admin-tab-nav,
.tab-nav-bar {
  display: flex;
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: var(--space-8);
  overflow-x: auto;
  scrollbar-width: none;
}
.admin-tab-nav::-webkit-scrollbar,
.tab-nav-bar::-webkit-scrollbar { display: none; }

.admin-tab-btn,
.tab-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted-on-dark);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--motion-instant) var(--ease-out), border-color var(--motion-instant) var(--ease-out), background-color var(--motion-instant) var(--ease-out);
  position: relative;
}

.admin-tab-btn:hover,
.tab-nav-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-hover);
}

.admin-tab-btn.active,
.tab-nav-btn.active {
  color: var(--color-brand-bright);
  border-bottom-color: var(--color-brand);
  background: transparent;
  font-weight: var(--font-weight-semibold);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 7px;
  font-size: 0.6875rem;
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-pill);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted-on-dark);
}

.admin-tab-btn.active .tab-badge,
.tab-nav-btn.active .tab-badge {
  background: var(--color-brand-soft);
  border-color: var(--color-brand-line);
  color: var(--color-brand-bright);
}

/* --------------------------------------------------------------------------
   20. CLINICAL QUEUE CARDS & DOCTOR WORKSPACE
   -------------------------------------------------------------------------- */
.queue-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--specular-card), var(--shadow-1);
  transition: transform var(--motion-fast) var(--ease-out), border-color var(--motion-fast) var(--ease-out), box-shadow var(--motion-fast) var(--ease-out);
}

.queue-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-brand);
  box-shadow: var(--specular-card), var(--shadow-glow), var(--shadow-2);
}

.queue-card.active-patient {
  border: 1.5px solid var(--color-brand);
  background: var(--gradient-card);
  box-shadow: var(--specular-card), 0 0 0 3px var(--color-brand-soft-2), var(--shadow-glow);
}

.serial-tag {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
  color: var(--color-brand-bright);
  background: var(--color-brand-soft);
  border: 1px solid var(--color-brand-line);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-xs);
  display: inline-block;
}

.shortcut-tag {
  font-family: var(--font-family-mono);
  font-size: 0.6875rem;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-subtle);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  color: var(--color-text-subtle);
}

.med-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 1fr auto;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-3);
  background: var(--color-surface-elevated);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-subtle);
  animation: fadeInRow var(--motion-fast) var(--ease-out);
}

@media (max-width: 768px) {
  .med-row { grid-template-columns: 1fr; }
}

@keyframes fadeInRow {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --------------------------------------------------------------------------
   21. DOCTORS FILTER & DIRECTORY LAYOUT
   -------------------------------------------------------------------------- */
.doctors-layout-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-8);
  align-items: start;
}

@media (max-width: 991px) {
  .doctors-layout-grid { grid-template-columns: 1fr; }
  .filter-sidebar-mobile-hide { display: none; }
  .filter-sidebar-mobile-hide.mobile-open {
    display: flex !important;
    flex-direction: column;
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    max-height: 84vh !important;
    overflow-y: auto !important;
    z-index: var(--z-modal) !important;
    background: var(--color-surface-card) !important;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0 !important;
    border: 1px solid var(--color-border-medium) !important;
    border-bottom: none !important;
    box-shadow: var(--shadow-deep) !important;
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    animation: bottomSheetSlide var(--motion-normal) var(--ease-out) !important;
    padding: var(--space-6) !important;
    padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom, 0px)) !important;
  }
}

@keyframes bottomSheetSlide {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.view-toggle-btn {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted-on-dark);
  padding: 0.35rem 0.55rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--motion-fast) var(--ease-out);
}

.view-toggle-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-medium);
}

.view-toggle-btn.active {
  background: var(--color-brand-soft);
  color: var(--color-brand-bright);
  border-color: var(--color-brand-line);
}

.doctors-list-grid-view {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
  gap: var(--space-6) !important;
}

.doctors-list-list-view {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: var(--space-4) !important;
}

.doctor-card-list-layout {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-6);
  align-items: center;
}

@media (max-width: 680px) {
  .doctor-card-list-layout {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

/* --------------------------------------------------------------------------
   22. AUTHENTICATION SPLIT SCREEN
   -------------------------------------------------------------------------- */
.auth-split-layout {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  min-height: 580px;
  background: var(--color-surface-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-subtle);
  overflow: hidden;
  box-shadow: var(--specular-card), var(--shadow-3);
  margin: var(--space-8) auto;
  max-width: 1040px;
}

@media (max-width: 860px) {
  .auth-split-layout { grid-template-columns: 1fr; }
  .auth-brand-side { display: none !important; }
}

.auth-brand-side {
  background: linear-gradient(145deg, #021a0d 0%, #000000 100%);
  color: var(--color-text-primary);
  padding: var(--space-10) var(--space-8);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  border-right: 1px solid var(--color-border-subtle);
}

.auth-brand-side::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 20% 30%, rgba(0, 152, 74, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

.auth-form-side {
  padding: var(--space-10) var(--space-8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-surface-card);
}

.demo-role-pill {
  font-size: var(--font-size-xs);
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-xs);
  cursor: pointer;
  color: var(--color-text-muted-on-dark);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all var(--motion-fast) var(--ease-out);
}

.demo-role-pill:hover {
  border-color: var(--color-brand);
  color: var(--color-brand-bright);
  background: var(--color-brand-soft);
}

/* --------------------------------------------------------------------------
   23. TELEMEDICINE & VIDEO CONSULTATION DOCK
   -------------------------------------------------------------------------- */
.telemed-header {
  background: var(--color-surface-card);
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.telemed-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 340px;
  height: calc(100vh - 65px);
}

.video-viewport {
  position: relative;
  background: var(--color-surface-base);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.remote-video-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--color-surface-inset);
}

.local-video-box {
  position: absolute;
  bottom: 96px;
  right: 24px;
  width: 220px;
  height: 140px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid var(--color-brand);
  box-shadow: var(--shadow-deep);
  background: var(--color-surface-elevated);
  z-index: 20;
}

.local-video-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.controls-bar {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-pill);
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 30;
  box-shadow: var(--shadow-deep);
}

.ctrl-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--color-border-subtle);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--motion-fast) var(--ease-out);
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.06);
}

.ctrl-btn.off {
  background: var(--color-danger-strong);
  border-color: var(--color-danger);
  color: white;
}

.ctrl-btn.hangup {
  background: var(--color-danger-strong);
  border-color: var(--color-danger);
  width: 54px;
  height: 54px;
}

.ctrl-btn.hangup:hover {
  background: var(--color-danger);
  transform: scale(1.08);
}

.clinical-drawer {
  background: var(--color-surface-card);
  border-left: 1px solid var(--color-border-subtle);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.call-timer {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-brand-bright);
  background: var(--color-brand-soft);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-brand-line);
}

.waiting-peer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 15;
}

/* --------------------------------------------------------------------------
   24. TV DISPLAY & LOUNGE BROADCAST SUITE
   -------------------------------------------------------------------------- */
.tv-header {
  background: rgba(10, 10, 10, 0.95);
  border-bottom: 2px solid var(--color-brand-line);
  padding: 16px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.tv-brand { display: flex; align-items: center; gap: 16px; }

.tv-logo-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-brand-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 26px;
  font-weight: 800;
  box-shadow: var(--shadow-glow);
}

.tv-title {
  font-family: var(--font-family-base);
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.tv-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted-on-dark);
  margin-top: 2px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tv-time {
  font-family: var(--font-family-mono);
  font-size: 2.1rem;
  font-weight: 800;
  color: var(--color-brand-bright);
  letter-spacing: 1px;
  line-height: 1;
}

.tv-date {
  font-size: 0.875rem;
  color: var(--color-text-muted-on-dark);
  margin-top: 4px;
  font-weight: 500;
}

.tv-stage {
  flex: 1;
  padding: 28px 36px;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 28px;
}

.tv-hero-card {
  background: var(--gradient-card);
  border: 2px solid var(--color-brand-line);
  border-radius: var(--radius-xl);
  padding: 36px;
  box-shadow: var(--shadow-deep), var(--shadow-glow);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.tv-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--color-brand-soft-2);
  border: 1px solid var(--color-brand-line);
  color: var(--color-brand-bright);
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-brand);
  box-shadow: 0 0 12px var(--color-brand);
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
  100% { transform: scale(0.9); opacity: 1; }
}

.tv-token-display { text-align: center; margin: 24px 0; }

.tv-token-label {
  font-size: 1.1rem;
  color: var(--color-text-muted-on-dark);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 600;
}

.tv-token-number {
  font-family: var(--font-family-mono);
  font-size: clamp(4.5rem, 8vw, 7.5rem);
  font-weight: 900;
  color: var(--color-text-primary);
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 0 0 40px rgba(0, 152, 74, 0.45);
  margin: 12px 0;
}

.tv-hero-patient {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-brand-bright);
  letter-spacing: 0.02em;
}

.tv-hero-doctor-box {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tv-doc-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.tv-doc-chamber {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-brand-bright);
  background: var(--color-brand-soft);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-brand-line);
}

.tv-queue-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 28px;
  display: flex;
  flex-direction: column;
}

.tv-queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 14px;
}

.tv-queue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 480px;
}

.tv-queue-item {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform var(--motion-fast) var(--ease-out), border-color var(--motion-fast) var(--ease-out);
}

.tv-queue-item.active {
  border-color: var(--color-brand);
  background: var(--color-brand-soft);
}

.tv-footer {
  background: var(--color-surface-card);
  border-top: 1px solid var(--color-border-subtle);
  padding: 12px 36px;
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 1rem;
}

.tv-ticker-tag {
  background: var(--color-danger-strong);
  color: white;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.tv-ticker-text {
  color: var(--color-text-secondary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.tv-btn {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background var(--motion-fast) var(--ease-out);
}

.tv-btn:hover { background: var(--color-surface-hover); }

/* --------------------------------------------------------------------------
   25. CLINICAL UTILITIES & LIVE SIGNALS
   -------------------------------------------------------------------------- */
.status-dot-live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-brand-bright);
  box-shadow: 0 0 10px var(--color-brand-bright);
  display: inline-block;
  animation: pulse-ring 1.8s infinite;
}

.live-status-strip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-brand-soft);
  border: 1px solid var(--color-brand-line);
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-pill);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-brand-bright);
}

.glass-panel {
  background: var(--color-surface-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--specular-card), var(--shadow-2);
}
`;

  css = css.trimEnd() + '\n' + additions;
  writeFileSync(file, css, 'utf8');
  console.log('Appended clinical components (Sections 18-25) to components.css');
} else {
  console.log('Sections 18-25 already present in components.css');
}
