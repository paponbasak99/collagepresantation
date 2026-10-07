// DocBook Universal Header & Navbar Component — Redesign v2.0
import { getCurrentUser, clearSession } from './api.js';
import { getLang, setLang, t, applyTranslations } from './i18n.js';
import { getTheme, toggleTheme, getPalette, setPalette, PALETTES } from './theme.js';
import { toggleFontSize } from './accessibility.js';
import { showToast } from './toast.js';
import { icons } from './icons.js';
import { initAllAnimations, initScrollReveals } from './animations.js';
import { renderDemoBar } from './demoMode.js';

export function renderNavbar() {
  renderDemoBar();
  const navContainer = document.getElementById('navbar-mount');
  if (!navContainer) return;

  const user = getCurrentUser();
  const lang = getLang();
  const theme = getTheme();
  const currentPalette = getPalette();
  const currentPaletteObj = PALETTES.find(p => p.id === currentPalette) || PALETTES[0];

  // Role specific links
  let roleLinks = '';
  let mobileRoleLinks = '';
  if (user) {
    if (user.role === 'admin') {
      roleLinks += `<li><a href="/admin-dashboard.html" class="nav-link" data-i18n="nav_admin">Admin</a></li>`;
      mobileRoleLinks += `<a href="/admin-dashboard.html" class="mobile-drawer-link">${icons.activity(18)} Admin Dashboard</a>`;
    } else if (user.role === 'doctor') {
      roleLinks += `<li><a href="/doctor-panel.html" class="nav-link" data-i18n="nav_doctor_panel">Doctor Workspace</a></li>`;
      mobileRoleLinks += `<a href="/doctor-panel.html" class="mobile-drawer-link">${icons.stethoscope(18)} Doctor Workspace</a>`;
    } else if (user.role === 'receptionist') {
      roleLinks += `<li><a href="/reception-panel.html" class="nav-link" data-i18n="nav_reception">Reception Desk</a></li>`;
      mobileRoleLinks += `<a href="/reception-panel.html" class="mobile-drawer-link">${icons.building(18)} Reception Desk</a>`;
    }
    roleLinks += `<li><a href="/my-appointments.html" class="nav-link" data-i18n="nav_appointments">Appointments</a></li>`;
    mobileRoleLinks += `<a href="/my-appointments.html" class="mobile-drawer-link">${icons.calendar(18)} My Appointments</a>`;
  }

  navContainer.innerHTML = `
    <!-- Top Emergency Helpline & Ambulance Ticker -->
    <div class="emergency-top-bar" role="complementary" aria-label="Emergency Medical Helpline">
      <div class="container emergency-bar-inner">
        <!-- Left: Live Triage Beacon & Cycling Clinical Ticker -->
        <div class="emergency-left">
          <div class="emergency-beacon-wrap" title="Real-time Clinical Triage Active">
            <span class="emergency-radar-sonar"></span>
            <span class="emergency-beacon-dot"></span>
          </div>
          <span class="emergency-badge" data-i18n="triage_badge">24/7 TRIAGE</span>
          <div class="emergency-ticker-viewport">
            <div class="emergency-ticker-track">
              <div class="ticker-slide-item">
                <span class="ticker-primary"><strong data-i18n="emergency_title">Dinajpur Medical Emergency Triage</strong></span>
                <span class="ticker-dot">•</span>
                <span class="ticker-secondary">Zero Double Booking Guarantee</span>
              </div>
              <div class="ticker-slide-item">
                <span class="ticker-primary"><strong>100% BMDC Verified Specialists</strong></span>
                <span class="ticker-dot">•</span>
                <span class="ticker-secondary">Real-Time 5-Min Slot Lock</span>
              </div>
              <div class="ticker-slide-item">
                <span class="ticker-primary"><strong>Instant E-Prescriptions & QR Tokens</strong></span>
                <span class="ticker-dot">•</span>
                <span class="ticker-secondary">Direct Hospital Queue SL</span>
              </div>
              <!-- Cloned slide for seamless infinite loop -->
              <div class="ticker-slide-item" aria-hidden="true">
                <span class="ticker-primary"><strong data-i18n="emergency_title">Dinajpur Medical Emergency Triage</strong></span>
                <span class="ticker-dot">•</span>
                <span class="ticker-secondary">Zero Double Booking Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Sleek Animated Quick-Dial Contact Chips -->
        <div class="emergency-contacts">
          <a href="tel:+8801711223301" class="emergency-chip emergency-chip-ambulance" title="Direct 24/7 Ambulance Dispatch">
            <span class="chip-icon">${icons.phone(12)}</span>
            <span class="chip-label" data-i18n="ambulance_label">Ambulance:</span>
            <span class="chip-num">+8801711223301</span>
          </a>
          <a href="tel:16263" class="emergency-chip emergency-chip-health" title="Government Health Helpline 16263">
            <span class="chip-icon">${icons.phone(12)}</span>
            <span class="chip-label" data-i18n="health_call_label">Health Call:</span>
            <span class="chip-num">16263</span>
          </a>
          <a href="tel:999" class="emergency-chip emergency-chip-red" title="National Emergency Services 999">
            <span class="chip-icon chip-pulse-icon">${icons.alertTriangle(12)}</span>
            <span class="chip-label" data-i18n="emergency_label">Emergency:</span>
            <span class="chip-num">999</span>
          </a>
        </div>
      </div>
    </div>

    <nav class="navbar">
      <div class="container navbar-inner">
        <a href="/index.html" class="nav-brand">
          <div class="brand-icon">
            ${icons.stethoscope(20)}
          </div>
          <span data-i18n="brand_name">DocBook</span>
        </a>

        <ul class="nav-links">
          <li><a href="/index.html" class="nav-link" data-i18n="nav_home">Home</a></li>
          <li><a href="/doctors.html" class="nav-link" data-i18n="nav_doctors">Find Doctors</a></li>
          <li>
            <button id="nav-symptom-btn" class="nav-link" style="background:none; border:none; cursor:pointer; font-weight:600; color:var(--color-teal-700); display:flex; align-items:center; gap:0.4rem;">
              ${icons.sparkles(16)} <span>AI Triage</span>
            </button>
          </li>
          ${roleLinks}
        </ul>

        <div class="nav-actions">
          <!-- Accessibility Font Size Toggle -->
          <button id="font-size-toggle-btn" class="btn btn-secondary btn-sm" aria-label="Toggle Font Size" title="Text Size (Normal / Large / Extra Large)">
            <span style="font-weight:700;">A+</span>
          </button>

          <!-- Language Toggle Button -->
          <button id="lang-toggle-btn" class="btn btn-secondary btn-sm" aria-label="Toggle Language" title="English / বাংলা">
            <span id="current-lang-text" style="font-weight: 700;">${lang === 'en' ? 'বাং' : 'EN'}</span>
          </button>

          <!-- Dynamic Color Palette Picker -->
          <div class="theme-picker-container">
            <button id="palette-dropdown-btn" class="btn btn-secondary btn-sm" aria-label="Select Color Palette" title="Select Color Theme" style="display: inline-flex; align-items: center; gap: 6px; padding: 0.375rem 0.65rem;">
              <span id="active-palette-dot" class="palette-color-preview" style="background: linear-gradient(135deg, ${currentPaletteObj.primary}, ${currentPaletteObj.accent});"></span>
              <span style="font-size: 0.8rem; line-height: 1;">${currentPaletteObj.emoji}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div id="palette-dropdown-menu" class="theme-picker-menu">
              <div style="font-size: 0.6875rem; font-weight: 700; color: var(--color-ink-500); text-transform: uppercase; letter-spacing: 0.05em; padding: 0.25rem 0.5rem 0.15rem;">
                Select Color Palette
              </div>
              ${PALETTES.map(p => `
                <button type="button" class="palette-option-btn ${p.id === currentPalette ? 'active' : ''}" data-palette-id="${p.id}">
                  <span style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1rem;">${p.emoji}</span>
                    <span style="font-size: 0.8125rem;">${lang === 'bn' ? p.labelBn : p.name}</span>
                  </span>
                  <span class="palette-color-preview" style="background: linear-gradient(135deg, ${p.primary}, ${p.accent});"></span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Theme Dark/Light Toggle -->
          <button id="theme-toggle-btn" class="btn btn-secondary btn-sm" aria-label="Toggle Dark Mode" title="Toggle Theme">
            <span class="theme-toggle-icon">${theme === 'dark' ? icons.sun(16) : icons.moon(16)}</span>
          </button>

          <!-- Reduce 3D Effects Toggle -->
          <button id="reduce-effects-btn" class="btn btn-secondary btn-sm" aria-label="Toggle 3D Effects" title="Toggle 3D & Motion Effects" style="font-size: 0.75rem; padding: 0.35rem 0.55rem; font-weight: 700;">
            <span>${localStorage.getItem('docbook_reduce_motion') === 'true' ? '⚡ Flat' : '✨ 3D'}</span>
          </button>

          <!-- User Menu -->
          ${user ? `
            <div class="user-menu">
              <button id="user-menu-btn" class="user-btn">
                <span class="user-avatar-circle">${user.name ? user.name[0].toUpperCase() : 'U'}</span>
                <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.name ? user.name.split(' ')[0] : 'User'}</span>
                <small style="opacity: 0.65; font-size: 0.7rem; text-transform: uppercase;">(${user.role})</small>
                ${icons.chevronDown(14)}
              </button>
              <div id="user-dropdown-menu" class="user-dropdown">
                <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border);">
                  <div style="font-weight: 700; color: var(--color-ink-950);">${user.name}</div>
                  <div style="font-size: 0.8rem; color: var(--color-ink-500);">${user.phone}</div>
                </div>
                ${user.role === 'patient' ? `<a href="/my-appointments.html">${icons.calendar(16)} My Appointments</a>` : ''}
                ${user.role === 'doctor' ? `<a href="/doctor-panel.html">${icons.stethoscope(16)} Doctor Workspace</a>` : ''}
                ${user.role === 'receptionist' ? `<a href="/reception-panel.html">${icons.building(16)} Reception Desk</a>` : ''}
                ${user.role === 'admin' ? `<a href="/admin-dashboard.html">${icons.activity(16)} Admin Dashboard</a>` : ''}
                <div class="user-dropdown-divider"></div>
                <button id="logout-btn" style="color: var(--color-danger);">${icons.x(16)} Sign Out</button>
              </div>
            </div>
          ` : `
            <a href="/login.html" class="btn btn-primary btn-sm" data-i18n="nav_login">Sign In</a>
          `}

          <!-- Mobile Hamburger Menu Button -->
          <button id="mobile-menu-toggle-btn" class="mobile-menu-toggle" aria-label="Open Navigation Menu">
            ${icons.menu(20)}
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Drawer Overlay & Drawer -->
    <div id="mobile-drawer-overlay" class="mobile-drawer-overlay"></div>
    <div id="mobile-drawer" class="mobile-drawer">
      <div class="mobile-drawer-header">
        <a href="/index.html" class="nav-brand">
          <div class="brand-icon">${icons.stethoscope(18)}</div>
          <span>DocBook</span>
        </a>
        <button id="mobile-drawer-close" style="background: none; border: none; color: var(--color-ink-500); cursor: pointer; display: flex; align-items: center;">${icons.x(20)}</button>
      </div>

      <div class="mobile-drawer-links">
        <a href="/index.html" class="mobile-drawer-link">Home</a>
        <a href="/doctors.html" class="mobile-drawer-link">${icons.search(18)} Find Doctors</a>
        <button id="mobile-symptom-btn" class="mobile-drawer-link" style="border: none; text-align: left; cursor: pointer; width: 100%;">
          ${icons.sparkles(18)} AI Symptom Checker
        </button>
        ${mobileRoleLinks}
      </div>

      <!-- Mobile Theme Palette Selector -->
      <div style="margin: 1.25rem 0 0.5rem; padding: 0.85rem; background: var(--color-surface-subtle); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-ink-500); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
          Theme Palette
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
          ${PALETTES.map(p => `
            <button type="button" class="btn btn-secondary btn-sm mobile-palette-btn" data-palette-id="${p.id}" style="font-size: 0.75rem; padding: 0.4rem 0.55rem; justify-content: flex-start; gap: 0.4rem; ${p.id === currentPalette ? 'border-color: var(--color-teal-700); font-weight: 700; background: var(--color-surface);' : ''}">
              <span>${p.emoji}</span>
              <span>${lang === 'bn' ? p.labelBn : p.name.split(' ')[0]}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div style="margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
        ${user ? `
          <div style="margin-bottom: 1rem;">
            <div style="font-weight: 700; color: var(--color-ink-950);">${user.name}</div>
            <div style="font-size: 0.8rem; color: var(--color-ink-500);">${user.phone} (${user.role})</div>
          </div>
          <button id="mobile-logout-btn" class="btn btn-danger-outline btn-block btn-sm">Sign Out</button>
        ` : `
          <a href="/login.html" class="btn btn-primary btn-block">Sign In / Register</a>
        `}
      </div>
    </div>

    <!-- Global AI Symptom Checker Modal Mount -->
    <div id="ai-symptom-modal" class="modal-backdrop">
      <div class="modal-box" style="max-width: 600px;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title" style="display: flex; align-items: center; gap: 0.5rem;">
              ${icons.sparkles(20)} AI Clinical Specialist Triage
            </h3>
            <p style="font-size: 0.85rem; color: var(--color-ink-500); margin: 0.25rem 0 0;">
              Type symptoms in English or বাংলা to find recommended specialties and active practitioners.
            </p>
          </div>
          <button id="ai-modal-close" class="modal-close">${icons.x(18)}</button>
        </div>

        <div class="modal-body">
          <form id="ai-symptom-form">
            <div class="form-group">
              <label class="form-label" for="ai-symptoms-input">Clinical Symptoms or Presentation</label>
              <textarea id="ai-symptoms-input" class="form-control" rows="3" placeholder="e.g. Chest pain with sweating, severe skin rash, শিশুর তীব্র জ্বর..." required></textarea>
            </div>

            <!-- Quick Suggestion Chips -->
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
              <span style="font-size: 0.75rem; color: var(--color-ink-500); font-weight: 600; align-self: center;">Examples:</span>
              <button type="button" class="badge badge-neutral ai-chip" data-text="Chest pain, breathlessness and palpitations">Chest Pain</button>
              <button type="button" class="badge badge-neutral ai-chip" data-text="Severe skin itching, red rashes and acne">Skin Rash</button>
              <button type="button" class="badge badge-neutral ai-chip" data-text="Knee pain and difficulty walking for 2 weeks">Joint Pain</button>
              <button type="button" class="badge badge-neutral ai-chip" data-text="শিশুর তীব্র জ্বর ও সর্দি">শিশুর জ্বর</button>
            </div>

            <button type="submit" id="ai-analyze-btn" class="btn btn-primary" style="width: 100%;">
              ${icons.search(16)} Analyze Symptoms & Suggest Specialist
            </button>
          </form>

          <!-- Results Section -->
          <div id="ai-results-box" style="display: none; margin-top: 1.5rem; border-top: 1px solid var(--color-border); padding-top: 1.25rem;">
            <!-- Injected dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  document.getElementById('font-size-toggle-btn')?.addEventListener('click', () => {
    const newSize = toggleFontSize();
    showToast(`Text size: ${newSize}`, 'info');
  });

  document.getElementById('lang-toggle-btn')?.addEventListener('click', () => {
    const nextLang = getLang() === 'en' ? 'bn' : 'en';
    setLang(nextLang);
    renderNavbar();
    applyTranslations();
  });

  document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
    toggleTheme();
    renderNavbar();
  });

  document.getElementById('reduce-effects-btn')?.addEventListener('click', () => {
    const isReduced = localStorage.getItem('docbook_reduce_motion') === 'true';
    const nextState = !isReduced;
    localStorage.setItem('docbook_reduce_motion', nextState ? 'true' : 'false');
    if (nextState) {
      document.documentElement.classList.add('reduce-effects');
      showToast('3D effects reduced for performance/comfort.', 'info');
    } else {
      document.documentElement.classList.remove('reduce-effects');
      showToast('Full 3D effects enabled.', 'success');
    }
    renderNavbar();
    window.dispatchEvent(new CustomEvent('docbook:reduce-effects-changed', { detail: { enabled: nextState } }));
  });

  // Desktop Palette Dropdown Handlers
  const paletteBtn = document.getElementById('palette-dropdown-btn');
  const paletteMenu = document.getElementById('palette-dropdown-menu');
  if (paletteBtn && paletteMenu) {
    paletteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      paletteMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!paletteMenu.contains(e.target) && e.target !== paletteBtn) {
        paletteMenu.classList.remove('show');
      }
    });

    paletteMenu.querySelectorAll('.palette-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-palette-id');
        setPalette(id);
        paletteMenu.classList.remove('show');
        renderNavbar();
        const selectedObj = PALETTES.find(p => p.id === id);
        showToast(`Theme changed to ${selectedObj ? selectedObj.name : id}`, 'success');
      });
    });
  }

  // Mobile Palette Switcher Buttons
  document.querySelectorAll('.mobile-palette-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-palette-id');
      setPalette(id);
      renderNavbar();
      const selectedObj = PALETTES.find(p => p.id === id);
      showToast(`Theme changed to ${selectedObj ? selectedObj.name : id}`, 'success');
    });
  });

  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown-menu');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
  }

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearSession();
    showToast('Signed out successfully.', 'info');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 500);
  });

  document.getElementById('mobile-logout-btn')?.addEventListener('click', () => {
    clearSession();
    showToast('Signed out successfully.', 'info');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 500);
  });

  // Mobile Drawer Toggle Handlers
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileCloseBtn = document.getElementById('mobile-drawer-close');

  function openMobileDrawer() {
    mobileDrawer?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    mobileDrawer?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  mobileToggleBtn?.addEventListener('click', openMobileDrawer);
  mobileCloseBtn?.addEventListener('click', closeMobileDrawer);
  mobileOverlay?.addEventListener('click', closeMobileDrawer);

  // Global AI Symptom Checker Modal Handlers
  const symptomModal = document.getElementById('ai-symptom-modal');
  const symptomInput = document.getElementById('ai-symptoms-input');
  const resultsBox = document.getElementById('ai-results-box');

  const openSymptomModal = () => {
    closeMobileDrawer();
    symptomModal?.classList.add('show');
    setTimeout(() => symptomInput?.focus(), 100);
  };

  const closeSymptomModal = () => {
    symptomModal?.classList.remove('show');
  };

  document.getElementById('nav-symptom-btn')?.addEventListener('click', openSymptomModal);
  document.getElementById('mobile-symptom-btn')?.addEventListener('click', openSymptomModal);
  document.getElementById('ai-modal-close')?.addEventListener('click', closeSymptomModal);
  symptomModal?.addEventListener('click', (e) => {
    if (e.target === symptomModal) closeSymptomModal();
  });

  // Chips click helper
  document.querySelectorAll('.ai-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      symptomInput.value = chip.getAttribute('data-text');
      symptomInput.focus();
    });
  });

  document.getElementById('ai-symptom-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = symptomInput.value.trim();
    if (!query) return;

    const btn = document.getElementById('ai-analyze-btn');
    btn.disabled = true;
    btn.innerHTML = `Analyzing presentation...`;

    resultsBox.style.display = 'block';
    resultsBox.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--color-ink-500);">Matching clinical taxonomy...</div>';

    try {
      const response = await fetch('/api/ai/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: query })
      });
      const json = await response.json();
      const data = json.data;

      const isEmergency = data.urgency === 'EMERGENCY';
      let urgencyBadge = `<span class="badge badge-success">Routine / Non-Emergency</span>`;
      if (data.urgency === 'HIGH') urgencyBadge = `<span class="badge badge-warning">High Priority</span>`;
      if (isEmergency) urgencyBadge = `<span class="badge badge-danger">Emergency Triage Required</span>`;

      let doctorsHtml = '';
      if (data.recommendedDoctors && data.recommendedDoctors.length > 0) {
        doctorsHtml = `
          <div style="margin-top: 1rem;">
            <div style="font-size: 0.8125rem; font-weight: 700; color: var(--color-ink-900); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.04em;">Vetted Practitioners:</div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${data.recommendedDoctors.map(d => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-surface); border: 1px solid var(--color-border); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm);">
                  <div>
                    <strong style="font-size: 0.95rem; color: var(--color-ink-950);">${d.doctor_name}</strong>
                    <div style="font-size: 0.75rem; color: var(--color-ink-500);">${d.hospital_name} • Fee: ৳${d.consultation_fee} • ★ ${d.rating_avg.toFixed(1)}</div>
                  </div>
                  <a href="/doctor-profile.html?id=${d.id}" class="btn btn-primary btn-sm">Book Visit</a>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      resultsBox.innerHTML = `
        <div style="background: ${isEmergency ? 'var(--color-danger-subtle)' : 'var(--color-surface-subtle)'}; border: 1px solid ${isEmergency ? 'var(--color-danger-border)' : 'var(--color-border)'}; padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-ink-500); text-transform: uppercase;">Clinical Assessment</span>
            ${urgencyBadge}
          </div>

          ${data.emergencyAlert ? `
            <div style="color: var(--color-danger-text); font-weight: 700; font-size: 0.875rem; margin-bottom: 0.75rem; line-height: 1.4;">
              ${icons.alertTriangle(16)} ${data.emergencyAlert}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; align-items: center;">
            <div>
              <div style="font-size: 0.75rem; color: var(--color-ink-500); text-transform: uppercase;">Recommended Department</div>
              <div style="font-size: 1.2rem; font-weight: 700; color: var(--color-teal-700);">
                ${data.suggestedSpecialty.nameEn}
                <span style="font-size: 0.85rem; font-weight: 500; color: var(--color-ink-500); display: block;">${data.suggestedSpecialty.nameBn}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <span class="badge badge-info">${data.suggestedSpecialty.confidence} Match</span>
            </div>
          </div>
        </div>

        ${doctorsHtml}
      `;

    } catch (err) {
      resultsBox.innerHTML = `<div style="color: var(--color-danger); text-align: center; padding: 1rem;">${err.message || 'Analysis failed.'}</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = `${icons.search(16)} Analyze Symptoms & Suggest Specialist`;
    }
  });

  applyTranslations();
}

export function renderFooter() {
  const footerContainer = document.getElementById('footer-mount');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <div class="nav-brand" style="margin-bottom: 0.85rem;">
              <div class="brand-icon">
                ${icons.stethoscope(18)}
              </div>
              <span>DocBook</span>
            </div>
            <p style="font-size: 0.875rem; margin-bottom: 1rem; color: var(--color-ink-600); line-height: 1.6;" data-i18n="hero_subtitle">
              Zero wait times, verified BMDC doctors, real-time slot holds, and transparent fee policies across Dinajpur healthcare facilities.
            </p>
            <p style="font-size: 0.8125rem; font-weight: 600; color: var(--color-teal-700); display: flex; align-items: center; gap: 6px;">
              ${icons.phone(14)} 24/7 Clinical Desk: +880 1711-223301
            </p>
          </div>

          <div class="footer-col">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="/index.html">Home</a></li>
              <li><a href="/doctors.html">Find Doctors</a></li>
              <li><a href="/symptom-checker.html">AI Symptom Checker</a></li>
              <li><a href="/my-appointments.html">My Appointments</a></li>
              <li><a href="/login.html">Sign In / Register</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Top Specialties</h4>
            <ul class="footer-links">
              <li><a href="/doctors.html?specialty=cardiology">Cardiology (হৃদরোগ)</a></li>
              <li><a href="/doctors.html?specialty=pediatrics">Pediatrics (শিশু রোগ)</a></li>
              <li><a href="/doctors.html?specialty=gynecology">Gynecology (স্ত্রীরোগ)</a></li>
              <li><a href="/doctors.html?specialty=dermatology">Dermatology (চর্মরোগ)</a></li>
              <li><a href="/doctors.html?specialty=orthopedics">Orthopedics (হাড় ও জোড়া)</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Accreditation & Trust</h4>
            <p style="font-size: 0.8125rem; color: var(--color-ink-600); margin-bottom: 0.75rem; line-height: 1.5;">
              Every practicing physician on DocBook is verified with the Bangladesh Medical & Dental Council (BMDC).
            </p>
            <div class="badge badge-success" style="font-size: 0.75rem;">
              ${icons.shieldCheck(14)} 100% BMDC Certified
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div>© ${new Date().getFullYear()} DocBook Healthcare Ltd. All rights reserved.</div>
          <div style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
            <button type="button" class="footer-policy-btn" data-policy="terms" style="background:none; border:none; color:inherit; font-size:inherit; cursor:pointer; text-decoration:underline;">Terms of Care</button>
            <button type="button" class="footer-policy-btn" data-policy="privacy" style="background:none; border:none; color:inherit; font-size:inherit; cursor:pointer; text-decoration:underline;">Patient Privacy</button>
            <button type="button" class="footer-policy-btn" data-policy="refund" style="background:none; border:none; color:inherit; font-size:inherit; cursor:pointer; text-decoration:underline;">Cancellation Policy</button>
          </div>
        </div>
      </div>
    </footer>

    <!-- Global Policy Modal Mount -->
    <div id="policy-modal" class="modal-backdrop">
      <div class="modal-box" style="max-width: 560px;">
        <div class="modal-header">
          <h3 id="policy-modal-title" class="modal-title" style="font-size: 1.15rem;">Clinical Policy</h3>
          <button id="policy-modal-close" class="modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div id="policy-modal-body" class="modal-body" style="font-size: 0.875rem; color: var(--color-ink-700); line-height: 1.6;">
        </div>
        <div class="modal-footer">
          <button id="policy-modal-dismiss" class="btn btn-primary btn-sm">I Understand</button>
        </div>
      </div>
    </div>
  `;

  // Attach policy dialog triggers
  const policyModal = document.getElementById('policy-modal');
  const policyTitle = document.getElementById('policy-modal-title');
  const policyBody = document.getElementById('policy-modal-body');
  const closePolicyModal = () => policyModal?.classList.remove('show');

  document.getElementById('policy-modal-close')?.addEventListener('click', closePolicyModal);
  document.getElementById('policy-modal-dismiss')?.addEventListener('click', closePolicyModal);
  policyModal?.addEventListener('click', (e) => {
    if (e.target === policyModal) closePolicyModal();
  });

  const policies = {
    terms: {
      title: 'DocBook Terms of Outpatient Care',
      content: `
        <p><strong>1. BMDC Certified Care:</strong> All consulting doctors are independently registered with the Bangladesh Medical & Dental Council (BMDC). DocBook verifies registration credentials annually.</p>
        <p style="margin-top: 8px;"><strong>2. Atomic 5-Minute Slot Locks:</strong> When booking, your selected appointment window is reserved exclusively for 5 minutes to prevent double-booking across hospital desks.</p>
        <p style="margin-top: 8px;"><strong>3. Serial Numbers & Queue:</strong> Walk-in arrivals and online bookings receive sequential serials. Emergent trauma or cardiac events may be prioritized by treating physicians.</p>
      `
    },
    privacy: {
      title: 'Patient Health Information Privacy',
      content: `
        <p><strong>1. Medical Confidentiality:</strong> Your symptoms, prescriptions, and medical history are encrypted and accessible exclusively by you and your authorized treating physician.</p>
        <p style="margin-top: 8px;"><strong>2. No Data Monetization:</strong> DocBook does not sell, market, or share patient consultation records with third-party pharmaceutical or insurance agencies.</p>
        <p style="margin-top: 8px;"><strong>3. Audit Transparency:</strong> Every access to clinical records is logged in an immutable, tamper-evident security audit trail.</p>
      `
    },
    refund: {
      title: 'Appointment Cancellation & Refund Policy',
      content: `
        <p><strong>1. Over 24 Hours Prior:</strong> Cancellations made more than 24 hours before the chamber session receive a <strong>90% refund</strong> credited within 24 hours.</p>
        <p style="margin-top: 8px;"><strong>2. 6 to 24 Hours Prior:</strong> Cancellations made between 6 and 24 hours before consultation receive a <strong>50% refund</strong>.</p>
        <p style="margin-top: 8px;"><strong>3. Under 6 Hours:</strong> Due to slot reservation commitment, cancellations under 6 hours are non-refundable. Patients may reschedule once for free up to 2 hours prior.</p>
      `
    }
  };

  document.querySelectorAll('.footer-policy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-policy');
      const data = policies[type];
      if (data && policyModal) {
        policyTitle.textContent = data.title;
        policyBody.innerHTML = data.content;
        policyModal.classList.add('show');
      }
    });
  });

  // Highlight active link in navbar
  const currentPath = window.location.pathname.toLowerCase();
  document.querySelectorAll('.nav-link, .mobile-drawer-link').forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href && (currentPath === href || (currentPath === '/' && (href === '/index.html' || href === '/')))) {
      link.classList.add('active');
    }
  });

  applyTranslations();
}

// Auto render on load
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('docbook_reduce_motion') === 'true') {
    document.documentElement.classList.add('reduce-effects');
  }

  renderNavbar();
  renderFooter();
  initAllAnimations();

  // Register PWA Service Worker & Manifest
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('PWA Service Worker registration skipped:', err);
    });
  }
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }
});

// PWA Install Prompt Handler & Non-intrusive Banner
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showPwaInstallBanner();
});

export function showPwaInstallBanner() {
  if (localStorage.getItem('docbook_pwa_dismissed') === 'true') return;
  if (document.getElementById('pwa-install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 20px;
    right: 20px;
    max-width: 440px;
    margin: 0 auto;
    background: var(--color-surface, #ffffff);
    color: var(--color-ink-950, #0f172a);
    border: 1.5px solid var(--color-teal-700, #0d9488);
    border-radius: var(--radius-md, 12px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.22);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    z-index: 9998;
    backdrop-filter: blur(12px);
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="width: 38px; height: 38px; border-radius: 10px; background: var(--color-teal-50, #f0fdfa); border: 1px solid var(--color-teal-200, #99f6e4); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
        🩺
      </div>
      <div>
        <div style="font-size: 0.8125rem; font-weight: 700; color: var(--color-ink-950, #0f172a); line-height: 1.2;">Install DocBook App</div>
        <div style="font-size: 0.72rem; color: var(--color-ink-600, #64748b);">Instant chamber queue tokens & offline prescriptions</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 6px;">
      <button id="pwa-install-action-btn" class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 5px 12px; white-space: nowrap;">
        Install
      </button>
      <button id="pwa-dismiss-action-btn" style="background: none; border: none; font-size: 1.25rem; color: var(--color-ink-400, #94a3b8); cursor: pointer; padding: 2px 6px;" title="Dismiss">
        &times;
      </button>
    </div>
  `;

  document.body.appendChild(banner);

  banner.querySelector('#pwa-install-action-btn')?.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        showToast('DocBook App successfully installed!', 'success');
      }
      deferredInstallPrompt = null;
    } else {
      showToast('DocBook App ready to add to your Home Screen!', 'info');
    }
    banner.remove();
  });

  banner.querySelector('#pwa-dismiss-action-btn')?.addEventListener('click', () => {
    localStorage.setItem('docbook_pwa_dismissed', 'true');
    banner.remove();
  });
}

