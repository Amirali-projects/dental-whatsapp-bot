const {
  parseDate,
  parseTime,
  isTimeWithinClinicHours,
} = require("./dateTime");

// ==================================================
// Helpers
// ==================================================

function cleanText(value = "") {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

function capitalizeName(name = "") {
  return cleanText(name)
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
    )
    .join(" ");
}

// ==================================================
// Patient Type Detection
// ==================================================

function detectPatientType(text = "") {
  const value = cleanText(text).toLowerCase();

  if (!value) {
    return null;
  }

  // English
  if (
    /\bnew\b/.test(value) ||
    /first visit/.test(value) ||
    /never been/.test(value) ||
    /first time/.test(value)
  ) {
    return "New patient";
  }

  if (
    /\bexisting\b/.test(value) ||
    /returning/.test(value) ||
    /current patient/.test(value) ||
    /been before/.test(value) ||
    /already a patient/.test(value)
  ) {
    return "Existing patient";
  }

  // Arabic
  if (
    /مريض جديد/.test(value) ||
    /جديد/.test(value) ||
    /اول زيارة/.test(value) ||
    /أول زيارة/.test(value) ||
    /أول مرة/.test(value)
  ) {
    return "New patient";
  }

  if (
    /مريض حالي/.test(value) ||
    /مريض سابق/.test(value) ||
    /سبق لي/.test(value) ||
    /زرت العيادة/.test(value) ||
    /مراجع سابق/.test(value)
  ) {
    return "Existing patient";
  }

  // Common Arabizi
  if (
    /\bmarid jdid\b/.test(value) ||
    /\bawal marra\b/.test(value) ||
    /\bawal zeyara\b/.test(value)
  ) {
    return "New patient";
  }

  if (
    /\bmarid sabeq\b/.test(value) ||
    /\bmarid 7ali\b/.test(value) ||
    /\bzort el3yada\b/.test(value)
  ) {
    return "Existing patient";
  }

  return null;
}

// ==================================================
// Yes / No Detection
// ==================================================

function isYes(text = "") {
  const value = cleanText(text).toLowerCase();

  return /^(yes|y|yeah|yep|sure|correct|confirm|confirmed|ok|okay|تمام|نعم|اي|أيوه|ايوه|أكيد|اكيد|موافق|موافقة|صح|تم|مؤكد|مؤكدة)$/i.test(
    value
  );
}

function isNo(text = "") {
  const value = cleanText(text).toLowerCase();

  return /^(no|n|nope|wrong|change|edit|لا|مو|غير صحيح|خطأ|غلط|تغيير|تعديل)$/i.test(
    value
  );
}

// ==================================================
// Appointment Initialization
// ==================================================

function startAppointment(session, selectedService = null) {
  if (!session) {
    return null;
  }

  session.appointment = {
    step: selectedService ? "patientType" : "service",

    service: selectedService || null,
    patientType: null,

    name: null,
    reason: null,

    date: null,
    dateObject: null,

    time: null,
    timeMinutes: null,
  };

  if (selectedService) {
    return `بكل سرور 🌷

قبل طلب الموعد، هل أنت:

1️⃣ *مريض جديد*
2️⃣ *مريض حالي*

يمكنك الرد:
• جديد
• مريض حالي`;
  }

  return `بكل سرور 🌷
يسعدنا مساعدتك في حجز موعد.

ما الخدمة أو المشكلة التي ترغب في زيارة الطبيب بسببها؟

يمكنك كتابة طلبك ببساطة، مثل:

• تنظيف الأسنان
• فحص الأسنان
• لدي ألم في الأسنان
• حشوة
• علاج العصب
• خلع الأسنان
• تبييض الأسنان

وإذا لم تكن متأكداً من اسم العلاج، فقط أخبرني بما تشعر به.`;
}

// ==================================================
// Appointment Step Handler
// ==================================================

async function handleAppointmentStep(
  session,
  text,
  helpers = {}
) {
  if (!session?.appointment) {
    return null;
  }

  const appointment = session.appointment;
  const clean = cleanText(text);

  if (!clean) {
    return null;
  }

  // --------------------------------------------------
  // SERVICE
  // --------------------------------------------------

  if (appointment.step === "service") {
    const detectedService =
      helpers.detectDentalService?.(clean) || null;

    appointment.service = detectedService || clean;
    appointment.step = "patientType";

    return `تم تسجيل طلبك لـ *${appointment.service}*. 🦷

هل أنت:

1️⃣ *مريض جديد*
2️⃣ *مريض حالي*

يمكنك الرد:
• جديد
• مريض حالي`;
  }

  // --------------------------------------------------
  // PATIENT TYPE
  // --------------------------------------------------

  if (appointment.step === "patientType") {
    const patientType = detectPatientType(clean);

    if (!patientType) {
      return `فضلاً اختر نوع المريض:

1️⃣ *مريض جديد*
2️⃣ *مريض حالي*

يمكنك كتابة:
• جديد
• مريض حالي`;
    }

    appointment.patientType = patientType;
    appointment.step = "name";

    return `شكراً لك 🌷

ما هو *اسمك الكامل*؟`;
  }

  // --------------------------------------------------
  // NAME
  // --------------------------------------------------

  if (appointment.step === "name") {
    if (clean.length < 2) {
      return `فضلاً أرسل *اسمك الكامل* حتى نتمكن من تسجيل طلب الموعد.`;
    }

    appointment.name = capitalizeName(clean);

    // If service is already known, skip the reason step.
    if (appointment.service) {
      appointment.step = "date";

      return `شكراً لك، ${appointment.name} 🌷

ما التاريخ المناسب لك؟

مثلاً:
• غداً
• الاثنين
• 25 سبتمبر
• 25/9`;
    }

    appointment.step = "reason";

    return `شكراً لك، ${appointment.name} 🌷

في جملة بسيطة، أخبرني ما الذي تحتاج المساعدة بشأنه.

مثلاً:
*"أعاني من ألم في أحد الأسنان منذ يومين."*`;
  }

  // --------------------------------------------------
  // REASON
  // --------------------------------------------------

  if (appointment.step === "reason") {
    appointment.reason = clean;
    appointment.step = "date";

    return `شكراً لتوضيح ذلك 🌷

ما التاريخ المناسب لك؟

مثلاً:
• غداً
• الاثنين
• 25 سبتمبر
• 25/9`;
  }

  // --------------------------------------------------
  // DATE
  // --------------------------------------------------

  if (appointment.step === "date") {
    const parsedDate = parseDate(clean);

    if (!parsedDate?.date) {
      return `لم أتمكن من تحديد التاريخ.

فضلاً أرسل تاريخاً مثل:
• غداً
• الاثنين
• 25 سبتمبر
• 25/9`;
    }

    const hours = helpers.getClinicHours
      ? helpers.getClinicHours(parsedDate.date)
      : null;

    if (!hours || /closed/i.test(hours)) {
      return `للأسف، العيادة مغلقة في *${parsedDate.label}*.

فضلاً اختر تاريخاً آخر 🌷`;
    }

    // Store parsed date object so we don't parse it again.
    appointment.date = parsedDate.label;
    appointment.dateObject = parsedDate.date;

    appointment.step = "time";

    return `ممتاز 🌷

📅 *${parsedDate.label}*

ما الوقت المناسب لك؟

مثلاً:
• 10 صباحاً
• 2:30 مساءً
• 6 مساءً

🕐 أوقات العيادة في هذا اليوم:
*${hours}*`;
  }

  // --------------------------------------------------
  // TIME
  // --------------------------------------------------

  if (appointment.step === "time") {
    const parsedTime = parseTime(clean);

    if (
      !parsedTime ||
      parsedTime.minutes === undefined
    ) {
      return `ما الوقت المناسب لك؟ 🕐

مثلاً:
• 10 صباحاً
• 2:30 مساءً
• 6 مساءً`;
    }

    if (appointment.dateObject) {
      const validation = isTimeWithinClinicHours(
        appointment.dateObject,
        parsedTime.minutes
      );

      if (!validation.valid) {
        if (validation.reason === "closed") {
          return `العيادة مغلقة في هذا اليوم.

فضلاً اختر تاريخاً آخر.`;
        }

        return `هذا الوقت خارج أوقات الدوام.

🕐 أوقات العيادة:
*${validation.hours}*

فضلاً اختر وقتاً آخر.`;
      }
    }

    appointment.time = parsedTime.value;
    appointment.timeMinutes = parsedTime.minutes;

    appointment.step = "confirm";

    return buildConfirmation(appointment);
  }

  // --------------------------------------------------
  // CONFIRMATION
  // --------------------------------------------------

  if (appointment.step === "confirm") {
    if (isYes(clean)) {
      /*
       * Do not claim that the appointment was sent
       * unless a real submission handler exists.
       */

      if (typeof helpers.submitAppointment === "function") {
        try {
          const result =
            await helpers.submitAppointment({
              ...appointment,
            });

          if (result === false) {
            return `تعذر إرسال طلب الموعد حالياً.

فضلاً حاول مرة أخرى بعد قليل أو اكتب *human* للتواصل مع فريق العيادة.`;
          }
        } catch (error) {
          console.error(
            "Appointment submission failed:",
            error
          );

          return `تعذر إرسال طلب الموعد حالياً.

فضلاً حاول مرة أخرى أو اكتب *human* للتواصل مع فريق العيادة.`;
        }
      }

      appointment.step = "submitted";

      return `شكراً لك، ${appointment.name} 🌷

تم إرسال *طلب الموعد* بالبيانات التالية:

👤 *الاسم:* ${appointment.name}
🧑‍⚕️ *نوع المريض:* ${appointment.patientType}
🦷 *الخدمة:* ${
        appointment.service || "موعد أسنان"
      }
📝 *السبب:* ${
        appointment.reason || "غير محدد"
      }
📅 *التاريخ:* ${appointment.date}
🕐 *الوقت:* ${appointment.time}

سيقوم فريق العيادة بمراجعة الطلب والتواصل معك لتأكيد الموعد.

⚠️ *ملاحظة:* هذا طلب موعد وليس تأكيداً نهائياً للموعد.`;
    }

    if (isNo(clean)) {
      appointment.step = "date";

      return `بالتأكيد 🌷

لنقم بتعديل الموعد.

ما التاريخ المناسب لك؟`;
    }

    return `هل ترغب في إرسال طلب الموعد؟

✅ *نعم* — إرسال الطلب
✏️ *تعديل* — تغيير البيانات`;
  }

  // --------------------------------------------------
  // SUBMITTED
  // --------------------------------------------------

  if (appointment.step === "submitted") {
    return `تم إرسال طلب موعدك بالفعل. 😊

إذا كنت ترغب في تعديل البيانات، أخبرني بما تريد تغييره.

أو اكتب *human* للتواصل مع فريق العيادة.`;
  }

  return null;
}

// ==================================================
// Confirmation
// ==================================================

function buildConfirmation(appointment) {
  return `يرجى مراجعة بيانات طلب الموعد:

👤 *الاسم:* ${appointment.name}

🧑‍⚕️ *نوع المريض:* ${
    appointment.patientType
  }

🦷 *الخدمة:* ${
    appointment.service || "موعد أسنان"
  }

📝 *السبب:* ${
    appointment.reason || "غير محدد"
  }

📅 *التاريخ:* ${appointment.date}

🕐 *الوقت:* ${appointment.time}

هل ترغب في إرسال طلب الموعد؟

✅ *نعم*
✏️ *تعديل*`;
}

// ==================================================
// Exports
// ==================================================

module.exports = {
  startAppointment,
  handleAppointmentStep,
  detectPatientType,
  isYes,
  isNo,
};