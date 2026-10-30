const clinic = require("../data/clinic");

// ==================================================
// Clinic Configuration
// ==================================================

const clinicName = clinic?.name || "Smile Dental Clinic";
const clinicLocation =
  clinic?.location || "Please contact the clinic for the location.";
const clinicPhone =
  clinic?.phone || "Please contact the clinic directly.";

const timings = clinic?.timings || {};

// ==================================================
// Service Detection
// ==================================================
// Keep patterns compiled once.
// Supports English + common Arabic dental terms.

const SERVICE_PATTERNS = Object.freeze([
  {
    name: "Teeth cleaning",
    pattern:
      /clean(?:ing)?(?:\s+my)?\s+teeth|teeth\s+cleaning|dental\s+cleaning|professional\s+cleaning|تنظيف\s*(?:ال)?أسنان|تنظيف\s+اسنان/i,
  },
  {
    name: "Tooth filling",
    pattern:
      /\b(?:filling|fillings|cavity|cavities|tooth\s+decay|decayed\s+tooth)\b|حشوات?|تسوس(?:\s*الأسنان)?/i,
  },
  {
    name: "Root canal consultation",
    pattern:
      /\b(?:root\s*canal|root-canal|rootcanal)\b|علاج\s*(?:ال)?عصب|عصب\s*(?:ال)?أسنان/i,
  },
  {
    name: "Tooth extraction",
    pattern:
      /\b(?:extraction|extract|pull\s+(?:my|a)\s+tooth|remove\s+(?:my|a)\s+tooth)\b|خلع\s*(?:ال)?أسنان?|خلع\s*السن/i,
  },
  {
    name: "Dental checkup",
    pattern:
      /\b(?:checkup|check-up|check\s+up|dental\s+checkup|dental\s+exam|examination|routine\s+(?:check|visit))\b|فحص\s*(?:ال)?أسنان|كشف\s*(?:ال)?أسنان/i,
  },
  {
    name: "Cosmetic dentistry",
    pattern:
      /\b(?:whitening|teeth\s+whitening|veneers|cosmetic\s+dentistry|cosmetic\s+treatment|smile\s+makeover)\b|تبييض\s*(?:ال)?أسنان|فينير|فينيير|عدسات\s*أسنان|تجميل\s*(?:ال)?أسنان/i,
  },
]);

// ==================================================
// Small Helpers
// ==================================================

function safe(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function clinicContactLine() {
  return clinicPhone
    ? `\n📞 ${clinicPhone}`
    : "";
}

// ==================================================
// Main Menu
// ==================================================

function mainMenu() {
  return `🏥 *${clinicName}*

أهلاً وسهلاً بك 👋
مرحباً بك في *${clinicName}*.

يمكنني مساعدتك في:

📅 حجز موعد
🦷 خدمات الأسنان
🕐 أوقات الدوام
📍 موقع العيادة
💳 الدفع والتأمين
💬 التواصل مع الفريق

كيف يمكننا خدمتك اليوم؟

يمكنك كتابة طلبك مباشرة، مثلاً:
*"أريد حجز موعد لتنظيف الأسنان."*`;
}

// ==================================================
// Greeting
// ==================================================

function greetingResponse() {
  return `أهلاً وسهلاً بك 👋
مرحباً بك في *${clinicName}*.

يسعدنا خدمتك 🌷

هل ترغب في:
📅 حجز موعد
🦷 معرفة الخدمات
🕐 معرفة أوقات الدوام
📍 معرفة الموقع
💳 الاستفسار عن الدفع أو التأمين

كيف يمكنني مساعدتك؟`;
}

// ==================================================
// Goodbye
// ==================================================

function goodbyeResponse() {
  return `العفو 🌷
سعدنا بخدمتك.

نتمنى لك يوماً سعيداً، وأهلاً بك في أي وقت. 🌹`;
}

// ==================================================
// Human Handoff
// ==================================================

function humanResponse() {
  return `بكل تأكيد 🌷

سأساعدك في التواصل مع فريق العيادة.

فضلاً أرسل:
• اسمك
• استفسارك أو طلبك

وسيقوم فريقنا بمتابعتك.

إذا كانت لديك حالة طارئة، يرجى طلب الرعاية الطبية العاجلة عند الحاجة.`;
}

// ==================================================
// Services
// ==================================================

function servicesResponse() {
  return `🦷 *خدمات الأسنان*

تشمل خدماتنا:

• فحص الأسنان
• تنظيف الأسنان
• حشوات الأسنان
• علاج واستشارة العصب
• خلع الأسنان
• تبييض وتجميل الأسنان

إذا لم تكن متأكداً من الخدمة المناسبة، أخبرني بما تحتاجه وسأساعدك. 😊`;
}

// ==================================================
// Clinic Hours
// ==================================================

function timingsResponse() {
  return `🕐 *أوقات الدوام*

الاثنين: ${safe(timings.monday, "يرجى التواصل مع العيادة")}
الثلاثاء: ${safe(timings.tuesday, "يرجى التواصل مع العيادة")}
الأربعاء: ${safe(timings.wednesday, "يرجى التواصل مع العيادة")}
الخميس: ${safe(timings.thursday, "يرجى التواصل مع العيادة")}
الجمعة: ${safe(timings.friday, "يرجى التواصل مع العيادة")}
السبت: ${safe(timings.saturday, "يرجى التواصل مع العيادة")}
الأحد: ${safe(timings.sunday, "يرجى التواصل مع العيادة")}

📅 هل ترغب في حجز موعد؟`;
}

// ==================================================
// Location
// ==================================================

function locationResponse() {
  return `📍 *موقع العيادة*

${clinicLocation}${clinicContactLine()}

يسعدنا مساعدتك إذا كنت بحاجة إلى أي معلومات إضافية.`;
}

// ==================================================
// Appointment
// ==================================================

function appointmentResponse() {
  return `بكل سرور 🌷
يسعدنا مساعدتك في حجز موعد.

ما الخدمة أو المشكلة التي ترغب في زيارة الطبيب بسببها؟

يمكنك كتابة طلبك ببساطة، مثل:

• أريد تنظيف الأسنان
• لدي ألم في الأسنان
• أريد فحصاً
• أريد تبييض الأسنان
• أحتاج إلى علاج عصب

لا تحتاج لمعرفة اسم العلاج بالضبط، فقط أخبرني بما تحتاجه.`;
}

// ==================================================
// Payment & Insurance
// ==================================================

function paymentResponse() {
  return `💳 *الدفع والتأمين*

يسعدنا مساعدتك بخصوص الدفع أو التأمين.

تختلف التغطية حسب شركة التأمين والبوليصة، لذلك يحتاج فريق العيادة إلى التحقق من بياناتك.

يمكنك إرسال اسم شركة التأمين، وسيساعدك الفريق في التفاصيل.

وبخصوص الأسعار، يرجى تحديد الخدمة التي ترغب بها حتى يتمكن الفريق من تزويدك بالمعلومات المناسبة.`;
}

// ==================================================
// Emergency
// ==================================================

function emergencyResponse() {
  return `🚨 *حالة طارئة*

إذا كنت تعاني من:
• صعوبة في التنفس أو البلع
• تورم شديد
• نزيف لا يتوقف
• ألم شديد جداً

يرجى طلب الرعاية الطبية العاجلة أو التواصل مع خدمات الطوارئ عند الحاجة.

للحالات العاجلة غير المهددة للحياة، تواصل مع العيادة مباشرة.

⚠️ لا يمكنني تشخيص الحالة الطبية عبر WhatsApp.`;
}

// ==================================================
// After Hours
// ==================================================

function afterHoursResponse() {
  return `شكراً لتواصلك معنا 🌷

العيادة خارج أوقات الدوام حالياً.

يمكنك إرسال:
• اسمك
• سبب الزيارة
• اليوم والوقت المناسب لك

وسيقوم فريق العيادة بمتابعتك خلال أوقات العمل.

في حالة الطوارئ، يرجى طلب الرعاية الطبية العاجلة.`;
}

// ==================================================
// Fallback
// ==================================================

function irrelevantResponse() {
  return `أهلاً بك 🌷

أنا المساعد الافتراضي لـ *${clinicName}*.

يمكنني مساعدتك في:

🦷 خدمات الأسنان
📅 حجز موعد
🕐 أوقات الدوام
📍 موقع العيادة
💳 الدفع والتأمين
💬 التواصل مع الفريق

كيف يمكنني خدمتك؟`;
}

// ==================================================
// Thanks
// ==================================================

function thanksResponse() {
  return `العفو 🌷
سعدنا بخدمتك.

إذا احتجت أي مساعدة أخرى، أنا هنا. 😊`;
}

// ==================================================
// Dental Service Detection
// ==================================================

function findDentalService(text = "") {
  if (typeof text !== "string") {
    return null;
  }

  const value = text.trim();

  if (!value) {
    return null;
  }

  for (const service of SERVICE_PATTERNS) {
    if (service.pattern.test(value)) {
      return service.name;
    }
  }

  return null;
}

// ==================================================
// Dental Service Responses
// ==================================================

const DENTAL_SERVICE_RESPONSES = Object.freeze({
  "Teeth cleaning": `🦷 *تنظيف الأسنان*

يساعد التنظيف الاحترافي على إزالة البلاك والترسبات التي قد يصعب التخلص منها بالتنظيف اليومي.

📅 هل ترغب في حجز موعد للتنظيف؟`,

  "Tooth filling": `🦷 *حشوات الأسنان*

تُستخدم الحشوات عادةً لعلاج التسوس أو بعض أنواع تلف الأسنان.

يحتاج الطبيب إلى فحص السن أولاً لتحديد العلاج المناسب.

📅 هل ترغب في حجز موعد للفحص؟`,

  "Root canal consultation": `🦷 *استشارة علاج العصب*

يحتاج الطبيب إلى فحص السن لتحديد ما إذا كان علاج العصب مناسباً.

إذا كان لديك ألم أو حساسية أو تورم، يرجى ذكر ذلك عند حجز الموعد.

📅 هل ترغب في حجز استشارة؟`,

  "Tooth extraction": `🦷 *خلع الأسنان*

يحتاج الطبيب إلى فحص السن أولاً لتحديد ما إذا كان الخلع مناسباً.

📅 هل ترغب في حجز موعد للفحص؟`,

  "Dental checkup": `🦷 *فحص الأسنان*

يساعد الفحص على تقييم صحة الأسنان واللثة واكتشاف أي مشاكل تحتاج إلى علاج.

📅 هل ترغب في حجز موعد للفحص؟`,

  "Cosmetic dentistry": `✨ *تجميل الأسنان*

تشمل خدمات تجميل الأسنان خيارات مثل تبييض الأسنان وبعض الإجراءات التجميلية الأخرى.

العلاج المناسب يعتمد على حالة الأسنان والنتيجة التي ترغب بها.

📅 هل ترغب في حجز استشارة؟`,
});

// ==================================================
// Dental Service Response
// ==================================================

function dentalServiceResponse(service) {
  if (typeof service !== "string") {
    return null;
  }

  return DENTAL_SERVICE_RESPONSES[service] || null;
}

// ==================================================
// Exports
// ==================================================

module.exports = {
  mainMenu,
  greetingResponse,
  goodbyeResponse,
  humanResponse,
  servicesResponse,
  timingsResponse,
  locationResponse,
  appointmentResponse,
  paymentResponse,
  emergencyResponse,
  afterHoursResponse,
  irrelevantResponse,
  thanksResponse,
  findDentalService,
  dentalServiceResponse,
};