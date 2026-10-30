/**
 * intents.js
 * Optimized Arabic + English intent detection
 * Designed for Saudi dental WhatsApp users
 *
 * Goals:
 * - Normalize once
 * - Minimal regex usage
 * - Fast string matching
 * - Arabic + English support
 * - Compatible with existing bot.js
 */

// ==================================================
// NORMALIZATION
// ==================================================

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .trim()

    // Remove Arabic diacritics + tatweel
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")

    // Remove emojis and punctuation
    .replace(/[^\p{L}\p{N}\s]/gu, " ")

    // Normalize Arabic characters
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")

    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}


// ==================================================
// REPEATED CHARACTER NORMALIZATION
// ==================================================
//
// Examples:
// appointtment -> appointment
// apppointment -> appointment
// boook -> book
// hellooo -> helloo
//
// Only used for appointment detection.
// We don't need this expensive operation for every intent.
//

function normalizeRepeatedLetters(text) {
  return text.replace(/(.)\1{2,}/g, "$1$1");
}


// ==================================================
// FAST MATCH HELPERS
// ==================================================

function includesAny(value, patterns) {
  for (const pattern of patterns) {
    if (value.includes(pattern)) {
      return true;
    }
  }

  return false;
}


function exactMatch(value, patterns) {
  return patterns.has(value);
}


// ==================================================
// GREETING
// ==================================================

const GREETINGS = new Set([
  "hi",
  "hello",
  "hey",
  "howdy",
  "good morning",
  "good afternoon",
  "good evening",

  "مرحبا",
  "اهلا",
  "اهلا وسهلا",
  "السلام عليكم",
  "هلا",
  "هلا والله",
  "يا هلا",
  "ياهلا",
  "صباح الخير",
  "مساء الخير",
  "حياك الله",
  "حياكم الله",
]);


function isGreeting(text) {
  const value = normalize(text);

  return exactMatch(value, GREETINGS);
}


// ==================================================
// APPOINTMENT
// ==================================================

const APPOINTMENT_PHRASES = [
  // English
  "appointment",
  "appoint",
  "booking",
  "book appointment",
  "appointment booking",
  "schedule appointment",
  "make appointment",
  "reserve appointment",
  "need an appointment",
  "i need an appointment",
  "i want an appointment",
  "book a dentist",
  "book dentist",

  // Arabic
  "حجز موعد",
  "موعد",
  "حجز",
  "احجز",
  "ابي احجز",
  "ابغى احجز",
  "اريد احجز",
  "اريد حجز",
  "ممكن احجز",
  "ابغى موعد",
  "ابي موعد",
  "ممكن موعد",
  "موعد اسنان",
  "موعد طبيب",
  "موعد دكتور",
  "ودي احجز",
  "ودي موعد",
  "احتاج موعد",
  "احتاج احجز",
  "ممكن احجز عندكم",
  "ابغى احجز عندكم",
  "ابي احجز عندكم",
];


function isAppointmentRequest(text) {
  let value = normalize(text);

  if (!value) {
    return false;
  }

  // Handle common typing mistakes such as:
  // appointtment
  // apppointment
  // boook
  value = normalizeRepeatedLetters(value);

  return includesAny(value, APPOINTMENT_PHRASES);
}


// ==================================================
// SERVICES
// ==================================================

const SERVICE_PHRASES = [
  // English
  "services",
  "treatments",
  "dental services",
  "dental treatments",
  "what do you offer",
  "what services",
  "available treatments",

  // Arabic
  "الخدمات",
  "خدماتكم",
  "خدمات العياده",
  "وش خدماتكم",
  "وش عندكم من خدمات",
  "ايش خدماتكم",
  "ما هي الخدمات",
  "وش تقدمون",
  "العلاجات",
  "علاجات الاسنان",
  "تخصصاتكم",
];


function isServicesRequest(text) {
  const value = normalize(text);

  return value
    ? includesAny(value, SERVICE_PHRASES)
    : false;
}


// ==================================================
// CLINIC TIMINGS
// ==================================================

const TIMING_PHRASES = [
  // English
  "hours",
  "timing",
  "timings",
  "opening hours",
  "working hours",
  "when are you open",
  "when do you open",
  "when do you close",
  "opening time",
  "closing time",

  // Arabic
  "ساعات العمل",
  "مواعيد العمل",
  "اوقات العمل",
  "دوامكم",
  "متى تفتحون",
  "متى تفتح",
  "متى تقفلون",
  "متى تسكرون",
  "متى تغلقون",
  "متى الدوام",
  "وش اوقاتكم",
];


function isTimingsRequest(text) {
  const value = normalize(text);

  return value
    ? includesAny(value, TIMING_PHRASES)
    : false;
}


// ==================================================
// LOCATION
// ==================================================

const LOCATION_PHRASES = [
  // English
  "where are you",
  "where is the clinic",
  "clinic location",
  "clinic address",
  "location",
  "address",
  "directions",

  // Arabic
  "الموقع",
  "موقع العياده",
  "موقعكم",
  "العنوان",
  "عنوان العياده",
  "وين موقعكم",
  "وينكم",
  "وين العياده",
  "اين العياده",
  "وين مكانكم",
  "مكانكم",
  "كيف اوصل لكم",
  "كيف اروح لكم",
  "كيف اصل للعياده",
  "اللوكيشن",
  "لوكيشن",
];


function isLocationRequest(text) {
  const value = normalize(text);

  return value
    ? includesAny(value, LOCATION_PHRASES)
    : false;
}


// ==================================================
// HUMAN / RECEPTIONIST
// ==================================================

const HUMAN_PHRASES = [
  // English
  "human",
  "real person",
  "real human",
  "agent",
  "receptionist",
  "talk to someone",
  "talk to a person",
  "speak to someone",
  "speak to staff",
  "customer service",
  "operator",

  // Arabic
  "موظف",
  "موظفه",
  "موظف الاستقبال",
  "موظفه الاستقبال",
  "الاستقبال",
  "خدمه العملاء",
  "اكلم موظف",
  "ابغى موظف",
  "ابي اكلم احد",
  "ابي شخص",
  "ابي انسان",
  "ابغى اكلم شخص",
  "ممكن اكلم موظف",
];


function isHumanRequest(text) {
  const value = normalize(text);

  return value
    ? includesAny(value, HUMAN_PHRASES)
    : false;
}


// ==================================================
// CANCEL
// ==================================================

const CANCEL_PHRASES = [
  // English
  "cancel",
  "stop",
  "exit",
  "never mind",
  "nevermind",
  "forget it",

  // Arabic
  "الغاء",
  "الغي",
  "الغى",
  "وقف",
  "توقف",
  "خلاص",
  "لا خلاص",
  "اتركه",
  "اتركها",
  "مو الحين",
  "ليس الان",
];


function isCancel(text) {
  const value = normalize(text);

  return value
    ? includesAny(value, CANCEL_PHRASES)
    : false;
}


// ==================================================
// MAIN MENU
// ==================================================

const MENU_PHRASES = [
  // English
  "menu",
  "main menu",
  "help",
  "options",
  "start",

  // Arabic
  "القائمه",
  "القائمه الرئيسيه",
  "الرئيسيه",
  "الخيارات",
  "مساعده",
  "ابدا",
  "بدايه",
  "وش الخيارات",
  "وش عندكم",
];


function isMenu(text) {
  const value = normalize(text);

  return value
    ? includesAny(value, MENU_PHRASES)
    : false;
}


// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  normalize,
  isGreeting,
  isCancel,
  isMenu,
  isAppointmentRequest,
  isServicesRequest,
  isTimingsRequest,
  isLocationRequest,
  isHumanRequest,
};