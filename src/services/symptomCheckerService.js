import { getDb } from '../db/connection.js';

// Medical Knowledge Base for Symptom to Specialty Mapping (Complete 24 Specialties)
const SPECIALTY_RULES = [
  {
    slug: 'cardiology',
    nameEn: 'Cardiology',
    nameBn: 'কার্ডিওলজি (হৃদরোগ)',
    keywordsEn: ['chest pain', 'palpitation', 'chest pressure', 'heart rate', 'heart attack', 'shortness of breath on exertion', 'high blood pressure', 'hypertension', 'angina', 'fluttering', 'cardiac', 'pulse rate'],
    keywordsBn: ['বুকে ব্যথা', 'বুক ধড়ফড়', 'হৃদরোগ', 'হার্ট', 'উচ্চ রক্তচাপ', 'প্রেসার', 'বুকে চাপ', 'হার্ট অ্যাটাক'],
    emergencyKeywords: ['crushing chest pain', 'severe crushing chest pain', 'pain radiating to left arm', 'severe chest pressure', 'pain radiating to jaw', 'বুকে তীব্র ব্যথা', 'বুকের ব্যথা বাম হাতে ছড়ানো']
  },
  {
    slug: 'medicine',
    nameEn: 'Medicine',
    nameBn: 'মেডিসিন ও ইন্টারনাল মেডিসিন',
    keywordsEn: ['fever', 'cold', 'cough', 'fatigue', 'weakness', 'general body ache', 'infection', 'weight loss', 'chills', 'malaise', 'flu'],
    keywordsBn: ['জ্বর', 'সর্দি', 'কাশি', 'দুর্বলতা', 'ক্লান্তি', 'গা ব্যথা', 'সংক্রমণ', 'শরীরে দুর্বলতা', 'কাশি ও ঠান্ডা'],
    emergencyKeywords: ['high fever with delirium', 'unresponsive with fever', 'তীব্র জ্বরে প্রলাপ বকা']
  },
  {
    slug: 'pediatrics',
    nameEn: 'Child / Paediatrics',
    nameBn: 'শিশু রোগ (পেডিয়াট্রিক্স)',
    keywordsEn: ['child fever', 'baby', 'infant', 'toddler', 'vaccination', 'child cough', 'pediatric', 'growth issue', 'baby vomiting', 'child lack of appetite', 'bedwetting'],
    keywordsBn: ['শিশুর জ্বর', 'বাচ্চা', 'শিশু', 'নবজাতক', 'টিকা', 'শিশুর কাশি', 'বাচ্চাদের রোগ', 'শিশুর বমি', 'শিশুর পেটে ব্যথা'],
    emergencyKeywords: ['infant lethargic unresponsive', 'blue baby', 'শিশুর শ্বাস বন্ধ হওয়া', 'শিশু নিস্তেজ', 'নবজাতকের শ্বাসকষ্ট']
  },
  {
    slug: 'gynecology',
    nameEn: 'Gynaecology & Obstetrics',
    nameBn: 'স্ত্রীরোগ ও প্রসূতি বিদ্যা',
    keywordsEn: ['pregnancy', 'menstrual cramps', 'period pain', 'irregular period', 'pelvic pain', 'ovarian', 'uterus', 'vaginal bleeding', 'morning sickness', 'pcos', 'white discharge'],
    keywordsBn: ['গর্ভধারণ', 'গর্ভবতী', 'পিরিয়ড', 'মাসিক', 'তলপেটে ব্যথা', 'জরায়ু', 'প্রসূতি', 'মাসিক অনিয়ম', 'সাদাস্রাব'],
    emergencyKeywords: ['heavy vaginal bleeding in pregnancy', 'severe pelvic pain with fainting', 'গর্ভকালীন রক্তপাত', 'প্রসবকালীন জটিলতা']
  },
  {
    slug: 'dermatology',
    nameEn: 'Dermatology (Skin, Hair & Cosmetic)',
    nameBn: 'চর্ম, অ্যালার্জি ও চুল (ডার্মাটোলজি)',
    keywordsEn: ['skin rash', 'itching', 'acne', 'eczema', 'psoriasis', 'hives', 'skin redness', 'hair loss', 'fungal infection', 'ringworm', 'dandruff', 'skin allergy', 'pigmentation'],
    keywordsBn: ['চুলকানি', 'ফুসকুড়ি', 'ফুসকুড়ি', 'লাল ফুসকুড়ি', 'ত্বক', 'চামড়ায়', 'ব্রণ', 'চুল পড়া', 'দাদ', 'একজিমা', 'চর্মরোগ', 'ত্বকের লালচে ভাব', 'এলার্জি', 'অ্যালার্জি'],
    emergencyKeywords: ['severe skin blistering covering whole body', 'steven johnson syndrome', 'চামড়া পুড়ে যাওয়ার মতো ফোসকা']
  },
  {
    slug: 'neurology',
    nameEn: 'Neurology',
    nameBn: 'নিউরোমেডিসিন (স্নায়ুরোগ)',
    keywordsEn: ['headache', 'migraine', 'seizure', 'dizziness', 'vertigo', 'numbness', 'tingling', 'tremor', 'stroke', 'loss of balance', 'face drooping', 'memory loss', 'neuropathy'],
    keywordsBn: ['মাথা ব্যথা', 'মাইগ্রেন', 'মাথা ঘোরা', 'মৃগীরোগ', 'খিঁচুনি', 'অসাড়তা', 'স্ট্রোক', 'ভারসাম্যহীনতা', 'স্মৃতিশক্তি হ্রাস'],
    emergencyKeywords: ['sudden face drooping', 'slurred speech with arm weakness', 'sudden severe thunderclap headache', 'মুখ বেঁকে যাওয়া', 'কথা জড়িয়ে যাওয়া', 'হঠাৎ তীব্র মাথাব্যথা']
  },
  {
    slug: 'ent',
    nameEn: 'ENT',
    nameBn: 'ইএনটি (নাক, কান, গলা)',
    keywordsEn: ['ear pain', 'hearing loss', 'sore throat', 'tonsillitis', 'nasal congestion', 'sinus', 'hoarse voice', 'ear discharge', 'tinnitus', 'ear buzzing', 'runny nose', 'nosebleed'],
    keywordsBn: ['কান ব্যথা', 'কানে কম শোনা', 'গলা ব্যথা', 'টনসিল', 'নাক বন্ধ', 'সাইনোসাইটিস', 'কানে পুঁজ', 'গলার স্বর বসা', 'নাক দিয়ে রক্ত পড়া'],
    emergencyKeywords: ['foreign object stuck in throat choking', 'severe throat swelling blocking airway', 'গলায় কিছু আটকে শ্বাসরোধ']
  },
  {
    slug: 'gastroenterology',
    nameEn: 'Gastroenterology',
    nameBn: 'গ্যাস্ট্রোএন্টারোলজি (পরিপাকতন্ত্র)',
    keywordsEn: ['stomach pain', 'acidity', 'gerd', 'heartburn', 'ulcer', 'vomiting', 'diarrhea', 'nausea', 'constipation', 'bloating', 'indigestion', 'gas', 'ibs'],
    keywordsBn: ['পেট ব্যথা', 'গ্যাস্ট্রিক', 'এসিডিটি', 'বমি', 'ডায়রিয়া', 'কোষ্ঠকাঠিন্য', 'পেট ফাঁপা', 'বুক জ্বালাপোড়া', 'বদহজম'],
    emergencyKeywords: ['vomiting blood', 'black tarry stool with dizziness', 'রক্ত বমি', 'কালো পায়খানা']
  },
  {
    slug: 'orthopedics',
    nameEn: 'Orthopedics',
    nameBn: 'অর্থোপেডিকস (হাড় ও জোড়)',
    keywordsEn: ['bone fracture', 'joint pain', 'knee pain', 'back pain', 'shoulder pain', 'arthritis', 'sprain', 'spine', 'swollen joint', 'ligament', 'slip disc', 'bone injury'],
    keywordsBn: ['হাড়ের ব্যথা', 'কোমর ব্যথা', 'হাঁটু ব্যথা', 'জয়েন্টে ব্যথা', 'হাড় ভাঙা', 'বাত', 'স্পাইন', 'মচকানো', 'হাড়ের জোড়ায় সমস্যা'],
    emergencyKeywords: ['compound fracture', 'bone piercing skin', 'হাড় ভেঙে চামড়া ফুঁড়ে বের হওয়া']
  },
  {
    slug: 'endocrinology',
    nameEn: 'Endocrinology & Diabetology',
    nameBn: 'এন্ডোক্রাইনোলজি ও ডায়াবেটিস',
    keywordsEn: ['diabetes', 'high blood sugar', 'thyroid', 'goiter', 'excessive thirst', 'frequent urination', 'weight gain', 'hormone', 'hormonal imbalance', 'hypothyroid', 'hyperthyroid'],
    keywordsBn: ['ডায়াবেটিস', 'রক্তে চিনি বৃদ্ধি', 'থাইরয়েড', 'গলগণ্ড', 'হরমোন সমস্যা', 'বেশি তৃষ্ণা', 'ঘন ঘন প্রস্রাব', 'অস্বাভাবিক ওজন বৃদ্ধি'],
    emergencyKeywords: ['diabetic ketoacidosis breath fruity', 'severe hypoglycemia unconscious', 'রক্তে সুগার মারাত্মক কমে অজ্ঞান']
  },
  {
    slug: 'nephrology',
    nameEn: 'Nephrology (Kidney Medicine)',
    nameBn: 'নেফ্রোলজি (কিডনি রোগ)',
    keywordsEn: ['kidney pain', 'swollen feet', 'face puffiness', 'foamy urine', 'decreased urination', 'proteinuria', 'high creatinine', 'dialysis', 'kidney stone', 'renal failure'],
    keywordsBn: ['কিডনি ব্যথা', 'পা ফোলা', 'মুখে ফোলা ভাব', 'প্রস্রাবে ফেনা', 'প্রস্রাব কমে যাওয়া', 'ক্রিয়েটিনিন বৃদ্ধি', 'ডায়ালাইসিস'],
    emergencyKeywords: ['complete inability to urinate for 24 hours', 'severe fluid overload lungs', '২৪ ঘণ্টা প্রস্রাব সম্পূর্ণ বন্ধ']
  },
  {
    slug: 'ophthalmology',
    nameEn: 'Ophthalmology',
    nameBn: 'চক্ষুরোগ (অপথালমোলজি)',
    keywordsEn: ['eye pain', 'blurred vision', 'cataract', 'red eye', 'eye itching', 'double vision', 'glaucoma', 'watery eyes', 'dry eyes', 'loss of vision', 'glasses'],
    keywordsBn: ['চোখ ব্যথা', 'ঝাপসা দৃষ্টি', 'চোখ লাল', 'ছানি', 'চোখে চুলকানি', 'দৃষ্টিশক্তি হ্রাস', 'চোখ দিয়ে জল পড়া', 'চোখ জ্বালাপোড়া'],
    emergencyKeywords: ['sudden blindness in eye', 'chemical splash in eye', 'eye trauma penetrating', 'হঠাৎ চোখে অন্ধত্ব', 'চোখে রাসায়নিক পড়া']
  },
  {
    slug: 'chest-medicine',
    nameEn: 'Chest Medicine',
    nameBn: 'বক্ষব্যাধি ও শ্বাসকষ্ট (চেস্ট মেডিসিন)',
    keywordsEn: ['asthma', 'breathing problem', 'shortness of breath', 'wheezing', 'chronic cough', 'copd', 'tuberculosis', 'phlegm', 'chest congestion', 'bronchitis'],
    keywordsBn: ['হাঁপানি', 'শ্বাসকষ্ট', 'কাশিতে কফ', 'যক্ষ্মা', 'বুকে ঘড়ঘড়', 'ক্রনিক কাশি', 'ফুসফুসে ইনফেকশন', 'বক্ষব্যাধি'],
    emergencyKeywords: ['gasping for air lips turning blue', 'coughing up massive blood', 'মারাত্মক শ্বাসকষ্ট ও ঠোঁট নীল হওয়া', 'কাশি দিয়ে প্রচুর রক্ত']
  },
  {
    slug: 'urology',
    nameEn: 'Urology',
    nameBn: 'ইউরোলজি (মূত্রতন্ত্র ও পুরুষ প্রজনন)',
    keywordsEn: ['burning urination', 'uti', 'blood in urine', 'prostate', 'painful urination', 'difficulty urinating', 'urinary incontinence', 'bladder', 'urethra'],
    keywordsBn: ['প্রস্রাবে জ্বালাপোড়া', 'প্রস্রাবে রক্ত', 'প্রস্টেট', 'প্রস্রাব আটকে যাওয়া', 'ঘন ঘন প্রস্রাবের বেগ', 'ইউটিআই'],
    emergencyKeywords: ['acute painful urinary retention', 'severe genital trauma', 'প্রস্রাব সম্পূর্ণ আটকে তীব্র তলপেট ব্যথা']
  },
  {
    slug: 'dentistry',
    nameEn: 'Dentistry',
    nameBn: 'ডেন্টাল (দন্ত চিকিৎসা)',
    keywordsEn: ['toothache', 'swollen gum', 'bleeding gums', 'cavity', 'bad breath', 'sensitive teeth', 'loose tooth', 'wisdom tooth', 'dental', 'root canal'],
    keywordsBn: ['দাঁত ব্যথা', 'মাড়ি ফোলা', 'মাড়ি দিয়ে রক্ত পড়া', 'দাঁতের পোকা', 'দাঁতে শিরশিরানি', 'মুখের দুর্গন্ধ', 'দাঁত নড়া'],
    emergencyKeywords: ['facial swelling spreading to neck from dental abscess', 'দাঁতের ইনফেকশন থেকে পুরো মুখ ও গলা ফুলে যাওয়া']
  },
  {
    slug: 'oncology',
    nameEn: 'Oncology (Cancer Care)',
    nameBn: 'অনকোলজি (ক্যান্সার সেবা)',
    keywordsEn: ['lump', 'tumor', 'cancer', 'unexplained weight loss', 'chemotherapy', 'biopsy', 'radiation', 'lymph node swelling', 'malignancy'],
    keywordsBn: ['টিউমার', 'ক্যান্সার', 'শরীরে চাকা বা মাংসপিণ্ড', 'কেমোথেরাপি', 'লিম্ফ নোড ফোলা', 'অস্বাভাবিক ওজন হ্রাস'],
    emergencyKeywords: ['suspected spinal cord compression by tumor', 'tumour lysis syndrome']
  },
  {
    slug: 'physical-medicine',
    nameEn: 'Physical Medicine & Rehabilitation (Physiotherapy)',
    nameBn: 'ফিজিকেল মেডিসিন ও রিহ্যাবিলিটেশন',
    keywordsEn: ['physiotherapy', 'rehabilitation', 'muscle stiffness', 'post stroke recovery', 'frozen shoulder', 'mobility loss', 'paralysis rehab', 'posture pain', 'physical therapy'],
    keywordsBn: ['ফিজিওথেরাপি', 'প্যারালাইসিস পুনর্বাসন', 'মাংসপেশি শক্ত হওয়া', 'ফ্রোজেন শোল্ডার', 'হাঁটাচলায় অক্ষমতা', 'স্ট্রোকের পর থেরাপি'],
    emergencyKeywords: []
  },
  {
    slug: 'general-surgery',
    nameEn: 'General Surgery',
    nameBn: 'জেনারেল সার্জারি',
    keywordsEn: ['hernia', 'appendix', 'appendicitis', 'gallbladder stones', 'abscess', 'piles', 'fistula', 'hemorrhoids', 'surgical consultation', 'wound infection'],
    keywordsBn: ['হার্নিয়া', 'অ্যাপেন্ডিসাইটিস', 'পিত্তথলিতে পাথর', 'পাইলস', 'ফিস্টুলা', 'ফোড়া কাটা', 'অপারেশন প্রয়োজন'],
    emergencyKeywords: ['acute appendicitis severe lower right abdomen pain', 'strangulated hernia with severe pain', 'তলপেটের ডানপাশে তীব্র অ্যাপেন্ডিক্স ব্যথা']
  },
  {
    slug: 'psychiatry',
    nameEn: 'Psychiatry',
    nameBn: 'সাইকিয়াট্রি (মানসিক স্বাস্থ্য)',
    keywordsEn: ['depression', 'anxiety', 'panic attack', 'insomnia', 'hallucination', 'ocd', 'stress', 'mood swings', 'suicidal thoughts', 'bipolar', 'mental trauma'],
    keywordsBn: ['ডিপ্রেশন', 'বিষণ্নতা', 'দুশ্চিন্তা', 'ঘুম না হওয়া', 'প্যানিক অ্যাটাক', 'মানসিক চাপ', 'ভয় পাওয়া', 'হ্যালুসিনেশন'],
    emergencyKeywords: ['active suicidal plan', 'severe violent acute psychosis', 'আত্মহত্যার তীব্র চিন্তা ও প্রবণতা']
  },
  {
    slug: 'nutrition',
    nameEn: 'Nutrition & Dietetics',
    nameBn: 'পুষ্টি ও ডায়েট চার্ট (ডায়েটিশিয়ান)',
    keywordsEn: ['diet chart', 'nutrition', 'weight loss plan', 'weight gain', 'obesity diet', 'cholesterol diet', 'malnutrition', 'calorie intake', 'dietitian'],
    keywordsBn: ['ডায়েট চার্ট', 'পুষ্টি', 'ওজন কমানোর খাবার', 'ওজন বাড়ানোর ডায়েট', 'মেদ কমানো', 'পুষ্টিহীনতা', 'খাবারের তালিকা'],
    emergencyKeywords: []
  },
  {
    slug: 'rheumatology',
    nameEn: 'Rheumatology',
    nameBn: 'রিউমাটোলজি (বাত রোগ)',
    keywordsEn: ['rheumatoid arthritis', 'morning stiffness in joints', 'lupus', 'sle', 'gout', 'autoimmune', 'uric acid', 'joint inflammation', 'ankylosing spondylitis'],
    keywordsBn: ['গেঁটে বাত', 'ইউরিক এসিড', 'সকালে আঙুল শক্ত হওয়া', 'অটোইমিউন রোগ', 'লুপাস', 'বাত ব্যথার তীব্রতা'],
    emergencyKeywords: ['severe vasculitis with gangrene', 'তীব্র ভাস্কুলাইটিস']
  },
  {
    slug: 'hepatology',
    nameEn: 'Liver Medicine (Hepatology)',
    nameBn: 'হেপাটোলজি (লিভার রোগ)',
    keywordsEn: ['jaundice', 'yellow eyes', 'fatty liver', 'hepatitis b', 'hepatitis c', 'cirrhosis', 'liver enlargement', 'ascites', 'liver enzymes'],
    keywordsBn: ['জন্ডিস', 'চোখ হলুদ', 'ফ্যাটি লিভার', 'হেপাটাইটিস', 'লিভার সিরোসিস', 'পেটে পানি আসা', 'লিভারের সমস্যা'],
    emergencyKeywords: ['hepatic encephalopathy confusion with jaundice', 'জন্ডিসের সাথে অজ্ঞান হয়ে যাওয়া বা মানসিক বিভ্রান্তি']
  },
  {
    slug: 'haematology',
    nameEn: 'Haematology',
    nameBn: 'হেমাটোলজি (রক্ত রোগ)',
    keywordsEn: ['anemia', 'pale skin', 'thalassemia', 'low hemoglobin', 'easy bruising', 'frequent bleeding', 'low platelets', 'blood cancer', 'leukemia'],
    keywordsBn: ['রক্তস্বল্পতা', 'অ্যানিমিয়া', 'থ্যালাসেমিয়া', 'কম হিমোগ্লোবিন', 'শরীরে কালশিটে পড়া', 'রক্ত জমাট না বাঁধা', 'প্লেটলেট কমে যাওয়া'],
    emergencyKeywords: ['uncontrolled spontaneous bleeding with petechiae', 'মারাত্মক রক্তপাত ও প্লেটলেট ধ্বংস']
  },
  {
    slug: 'pain-management',
    nameEn: 'Pain Management',
    nameBn: 'পেইন মেডিসিন (ব্যথা নিরাময়)',
    keywordsEn: ['chronic pain', 'sciatica', 'nerve pain', 'intractable back pain', 'fibromyalgia', 'cancer pain', 'shooting leg pain', 'persistent headache pain'],
    keywordsBn: ['দীর্ঘদিনের তীব্র ব্যথা', 'সায়াটিকা', 'কোমর থেকে পায়ে নামা ব্যথা', 'নার্ভের তীব্র যন্ত্রণা', 'ক্যান্সারের অসহ্য ব্যথা'],
    emergencyKeywords: ['cauda equina syndrome with bowel bladder incontinence', 'তীব্র কোমর ব্যথার সাথে প্রস্রাব পায়খানার নিয়ন্ত্রণ হারানো']
  }
];

/**
 * Analyzes patient symptom text, scores specialties, checks urgency, and recommends verified doctors.
 */
export function analyzeSymptoms(symptomText) {
  if (!symptomText || typeof symptomText !== 'string' || symptomText.trim().length === 0) {
    throw new Error('Please describe your symptoms to receive an accurate clinical recommendation.');
  }

  const normalized = symptomText.toLowerCase();
  const db = getDb();

  let isEmergency = false;
  let emergencyReason = '';

  // 1. Check for emergency red flags
  for (const rule of SPECIALTY_RULES) {
    for (const em of rule.emergencyKeywords) {
      if (normalized.includes(em.toLowerCase())) {
        isEmergency = true;
        emergencyReason = `Potential urgent condition detected: "${em}". Immediate emergency medical attention or priority chamber booking recommended.`;
        break;
      }
    }
    if (isEmergency) break;
  }

  // 2. Score matches across specialties
  const scores = [];

  for (const rule of SPECIALTY_RULES) {
    let score = 0;
    const matchedTerms = [];

    // English keywords
    for (const kw of rule.keywordsEn) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.split(' ').length >= 2 ? 3 : 2; // Multi-word phrases carry higher confidence
        matchedTerms.push(kw);
      }
    }

    // Bengali keywords
    for (const kw of rule.keywordsBn) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.split(' ').length >= 2 ? 3 : 2;
        matchedTerms.push(kw);
      }
    }

    if (score > 0) {
      scores.push({
        specialtySlug: rule.slug,
        nameEn: rule.nameEn,
        nameBn: rule.nameBn,
        score,
        matchedTerms
      });
    }
  }

  // Sort by highest score
  scores.sort((a, b) => b.score - a.score);

  // If no specialty matched, default to General Medicine / Cardiology
  let primaryMatch = scores[0];
  if (!primaryMatch) {
    primaryMatch = {
      specialtySlug: 'cardiology', // or internal medicine
      nameEn: 'General Medicine & Specialist Consultation',
      nameBn: 'জেনারেল মেডিসিন ও বিশেষজ্ঞ পরামর্শ',
      score: 1,
      matchedTerms: ['General health symptoms']
    };
  }

  // 3. Query top available doctors for the matched specialty
  const specialtyRecord = db.prepare(`
    SELECT id, name_en, name_bn FROM specialties 
    WHERE slug = ? OR name_en LIKE ?
  `).get(primaryMatch.specialtySlug, `%${primaryMatch.specialtySlug}%`);

  let recommendedDoctors = [];
  if (specialtyRecord) {
    recommendedDoctors = db.prepare(`
      SELECT 
        d.id, d.consultation_fee, d.experience_years, d.chamber_address, d.rating_avg, d.rating_count,
        u.name as doctor_name, u.phone as doctor_phone,
        h.name_en as hospital_name, s.name_en as specialty_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN hospitals h ON d.hospital_id = h.id
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.specialty_id = ? AND d.status = 'APPROVED'
      ORDER BY d.rating_avg DESC, d.experience_years DESC
      LIMIT 3
    `).all(specialtyRecord.id);
  }

  // Calculate confidence score (bounded between 65% and 98%)
  const confidence = Math.min(65 + (primaryMatch.score * 7), 98);

  return {
    query: symptomText,
    urgency: isEmergency ? 'EMERGENCY' : (primaryMatch.score >= 5 ? 'HIGH' : 'NORMAL'),
    emergencyAlert: isEmergency ? emergencyReason : null,
    suggestedSpecialty: {
      id: specialtyRecord ? specialtyRecord.id : null,
      slug: primaryMatch.specialtySlug,
      nameEn: primaryMatch.nameEn,
      nameBn: primaryMatch.nameBn,
      confidence: `${confidence}%`,
      matchedSymptoms: primaryMatch.matchedTerms
    },
    differentialSpecialties: scores.slice(1, 3).map(s => ({
      nameEn: s.nameEn,
      nameBn: s.nameBn,
      confidence: `${Math.min(50 + (s.score * 5), 85)}%`
    })),
    recommendedDoctors
  };
}
