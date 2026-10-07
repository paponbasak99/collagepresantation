// DocBook Internationalization (English & Bengali)
const translations = {
  en: {
    // Top Emergency Bar
    triage_badge: "24/7 TRIAGE",
    emergency_title: "Dinajpur Medical Emergency Triage",
    ambulance_label: "Ambulance:",
    health_call_label: "Health Call:",
    emergency_label: "Emergency:",

    // Navigation
    brand_name: "DocBook",
    tagline: "Smart Care, Seamless Scheduling",
    nav_home: "Home",
    nav_doctors: "Find Doctors",
    nav_specialties: "Specialties",
    nav_appointments: "My Appointments",
    nav_doctor_panel: "Doctor Panel",
    nav_reception: "Reception Desk",
    nav_admin: "Admin Dashboard",
    nav_login: "Login / Register",
    nav_logout: "Logout",
    nav_profile: "My Profile",

    // Hero & Search
    hero_title: "Find & Book The Best Specialists in Minutes",
    hero_subtitle: "Zero wait times, verified BMDC doctors, real-time slot holds, and transparent fee policies.",
    search_placeholder: "Search doctor name, hospital, or symptoms...",
    all_specialties: "All Specialties",
    all_hospitals: "All Hospitals & Clinics",
    search_btn: "Search Doctors",

    // Home sections
    specialties_heading: "Browse Medical Specialties",
    specialties_sub: "Find certified doctors across specialized departments",
    top_doctors_heading: "Featured Top-Rated Specialists",
    top_doctors_sub: "Vetted by BMDC and trusted by thousands of patients",
    how_it_works_heading: "How DocBook Works",
    step_1_title: "1. Find Your Doctor",
    step_1_desc: "Filter by specialty, location, fee, rating, or chamber availability.",
    step_2_title: "2. Lock Slot (5-Min Hold)",
    step_2_desc: "Pick an available time slot. We hold it exclusively for 5 minutes while you confirm.",
    step_3_title: "3. Pay & Get Slip",
    step_3_desc: "Pay via bKash, Nagad, or at clinic. Download your QR verified serial token.",

    // Doctor profile & cards
    book_appointment: "Book Appointment",
    view_profile: "View Profile",
    bmdc_verified: "BMDC Verified",
    experience_years: "Years Experience",
    consultation_fee: "Consultation Fee",
    follow_up_fee: "Follow-up Fee",
    chamber_address: "Chamber Address",
    available_slots: "Available Slots",
    select_date: "Select Date",
    morning_shift: "Morning Shift",
    afternoon_shift: "Afternoon Shift",
    evening_shift: "Evening Shift",
    no_slots_found: "No available slots on this date. Doctor may be off or booked.",
    on_leave: "Doctor is on leave on this date.",

    // Booking & Hold
    slot_reserved_notice: "Slot Temporarily Reserved",
    remaining_time: "Remaining Time:",
    patient_info_heading: "Patient Information",
    book_for_self: "For Myself",
    book_for_family: "For Family Member",
    patient_name: "Patient Full Name",
    patient_phone: "Phone Number",
    patient_age: "Age",
    patient_gender: "Gender",
    gender_male: "Male",
    gender_female: "Female",
    gender_other: "Other",
    patient_relation: "Relation with Patient",
    reason_for_visit: "Reason for Visit",
    reason_placeholder: "Describe primary symptoms or health concern...",
    notes: "Optional Notes for Doctor",
    proceed_to_payment: "Proceed to Payment",

    // Payment & Checkout
    checkout_heading: "Appointment Checkout",
    summary: "Booking Summary",
    fee_breakdown: "Fee Breakdown",
    vat_platform_fee: "Platform & VAT Fee",
    total_payable: "Total Payable",
    select_payment_method: "Select Payment Method",
    pay_bkash: "Pay with bKash",
    pay_nagad: "Pay with Nagad",
    pay_at_clinic: "Pay at Clinic (Cash)",
    pay_clinic_note: "You can pay in cash at the reception desk. Please arrive 15 minutes before your slot.",
    confirm_and_pay: "Confirm & Book",

    // Appointment Slip
    slip_heading: "Patient Appointment Slip",
    serial_number: "Serial Number",
    appointment_id: "Appointment ID",
    reporting_time: "Reporting Time",
    doctor_info: "Doctor Information",
    payment_status: "Payment Status",
    print_slip: "Print Slip",
    download_pdf: "Download PDF",
    scan_qr_note: "Hospital staff can scan this QR code to verify token validity.",

    // Statuses
    status_confirmed: "Confirmed",
    status_pending: "Payment Pending",
    status_arrived: "Arrived",
    status_in_consultation: "In Consultation",
    status_completed: "Completed",
    status_cancelled: "Cancelled",
    status_no_show: "No Show",

    // My Appointments
    tab_upcoming: "Upcoming Visits",
    tab_completed: "Completed Visits",
    tab_cancelled: "Cancelled Visits",
    cancel_appointment: "Cancel Visit",
    reschedule_appointment: "Reschedule",
    view_prescription: "View Prescription",
    rate_doctor: "Rate & Review",
    cancellation_heading: "Cancel Appointment",
    cancellation_policy: "Refund Policy: >24h = 90% refund, 6-24h = 50% refund, <6h = 0% refund.",
    cancel_reason: "Reason for cancellation",
    confirm_cancel: "Confirm Cancellation",

    // Common
    loading: "Loading...",
    no_data: "No records found.",
    error: "An error occurred.",
    success: "Success",
    currency: "৳"
  },

  bn: {
    // Top Emergency Bar
    triage_badge: "২৪/৭ ট্রায়াজ",
    emergency_title: "দিনাজপুর মেডিকেল জরুরি ট্রায়াজ",
    ambulance_label: "অ্যাম্বুলেন্স:",
    health_call_label: "স্বাস্থ্য কল:",
    emergency_label: "জরুরি সেবা:",

    // Navigation
    brand_name: "ডকবুক",
    tagline: "স্মার্ট সেবা, সহজ বুকিং",
    nav_home: "হোম",
    nav_doctors: "ডাক্তার খুঁজুন",
    nav_specialties: "বিভাগসমূহ",
    nav_appointments: "আমার অ্যাপয়েন্টমেন্ট",
    nav_doctor_panel: "ডাক্তার প্যানেল",
    nav_reception: "রিসেপশন ডেস্ক",
    nav_admin: "অ্যাডমিন ড্যাশবোর্ড",
    nav_login: "লগইন / রেজিস্টার",
    nav_logout: "লগআউট",
    nav_profile: "আমার প্রোফাইল",

    // Hero & Search
    hero_title: "সেরা বিশেষজ্ঞ ডাক্তার খুঁজুন ও সহজে বুকিং করুন",
    hero_subtitle: "বিএমডিসি অনুমোদিত ডাক্তার, ৫ মিনিটের স্লট রিজার্ভেশন এবং স্বচ্ছ ফি নীতি।",
    search_placeholder: "ডাক্তারের নাম, হাসপাতাল বা লক্ষণ লিখুন...",
    all_specialties: "সকল বিভাগ",
    all_hospitals: "সকল হাসপাতাল ও ক্লিনিক",
    search_btn: "ডাক্তার খুঁজুন",

    // Home sections
    specialties_heading: "চিকিৎসা বিভাগসমূহ",
    specialties_sub: "আপনার প্রয়োজনীয় বিশেষজ্ঞ বিভাগ বেছে নিন",
    top_doctors_heading: "শীর্ষ রেটেড বিশেষজ্ঞ ডাক্তারগণ",
    top_doctors_sub: "বিএমডিসি ভেরিফাইড এবং হাজারো রোগীর বিশ্বস্ত",
    how_it_works_heading: "ডকবুক যেভাবে কাজ করে",
    step_1_title: "১. ডাক্তার খুঁজুন",
    step_1_desc: "বিভাগ, ফি, অবস্থান ও রেটিং অনুযায়ী সেরা বিশেষজ্ঞ নির্বাচন করুন।",
    step_2_title: "২. স্লট হোল্ড (৫ মিনিট)",
    step_2_desc: "পছন্দের সময় নির্বাচন করুন। কনফার্ম করার জন্য স্লটটি ৫ মিনিট আপনার জন্য সংরক্ষিত থাকবে।",
    step_3_title: "৩. পেমেন্ট ও সিরিয়াল স্লিপ",
    step_3_desc: "বিকাশ, নগদ বা চেম্বারে পেমেন্ট করুন এবং কিউআর কোডসহ সিরিয়াল টোকেন সংগ্রহ করুন।",

    // Doctor profile & cards
    book_appointment: "অ্যাপয়েন্টমেন্ট নিন",
    view_profile: "প্রোফাইল দেখুন",
    bmdc_verified: "বিএমডিসি ভেরিফাইড",
    experience_years: "বছরের অভিজ্ঞতা",
    consultation_fee: "পরামর্শ ফি",
    follow_up_fee: "ফলো-আপ ফি",
    chamber_address: "চেম্বারের ঠিকানা",
    available_slots: "উপলব্ধ সময়সূচী",
    select_date: "তারিখ নির্বাচন করুন",
    morning_shift: "সকালের শিফট",
    afternoon_shift: "দুপুরের শিফট",
    evening_shift: "সন্ধ্যার শিফট",
    no_slots_found: "এই তারিখে কোনো সময় খালি নেই।",
    on_leave: "ডাক্তার এই তারিখে ছুটিতে আছেন।",

    // Booking & Hold
    slot_reserved_notice: "স্লটটি সাময়িকভাবে সংরক্ষিত",
    remaining_time: "বাকি সময়:",
    patient_info_heading: "রোগীর তথ্য",
    book_for_self: "নিজের জন্য",
    book_for_family: "পরিবারের সদস্যের জন্য",
    patient_name: "রোগীর পূর্ণ নাম",
    patient_phone: "মোবাইল নম্বর",
    patient_age: "বয়স",
    patient_gender: "লিঙ্গ",
    gender_male: "পুরুষ",
    gender_female: "নারী",
    gender_other: "অন্যান্য",
    patient_relation: "রোগীর সাথে সম্পর্ক",
    reason_for_visit: "সাক্ষাতের কারণ",
    reason_placeholder: "প্রধান লক্ষণ বা স্বাস্থ্য সমস্যা সংক্ষেপে লিখুন...",
    notes: "ডাক্তারের জন্য বিশেষ নোট (ঐচ্ছিক)",
    proceed_to_payment: "পেমেন্টে এগিয়ে যান",

    // Payment & Checkout
    checkout_heading: "অ্যাপয়েন্টমেন্ট চেকআউট",
    summary: "বুকিং সারসংক্ষেপ",
    fee_breakdown: "ফি বিবরণী",
    vat_platform_fee: "প্ল্যাটফর্ম ও ভ্যাট ফি",
    total_payable: "মোট প্রদেয়",
    select_payment_method: "পেমেন্ট মাধ্যম বেছে নিন",
    pay_bkash: "বিকাশ দিয়ে পেমেন্ট",
    pay_nagad: "নগদ দিয়ে পেমেন্ট",
    pay_at_clinic: "চেম্বারে নগদ প্রদান",
    pay_clinic_note: "চেম্বারে পৌঁছে রিসেপশনে নগদ ফি পরিশোধ করতে পারবেন। অনুগ্রহ করে নির্ধারিত সময়ের ১৫ মিনিট আগে উপস্থিত হোন।",
    confirm_and_pay: "নিশ্চিত করুন ও বুক করুন",

    // Appointment Slip
    slip_heading: "রোগীর অ্যাপয়েন্টমেন্ট স্লিপ",
    serial_number: "সিরিয়াল নম্বর",
    appointment_id: "অ্যাপয়েন্টমেন্ট আইডি",
    reporting_time: "উপস্থিতির সময়",
    doctor_info: "ডাক্তারের বিবরণ",
    payment_status: "পেমেন্ট অবস্থা",
    print_slip: "স্লিপ প্রিন্ট করুন",
    download_pdf: "পিডিএফ ডাউনলোড",
    scan_qr_note: "হাসপাতালের কর্মীরা এই কিউআর কোড স্ক্যান করে সিরিয়াল যাচাই করতে পারবেন।",

    // Statuses
    status_confirmed: "নিশ্চিত",
    status_pending: "পেমেন্ট বাকি",
    status_arrived: "উপস্থিত",
    status_in_consultation: "পরামর্শকক্ষে",
    status_completed: "সম্পন্ন",
    status_cancelled: "বাতিল",
    status_no_show: "অনুপস্থিত",

    // My Appointments
    tab_upcoming: "আসন্ন অ্যাপয়েন্টমেন্ট",
    tab_completed: "সম্পন্ন অ্যাপয়েন্টমেন্ট",
    tab_cancelled: "বাতিল অ্যাপয়েন্টমেন্ট",
    cancel_appointment: "সাক্ষাৎ বাতিল",
    reschedule_appointment: "সময় পরিবর্তন",
    view_prescription: "প্রেসক্রিপশন দেখুন",
    rate_doctor: "মতামত দিন",
    cancellation_heading: "অ্যাপয়েন্টমেন্ট বাতিল",
    cancellation_policy: "রিফান্ড নীতিমালা: ২৪ ঘণ্টার বেশি = ৯০% রিফান্ড, ৬-২৪ ঘণ্টা = ৫০% রিফান্ড, ৬ ঘণ্টার কম = রিফান্ড প্রযোজ্য নয়।",
    cancel_reason: "বাতিলের কারণ",
    confirm_cancel: "বাতিল নিশ্চিত করুন",

    // Common
    loading: "লোড হচ্ছে...",
    no_data: "কোনো তথ্য পাওয়া যায়নি।",
    error: "একটি ত্রুটি ঘটেছে।",
    success: "সফল",
    currency: "৳"
  }
};

let currentLang = localStorage.getItem('docbook_lang') || 'en';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (lang !== 'en' && lang !== 'bn') lang = 'en';
  currentLang = lang;
  localStorage.setItem('docbook_lang', lang);
  if (lang === 'bn') {
    document.body.classList.add('lang-bn');
  } else {
    document.body.classList.remove('lang-bn');
  }
  applyTranslations();
  // Dispatch custom event for dynamic components
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

export function toggleLanguage() {
  setLang(currentLang === 'en' ? 'bn' : 'en');
}

export function t(key, fallback = '') {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || fallback || key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key, el.textContent);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key, el.getAttribute('placeholder') || ''));
  });
}

// Auto initialize on script load
document.addEventListener('DOMContentLoaded', () => {
  if (currentLang === 'bn') {
    document.body.classList.add('lang-bn');
  }
  applyTranslations();
});
