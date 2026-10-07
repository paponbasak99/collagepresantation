// DocBook Clinical ICD-10 Diagnostics Catalog & Dosage Calculator (icd10.js)
// Standardized clinical diagnostic codes and automated prescription quantity calculator.

export const ICD10_DATABASE = [
  { code: 'I10', nameEn: 'Essential (primary) hypertension', nameBn: 'উচ্চ রক্তচাপ (প্রাইমারি হাইপারটেনশন)', category: 'Cardiology' },
  { code: 'I20.9', nameEn: 'Angina pectoris, unspecified', nameBn: 'এনজাইনা পেক্টোরিস (হৃদরোগজনিত বুক ব্যথা)', category: 'Cardiology' },
  { code: 'I25.1', nameEn: 'Atherosclerotic heart disease', nameBn: 'করোনারি ধমনী রোগ (ইসকেমিক হার্ট ডিজিজ)', category: 'Cardiology' },
  { code: 'E11.9', nameEn: 'Type 2 diabetes mellitus without complications', nameBn: 'টাইপ ২ ডায়াবেটিস মেলিটাস', category: 'Endocrinology' },
  { code: 'E10.9', nameEn: 'Type 1 diabetes mellitus without complications', nameBn: 'টাইপ ১ ডায়াবেটিস মেলিটাস', category: 'Endocrinology' },
  { code: 'E03.9', nameEn: 'Hypothyroidism, unspecified', nameBn: 'হাইপোথাইরয়েডিজম (থাইরয়েড হরমোনের ঘাটতি)', category: 'Endocrinology' },
  { code: 'J06.9', nameEn: 'Acute upper respiratory infection, unspecified', nameBn: 'তীব্র ঊর্ধ্ব শ্বাসনালী সংক্রমণ (সর্দি-কাশি)', category: 'Medicine / ENT' },
  { code: 'J45.9', nameEn: 'Asthma, unspecified', nameBn: 'হাঁপানি / ব্রঙ্কিয়াল অ্যাজমা', category: 'Chest Medicine' },
  { code: 'J44.9', nameEn: 'Chronic obstructive pulmonary disease (COPD)', nameBn: 'সিওপিডি (ক্রনিক ফুসফুসের রোগ)', category: 'Chest Medicine' },
  { code: 'K21.9', nameEn: 'Gastro-esophageal reflux disease (GERD)', nameBn: 'গ্যাস্ট্রো-ইসোফেজিয়াল রিফ্লাক্স (গ্যাস্ট্রিক / এসিডিটি)', category: 'Gastroenterology' },
  { code: 'K25.9', nameEn: 'Gastric ulcer, unspecified', nameBn: 'পাকস্থলীর আলসার', category: 'Gastroenterology' },
  { code: 'K59.0', nameEn: 'Constipation', nameBn: 'কোষ্ঠকাঠিন্য', category: 'Gastroenterology' },
  { code: 'M54.5', nameEn: 'Low back pain (Lumbar spondylosis)', nameBn: 'কোমর ব্যথা / লাম্বার স্পন্ডাইলোসিস', category: 'Orthopedics' },
  { code: 'M19.9', nameEn: 'Osteoarthritis, unspecified site', nameBn: 'অস্টিওআর্থ্রাইটিস (হাড় ও জোড়ার ক্ষয়জনিত ব্যথা)', category: 'Orthopedics' },
  { code: 'L20.9', nameEn: 'Atopic dermatitis, unspecified (Eczema)', nameBn: 'একজিমা / অ্যাটোপিক ডার্মাটাইটিস', category: 'Dermatology' },
  { code: 'L70.0', nameEn: 'Acne vulgaris', nameBn: 'ব্রণ (অ্যাকনি ভালগারিস)', category: 'Dermatology' },
  { code: 'B35.9', nameEn: 'Dermatophytosis (Fungal skin infection)', nameBn: 'দাদ / ছত্রাক সংক্রমণ', category: 'Dermatology' },
  { code: 'N39.0', nameEn: 'Urinary tract infection, site not specified (UTI)', nameBn: 'মূত্রনালীর সংক্রমণ (ইউটিআই)', category: 'Urology / Nephrology' },
  { code: 'N20.0', nameEn: 'Calculus of kidney (Kidney stone)', nameBn: 'কিডনিতে পাথর (রেনাল ক্যালকুলাস)', category: 'Urology' },
  { code: 'G43.9', nameEn: 'Migraine, unspecified', nameBn: 'মাইগ্রেন (তীব্র মাথা ব্যথা)', category: 'Neurology' },
  { code: 'G40.9', nameEn: 'Epilepsy, unspecified', nameBn: 'মৃগীরোগ (এপিলেপসি)', category: 'Neurology' },
  { code: 'F32.9', nameEn: 'Major depressive disorder, single episode', nameBn: 'ক্লিনিক্যাল ডিপ্রেশন / বিষণ্নতা', category: 'Psychiatry' },
  { code: 'F41.1', nameEn: 'Generalized anxiety disorder', nameBn: 'অ্যাংজাইটি ডিজঅর্ডার / মানসিক উদ্বেগ', category: 'Psychiatry' },
  { code: 'H10.9', nameEn: 'Conjunctivitis, unspecified', nameBn: 'চোখ ওঠা / কনজাংটিভাইটিস', category: 'Ophthalmology' },
  { code: 'H52.1', nameEn: 'Myopia (Short-sightedness)', nameBn: 'মায়োপিয়া (দৃষ্টি সমস্যা)', category: 'Ophthalmology' },
  { code: 'K02.9', nameEn: 'Dental caries, unspecified', nameBn: 'দাঁতের ক্ষয় (ক্যাভিটি)', category: 'Dentistry' },
  { code: 'A09', nameEn: 'Infectious gastroenteritis and colitis (Diarrhea)', nameBn: 'ডায়রিয়া / পেটের ইনফেকশন', category: 'Medicine / Paediatrics' },
  { code: 'R50.9', nameEn: 'Fever, unspecified (Pyrexia)', nameBn: 'অজানা উৎসের জ্বর', category: 'Medicine' },
  { code: 'D50.9', nameEn: 'Iron deficiency anemia, unspecified', nameBn: 'রক্তস্বল্পতা (আয়রনের ঘাটতিজনিত অ্যানিমিয়া)', category: 'Haematology' }
];

export function searchIcd10(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return ICD10_DATABASE.filter(item => 
    item.code.toLowerCase().includes(q) ||
    item.nameEn.toLowerCase().includes(q) ||
    item.nameBn.includes(q) ||
    item.category.toLowerCase().includes(q)
  ).slice(0, 8);
}

/**
 * Calculates total required medication quantity based on frequency and duration
 * @param {string} frequency - e.g. "1+0+1", "1+1+1", "0+0+1", "1+0+0"
 * @param {number|string} durationStr - e.g. "7 days", "14", "1 month"
 * @returns {number} total units (tablets / capsules / spoonfuls)
 */
export function calculateDoseUnits(frequency, durationStr) {
  if (!frequency) return 0;
  
  // Extract daily count from pattern like 1+0+1 or 1-0-1
  const parts = frequency.split(/[+\-\/]/).map(p => parseFloat(p.trim()) || 0);
  const dailyCount = parts.reduce((sum, val) => sum + val, 0);

  // Extract days from duration string
  let days = 7; // default 1 week
  if (typeof durationStr === 'number') {
    days = durationStr;
  } else if (typeof durationStr === 'string') {
    const num = parseInt(durationStr, 10);
    if (!isNaN(num)) {
      if (durationStr.toLowerCase().includes('month')) {
        days = num * 30;
      } else if (durationStr.toLowerCase().includes('week')) {
        days = num * 7;
      } else {
        days = num;
      }
    }
  }

  return Math.ceil(dailyCount * days);
}

/**
 * Returns HTML badge for visual Morning/Noon/Night pill schedule and total units
 */
export function renderPillSchedule(dosage, instruction, duration) {
  if (!dosage) return '';
  const parts = String(dosage).split(/[+\-\/]/).map(p => p.trim());
  const m = parts[0] || '0';
  const n = parts[1] || '0';
  const e = parts[2] || '0';
  const total = calculateDoseUnits(dosage, duration);

  const mealText = instruction || 'After meal';
  return `
    <div style="display: inline-flex; flex-direction: column; gap: 4px;">
      <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8125rem; font-weight: 700; color: #0f172a; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <span title="Morning Dose" style="color: #d97706;">☀️ ${m}</span>
        <span style="color: #cbd5e1;">|</span>
        <span title="Noon Dose" style="color: #0284c7;">⛅ ${n}</span>
        <span style="color: #cbd5e1;">|</span>
        <span title="Night Dose" style="color: #6366f1;">🌙 ${e}</span>
        <span style="color: #64748b; font-size: 0.75rem; font-weight: 500; margin-left: 4px;">(${mealText})</span>
      </div>
      ${total > 0 ? `
        <span style="font-size: 0.72rem; color: #0d9488; font-weight: 600;">
          📦 Total Dispense: <strong>${total}</strong> units
        </span>
      ` : ''}
    </div>
  `;
}

/**
 * Attaches real-time ICD-10 suggestions dropdown to an input element
 */
export function attachIcd10Autocomplete(inputEl, onSelect) {
  if (!inputEl) return;

  let dropdown = document.getElementById('icd10-autocomplete-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'icd10-autocomplete-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      box-shadow: 0 12px 30px rgba(0,0,0,0.2);
      max-height: 240px;
      overflow-y: auto;
      z-index: 9999;
      display: none;
      width: ${inputEl.offsetWidth || 340}px;
    `;
    document.body.appendChild(dropdown);
  }

  inputEl.addEventListener('input', () => {
    const matches = searchIcd10(inputEl.value);
    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    const rect = inputEl.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.width = `${rect.width}px`;
    dropdown.style.display = 'block';

    dropdown.innerHTML = `
      <div style="padding: 6px 10px; background: var(--color-surface-subtle); border-bottom: 1px solid var(--color-border); font-size: 0.6875rem; font-weight: 700; color: var(--color-ink-500); text-transform: uppercase;">
        Standard ICD-10 Clinical Diagnostics
      </div>
      ${matches.map(m => `
        <div class="icd10-item" data-code="${m.code}" data-name="${m.nameEn}" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--color-border); font-size: 0.8125rem; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
          <div>
            <span style="font-weight: 700; color: var(--color-teal-700); font-family: var(--font-mono, monospace); margin-right: 6px;">[${m.code}]</span>
            <span style="font-weight: 600; color: var(--color-ink-950);">${m.nameEn}</span>
            <div style="font-size: 0.72rem; color: var(--color-ink-500);">${m.nameBn}</div>
          </div>
          <span style="font-size: 0.65rem; background: var(--color-teal-50); color: var(--color-teal-700); padding: 2px 6px; border-radius: 4px; font-weight: 700;">${m.category}</span>
        </div>
      `).join('')}
    `;

    dropdown.querySelectorAll('.icd10-item').forEach(item => {
      item.addEventListener('mouseenter', () => item.style.background = 'var(--color-surface-subtle)');
      item.addEventListener('mouseleave', () => item.style.background = 'transparent)');
      item.addEventListener('click', () => {
        const fullDiagnosis = `${item.getAttribute('data-code')} — ${item.getAttribute('data-name')}`;
        inputEl.value = fullDiagnosis;
        dropdown.style.display = 'none';
        if (onSelect) onSelect(fullDiagnosis, item.getAttribute('data-code'));
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== inputEl) {
      dropdown.style.display = 'none';
    }
  });
}
