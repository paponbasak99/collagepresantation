// DocBook Viva & College Presentation Demo Toolkit (demoMode.js)
// Enables 1-Click Role Switching and an Interactive 6-Step Presentation Walkthrough for Evaluators.

import { showToast } from './toast.js';

const DEMO_PERSONAS = [
  {
    role: 'doctor',
    title: 'Doctor',
    name: 'Prof. Dr. Tariq Rahman',
    meta: 'Cardiology Specialist',
    phone: '01711000002',
    pass: 'Doctor@1234',
    url: '/doctor-panel.html',
    badge: 'BMDC Certified',
    emoji: '👨‍⚕️'
  },
  {
    role: 'receptionist',
    title: 'Reception',
    name: 'Lina Akter',
    meta: 'Front Desk Operator',
    phone: '01711000004',
    pass: 'Reception@1234',
    url: '/reception-panel.html',
    badge: 'OPD Desk',
    emoji: '🏥'
  },
  {
    role: 'admin',
    title: 'Chief Admin',
    name: 'System Administrator',
    meta: 'Governance & Analytics',
    phone: '01711000001',
    pass: 'Admin@1234',
    url: '/admin-dashboard.html',
    badge: 'Full Access',
    emoji: '🛡️'
  },
  {
    role: 'patient',
    title: 'Patient',
    name: 'Tanvir Ahmed',
    meta: 'Registered Outpatient',
    phone: '01711000005',
    pass: 'Patient@1234',
    url: '/my-appointments.html',
    badge: 'Active Token',
    emoji: '🧑'
  }
];

export async function loginAsPersona(persona) {
  try {
    showToast(`Logging in as ${persona.name} (${persona.title})...`, 'info', 1800);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: persona.phone, password: persona.pass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Login failed');

    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));

    showToast(`Authenticated as ${persona.name}`, 'success', 1800);
    setTimeout(() => {
      window.location.href = persona.url;
    }, 400);
  } catch (err) {
    showToast(err.message || 'Demo switch failed', 'error');
  }
}

// 6-Step Presentation Walkthrough for Examiners
const WALKTHROUGH_STEPS = [
  {
    step: 1,
    title: '1. Discovery & 24-Specialty Filtering',
    desc: 'Patients find BMDC-certified doctors across 24 specialties and 15 hospitals in Dinajpur with real-time fee and rating filters.',
    actionLabel: 'Go to Doctor Directory',
    actionUrl: '/doctors.html'
  },
  {
    step: 2,
    title: '2. Atomic 5-Minute Slot Reservation',
    desc: 'Atomic slot reservation prevents race conditions and zero double-booking guarantee via SQLite transactions with a visual countdown timer.',
    actionLabel: 'View Doctor Profile',
    actionUrl: '/doctor-profile.html?id=3372'
  },
  {
    step: 3,
    title: '3. bKash / Nagad Mobile Financial Checkout',
    desc: 'Simulated sandbox for Bangladesh MFS (Mobile Financial Services) with instant OTP validation, wallet debiting, and cash-at-clinic fallback.',
    actionLabel: 'Browse Chambers',
    actionUrl: '/doctors.html'
  },
  {
    step: 4,
    title: '4. Dynamic Slip & Cryptographic QR Verification',
    desc: 'Print-ready A4 / 80mm POS slip with serial number (e.g. SL-04) and authenticable QR code verifiable by public health scanners.',
    actionLabel: 'Check My Appointments',
    actionUrl: '/my-appointments.html'
  },
  {
    step: 5,
    title: '5. Front Desk Reception & Lounge TV Display',
    desc: 'Real-time outpatient reception desk with walk-in token issuance, cash collection, and 60fps TV lounge waiting board.',
    actionLabel: 'Open Reception Panel',
    actionUrl: '/reception-panel.html'
  },
  {
    step: 6,
    title: '6. Doctor Workspace & Live Clinical Drug Safety Audit',
    desc: 'Digital e-prescription builder with real-time adverse drug interaction checks (e.g. Warfarin + Aspirin), allergy alerts, and revenue stats.',
    actionLabel: 'Open Doctor Workspace',
    actionUrl: '/doctor-panel.html'
  }
];

export function renderDemoBar() {
  if (document.getElementById('demo-suite-root')) return;

  const root = document.createElement('div');
  root.id = 'demo-suite-root';
  root.innerHTML = `
    <!-- Floating Demo Toggle Pill -->
    <div id="demo-floating-trigger" style="position: fixed; bottom: 24px; left: 24px; z-index: 9999; display: flex; align-items: center; gap: 8px;">
      <button id="demo-pill-btn" style="background: linear-gradient(135deg, #0d7a71, #0f766e); color: white; border: 1.5px solid rgba(255, 255, 255, 0.4); border-radius: 9999px; padding: 8px 16px; font-weight: 700; font-size: 0.8125rem; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 10px 25px -4px rgba(13, 122, 113, 0.5), inset 0 1px 0 rgba(255,255,255,0.4); transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
        <span style="display: inline-block; animation: demo-pulse 2s infinite;">🎓</span>
        <span>Viva Demo Mode</span>
        <span style="font-size: 0.6875rem; background: rgba(255,255,255,0.22); padding: 1px 6px; border-radius: 999px;">Quick Switch</span>
      </button>

      <button id="walkthrough-btn" title="6-Step Presentation Walkthrough" style="background: var(--color-surface); color: var(--color-ink-900); border: 1px solid var(--color-border); border-radius: 9999px; padding: 8px 12px; font-weight: 700; font-size: 0.8125rem; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: var(--shadow-sm); transition: all 0.2s ease;">
        <span>🎬</span>
        <span>Guided Tour</span>
      </button>
    </div>

    <!-- Demo Persona Modal -->
    <div id="demo-persona-modal" class="modal-backdrop">
      <div class="modal-box" style="max-width: 520px; padding: 0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0d7a71, #0a5c55); color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.08em; opacity: 0.85;">College Presentation Toolkit</div>
            <h3 style="margin: 4px 0 0; font-size: 1.2rem; font-weight: 800; color: white;">1-Click Persona Switcher</h3>
          </div>
          <button id="demo-modal-close" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; opacity: 0.8;">&times;</button>
        </div>

        <div style="padding: 20px 24px; background: var(--color-canvas);">
          <p style="font-size: 0.8125rem; color: var(--color-ink-600); margin: 0 0 16px; line-height: 1.45;">
            Switch user roles instantly without typing passwords or logging out. Ideal for showing different privileges to evaluators:
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${DEMO_PERSONAS.map(p => `
              <div class="demo-card-btn" data-role="${p.role}" style="background: var(--color-surface); border: 1.5px solid var(--color-border); border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 1.35rem;">${p.emoji}</span>
                    <span style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 999px; background: var(--color-teal-50); color: var(--color-teal-700);">${p.badge}</span>
                  </div>
                  <div style="font-weight: 700; font-size: 0.875rem; color: var(--color-ink-950); margin-bottom: 2px;">${p.name}</div>
                  <div style="font-size: 0.72rem; color: var(--color-ink-500);">${p.meta}</div>
                </div>
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; font-weight: 700; color: var(--color-teal-700);">
                  <span>Switch Role</span>
                  <span>→</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Walkthrough Showcase Modal -->
    <div id="walkthrough-modal" class="modal-backdrop">
      <div class="modal-box" style="max-width: 600px; padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span style="font-size: 0.72rem; font-weight: 800; color: var(--color-teal-700); text-transform: uppercase; letter-spacing: 0.08em;">Full Lifecycle Evaluation</span>
            <h3 style="margin: 4px 0 0; font-size: 1.25rem; font-weight: 800;">6-Step Viva Presentation Tour</h3>
          </div>
          <button id="walkthrough-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding-right: 4px;">
          ${WALKTHROUGH_STEPS.map(s => `
            <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 14px; display: flex; justify-content: space-between; align-items: center; gap: 14px;">
              <div style="flex: 1;">
                <h4 style="margin: 0 0 4px; font-size: 0.9375rem; font-weight: 700; color: var(--color-ink-950);">${s.title}</h4>
                <p style="margin: 0; font-size: 0.8125rem; color: var(--color-ink-600); line-height: 1.4;">${s.desc}</p>
              </div>
              <a href="${s.actionUrl}" class="btn btn-primary btn-sm" style="flex-shrink: 0; font-size: 0.75rem;">
                ${s.actionLabel}
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <style>
      @keyframes demo-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }
      .demo-card-btn:hover {
        border-color: var(--color-teal-700) !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(13, 122, 113, 0.2);
      }
    </style>
  `;

  document.body.appendChild(root);

  // Wire Persona Modal
  const personaModal = document.getElementById('demo-persona-modal');
  const pillBtn = document.getElementById('demo-pill-btn');
  const closeBtn = document.getElementById('demo-modal-close');

  pillBtn?.addEventListener('click', () => personaModal.classList.add('show'));
  closeBtn?.addEventListener('click', () => personaModal.classList.remove('show'));
  personaModal?.addEventListener('click', (e) => {
    if (e.target === personaModal) personaModal.classList.remove('show');
  });

  root.querySelectorAll('.demo-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      const persona = DEMO_PERSONAS.find(p => p.role === role);
      if (persona) loginAsPersona(persona);
    });
  });

  // Wire Walkthrough Modal
  const wtModal = document.getElementById('walkthrough-modal');
  const wtBtn = document.getElementById('walkthrough-btn');
  const wtClose = document.getElementById('walkthrough-close');

  wtBtn?.addEventListener('click', () => wtModal.classList.add('show'));
  wtClose?.addEventListener('click', () => wtModal.classList.remove('show'));
  wtModal?.addEventListener('click', (e) => {
    if (e.target === wtModal) wtModal.classList.remove('show');
  });
}

// Auto-boot
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderDemoBar);
  } else {
    renderDemoBar();
  }
}
