/**
 * DocBook Clinical Drug Interaction & Allergy Safety Engine
 * Analyzes prescribed medications in real-time against medical safety rules.
 */

export const ADVERSE_DRUG_INTERACTIONS = [
  {
    drugs: ['warfarin', 'aspirin'],
    severity: 'DANGER',
    title: 'Severe Bleeding Hazard',
    message: 'Concurrent Warfarin and Aspirin synergistically inhibits platelet aggregation and coagulation factors, drastically elevating major gastrointestinal and intracranial hemorrhage risk.'
  },
  {
    drugs: ['warfarin', 'ibuprofen'],
    severity: 'DANGER',
    title: 'High Hemorrhage Risk',
    message: 'NSAIDs (Ibuprofen) displace Warfarin from albumin binding sites and induce gastric mucosal erosions.'
  },
  {
    drugs: ['sildenafil', 'nitroglycerin'],
    severity: 'DANGER',
    title: 'Life-Threatening Hypotension',
    message: 'PDE-5 inhibitors and organic nitrates produce profound synergistic vasodilation resulting in fatal cardiovascular collapse.'
  },
  {
    drugs: ['ramipril', 'spironolactone'],
    severity: 'WARNING',
    title: 'Severe Hyperkalemia',
    message: 'ACE inhibitors paired with potassium-sparing diuretics trigger dangerously elevated serum potassium levels (>6.0 mmol/L).'
  },
  {
    drugs: ['enalapril', 'spironolactone'],
    severity: 'WARNING',
    title: 'Severe Hyperkalemia',
    message: 'ACE inhibitors paired with potassium-sparing diuretics trigger dangerously elevated serum potassium levels.'
  },
  {
    drugs: ['ciprofloxacin', 'antacid'],
    severity: 'WARNING',
    title: 'Chelation Impairs Absorption',
    message: 'Magnesium/Aluminum antacids form insoluble chelates with fluoroquinolones, dropping antibiotic bioavailability by over 70%.'
  },
  {
    drugs: ['clopidogrel', 'omeprazole'],
    severity: 'WARNING',
    title: 'Reduced Antiplatelet Efficacy',
    message: 'Omeprazole competitively inhibits CYP2C19, hindering the bioactivation of Clopidogrel and increasing secondary stroke/cardiac risks.'
  },
  {
    drugs: ['tramadol', 'fluoxetine'],
    severity: 'DANGER',
    title: 'Serotonin Syndrome Risk',
    message: 'Combined serotonergic reuptake inhibition can induce hyperthermia, autonomic hyperactivity, and neuromuscular delirium.'
  },
  {
    drugs: ['methotrexate', 'ibuprofen'],
    severity: 'DANGER',
    title: 'Methotrexate Toxicity',
    message: 'NSAIDs reduce renal tubular clearance of Methotrexate, causing pancytopenia and severe bone marrow suppression.'
  }
];

export const ALLERGY_GROUPS = {
  penicillin: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin', 'cloxacillin'],
  sulfa: ['sulfa', 'cotrimoxazole', 'bactrim', 'sulfamethoxazole', 'sulfasalazine'],
  nsaid: ['aspirin', 'ibuprofen', 'naproxen', 'ketorolac', 'diclofenac', 'indomethacin'],
  cephalosporin: ['cephalexin', 'cefixime', 'ceftriaxone', 'cefuroxime']
};

/**
 * Perform comprehensive clinical safety audit
 * @param {Array<{medicine_name: string}>} medicines 
 * @param {string|Array<string>} patientAllergies 
 * @returns {Array<{severity: string, title: string, message: string}>}
 */
export function checkPrescriptionSafety(medicines = [], patientAllergies = '') {
  const alerts = [];
  const normalizedMeds = medicines.map(m => (m.medicine_name || m.name || '').toLowerCase().trim()).filter(Boolean);

  // 1. Check Drug-Drug Adverse Interactions
  for (const rule of ADVERSE_DRUG_INTERACTIONS) {
    const matchCount = rule.drugs.filter(target => 
      normalizedMeds.some(med => med.includes(target))
    ).length;

    if (matchCount >= 2) {
      alerts.push({
        severity: rule.severity,
        title: rule.title,
        message: rule.message,
        drugs: rule.drugs.join(' + ')
      });
    }
  }

  // 2. Check Patient Drug Allergies
  let allergyList = [];
  if (typeof patientAllergies === 'string') {
    allergyList = patientAllergies.toLowerCase().split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(patientAllergies)) {
    allergyList = patientAllergies.map(s => String(s).toLowerCase().trim());
  }

  for (const allergy of allergyList) {
    for (const [groupName, groupMeds] of Object.entries(ALLERGY_GROUPS)) {
      if (allergy.includes(groupName)) {
        for (const prescribedMed of normalizedMeds) {
          if (groupMeds.some(g => prescribedMed.includes(g))) {
            alerts.push({
              severity: 'DANGER',
              title: `Known Drug Allergy Conflict (${allergy.toUpperCase()})`,
              message: `Patient has documented allergy to "${allergy.toUpperCase()}". The prescribed medicine "${prescribedMed}" belongs to this contraindicated class.`,
              drugs: prescribedMed
            });
          }
        }
      }
    }
  }

  return alerts;
}
