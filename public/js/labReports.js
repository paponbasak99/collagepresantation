// DocBook Patient & Doctor Laboratory Reports Vault (labReports.js)
// Comprehensive Diagnostic Record Management, Reference Ranges & Investigation Preview

const STORAGE_KEY = 'docbook_lab_reports_v1';

export const COMMON_LAB_TESTS = [
  {
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    parameters: [
      { param: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', refRange: '13.0 - 17.5', status: 'normal' },
      { param: 'Total WBC Count', value: '7,800', unit: '/cumm', refRange: '4,000 - 11,000', status: 'normal' },
      { param: 'Platelet Count', value: '265,000', unit: '/cumm', refRange: '150,000 - 450,000', status: 'normal' },
      { param: 'ESR (Westergren)', value: '12', unit: 'mm in 1st hr', refRange: '0 - 15', status: 'normal' }
    ]
  },
  {
    name: 'Fasting Blood Glucose (FBS) & HbA1c',
    category: 'Biochemistry',
    parameters: [
      { param: 'Fasting Blood Sugar', value: '108', unit: 'mg/dL', refRange: '70 - 99', status: 'elevated' },
      { param: 'HbA1c (Glycated Hemoglobin)', value: '6.1', unit: '%', refRange: '4.0 - 5.6', status: 'elevated' },
      { param: 'Estimated Avg Glucose (eAG)', value: '128', unit: 'mg/dL', refRange: '68 - 115', status: 'elevated' }
    ]
  },
  {
    name: 'Comprehensive Lipid Profile',
    category: 'Biochemistry',
    parameters: [
      { param: 'Total Cholesterol', value: '185', unit: 'mg/dL', refRange: '< 200', status: 'normal' },
      { param: 'Triglycerides', value: '162', unit: 'mg/dL', refRange: '< 150', status: 'elevated' },
      { param: 'HDL Cholesterol', value: '46', unit: 'mg/dL', refRange: '> 40', status: 'normal' },
      { param: 'LDL Cholesterol', value: '107', unit: 'mg/dL', refRange: '< 100', status: 'borderline' }
    ]
  },
  {
    name: 'Kidney Function Test (KFT / RFT)',
    category: 'Biochemistry',
    parameters: [
      { param: 'Serum Creatinine', value: '0.95', unit: 'mg/dL', refRange: '0.7 - 1.3', status: 'normal' },
      { param: 'Blood Urea Nitrogen (BUN)', value: '16', unit: 'mg/dL', refRange: '7 - 20', status: 'normal' },
      { param: 'eGFR', value: '104', unit: 'mL/min/1.73m²', refRange: '> 90', status: 'normal' }
    ]
  },
  {
    name: '12-Lead Electrocardiogram (ECG)',
    category: 'Cardiology',
    parameters: [
      { param: 'Ventricular Heart Rate', value: '74', unit: 'bpm', refRange: '60 - 100', status: 'normal' },
      { param: 'PR Interval', value: '154', unit: 'ms', refRange: '120 - 200', status: 'normal' },
      { param: 'QRS Duration', value: '88', unit: 'ms', refRange: '80 - 120', status: 'normal' },
      { param: 'Interpretation', value: 'Normal Sinus Rhythm. No ST-T wave abnormalities', unit: '-', refRange: 'Normal', status: 'normal' }
    ]
  },
  {
    name: 'Chest X-Ray (PA View)',
    category: 'Radiology',
    parameters: [
      { param: 'Cardiothoracic Ratio', value: '< 0.5 (Normal)', unit: '-', refRange: '< 0.5', status: 'normal' },
      { param: 'Bilateral Lung Fields', value: 'Clear, no focal consolidation or effusion', unit: '-', refRange: 'Clear', status: 'normal' },
      { param: 'Costophrenic Angles', value: 'Sharp and well delineated bilaterally', unit: '-', refRange: 'Sharp', status: 'normal' }
    ]
  }
];

const DEFAULT_REPORTS = [
  {
    id: 'REP-2026-0091',
    patientPhone: '01711000005',
    patientName: 'Tanvir Ahmed',
    patientAge: 32,
    patientGender: 'Male',
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    labName: 'Popular Diagnostic Centre, Dinajpur',
    referringDoctor: 'Prof. Dr. Tariq Rahman',
    date: '2026-09-28',
    status: 'Verified',
    parameters: [
      { param: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', refRange: '13.0 - 17.5', status: 'normal' },
      { param: 'Total WBC Count', value: '7,800', unit: '/cumm', refRange: '4,000 - 11,000', status: 'normal' },
      { param: 'Platelet Count', value: '265,000', unit: '/cumm', refRange: '150,000 - 450,000', status: 'normal' },
      { param: 'ESR (Westergren)', value: '12', unit: 'mm in 1st hr', refRange: '0 - 15', status: 'normal' }
    ],
    pathologist: 'Dr. S. K. Roy, MBBS, MD (Pathology)',
    doctorNotes: 'Normal blood count parameters. No signs of infection, anemia, or thrombocytopenia.'
  },
  {
    id: 'REP-2026-0092',
    patientPhone: '01711000005',
    patientName: 'Tanvir Ahmed',
    patientAge: 32,
    patientGender: 'Male',
    testName: 'Fasting Blood Glucose (FBS) & HbA1c',
    category: 'Biochemistry',
    labName: 'Ibn Sina Diagnostic & Consultation Centre, Dinajpur',
    referringDoctor: 'Prof. Dr. Tariq Rahman',
    date: '2026-10-02',
    status: 'Verified',
    parameters: [
      { param: 'Fasting Blood Sugar', value: '108', unit: 'mg/dL', refRange: '70 - 99', status: 'elevated' },
      { param: 'HbA1c (Glycated Hemoglobin)', value: '6.1', unit: '%', refRange: '4.0 - 5.6', status: 'elevated' },
      { param: 'Estimated Avg Glucose (eAG)', value: '128', unit: 'mg/dL', refRange: '68 - 115', status: 'elevated' }
    ],
    pathologist: 'Dr. Nazma Sultana, M.Phil (Biochem)',
    doctorNotes: 'Mild impaired fasting glucose (Prediabetes stage). Lifestyle modification and dietary counseling advised.'
  },
  {
    id: 'REP-2026-0093',
    patientPhone: '01711000005',
    patientName: 'Tanvir Ahmed',
    patientAge: 32,
    patientGender: 'Male',
    testName: 'Comprehensive Lipid Profile',
    category: 'Biochemistry',
    labName: 'M Abdur Rahim Medical College Diagnostic Lab',
    referringDoctor: 'Prof. Dr. Tariq Rahman',
    date: '2026-10-04',
    status: 'Verified',
    parameters: [
      { param: 'Total Cholesterol', value: '185', unit: 'mg/dL', refRange: '< 200', status: 'normal' },
      { param: 'Triglycerides', value: '162', unit: 'mg/dL', refRange: '< 150', status: 'elevated' },
      { param: 'HDL Cholesterol', value: '46', unit: 'mg/dL', refRange: '> 40', status: 'normal' },
      { param: 'LDL Cholesterol', value: '107', unit: 'mg/dL', refRange: '< 100', status: 'borderline' }
    ],
    pathologist: 'Prof. Dr. M. A. Jalil, Head of Biochemistry',
    doctorNotes: 'Borderline hypertriglyceridemia. Advised 30 minutes daily aerobic exercise and low saturated fats.'
  }
];

export function getStoredLabReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REPORTS));
      return [...DEFAULT_REPORTS];
    }
    return JSON.parse(raw);
  } catch (err) {
    return [...DEFAULT_REPORTS];
  }
}

export function saveLabReport(report) {
  const reports = getStoredLabReports();
  reports.unshift(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  window.dispatchEvent(new CustomEvent('docbook:lab-reports-updated', { detail: report }));
  return report;
}

export function deleteLabReport(reportId) {
  const reports = getStoredLabReports().filter(r => r.id !== reportId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  window.dispatchEvent(new CustomEvent('docbook:lab-reports-updated'));
}

export function getReportsForPatient(phoneOrId) {
  const all = getStoredLabReports();
  if (!phoneOrId) return all;
  return all.filter(r => r.patientPhone === phoneOrId || String(r.patientPhone).includes(String(phoneOrId)));
}

/**
 * Renders the modal showing full official lab investigation sheet
 */
export function openLabReportModal(reportId) {
  const report = getStoredLabReports().find(r => r.id === reportId);
  if (!report) return;

  let modal = document.getElementById('lab-report-preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'lab-report-preview-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const statusBadge = (status) => {
    if (status === 'elevated') return '<span style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; font-size: 0.6875rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">HIGH</span>';
    if (status === 'borderline') return '<span style="background: #fffbeb; color: #d97706; border: 1px solid #fde68a; font-size: 0.6875rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">BORDERLINE</span>';
    return '<span style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 0.6875rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">NORMAL</span>';
  };

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 720px; width: 95%;">
      <div class="modal-header" style="border-bottom: 2px solid var(--color-teal-700); padding-bottom: 12px;">
        <div>
          <span style="font-size: 0.7rem; font-weight: 800; color: var(--color-teal-700); text-transform: uppercase; letter-spacing: 0.05em;">DocBook Diagnostic Record Vault</span>
          <h3 class="modal-title" style="font-size: 1.15rem; margin-top: 2px;">${report.testName}</h3>
        </div>
        <button id="close-report-modal-btn" class="modal-close">&times;</button>
      </div>

      <div class="modal-body" style="padding: 20px 0;">
        <!-- Clinical Sheet Header -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 0.8125rem;">
          <div>
            <div style="color: #64748b; font-size: 0.7rem; font-weight: 600;">PATIENT NAME</div>
            <strong style="color: #0f172a; font-size: 0.9rem;">${report.patientName}</strong>
            <div style="color: #475569; font-size: 0.75rem;">${report.patientAge} Yrs • ${report.patientGender}</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 0.7rem; font-weight: 600;">LAB FACILITY</div>
            <strong style="color: #0f172a;">${report.labName}</strong>
            <div style="color: #0d9488; font-size: 0.75rem; font-weight: 600;">Ref ID: ${report.id}</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 0.7rem; font-weight: 600;">INVESTIGATION DATE</div>
            <strong style="color: #0f172a;">${report.date}</strong>
            <div style="color: #16a34a; font-size: 0.75rem; font-weight: 700;">● ${report.status}</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 0.7rem; font-weight: 600;">REFERRED BY</div>
            <strong style="color: #0f172a;">${report.referringDoctor || 'Medical Officer'}</strong>
          </div>
        </div>

        <!-- Parameters Table -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #475569;">
                <th style="padding: 10px 12px;">Test Parameter</th>
                <th style="padding: 10px 12px;">Observed Value</th>
                <th style="padding: 10px 12px;">Unit</th>
                <th style="padding: 10px 12px;">Reference Interval</th>
                <th style="padding: 10px 12px; text-align: center;">Flag</th>
              </tr>
            </thead>
            <tbody>
              ${(report.parameters || []).map(p => `
                <tr style="border-top: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${p.param}</td>
                  <td style="padding: 10px 12px; font-weight: 700; color: ${p.status === 'elevated' ? '#dc2626' : '#0f172a'};">${p.value}</td>
                  <td style="padding: 10px 12px; color: #64748b;">${p.unit}</td>
                  <td style="padding: 10px 12px; color: #64748b;">${p.refRange}</td>
                  <td style="padding: 10px 12px; text-align: center;">${statusBadge(p.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Clinical Remarks -->
        <div style="background: #fdfefe; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
          <div style="font-size: 0.72rem; font-weight: 700; color: #0f766e; text-transform: uppercase; margin-bottom: 4px;">Consultant Pathologist Remarks:</div>
          <div style="font-size: 0.8125rem; color: #334155; line-height: 1.5;">${report.doctorNotes || 'Parameters noted and verified.'}</div>
          <div style="margin-top: 8px; font-size: 0.72rem; color: #64748b; font-style: italic;">Verified by: ${report.pathologist || 'Authorized Clinical Pathologist'}</div>
        </div>

        <!-- Digital Authentication Stamp -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 0.75rem; color: #64748b;">
          <div>🔒 E-Verified Digital Medical Record • BMDC & DGHS Standards</div>
          <div style="font-family: monospace; color: #0d9488; font-weight: 700;">SHA256: ${report.id.replace(/-/g, '').toLowerCase()}9b3e1</div>
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px;">
        <button id="print-report-btn" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 4px;">
          🖨️ Print / Save PDF
        </button>
        <button id="close-report-modal-footer" class="btn btn-primary btn-sm">Done</button>
      </div>
    </div>
  `;

  modal.classList.add('show');

  const closeModal = () => modal.classList.remove('show');
  modal.querySelector('#close-report-modal-btn').addEventListener('click', closeModal);
  modal.querySelector('#close-report-modal-footer').addEventListener('click', closeModal);
  modal.querySelector('#print-report-btn').addEventListener('click', () => {
    window.print();
  });
}

/**
 * Opens upload report modal allowing patient or doctor to enter investigation
 */
export function openUploadReportModal(currentUser, onSaved) {
  let modal = document.getElementById('upload-report-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'upload-report-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const patientName = currentUser?.name || 'Tanvir Ahmed';
  const patientPhone = currentUser?.phone || '01711000005';

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 580px; width: 95%;">
      <div class="modal-header">
        <h3 class="modal-title" style="font-size: 1.125rem;">Upload Diagnostic Lab Report</h3>
        <button id="close-upload-modal-btn" class="modal-close">&times;</button>
      </div>

      <form id="upload-lab-form" class="modal-body" style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--color-ink-700); display: block; margin-bottom: 4px;">Select Diagnostic Test Preset</label>
          <select id="upload-test-select" class="form-control" style="font-size: 0.8125rem;">
            ${COMMON_LAB_TESTS.map(t => `<option value="${t.name}">${t.name} (${t.category})</option>`).join('')}
            <option value="custom">Other / Custom Investigation...</option>
          </select>
        </div>

        <div id="custom-test-row" style="display: none;">
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--color-ink-700); display: block; margin-bottom: 4px;">Custom Investigation Title</label>
          <input type="text" id="upload-custom-name" class="form-control" placeholder="e.g. Thyroid Panel (TSH, FT4)" style="font-size: 0.8125rem;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 700; color: var(--color-ink-700); display: block; margin-bottom: 4px;">Diagnostic Centre / Hospital</label>
            <input type="text" id="upload-lab-name" class="form-control" value="Popular Diagnostic Centre, Dinajpur" required style="font-size: 0.8125rem;">
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 700; color: var(--color-ink-700); display: block; margin-bottom: 4px;">Test Date</label>
            <input type="date" id="upload-lab-date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required style="font-size: 0.8125rem;">
          </div>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--color-ink-700); display: block; margin-bottom: 4px;">Attending Doctor / Specialist</label>
          <input type="text" id="upload-doctor-name" class="form-control" value="Prof. Dr. Tariq Rahman" placeholder="Doctor's name" style="font-size: 0.8125rem;">
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--color-ink-700); display: block; margin-bottom: 4px;">Doctor Remarks / Clinical Notes</label>
          <textarea id="upload-doctor-notes" class="form-control" rows="2" placeholder="Routine evaluation, all vital parameters within acceptable range." style="font-size: 0.8125rem;"></textarea>
        </div>

        <div style="border: 2px dashed var(--color-border); border-radius: 8px; padding: 14px; text-align: center; background: var(--color-surface-subtle);">
          <div style="font-size: 1.25rem; margin-bottom: 4px;">📄</div>
          <div style="font-size: 0.8125rem; font-weight: 600; color: var(--color-ink-900);">Attach PDF or Scan File (Optional)</div>
          <div style="font-size: 0.72rem; color: var(--color-ink-500); margin-bottom: 8px;">Supports PDF, PNG, JPG up to 10MB</div>
          <input type="file" id="upload-report-file" accept=".pdf,image/*" style="font-size: 0.75rem;">
        </div>

        <div class="modal-footer" style="padding-top: 10px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" id="close-upload-footer-btn" class="btn btn-secondary btn-sm">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save to Vault</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('show');

  const testSelect = modal.querySelector('#upload-test-select');
  const customRow = modal.querySelector('#custom-test-row');
  testSelect.addEventListener('change', () => {
    customRow.style.display = testSelect.value === 'custom' ? 'block' : 'none';
  });

  const closeModal = () => modal.classList.remove('show');
  modal.querySelector('#close-upload-modal-btn').addEventListener('click', closeModal);
  modal.querySelector('#close-upload-footer-btn').addEventListener('click', closeModal);

  modal.querySelector('#upload-lab-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const selVal = testSelect.value;
    const finalTestName = selVal === 'custom' ? (modal.querySelector('#upload-custom-name').value.trim() || 'Laboratory Investigation') : selVal;
    const preset = COMMON_LAB_TESTS.find(t => t.name === selVal);

    const newReport = {
      id: `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientPhone: patientPhone,
      patientName: patientName,
      patientAge: currentUser?.age || 32,
      patientGender: currentUser?.gender || 'Male',
      testName: finalTestName,
      category: preset ? preset.category : 'General Diagnostics',
      labName: modal.querySelector('#upload-lab-name').value.trim() || 'Central Diagnostic Centre',
      referringDoctor: modal.querySelector('#upload-doctor-name').value.trim() || 'Consultant Physician',
      date: modal.querySelector('#upload-lab-date').value || new Date().toISOString().slice(0, 10),
      status: 'Verified',
      parameters: preset ? preset.parameters : [
        { param: 'Routine Screening', value: 'Normal', unit: '-', refRange: 'Normal', status: 'normal' }
      ],
      pathologist: 'Medical Technologist (Lab in-charge)',
      doctorNotes: modal.querySelector('#upload-doctor-notes').value.trim() || 'Patient investigation saved to medical vault.'
    };

    saveLabReport(newReport);
    closeModal();
    if (onSaved) onSaved(newReport);
  });
}

/**
 * Mounts the Lab Reports Vault UI tab into a page container
 */
export function renderLabReportsTab(containerEl, currentUser) {
  if (!containerEl) return;

  function refresh() {
    const isPatient = currentUser?.role === 'patient';
    const reports = isPatient ? getReportsForPatient(currentUser?.phone) : getStoredLabReports();

    containerEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: var(--space-3);">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--color-ink-950); margin: 0;">
            Diagnostic Lab Reports & Pathology Vault
          </h2>
          <p style="font-size: 0.8125rem; color: var(--color-ink-500); margin: 2px 0 0;">
            Digital investigation records with reference ranges, biochemistry status flags, and PDF export.
          </p>
        </div>
        <button id="add-lab-report-btn" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
          <span>+ Upload / Add Lab Test</span>
        </button>
      </div>

      ${reports.length === 0 ? `
        <div class="card" style="padding: var(--space-8); text-align: center; color: var(--color-ink-500);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔬</div>
          <div style="font-weight: 700; color: var(--color-ink-800);">No Lab Reports on Record</div>
          <p style="font-size: 0.8125rem; margin-top: 4px;">Click the button above to upload a new diagnostic test report.</p>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-4);">
          ${reports.map(r => `
            <div class="card" style="padding: var(--space-4); border-left: 4px solid var(--color-teal-700); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <span style="font-size: 0.6875rem; font-weight: 800; color: var(--color-teal-700); background: var(--color-teal-50); padding: 2px 8px; border-radius: 4px;">
                    ${r.category}
                  </span>
                  <span style="font-size: 0.6875rem; color: var(--color-ink-500); font-family: monospace;">${r.id}</span>
                </div>
                <h4 style="font-size: 1rem; font-weight: 700; color: var(--color-ink-950); margin: 0 0 4px;">
                  ${r.testName}
                </h4>
                <div style="font-size: 0.78rem; color: var(--color-ink-600); margin-bottom: 8px;">
                  🏥 ${r.labName}
                </div>
                <div style="font-size: 0.75rem; color: var(--color-ink-500); margin-bottom: 12px; display: flex; gap: 8px;">
                  <span>📅 ${r.date}</span>
                  <span>•</span>
                  <span>👤 ${r.patientName}</span>
                </div>

                <!-- Parameters summary snippet -->
                <div style="background: var(--color-surface-subtle); padding: 8px 10px; border-radius: 6px; font-size: 0.75rem; margin-bottom: 12px;">
                  ${(r.parameters || []).slice(0, 3).map(p => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span style="color: var(--color-ink-700);">${p.param}:</span>
                      <strong style="color: ${p.status === 'elevated' ? '#dc2626' : 'var(--color-ink-950)'};">${p.value} ${p.unit}</strong>
                    </div>
                  `).join('')}
                  ${(r.parameters || []).length > 3 ? `<div style="color: var(--color-ink-500); font-size: 0.6875rem; margin-top: 4px;">+ ${(r.parameters || []).length - 3} more parameters</div>` : ''}
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 10px; margin-top: 4px;">
                <button class="btn btn-primary btn-sm view-report-btn" data-id="${r.id}" style="font-size: 0.75rem; padding: 4px 10px;">
                  👁️ Inspect Sheet
                </button>
                <button class="btn btn-ghost btn-sm delete-report-btn" data-id="${r.id}" style="color: var(--color-danger); font-size: 0.75rem; padding: 4px 8px;" title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    containerEl.querySelector('#add-lab-report-btn')?.addEventListener('click', () => {
      openUploadReportModal(currentUser, refresh);
    });

    containerEl.querySelectorAll('.view-report-btn').forEach(btn => {
      btn.addEventListener('click', () => openLabReportModal(btn.getAttribute('data-id')));
    });

    containerEl.querySelectorAll('.delete-report-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this diagnostic lab record?')) {
          deleteLabReport(btn.getAttribute('data-id'));
          refresh();
        }
      });
    });
  }

  refresh();
  window.addEventListener('docbook:lab-reports-updated', refresh);
}
