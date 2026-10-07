import bcrypt from 'bcryptjs';
import { getDb } from './connection.js';
import { initDatabase } from './init.js';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  initDatabase();
  const db = getDb();

  // Clear existing data in correct relational dependency order
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM notifications;
    DELETE FROM reviews;
    DELETE FROM prescription_tests;
    DELETE FROM prescription_items;
    DELETE FROM prescriptions;
    DELETE FROM payments;
    DELETE FROM waitlist;
    DELETE FROM appointments;
    DELETE FROM time_slots;
    DELETE FROM doctor_leaves;
    DELETE FROM doctor_schedules;
    DELETE FROM doctors;
    DELETE FROM hospitals;
    DELETE FROM specialties;
    DELETE FROM users;
  `);

  console.log('🧹 Existing data wiped.');

  // Common password hashes (using 10 rounds for seeding performance, 12 for live auth)
  const adminPass = bcrypt.hashSync('Admin@1234', 10);
  const doctorPass = bcrypt.hashSync('Doctor@1234', 10);
  const receptionPass = bcrypt.hashSync('Reception@1234', 10);
  const patientPass = bcrypt.hashSync('Patient@1234', 10);

  // 1. Insert Specialties (Complete 24 Specialties)
  const insertSpecialty = db.prepare(`
    INSERT INTO specialties (name_en, name_bn, slug, icon, description_en, description_bn)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const specialties = [
    ['Cardiology', 'হৃদরোগ ও কার্ডিওলজি', 'cardiology', 'heart-pulse', 'Heart conditions, hypertension, chest pain, arrhythmias & coronary care', 'উচ্চ রক্তচাপ, হৃদরোগ ও বুক ব্যথার বিশেষজ্ঞ চিকিৎসা'],
    ['Medicine', 'মেডিসিন ও ইন্টারনাল মেডিসিন', 'medicine', 'stethoscope', 'Comprehensive adult internal medicine, chronic disease management & infections', 'ডায়াবেটিস, জ্বর, সংক্রামক ব্যাধি ও সাধারণ স্বাস্থ্য সেবা'],
    ['Child / Paediatrics', 'শিশু ও কিশোর রোগ (পেডিয়াট্রিক্স)', 'pediatrics', 'baby', 'Infant care, child vaccinations, growth, pediatric fever & developmental health', 'নবজাতক ও শিশুদের পুষ্টি, বিকাশ ও রোগের সামগ্রিক সেবা'],
    ['Gynaecology & Obstetrics', 'স্ত্রীরোগ ও প্রসূতি বিদ্যা', 'gynecology', 'female', 'Maternal health, pregnancy care, reproductive wellness & delivery', 'মাতৃত্বকালীন যত্ন, গর্ভধারণ ও নারী স্বাস্থ্য বিশেষজ্ঞ'],
    ['Dermatology (Skin, Hair & Cosmetic)', 'চর্ম, অ্যালার্জি, চুল ও কসমেটিক', 'dermatology', 'sparkles', 'Skin disorders, allergies, acne, eczema, hair & nail care, cosmetics', 'ত্বক, ব্রণ, অ্যালার্জি, একজিমা ও চর্মরোগের আধুনিক যত্ন'],
    ['Neurology', 'মস্তিষ্ক ও স্নায়ুরোগ (নিউরোমেডিসিন)', 'neurology', 'brain', 'Stroke, migraines, nerve disorders, epilepsy & memory loss', 'স্ট্রোক, মাইগ্রেন, প্যারালাইসিস ও স্নায়বিক জটিলতার নিরাময়'],
    ['ENT', 'নাক, কান ও গলা বিশেষজ্ঞ (ইএনটি)', 'ent', 'ear-listen', 'Ear infections, sinusitis, throat pain, hearing problems & tonsils', 'টনসিল, সাইনাস, কানের ইনফেকশন ও গলার সমস্যা'],
    ['Gastroenterology', 'গ্যাস্ট্রোএন্টারোলজি ও পরিপাকতন্ত্র', 'gastroenterology', 'bowl-food', 'Acid reflux, stomach ulcers, digestive issues, IBD & liver care', 'গ্যাস, আলসার, পেটের ব্যথা, বদহজম ও পরিপাকতন্ত্রের চিকিৎসা'],
    ['Orthopedics', 'হাড়, জোড়া ও অর্থোপেডিক সার্জারি', 'orthopedics', 'bone', 'Bone fractures, joints, arthritis, spine & sports injuries', 'হাড়ের ভাঙা, জোড়ার ব্যথা, আর্থ্রাইটিস ও স্পোর্টস ইনজুরি'],
    ['Endocrinology & Diabetology', 'ডায়াবেটিস, থাইরয়েড ও হরমোন রোগ', 'endocrinology', 'droplet', 'Diabetes management, thyroid disorders, metabolic health & hormones', 'ডায়াবেটিস নিয়ন্ত্রণ, থাইরয়েড ও হরমোনজনিত জটিলতার বিশেষ যত্ন'],
    ['Nephrology (Kidney Medicine)', 'কিডনি ও মূত্রনালি রোগ বিশেষজ্ঞ', 'nephrology', 'shield-halved', 'Kidney disease, dialysis care, proteinuria, hypertension & renal stones', 'কিডনি ফেইলিউর, ডায়ালাইসিস, প্রোটিন ক্ষরণ ও কিডনি রোগের চিকিৎসা'],
    ['Ophthalmology', 'চক্ষুরোগ ও চক্ষু সার্জারি', 'ophthalmology', 'eye', 'Cataract, glaucoma, refractive errors, retinal disorders & vision care', 'ছানি, গ্লুকোমা, দৃষ্টি সমস্যা ও চোখের উন্নত লেজার ও সার্জারি'],
    ['Chest Medicine', 'বক্ষব্যাধি, ফুসফুস ও শ্বাসকষ্ট বিশেষজ্ঞ', 'chest-medicine', 'lungs', 'Asthma, COPD, chronic bronchitis, tuberculosis & lung infections', 'হাঁপানি, শ্বাসকষ্ট, যক্ষ্মা, ব্রঙ্কাইটিস ও ফুসফুসের জটিল রোগের নিরাময়'],
    ['Urology', 'ইউরোলজি ও মূত্রতন্ত্র সার্জারি', 'urology', 'water-ladder', 'Urinary tract issues, kidney stones, prostate enlargement & male urology', 'প্রস্টেট বৃদ্ধি, প্রস্রাবে জ্বালাপোড়া, পাথর অপসারণ ও মূত্রনালির চিকিৎসা'],
    ['Dentistry', 'দন্ত ও মুখগহ্বর চিকিৎসা (ডেন্টাল)', 'dentistry', 'tooth', 'Root canals, teeth cleaning, implants, braces & oral hygiene', 'দাঁতের ক্ষয়, রুট ক্যানেল, স্কেলিং, ফিলিং ও আধুনিক ডেন্টাল সার্জারি'],
    ['Oncology (Cancer Care)', 'ক্যান্সার ও অনকোলজি বিশেষজ্ঞ', 'oncology', 'ribbon', 'Medical & surgical cancer treatment, chemotherapy & tumor care', 'ক্যান্সার নির্ণয়, কেমোথেরাপি, টিউমার চিকিৎসা ও উপশমমূলক যত্ন'],
    ['Physical Medicine & Rehabilitation (Physiotherapy)', 'ফিজিকেল মেডিসিন ও রিহ্যাবিলিটেশন', 'physical-medicine', 'person-walking', 'Pain rehabilitation, post-stroke physiotherapy, nerve paralysis & muscle recovery', 'স্ট্রোক পরবর্তী পুনর্বাসন, বাত ও প্যারালাইসিস ফিজিওথেরাপিউটিক চিকিৎসা'],
    ['General Surgery', 'জেনারেল ও ল্যাপারোস্কোপিক সার্জারি', 'general-surgery', 'scissors', 'Hernia repair, appendix, gallbladder stones & laparoscopic surgeries', 'হার্নিয়া, অ্যাপেন্ডিক্স, পিত্তপাথর অপারেশন ও সার্জারি'],
    ['Psychiatry', 'মানসিক রোগ ও সাইকিয়াট্রি', 'psychiatry', 'head-side-virus', 'Depression, anxiety, sleep disorders, OCD & mental counseling', 'ডিপ্রেশন, দুশ্চিন্তা, ঘুমের সমস্যা ও মানসিক স্বাস্থ্যসেবা'],
    ['Nutrition & Dietetics', 'পুষ্টি ও ডায়েট বিশেষজ্ঞ (ডায়েটিশিয়ান)', 'nutrition', 'apple-whole', 'Clinical dietary planning, weight management, diabetes diet charts & child nutrition', 'ওজন নিয়ন্ত্রণ, ডায়াবেটিস ও কিডনি রোগীদের বৈজ্ঞানিক ডায়েট চার্ট'],
    ['Rheumatology', 'রিউমাটোলজি ও বাত রোগ বিশেষজ্ঞ', 'rheumatology', 'person-cane', 'Rheumatoid arthritis, lupus, gout, autoimmune diseases & joint swelling', 'গেঁটেবাত, লুপাস, অটোইমিউন রোগ ও অস্থিসন্ধির প্রদাহের বিশেষ যত্ন'],
    ['Liver Medicine (Hepatology)', 'লিভার ও পরিপাকতন্ত্র বিশেষজ্ঞ (হেপাটোলজি)', 'hepatology', 'shield', 'Fatty liver, hepatitis B & C, liver cirrhosis & jaundice care', 'ফ্যাটি লিভার, হেপাটাইটিস, লিভার সিরোসিস ও জন্ডিসের আধুনিক চিকিৎসা'],
    ['Haematology', 'হেমাটোলজি ও রক্তরোগ বিশেষজ্ঞ', 'haematology', 'vial', 'Anemia, thalassemia, blood clotting disorders, leukemia & platelet deficiencies', 'রক্তস্বল্পতা, থ্যালাসেমিয়া, রক্ত জমাট বাঁধা সমস্যা ও রক্তের রোগ নির্ণয়'],
    ['Pain Management', 'পেইন মেডিসিন ও ব্যাথা নিরাময় বিশেষজ্ঞ', 'pain-management', 'bandage', 'Chronic back pain, sciatica, neck pain, cancer pain relief & nerve blocks', 'দীর্ঘমেয়াদী কোমর ও ঘাড় ব্যথা, সায়াটিকা ও ব্যথাহীন জীবনযাপনের চিকিৎসা']
  ];

  const specialtyIds = {};
  for (const s of specialties) {
    const res = insertSpecialty.run(...s);
    specialtyIds[s[2]] = res.lastInsertRowid;
  }
  console.log(`✅ Seeded ${specialties.length} specialties.`);

  // 2. Insert Hospitals (15 Dinajpur Hospitals & Diagnostic Centers)
  const insertHospital = db.prepare(`
    INSERT INTO hospitals (name_en, name_bn, address_en, address_bn, city, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const hospitals = [
    ['Dinajpur General Hospital', 'দিনাজপুর জেনারেল হাসপাতাল', 'Hospital Road, Dinajpur Sadar', 'হাসপাতাল রোড, দিনাজপুর সদর', 'Dinajpur', '+8801711223301', 'info@dinajpurgeneralhospital.gov.bd'],
    ['Dinajpur 250 Bed District Hospital', 'দিনাজপুর ২৫০ শয্যা বিশিষ্ট জেলা হাসপাতাল', 'Kotwali, Dinajpur Sadar', 'কোতয়ালী, দিনাজপুর সদর', 'Dinajpur', '+8801711223302', 'super@dinajpur250bedhospital.gov.bd'],
    ['Dinajpur Medical College Hospital', 'দিনাজপুর মেডিকেল কলেজ হাসপাতাল', 'Ananda Sagor, Dinajpur', 'আনন্দ সাগর, দিনাজপুর', 'Dinajpur', '+8801711223303', 'director@dmch-dinajpur.gov.bd'],
    ['Islami Bank Community Hospital, Dinajpur', 'ইসলামী ব্যাংক কমিউনিটি হাসপাতাল, দিনাজপুর', 'Goneshtola, Dinajpur', 'গণেশতলা, দিনাজপুর', 'Dinajpur', '+8801711223304', 'ibch.dinajpur@ibfbd.org'],
    ['Holy Family Hospital & Diagnostic Center', 'হলি ফ্যামিলি হাসপাতাল অ্যান্ড ডায়াগনস্টিক সেন্টার', 'Balubari, Dinajpur', 'বালুবাড়ি, দিনাজপুর', 'Dinajpur', '+8801711223305', 'contact@holyfamilydinajpur.com'],
    ['North Bengal Medical College Hospital', 'নর্থ বেঙ্গল মেডিকেল কলেজ হাসপাতাল', 'Medical Road, Dinajpur', 'মেডিকেল রোড, দিনাজপুর', 'Dinajpur', '+8801711223306', 'info@northbengalmedical.org'],
    ['Dinajpur Lions Eye Hospital', 'দিনাজপুর লায়ন্স চক্ষু হাসপাতাল', 'Lions Bhaban, Suihari, Dinajpur', 'লায়ন্স ভবন, সুইহারী, দিনাজপুর', 'Dinajpur', '+8801711223307', 'contact@dinajpurlionseye.org'],
    ['Amin Diagnostic Center', 'আমিন ডায়াগনস্টিক সেন্টার', 'Station Road, Dinajpur', 'স্টেশন রোড, দিনাজপুর', 'Dinajpur', '+8801711223308', 'info@amindiagnosticbd.com'],
    ['Medinova Diagnostic Center, Dinajpur', 'মেদিনোভা ডায়াগনস্টিক সেন্টার, দিনাজপুর', 'Goneshtola Road, Dinajpur', 'গণেশতলা রোড, দিনাজপুর', 'Dinajpur', '+8801711223309', 'medinova.dinajpur@medinovabd.com'],
    ['Prime Diagnostic Center, Dinajpur', 'প্রাইম ডায়াগনস্টিক সেন্টার, দিনাজপুর', 'Munshipara, Dinajpur', 'মুন্সিপাড়া, দিনাজপুর', 'Dinajpur', '+8801711223310', 'contact@primediagnosticdinajpur.com'],
    ['Sunrise Clinic & Diagnostic Center', 'সানরাইজ ক্লিনিক অ্যান্ড ডায়াগনস্টিক সেন্টার', 'Paharpur, Dinajpur', 'পাহাড়পুর, দিনাজপুর', 'Dinajpur', '+8801711223311', 'info@sunriseclinicdinajpur.com'],
    ['City Diagnostic Center, Dinajpur', 'সিটি ডায়াগনস্টিক সেন্টার, দিনাজপুর', 'Modern Mor, Dinajpur', 'মডার্ন মোড়, দিনাজপুর', 'Dinajpur', '+8801711223312', 'info@citydiagnosticdinajpur.com'],
    ['New Life Diagnostic Center', 'নিউ লাইফ ডায়াগনস্টিক সেন্টার', 'Hospital Road, Suihari, Dinajpur', 'হাসপাতাল রোড, সুইহারী, দিনাজপুর', 'Dinajpur', '+8801711223313', 'care@newlifediagnosticbd.com'],
    ['Central Hospital & Diagnostic Center', 'সেন্ট্রাল হাসপাতাল অ্যান্ড ডায়াগনস্টিক সেন্টার', 'Chowrongi Mor, Dinajpur', 'চৌরঙ্গী মোড়, দিনাজপুর', 'Dinajpur', '+8801711223314', 'centralhospital.dinajpur@gmail.com'],
    ['Al-Amin Hospital & Diagnostic Center', 'আল-আমিন হাসপাতাল অ্যান্ড ডায়াগনস্টিক সেন্টার', 'Jail Road, Dinajpur', 'জেল রোড, দিনাজপুর', 'Dinajpur', '+8801711223315', 'alamin.hospital.dinajpur@gmail.com']
  ];

  const hospitalIds = [];
  for (const h of hospitals) {
    const res = insertHospital.run(...h);
    hospitalIds.push(res.lastInsertRowid);
  }
  console.log(`✅ Seeded ${hospitals.length} Dinajpur hospitals & diagnostic centers.`);

  // 3. Insert Users (Admin, Receptionist, Patients, Doctors)
  const insertUser = db.prepare(`
    INSERT INTO users (phone, name, email, password_hash, role, age, gender, blood_group, address, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run('01711000001', 'System Administrator', 'admin@docbook.local', adminPass, 'admin', 38, 'MALE', 'A+', 'Dinajpur Sadar, Dinajpur', '/images/doctor-male-2.jpg').lastInsertRowid;
  const receptionId = insertUser.run('01711000004', 'Lina Akter (Receptionist)', 'reception@docbook.local', receptionPass, 'receptionist', 27, 'FEMALE', 'O+', 'Balubari, Dinajpur', '/images/doctor-female-2.jpg').lastInsertRowid;
  const patient1Id = insertUser.run('01711000005', 'Tanvir Ahmed', 'patient@docbook.local', patientPass, 'patient', 32, 'MALE', 'B+', 'Chowrongi Mor, Dinajpur', '/images/doctor-male-1.jpg').lastInsertRowid;
  const patient2Id = insertUser.run('01711000011', 'Sadia Islam', 'patient2@docbook.local', patientPass, 'patient', 28, 'FEMALE', 'O+', 'Kotwali, Dinajpur', '/images/doctor-female-1.jpg').lastInsertRowid;

  // 4. Doctor Profiles Definition (Covering all 24 specialties with top consultants!)
  const doctorsData = [
    // 1. Cardiology (Doc 1 - Keep as Doctor 1 for tests)
    {
      phone: '01711000002', name: 'Prof. Dr. Tariq Rahman', email: 'dr.rahman@docbook.local',
      age: 49, gender: 'MALE', blood: 'O+', address: 'Balubari, Dinajpur', avatar: '/images/doctor-male-2.jpg',
      specSlug: 'cardiology', hospIdx: 2, bmdc: 'BMDC-A-45892',
      qualifications: 'MBBS, FCPS (Cardiology), FACC (USA)', exp: 16, fee: 1200, followup: 700,
      bio_en: 'Senior Consultant Interventional Cardiologist with extensive clinical expertise in hypertension, ischemic heart disease, and coronary angioplasty.',
      bio_bn: 'সিনিয়র কনসালটেন্ট হৃদরোগ বিশেষজ্ঞ, উচ্চ রক্তচাপ, হার্ট অ্যাটাক ও এনজিওপ্লাস্টিতে দীর্ঘ অভিজ্ঞতা সম্পন্ন।',
      chamber: 'Dinajpur Medical College Hospital, Cardiology Wing, Room 302, Ananda Sagor, Dinajpur',
      rating: 4.9, ratingCount: 38
    },
    // 2. Gynaecology (Doc 2 - Keep as Doctor 2 for tests)
    {
      phone: '01711000003', name: 'Dr. Fatima Begum', email: 'dr.fatima@docbook.local',
      age: 41, gender: 'FEMALE', blood: 'B+', address: 'Goneshtola, Dinajpur', avatar: '/images/doctor-female-1.jpg',
      specSlug: 'gynecology', hospIdx: 1, bmdc: 'BMDC-A-52119',
      qualifications: 'MBBS, MS (Gynecology & Obstetrics), Fellow Infertility (UK)', exp: 12, fee: 1000, followup: 600,
      bio_en: 'Associate Professor and Gynecologist specializing in high-risk pregnancies, laparoscopic surgeries, and maternal wellbeing.',
      bio_bn: 'সহযোগী অধ্যাপক ও স্ত্রীরোগ বিশেষজ্ঞ, ঝুঁকিপূর্ণ গর্ভধারণ এবং ল্যাপারোস্কোপিক সার্জারিতে অভিজ্ঞ।',
      chamber: 'Dinajpur 250 Bed District Hospital, Gynae Block, Room 104, Kotwali, Dinajpur',
      rating: 4.8, ratingCount: 29
    },
    // 3. Child / Paediatrics (Doc 3)
    {
      phone: '01711000006', name: 'Dr. Anisul Haque', email: 'dr.anisul@docbook.local',
      age: 46, gender: 'MALE', blood: 'A+', address: 'Paharpur, Dinajpur', avatar: '/images/doctor-male-1.jpg',
      specSlug: 'pediatrics', hospIdx: 0, bmdc: 'BMDC-A-38914',
      qualifications: 'MBBS, DCH, MD (Pediatrics)', exp: 15, fee: 1000, followup: 500,
      bio_en: 'Leading Pediatrician dedicated to infant nutrition, infectious childhood illnesses, growth assessment, and routine vaccinations.',
      bio_bn: 'বিশিষ্ট শিশু রোগ বিশেষজ্ঞ, শিশুদের পুষ্টি, বৃদ্ধি এবং সংক্রামক ব্যাধির নিবেদিত চিকিৎসক।',
      chamber: 'Dinajpur General Hospital, Paediatrics OPD, Room 205, Hospital Road, Dinajpur',
      rating: 4.7, ratingCount: 24
    },
    // 4. Dermatology (Doc 4)
    {
      phone: '01711000007', name: 'Dr. Nusrat Jahan', email: 'dr.nusrat@docbook.local',
      age: 36, gender: 'FEMALE', blood: 'AB+', address: 'Suihari, Dinajpur', avatar: '/images/doctor-female-2.jpg',
      specSlug: 'dermatology', hospIdx: 8, bmdc: 'BMDC-A-61205',
      qualifications: 'MBBS, DDV, FCPS (Dermatology & Venereology)', exp: 9, fee: 800, followup: 500,
      bio_en: 'Consultant Dermatologist with specialized skills in stubborn acne, cosmetic dermatology, eczema, and laser therapy.',
      bio_bn: 'চর্ম ও যৌন রোগ বিশেষজ্ঞ, একজিমা, সোরিয়াসিস এবং লেজার স্কিন থেরাপিতে পারদর্শী।',
      chamber: 'Medinova Diagnostic Center, 2nd Floor, Room 212, Goneshtola Road, Dinajpur',
      rating: 4.9, ratingCount: 42
    },
    // 5. Orthopedics (Doc 5)
    {
      phone: '01711000008', name: 'Dr. Kamal Hossain', email: 'dr.kamal@docbook.local',
      age: 44, gender: 'MALE', blood: 'O-', address: 'Munshipara, Dinajpur', avatar: '/images/doctor-male-4.jpg',
      specSlug: 'orthopedics', hospIdx: 4, bmdc: 'BMDC-A-49033',
      qualifications: 'MBBS, MS (Orthopedic Surgery)', exp: 13, fee: 1100, followup: 700,
      bio_en: 'Consultant Orthopedic Surgeon specializing in joint replacement, sports trauma, and spine disorders.',
      bio_bn: 'হাড় ও জোড়া রোগ বিশেষজ্ঞ সার্জন, জয়েন্ট প্রতিস্থাপন ও স্পোর্টস ইনজুরির চিকিৎসক।',
      chamber: 'Holy Family Hospital & Diagnostic Center, Orthopedic Unit, Balubari, Dinajpur',
      rating: 4.6, ratingCount: 22
    },
    // 6. Neurology (Doc 6)
    {
      phone: '01711000009', name: 'Dr. Shahin Alam', email: 'dr.shahin@docbook.local',
      age: 40, gender: 'MALE', blood: 'B+', address: 'Modern Mor, Dinajpur', avatar: '/images/doctor-male-3.jpg',
      specSlug: 'neurology', hospIdx: 3, bmdc: 'BMDC-A-55112',
      qualifications: 'MBBS, MD (Neurology), MACP (USA)', exp: 10, fee: 1200, followup: 800,
      bio_en: 'Neurologist specializing in stroke management, chronic migraines, epilepsy, and peripheral neuropathy.',
      bio_bn: 'স্নায়ুরোগ ও স্ট্রোক বিশেষজ্ঞ, ক্রনিক মাইগ্রেন ও এপিলেপসির চিকিৎসক।',
      chamber: 'Islami Bank Community Hospital, Room 408, Goneshtola, Dinajpur',
      rating: 4.8, ratingCount: 27
    },
    // 7. Medicine / Internal Medicine
    {
      phone: '01711000012', name: 'Prof. Dr. Mahbubur Rahman', email: 'dr.mahbub@docbook.local',
      age: 52, gender: 'MALE', blood: 'A+', address: 'Ananda Sagor, Dinajpur', avatar: '/images/doctor-male-4.jpg',
      specSlug: 'medicine', hospIdx: 2, bmdc: 'BMDC-A-41280',
      qualifications: 'MBBS, FCPS (Medicine), MACP (USA), FRCP (Glasgow)', exp: 18, fee: 1200, followup: 700,
      bio_en: 'Senior Consultant in Internal Medicine with comprehensive clinical expertise in complex adult disorders, chronic infectious diseases, and multi-system illness.',
      bio_bn: 'প্রফেসর ও সিনিয়র কনসালটেন্ট মেডিসিন বিশেষজ্ঞ, জটিল ও দীর্ঘমেয়াদী রোগের আধুনিক চিকিৎসায় অভিজ্ঞ।',
      chamber: 'Dinajpur Medical College Hospital, Medicine Block, Room 102, Ananda Sagor, Dinajpur',
      rating: 4.9, ratingCount: 45
    },
    // 8. ENT (Ear, Nose & Throat)
    {
      phone: '01711000013', name: 'Dr. Ashraful Islam', email: 'dr.ashraful@docbook.local',
      age: 45, gender: 'MALE', blood: 'O+', address: 'Chowrongi Mor, Dinajpur', avatar: '/images/doctor-male-1.jpg',
      specSlug: 'ent', hospIdx: 13, bmdc: 'BMDC-A-47312',
      qualifications: 'MBBS, DLO, MS (ENT), Fellow Micro-Ear Surgery', exp: 14, fee: 1000, followup: 600,
      bio_en: 'Consultant ENT Surgeon specializing in sinus endoscopy, micro-ear surgery, tonsillectomy, and chronic voice disorders.',
      bio_bn: 'নাক, কান ও গলা রোগ বিশেষজ্ঞ এবং হেড-নেক সার্জন, সাইনাস ও কানের মাইক্রো সার্জারিতে অভিজ্ঞ।',
      chamber: 'Central Hospital & Diagnostic Center, Room 204, Chowrongi Mor, Dinajpur',
      rating: 4.8, ratingCount: 31
    },
    // 9. Gastroenterology
    {
      phone: '01711000014', name: 'Dr. Tanveer Hasan', email: 'dr.tanveer@docbook.local',
      age: 42, gender: 'MALE', blood: 'B+', address: 'Goneshtola Road, Dinajpur', avatar: '/images/doctor-male-3.jpg',
      specSlug: 'gastroenterology', hospIdx: 8, bmdc: 'BMDC-A-51904',
      qualifications: 'MBBS, MD (Gastroenterology), FACG (USA)', exp: 12, fee: 1100, followup: 600,
      bio_en: 'Consultant Gastroenterologist specializing in therapeutic endoscopy, colonoscopy, peptic ulcers, fatty liver, and IBD.',
      bio_bn: 'পরিপাকতন্ত্র ও গ্যাস্ট্রোএন্টারোলজি বিশেষজ্ঞ, এন্ডোস্কোপি, আলসার ও আইবিডি নিরাময়ে পারদর্শী।',
      chamber: 'Medinova Diagnostic Center, Room 305, Goneshtola Road, Dinajpur',
      rating: 4.9, ratingCount: 34
    },
    // 10. Endocrinology & Diabetology
    {
      phone: '01711000015', name: 'Dr. Sabina Parveen', email: 'dr.sabina@docbook.local',
      age: 39, gender: 'FEMALE', blood: 'AB+', address: 'Hospital Road, Dinajpur', avatar: '/images/doctor-female-4.jpg',
      specSlug: 'endocrinology', hospIdx: 0, bmdc: 'BMDC-A-62408',
      qualifications: 'MBBS, DEM (BIRDEM), MD (Endocrinology), FACE', exp: 10, fee: 1000, followup: 500,
      bio_en: 'Endocrinologist & Diabetologist expert in gestational diabetes, thyroid disorders, metabolic syndrome, and pituitary health.',
      bio_bn: 'ডায়াবেটিস, থাইরয়েড ও হরমোন রোগ বিশেষজ্ঞ, গর্ভকালীন ডায়াবেটিস ও হরমোন ভারসাম্য নিয়ন্ত্রণে অভিজ্ঞ।',
      chamber: 'Dinajpur General Hospital, Diabetology Unit, Room 118, Hospital Road, Dinajpur',
      rating: 4.8, ratingCount: 26
    },
    // 11. Nephrology (Kidney Medicine)
    {
      phone: '01711000016', name: 'Dr. Jahangir Kabir', email: 'dr.jahangir@docbook.local',
      age: 47, gender: 'MALE', blood: 'O+', address: 'Kotwali, Dinajpur', avatar: '/images/doctor-male-2.jpg',
      specSlug: 'nephrology', hospIdx: 1, bmdc: 'BMDC-A-44320',
      qualifications: 'MBBS, FCPS (Medicine), MD (Nephrology)', exp: 15, fee: 1200, followup: 700,
      bio_en: 'Nephrologist specializing in acute renal failure, chronic kidney disease (CKD), hemodialysis planning, and diabetic nephropathy.',
      bio_bn: 'কিডনি ও মেডিসিন বিশেষজ্ঞ, ডায়ালাইসিস ও ক্রনিক কিডনি রোগের আধুনিক নিরাময়ে অভিজ্ঞ।',
      chamber: 'Dinajpur 250 Bed District Hospital, Nephrology Unit, Room 210, Kotwali, Dinajpur',
      rating: 4.8, ratingCount: 28
    },
    // 12. Ophthalmology (Eye Care)
    {
      phone: '01711000017', name: 'Dr. Niaz Morshed', email: 'dr.niaz@docbook.local',
      age: 50, gender: 'MALE', blood: 'A+', address: 'Suihari, Dinajpur', avatar: '/images/doctor-male-4.jpg',
      specSlug: 'ophthalmology', hospIdx: 6, bmdc: 'BMDC-A-39845',
      qualifications: 'MBBS, DO, FCPS (Ophthalmology), Fellow Phaco & Glaucoma', exp: 17, fee: 800, followup: 400,
      bio_en: 'Senior Eye Consultant and Phaco Surgeon with over 6,000 successful micro-incision cataract surgeries and laser treatments.',
      bio_bn: 'চক্ষু বিশেষজ্ঞ ও ফ্যাকো সার্জন, ছানি অপারেশন, গ্লুকোমা ও আধুনিক লেজার চিকিৎসায় বিশেষজ্ঞ।',
      chamber: 'Dinajpur Lions Eye Hospital, Chamber 101, Lions Bhaban, Suihari, Dinajpur',
      rating: 4.9, ratingCount: 52
    },
    // 13. Chest Medicine (Pulmonology)
    {
      phone: '01711000018', name: 'Dr. Rezwan Ahmed', email: 'dr.rezwan@docbook.local',
      age: 44, gender: 'MALE', blood: 'B-', address: 'Hospital Road, Suihari, Dinajpur', avatar: '/images/doctor-male-1.jpg',
      specSlug: 'chest-medicine', hospIdx: 12, bmdc: 'BMDC-A-48762',
      qualifications: 'MBBS, DTCD, MD (Chest Diseases), FCCP (USA)', exp: 13, fee: 1000, followup: 600,
      bio_en: 'Pulmonologist specializing in bronchial asthma, COPD, pulmonary fibrosis, post-TB lung rehabilitation, and sleep apnea.',
      bio_bn: 'বক্ষব্যাধি ও ফুসফুস রোগ বিশেষজ্ঞ, হাঁপানি, ক্রনিক কাশি ও শ্বাসকষ্টের সুচিকিৎসক।',
      chamber: 'New Life Diagnostic Center, Room 108, Hospital Road, Suihari, Dinajpur',
      rating: 4.7, ratingCount: 23
    },
    // 14. Urology
    {
      phone: '01711000019', name: 'Dr. Monjurul Karim', email: 'dr.monjurul@docbook.local',
      age: 48, gender: 'MALE', blood: 'O+', address: 'Medical Road, Dinajpur', avatar: '/images/doctor-male-3.jpg',
      specSlug: 'urology', hospIdx: 5, bmdc: 'BMDC-A-43180',
      qualifications: 'MBBS, MS (Urology), FRCS (Edin)', exp: 16, fee: 1300, followup: 800,
      bio_en: 'Consultant Urological Surgeon skilled in endourology, laser prostatectomy (TURP), PCNL kidney stone extraction, and urinary strictures.',
      bio_bn: 'ইউরোলজিস্ট ও মূত্রতন্ত্র সার্জন, প্রোস্টেট বৃদ্ধি ও লেজারের সাহায্যে কিডনি পাথর অপসারণে পারদর্শী।',
      chamber: 'North Bengal Medical College Hospital, Urology Suite, Room 201, Medical Road, Dinajpur',
      rating: 4.9, ratingCount: 36
    },
    // 15. Dentistry
    {
      phone: '01711000020', name: 'Dr. Rumana Akhter', email: 'dr.rumana@docbook.local',
      age: 34, gender: 'FEMALE', blood: 'A+', address: 'Munshipara, Dinajpur', avatar: '/images/doctor-female-2.jpg',
      specSlug: 'dentistry', hospIdx: 9, bmdc: 'BMDC-D-12940',
      qualifications: 'BDS, PGT, FCPS (Orthodontics & Dentofacial Orthopedics)', exp: 8, fee: 700, followup: 400,
      bio_en: 'Dental Surgeon and Orthodontist specializing in aesthetic smile design, root canal treatment, dental crowns, and pain-free extractions.',
      bio_bn: 'ডেন্টাল সার্জন ও অর্থোডন্টিস্ট, রুট ক্যানেল, আঁকাবাঁকা দাঁত সোজা করা ও ব্যথামুক্ত দাঁত তোলা।',
      chamber: 'Prime Diagnostic Center, Dental OPD, Room 105, Munshipara, Dinajpur',
      rating: 4.8, ratingCount: 30
    },
    // 16. General & Laparoscopic Surgery
    {
      phone: '01711000021', name: 'Dr. Saifullah Mansur', email: 'dr.saifullah@docbook.local',
      age: 46, gender: 'MALE', blood: 'B+', address: 'Ananda Sagor, Dinajpur', avatar: '/images/doctor-male-2.jpg',
      specSlug: 'general-surgery', hospIdx: 2, bmdc: 'BMDC-A-46019',
      qualifications: 'MBBS, FCPS (Surgery), FMAS (Minimal Access Surgery)', exp: 14, fee: 1100, followup: 600,
      bio_en: 'Laparoscopic and General Surgeon performing laparoscopic cholecystectomy, hernia mesh repair, appendectomy, and colorectal surgery.',
      bio_bn: 'জেনারেল ও ল্যাপারোস্কোপিক সার্জন, পিত্তপাথর, অ্যাপেন্ডিক্স ও হার্নিয়া অপারেশনে দীর্ঘ অভিজ্ঞতা।',
      chamber: 'Dinajpur Medical College Hospital, Surgery Unit, Room 315, Ananda Sagor, Dinajpur',
      rating: 4.8, ratingCount: 33
    },
    // 17. Psychiatry & Behavioral Health
    {
      phone: '01711000022', name: 'Dr. Tasnim Ara', email: 'dr.tasnim@docbook.local',
      age: 37, gender: 'FEMALE', blood: 'O+', address: 'Paharpur, Dinajpur', avatar: '/images/doctor-female-3.jpg',
      specSlug: 'psychiatry', hospIdx: 10, bmdc: 'BMDC-A-56782',
      qualifications: 'MBBS, MD (Psychiatry), Member WPA', exp: 9, fee: 900, followup: 500,
      bio_en: 'Clinical Psychiatrist providing compassionate care for depressive disorders, panic attacks, OCD, insomnia, and adolescent mental wellness.',
      bio_bn: 'মানসিক রোগ ও সাইকিয়াট্রি বিশেষজ্ঞ, বিষণ্ণতা, ফোবিয়া, অনিদ্রা ও মানসিক স্বাস্থ্য পরামর্শক।',
      chamber: 'Sunrise Clinic & Diagnostic Center, Room 102, Paharpur, Dinajpur',
      rating: 4.9, ratingCount: 25
    },
    // 18. Physical Medicine & Rehabilitation
    {
      phone: '01711000023', name: 'Dr. Kazi Mostafa', email: 'dr.mostafa@docbook.local',
      age: 43, gender: 'MALE', blood: 'AB-', address: 'Modern Mor, Dinajpur', avatar: '/images/doctor-male-1.jpg',
      specSlug: 'physical-medicine', hospIdx: 11, bmdc: 'BMDC-A-50123',
      qualifications: 'MBBS, FCPS (Physical Medicine & Rehabilitation)', exp: 11, fee: 800, followup: 500,
      bio_en: 'Rehabilitation Specialist for sciatica, cervical spondylosis, stroke hemiplegia rehabilitation, and musculoskeletal trigger injections.',
      bio_bn: 'ফিজিকেল মেডিসিন ও বাত ব্যাথা বিশেষজ্ঞ, প্যারালাইসিস ও কোমর ব্যথার ফিজিওথেরাপি পুনর্বাসন।',
      chamber: 'City Diagnostic Center, Room 208, Modern Mor, Dinajpur',
      rating: 4.7, ratingCount: 21
    },
    // 19. Nutrition & Dietetics
    {
      phone: '01711000024', name: 'Dr. Asma Ul Husna', email: 'dr.asma@docbook.local',
      age: 33, gender: 'FEMALE', blood: 'B+', address: 'Station Road, Dinajpur', avatar: '/images/doctor-female-1.jpg',
      specSlug: 'nutrition', hospIdx: 7, bmdc: 'BMDC-A-65890',
      qualifications: 'MBBS, MPH, PGDN (Clinical Nutrition & Dietetics)', exp: 7, fee: 700, followup: 400,
      bio_en: 'Clinical Nutritionist designing personalized medical nutrition therapy for diabetes reversal, fatty liver, renal diets, and pediatric growth.',
      bio_bn: 'ক্লিনিক্যাল নিউট্রিশনিস্ট ও ডায়েট স্পেশালিস্ট, ডায়াবেটিস নিয়ন্ত্রণ ও ওজন কমানোর বৈজ্ঞানিক ডায়েট চার্ট প্রস্তুতকারক।',
      chamber: 'Amin Diagnostic Center, Room 104, Station Road, Dinajpur',
      rating: 4.9, ratingCount: 28
    },
    // 20. Oncology (Cancer Care)
    {
      phone: '01711000025', name: 'Dr. Sharif Hossain', email: 'dr.sharif@docbook.local',
      age: 49, gender: 'MALE', blood: 'A+', address: 'Ananda Sagor, Dinajpur', avatar: '/images/doctor-male-4.jpg',
      specSlug: 'oncology', hospIdx: 2, bmdc: 'BMDC-A-41905',
      qualifications: 'MBBS, MPhil, FCPS (Radiotherapy & Oncology)', exp: 15, fee: 1400, followup: 800,
      bio_en: 'Clinical Oncologist expert in chemo-immunotherapy protocols, precision radiation therapy planning, and palliative cancer care.',
      bio_bn: 'ক্যান্সার ও অনকোলজি বিশেষজ্ঞ, কেমোথেরাপি, রেডিয়েশন প্ল্যানিং ও টিউমার চিকিৎসায় পারদর্শী।',
      chamber: 'Dinajpur Medical College Hospital, Oncology Department, Room 401, Ananda Sagor, Dinajpur',
      rating: 4.9, ratingCount: 37
    },
    // 21. Rheumatology
    {
      phone: '01711000026', name: 'Dr. Laila Noor', email: 'dr.laila@docbook.local',
      age: 38, gender: 'FEMALE', blood: 'O+', address: 'Goneshtola, Dinajpur', avatar: '/images/doctor-female-4.jpg',
      specSlug: 'rheumatology', hospIdx: 3, bmdc: 'BMDC-A-53210',
      qualifications: 'MBBS, MD (Rheumatology), FACR', exp: 10, fee: 1100, followup: 600,
      bio_en: 'Rheumatologist treating rheumatoid arthritis, SLE / lupus, ankylosing spondylitis, gout, and systemic connective tissue diseases.',
      bio_bn: 'বাত ও রিউমাটোলজি বিশেষজ্ঞ, গেঁটেবাত, লুপাস ও জয়েন্টের দীর্ঘমেয়াদী প্রদাহ নিরাময়ে অভিজ্ঞ।',
      chamber: 'Islami Bank Community Hospital, Room 302, Goneshtola, Dinajpur',
      rating: 4.8, ratingCount: 24
    },
    // 22. Liver Medicine (Hepatology)
    {
      phone: '01711000027', name: 'Dr. Aminul Islam', email: 'dr.aminul@docbook.local',
      age: 44, gender: 'MALE', blood: 'B+', address: 'Kotwali, Dinajpur', avatar: '/images/doctor-male-3.jpg',
      specSlug: 'hepatology', hospIdx: 1, bmdc: 'BMDC-A-47812',
      qualifications: 'MBBS, MD (Hepatology)', exp: 12, fee: 1100, followup: 650,
      bio_en: 'Hepatologist specializing in non-alcoholic fatty liver disease (NAFLD), viral Hepatitis B/C cure protocols, cirrhosis, and jaundice.',
      bio_bn: 'লিভার ও হেপাটোলজি বিশেষজ্ঞ, ফ্যাটি লিভার, হেপাটাইটিস ও জন্ডিসের আধুনিক চিকিৎসায় পারদর্শী।',
      chamber: 'Dinajpur 250 Bed District Hospital, Hepatology Clinic, Room 112, Kotwali, Dinajpur',
      rating: 4.8, ratingCount: 27
    },
    // 23. Haematology
    {
      phone: '01711000028', name: 'Dr. Shireen Parvin', email: 'dr.shireen@docbook.local',
      age: 37, gender: 'FEMALE', blood: 'A+', address: 'Jail Road, Dinajpur', avatar: '/images/doctor-female-3.jpg',
      specSlug: 'haematology', hospIdx: 14, bmdc: 'BMDC-A-59811',
      qualifications: 'MBBS, FCPS (Haematology)', exp: 9, fee: 1000, followup: 600,
      bio_en: 'Blood Disease Specialist treating refractory anemia, thalassemia major/minor counseling, immune thrombocytopenia (ITP), and coagulation defects.',
      bio_bn: 'রক্তরোগ বিশেষজ্ঞ, রক্তস্বল্পতা, থ্যালাসেমিয়া ও রক্তের প্লেটলেট বৃদ্ধির বিশেষ চিকিৎসা।',
      chamber: 'Al-Amin Hospital & Diagnostic Center, Room 203, Jail Road, Dinajpur',
      rating: 4.8, ratingCount: 22
    },
    // 24. Pain Management
    {
      phone: '01711000029', name: 'Dr. Tariqul Islam', email: 'dr.tariqul@docbook.local',
      age: 45, gender: 'MALE', blood: 'O+', address: 'Balubari, Dinajpur', avatar: '/images/doctor-male-2.jpg',
      specSlug: 'pain-management', hospIdx: 4, bmdc: 'BMDC-A-49218',
      qualifications: 'MBBS, DA, Fellow Interventional Pain Management (FIPM)', exp: 13, fee: 1000, followup: 600,
      bio_en: 'Interventional Pain Specialist providing fluoroscopy-guided epidural injections, radiofrequency ablation for chronic back pain, and cancer pain relief.',
      bio_bn: 'পেইন মেডিসিন বিশেষজ্ঞ, অপারেশনবিহীন দীর্ঘমেয়াদী কোমর, ঘাড় ও জয়েন্টের ব্যথা নিরাময়।',
      chamber: 'Holy Family Hospital & Diagnostic Center, Pain Clinic, Balubari, Dinajpur',
      rating: 4.9, ratingCount: 31
    },
    // 25. Medicine / General Practice (Dr. Mizanur - Approved)
    {
      phone: '01711000030', name: 'Dr. Mizanur Rahman', email: 'dr.mizanur@docbook.local',
      age: 38, gender: 'MALE', blood: 'A+', address: 'Munshipara, Dinajpur', avatar: '/images/doctor-male-1.jpg',
      specSlug: 'medicine', hospIdx: 9, bmdc: 'BMDC-A-54321',
      qualifications: 'MBBS, FCPS (Medicine Part-2), CCD (BIRDEM)', exp: 8, fee: 800, followup: 500,
      bio_en: 'Consultant Physician with special focus on preventive health checkups, hypertension, viral illnesses, and glycemic control.',
      bio_bn: 'মেডিসিন ও ডায়াবেটিস চিকিৎসক, নিয়মিত স্বাস্থ্য পরীক্ষা ও জ্বর-সংক্রামক রোগের অভিজ্ঞ চিকিৎসক।',
      chamber: 'Prime Diagnostic Center, Room 101, Munshipara, Dinajpur',
      rating: 4.7, ratingCount: 19
    },
    // 26. Gynaecology & Obstetrics (Second Specialist - Dr. Farhana)
    {
      phone: '01711000031', name: 'Dr. Farhana Yasmin', email: 'dr.farhana@docbook.local',
      age: 40, gender: 'FEMALE', blood: 'B+', address: 'Balubari, Dinajpur', avatar: '/images/doctor-female-3.jpg',
      specSlug: 'gynecology', hospIdx: 4, bmdc: 'BMDC-A-58291',
      qualifications: 'MBBS, FCPS (Gynae & Obs), DGO, Fellow Laparoscopy (India)', exp: 11, fee: 900, followup: 500,
      bio_en: 'Consultant Obstetrician & Gynecological Surgeon, dedicated to prenatal care, cesarean section, painless labor, and PCOS management.',
      bio_bn: 'স্ত্রীরোগ ও প্রসূতি বিদ্যা বিশেষজ্ঞ, নরমাল ডেলিভারি, সিজারিয়ান ও বন্ধ্যাত্ব পরামর্শক।',
      chamber: 'Holy Family Hospital & Diagnostic Center, Gynae Unit, Room 202, Balubari, Dinajpur',
      rating: 4.8, ratingCount: 26
    }
  ];

  // Insert Approved Doctors
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (
      user_id, specialty_id, hospital_id, bmdc_reg_no, qualifications, experience_years,
      consultation_fee, follow_up_fee, bio_en, bio_bn, chamber_address, status, rating_avg, rating_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createdDoctorIds = [];
  let doc1Id = null;
  let doc2Id = null;

  for (let i = 0; i < doctorsData.length; i++) {
    const doc = doctorsData[i];
    const userId = insertUser.run(
      doc.phone, doc.name, doc.email, doctorPass, 'doctor',
      doc.age, doc.gender, doc.blood, doc.address, doc.avatar
    ).lastInsertRowid;

    const specialtyId = specialtyIds[doc.specSlug];
    const hospitalId = hospitalIds[doc.hospIdx];

    const doctorId = insertDoctor.run(
      userId, specialtyId, hospitalId, doc.bmdc,
      doc.qualifications, doc.exp, doc.fee, doc.followup,
      doc.bio_en, doc.bio_bn, doc.chamber,
      'APPROVED', doc.rating, doc.ratingCount
    ).lastInsertRowid;

    createdDoctorIds.push(doctorId);
    if (i === 0) doc1Id = doctorId;
    if (i === 1) doc2Id = doctorId;
  }

  // Pending Doctor for Admin credential verification testing
  const drPendingUserId = insertUser.run(
    '01711000010', 'Dr. Kabir Chowdhury (Applicant)', 'dr.pending@docbook.local', doctorPass, 'doctor',
    34, 'MALE', 'A+', 'Hospital Road, Dinajpur', '/images/doctor-male-1.jpg'
  ).lastInsertRowid;

  insertDoctor.run(
    drPendingUserId, specialtyIds['general-surgery'], hospitalIds[9], 'BMDC-A-77889',
    'MBBS, MS (Surgery Phase-B)', 5, 600, 400,
    'Surgical Registrar awaiting credential board verification.',
    'সার্জারি চিকিৎসক (অনুমোদনের অপেক্ষায়)।',
    'Prime Diagnostic Center, Room 101, Munshipara, Dinajpur',
    'PENDING_APPROVAL', 0.0, 0
  );

  console.log(`✅ Seeded ${createdDoctorIds.length} approved doctors covering all 24 specialties, plus 1 pending applicant.`);

  // 5. Insert Doctor Weekly Schedules (All 7 days: 0=Sun to 6=Sat)
  const insertSchedule = db.prepare(`
    INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, break_start, break_end)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const docId of createdDoctorIds) {
    // Schedule all active doctors across all 7 days of the week so appointments can be made any day!
    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
      insertSchedule.run(docId, day, '17:00', '21:00', 20, '19:00', '19:20');
    }
  }
  console.log('✅ Seeded full 7-day weekly schedules for all active doctors.');

  // 6. Generate Time Slots for Today and Next 4 Days
  const insertSlot = db.prepare(`
    INSERT INTO time_slots (doctor_id, date, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const dateStrings = [];
  for (let offset = 0; offset <= 4; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    dateStrings.push(d.toISOString().slice(0, 10));
  }

  const sampleTimes = [
    ['17:00', '17:20'],
    ['17:20', '17:40'],
    ['17:40', '18:00'],
    ['18:00', '18:20'],
    ['18:20', '18:40'],
    ['18:40', '19:00'],
    ['19:20', '19:40'],
    ['19:40', '20:00'],
    ['20:00', '20:20'],
    ['20:20', '20:40'],
    ['20:40', '21:00']
  ];

  let firstSlotId = null;
  let secondSlotId = null;
  let thirdSlotId = null;

  // Pre-generate slots for all doctors across upcoming days for immediate availability
  const insertManySlots = db.transaction(() => {
    for (const docId of createdDoctorIds) {
      for (const dateStr of dateStrings) {
        for (const [st, et] of sampleTimes) {
          const res = insertSlot.run(docId, dateStr, st, et, 'AVAILABLE');
          if (!firstSlotId && docId === doc1Id && dateStr === dateStrings[0]) {
            firstSlotId = res.lastInsertRowid;
          } else if (!secondSlotId && docId === doc1Id && dateStr === dateStrings[0]) {
            secondSlotId = res.lastInsertRowid;
          } else if (!thirdSlotId && docId === doc2Id && dateStr === dateStrings[1]) {
            thirdSlotId = res.lastInsertRowid;
          }
        }
      }
    }
  });
  insertManySlots();
  console.log('✅ Seeded initial time slots for upcoming days.');

  // 7. Seed Sample Appointments, Payments, Prescriptions & Reviews
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (
      appointment_number, patient_id, doctor_id, slot_id, date, time, serial_number,
      patient_type, patient_name, patient_phone, patient_age, patient_gender,
      reason_for_visit, notes, status, fee_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (
      appointment_id, user_id, method, transaction_ref, amount, status, payment_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Appointment 1: Completed consultation with Dr. Rahman for Patient Tanvir
  if (firstSlotId) {
    db.prepare("UPDATE time_slots SET status = 'BOOKED' WHERE id = ?").run(firstSlotId);
    const apt1Res = insertAppointment.run(
      'APT-20261005-0001', patient1Id, doc1Id, firstSlotId, dateStrings[0], '17:00', 1,
      'SELF', 'Tanvir Ahmed', '01711000005', 32, 'MALE',
      'Occasional chest discomfort and elevated blood pressure',
      'History of hypertension in family', 'COMPLETED', 1200
    );
    const apt1Id = apt1Res.lastInsertRowid;

    insertPayment.run(apt1Id, patient1Id, 'BKASH', 'TRX-BK-9823184', 1200, 'PAID', new Date().toISOString());

    // Prescription for Appointment 1
    const rxRes = db.prepare(`
      INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, symptoms, advice, follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      apt1Id, doc1Id, patient1Id,
      'Essential Hypertension Stage 1 with Mild Palpitation',
      'Chest tightness on exertion, systolic BP 145/92 mmHg',
      'Reduce dietary sodium intake. Brisk walking for 30 minutes daily. Avoid late night stress.',
      dateStrings[3]
    );
    const rxId = rxRes.lastInsertRowid;

    db.prepare(`
      INSERT INTO prescription_items (prescription_id, medicine_name, dosage, instruction, duration)
      VALUES (?, ?, ?, ?, ?)
    `).run(rxId, 'Tab. Bisoprolol 2.5mg', '1+0+0', 'Morning, Before Breakfast', '30 Days');

    db.prepare(`
      INSERT INTO prescription_items (prescription_id, medicine_name, dosage, instruction, duration)
      VALUES (?, ?, ?, ?, ?)
    `).run(rxId, 'Tab. Telmisartan 40mg', '0+0+1', 'Night, After Dinner', '30 Days');

    db.prepare(`
      INSERT INTO prescription_tests (prescription_id, test_name, notes)
      VALUES (?, ?, ?)
    `).run(rxId, '12-Lead Resting ECG', 'Check for LVH or ischemia');

    db.prepare(`
      INSERT INTO prescription_tests (prescription_id, test_name, notes)
      VALUES (?, ?, ?)
    `).run(rxId, 'Lipid Profile & Serum Creatinine', 'Fasting sample required');

    // Review for Appointment 1
    db.prepare(`
      INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      apt1Id, doc1Id, patient1Id, 5,
      'Prof. Tariq Rahman is extremely attentive and explained my ECG results very clearly. Highly recommended!'
    );
  }

  // Appointment 2: Confirmed upcoming appointment for Sadia with Dr. Fatima
  if (thirdSlotId) {
    db.prepare("UPDATE time_slots SET status = 'BOOKED' WHERE id = ?").run(thirdSlotId);
    const apt2Res = insertAppointment.run(
      'APT-20261006-0002', patient2Id, doc2Id, thirdSlotId, dateStrings[1], '17:00', 1,
      'SELF', 'Sadia Islam', '01711000011', 28, 'FEMALE',
      'Routine prenatal wellness checkup (First trimester)',
      'Previous ultrasound report available', 'CONFIRMED', 1000
    );
    const apt2Id = apt2Res.lastInsertRowid;
    insertPayment.run(apt2Id, patient2Id, 'NAGAD', 'TRX-NG-4458912', 1000, 'PAID', new Date().toISOString());

    db.prepare(`
      INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      apt2Id, doc2Id, patient2Id, 5,
      'Dr. Fatima Begum was reassuring, gentle, and addressed all my pregnancy concerns patiently.'
    );
  }

  // Appointment 3: Pay at Clinic pending appointment
  if (secondSlotId) {
    db.prepare("UPDATE time_slots SET status = 'BOOKED' WHERE id = ?").run(secondSlotId);
    const apt3Res = insertAppointment.run(
      'APT-20261005-0002', patient1Id, doc1Id, secondSlotId, dateStrings[0], '17:20', 2,
      'FAMILY', 'Mohammad Ali (Father)', '01711000005', 68, 'MALE',
      'Post-bypass surgery routine cardiac follow-up',
      'Patient uses wheelchair', 'CONFIRMED', 1200
    );
    const apt3Id = apt3Res.lastInsertRowid;
    insertPayment.run(apt3Id, patient1Id, 'CASH_AT_CLINIC', null, 1200, 'PENDING', null);
  }

  // Add authentic reviews for other doctors as well
  const extraReviews = [
    { docId: createdDoctorIds[2], rating: 5, comment: 'Dr. Anisul Haque handled my child’s high fever with great care and quick diagnosis.' },
    { docId: createdDoctorIds[3], rating: 5, comment: 'Dr. Nusrat Jahan solved my chronic skin allergy when other treatments had failed.' },
    { docId: createdDoctorIds[4], rating: 4, comment: 'Very experienced orthopedist. My knee pain improved within 2 weeks of his prescribed physical regimen.' },
    { docId: createdDoctorIds[5], rating: 5, comment: 'Excellent neurologist. He diagnosed my migraine triggers accurately.' },
    { docId: createdDoctorIds[6], rating: 5, comment: 'Prof. Mahbubur Rahman is a legend in Dinajpur medicine. Thorough examination.' },
    { docId: createdDoctorIds[7], rating: 5, comment: 'Dr. Ashraful cured my chronic sinus problem with endoscopic treatment.' },
    { docId: createdDoctorIds[8], rating: 5, comment: 'Very skilled gastroenterologist, painless endoscopy experience.' },
    { docId: createdDoctorIds[9], rating: 5, comment: 'Dr. Sabina brought my HbA1c down from 9.2 to 6.4 with a balanced medicine schedule.' },
    { docId: createdDoctorIds[11], rating: 5, comment: 'Dr. Niaz performed phaco surgery on my mother’s eye. Vision restored 100%!' }
  ];

  const insertDirectReview = db.prepare(`
    INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < extraReviews.length; i++) {
    const rev = extraReviews[i];
    if (rev.docId) {
      const existingSlot = db.prepare("SELECT id FROM time_slots WHERE doctor_id = ? AND date = ? AND status = 'AVAILABLE' LIMIT 1").get(rev.docId, dateStrings[0]);
      let slotId = existingSlot ? existingSlot.id : null;
      if (slotId) {
        db.prepare("UPDATE time_slots SET status = 'BOOKED' WHERE id = ?").run(slotId);
      } else {
        const slotRes = insertSlot.run(rev.docId, dateStrings[0], `10:${(i * 10).toString().padStart(2, '0')}`, `10:${((i * 10) + 15).toString().padStart(2, '0')}`, 'BOOKED');
        slotId = slotRes.lastInsertRowid;
      }
      const aptRes = insertAppointment.run(
        `APT-2026100${i + 7}-000${i + 4}`, patient1Id, rev.docId, slotId, dateStrings[0], '18:00', i + 1,
        'SELF', 'Tanvir Ahmed', '01711000005', 32, 'MALE',
        'Specialist outpatient consultation', 'Completed consultation', 'COMPLETED', 1000
      );
      insertDirectReview.run(aptRes.lastInsertRowid, rev.docId, patient1Id, rev.rating, rev.comment);
    }
  }

  // Initial Audit Log
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, entity, entity_id, new_values, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, 'SYSTEM_SEED', 'SYSTEM', 0, JSON.stringify({ seeded: true }), '127.0.0.1', 'Node/Seeder');

  console.log('✅ Seed completed successfully with all doctors, schedules, and reviews!');
}

if (process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}
