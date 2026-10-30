const logger = require("../utils/logger");

const {
  mainMenu,
  greetingResponse,
  goodbyeResponse,
  humanResponse,
  servicesResponse,
  timingsResponse,
  locationResponse,
  paymentResponse,
  emergencyResponse,
  irrelevantResponse,
  thanksResponse,
  findDentalService,
  dentalServiceResponse,
} = require("../utils/responses");

const {
  isGreeting,
  isCancel,
  isMenu,
  isAppointmentRequest,
  isServicesRequest,
  isTimingsRequest,
  isLocationRequest,
  isHumanRequest,
  normalize,
} = require("../utils/intents");

const {
  startAppointment,
  handleAppointmentStep,
} = require("../utils/appointment");

const clinic = require("../data/clinic");


// ============================================================
// CONFIGURATION
// ============================================================

const MESSAGE_CACHE_DURATION = 10 * 60 * 1000;
const SESSION_EXPIRATION = 30 * 60 * 1000;

const DEBUG_MESSAGES = true;


// ============================================================
// STORAGE
// ============================================================

const sessions = new Map();
const processedMessages = new Map();


// ============================================================
// PATTERNS
// ============================================================

const paymentPattern =
  /(?:payment|pay|cash|card|credit card|debit card|insurance|الدفع|دفع|كاش|بطاقة|التأمين|تامين|تأمين)/i;

const thanksPattern =
  /^(?:thanks|thank you|thankyou|thx|ty|شكرا|شكرًا|مشكور|مشكورة|يعطيك العافية|يعطيكم العافية)$/i;

const goodbyePattern =
  /^(?:bye|goodbye|see you|see ya|مع السلامة|مع السلامه|سلام|في امان الله|في أمان الله)$/i;


// ============================================================
// SAFETY
// ============================================================

function isEmergency(text = "") {
  const value = normalize(text);

  const patterns = [
    "severe bleeding",
    "heavy bleeding",
    "uncontrolled bleeding",
    "difficulty breathing",
    "cannot breathe",
    "can't breathe",
    "trouble breathing",
    "swelling of face",
    "face swelling",
    "severe swelling",
    "emergency",
    "medical emergency",

    "نزيف شديد",
    "نزيف قوي",
    "نزيف مستمر",
    "صعوبة في التنفس",
    "ما اقدر اتنفس",
    "لا استطيع التنفس",
    "ضيق التنفس",
    "تورم شديد",
    "تورم الوجه",
    "انتفاخ الوجه",
    "حالة طارئة",
    "طوارئ",
  ];

  return patterns.some(
    (pattern) =>
      value.includes(pattern)
  );
}


function isInappropriate(text = "") {
  const value = normalize(text);

  const patterns = [
    "fuck",
    "shit",
    "bitch",
    "porn",
    "nude",
    "naked",
    "sex",

    "اباحي",
    "اباحية",
    "جنس",
    "صور عارية",
    "عاري",
  ];

  return patterns.some(
    (pattern) =>
      value.includes(pattern)
  );
}


// ============================================================
// SESSION
// ============================================================

function getSession(sender) {
  const now = Date.now();

  let session =
    sessions.get(sender);

  if (!session) {
    session = {
      createdAt: now,
      lastActivity: now,
      appointment: null,
    };

    sessions.set(
      sender,
      session
    );

    return session;
  }

  if (
    now - session.lastActivity >
    SESSION_EXPIRATION
  ) {
    session = {
      createdAt: now,
      lastActivity: now,
      appointment: null,
    };

    sessions.set(
      sender,
      session
    );

    return session;
  }

  session.lastActivity = now;

  return session;
}


// ============================================================
// DUPLICATE MESSAGE PROTECTION
// ============================================================

function wasProcessed(messageId) {
  if (!messageId) {
    return false;
  }

  const now = Date.now();

  for (
    const [
      id,
      timestamp,
    ] of processedMessages.entries()
  ) {
    if (
      now - timestamp >
      MESSAGE_CACHE_DURATION
    ) {
      processedMessages.delete(id);
    }
  }

  if (
    processedMessages.has(messageId)
  ) {
    return true;
  }

  processedMessages.set(
    messageId,
    now
  );

  return false;
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendReply(
  message,
  response
) {
  if (!response) {
    return;
  }

  try {
    await message.reply(response);

    if (DEBUG_MESSAGES) {
      logger.info(
        `Bot replied to ${message.from}`
      );
    }
  } catch (error) {
    logger.error(
      "Failed to send WhatsApp reply.",
      error
    );
  }
}


// ============================================================
// CLINIC HOURS
// ============================================================

function getClinicHours(date) {
  if (!date) {
    return null;
  }

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const day =
    days[date.getDay()];

  return (
    clinic.timings?.[day] ||
    null
  );
}


// ============================================================
// APPOINTMENT SUBMISSION
// ============================================================

async function submitAppointment(
  appointment
) {
  try {
    logger.info(
      `NEW APPOINTMENT REQUEST: ${JSON.stringify(
        appointment
      )}`
    );

    /*
      DEMO ONLY.

      Later replace this with:
      - MongoDB
      - Google Calendar
      - CRM
      - Email
      - Admin dashboard
      - Staff notification
    */

    return true;
  } catch (error) {
    logger.error(
      "Appointment submission failed.",
      error
    );

    return false;
  }
}


// ============================================================
// MAIN MESSAGE HANDLER
// ============================================================

async function handleMessage(message) {
  try {

    // ========================================================
    // 1. VALIDATION
    // ========================================================

    if (!message) {
      return;
    }

    if (message.fromMe) {
      return;
    }

    const messageId =
      message.id?._serialized ||
      message.id?.id ||
      null;

    if (
      wasProcessed(messageId)
    ) {
      return;
    }

    const text =
      typeof message.body === "string"
        ? message.body.trim()
        : "";

    if (!text) {
      return;
    }

    const sender =
      message.from;

    if (!sender) {
      return;
    }

    const normalizedText =
      normalize(text);

    if (DEBUG_MESSAGES) {
      logger.info(
        `Incoming message from ${sender}: "${text}"`
      );
    }


    // ========================================================
    // 2. SESSION
    // ========================================================

    const session =
      getSession(sender);


    // ========================================================
    // 3. EMERGENCY
    // ========================================================

    if (isEmergency(text)) {
      await sendReply(
        message,
        emergencyResponse()
      );

      return;
    }


    // ========================================================
    // 4. INAPPROPRIATE
    // ========================================================

    if (isInappropriate(text)) {
      await sendReply(
        message,
        irrelevantResponse()
      );

      return;
    }


    // ========================================================
    // 5. CANCEL
    // ========================================================

    if (isCancel(text)) {
      const hadAppointment =
        Boolean(
          session.appointment
        );

      session.appointment = null;

      if (hadAppointment) {
        await sendReply(
          message,
          `تم إلغاء طلب الموعد الحالي. 😊

إذا احتجت أي مساعدة أخرى، أنا هنا لمساعدتك.

اكتب *menu* لعرض الخيارات.`
        );
      } else {
        await sendReply(
          message,
          `بالتأكيد 😊

لا يوجد طلب موعد نشط حالياً.

اكتب *menu* لعرض الخيارات.`
        );
      }

      return;
    }


    // ========================================================
    // 6. MENU
    // ========================================================

    if (isMenu(text)) {
      await sendReply(
        message,
        mainMenu()
      );

      return;
    }


    // ========================================================
    // 7. HUMAN
    // ========================================================

    if (isHumanRequest(text)) {
      await sendReply(
        message,
        humanResponse()
      );

      return;
    }


    // ========================================================
    // 8. APPOINTMENT REQUEST
    // ========================================================

    if (
      isAppointmentRequest(text)
    ) {
      session.appointment = null;

      const selectedService =
        findDentalService(text);

      const response =
        startAppointment(
          session,
          selectedService
        );

      await sendReply(
        message,
        response
      );

      return;
    }


    // ========================================================
    // 9. SERVICES
    // ========================================================

    if (
      isServicesRequest(text)
    ) {
      await sendReply(
        message,
        servicesResponse()
      );

      return;
    }


    // ========================================================
    // 10. TIMINGS
    // ========================================================

    if (
      isTimingsRequest(text)
    ) {
      await sendReply(
        message,
        timingsResponse()
      );

      return;
    }


    // ========================================================
    // 11. LOCATION
    // ========================================================

    if (
      isLocationRequest(text)
    ) {
      await sendReply(
        message,
        locationResponse()
      );

      return;
    }


    // ========================================================
    // 12. PAYMENT
    // ========================================================

    if (
      paymentPattern.test(
        normalizedText
      )
    ) {
      await sendReply(
        message,
        paymentResponse()
      );

      return;
    }


    // ========================================================
    // 13. ACTIVE APPOINTMENT
    //
    // Only appointment-specific answers reach here.
    // ========================================================

    if (session.appointment) {

      const response =
        await handleAppointmentStep(
          session,
          text,
          {
            detectDentalService:
              findDentalService,

            getClinicHours,

            submitAppointment,
          }
        );

      if (response) {
        await sendReply(
          message,
          response
        );

        return;
      }
    }


    // ========================================================
    // 14. GREETING
    // ========================================================

    if (isGreeting(text)) {
      await sendReply(
        message,
        greetingResponse()
      );

      return;
    }


    // ========================================================
    // 15. DENTAL SERVICE
    // ========================================================

    const dentalService =
      findDentalService(text);

    if (dentalService) {
      await sendReply(
        message,
        dentalServiceResponse(
          dentalService
        )
      );

      return;
    }


    // ========================================================
    // 16. THANKS
    // ========================================================

    if (
      thanksPattern.test(
        normalizedText
      )
    ) {
      await sendReply(
        message,
        thanksResponse()
      );

      return;
    }


    // ========================================================
    // 17. GOODBYE
    // ========================================================

    if (
      goodbyePattern.test(
        normalizedText
      )
    ) {
      await sendReply(
        message,
        goodbyeResponse()
      );

      return;
    }


    // ========================================================
    // 18. FALLBACK
    // ========================================================

    await sendReply(
      message,
      mainMenu()
    );

  } catch (error) {

    // ========================================================
    // GLOBAL ERROR HANDLER
    // ========================================================

    logger.error(
      "Unexpected error while handling WhatsApp message.",
      error
    );

    try {
      await sendReply(
        message,
        `عذراً، حدث خطأ بسيط أثناء معالجة رسالتك. 😔

فضلاً حاول مرة أخرى بعد قليل.

أو اكتب *human* للتواصل مع فريق العيادة.`
      );
    } catch (replyError) {
      logger.error(
        "Failed to send error response.",
        replyError
      );
    }
  }
}


// ============================================================
// CLEANUP
// ============================================================

const cleanupInterval =
  setInterval(
    () => {
      const now =
        Date.now();

      // Sessions
      for (
        const [
          sender,
          session,
        ] of sessions.entries()
      ) {
        if (
          now -
            session.lastActivity >
          SESSION_EXPIRATION
        ) {
          sessions.delete(
            sender
          );

          if (DEBUG_MESSAGES) {
            logger.info(
              `Expired session removed: ${sender}`
            );
          }
        }
      }

      // Message cache
      for (
        const [
          messageId,
          timestamp,
        ] of processedMessages.entries()
      ) {
        if (
          now - timestamp >
          MESSAGE_CACHE_DURATION
        ) {
          processedMessages.delete(
            messageId
          );
        }
      }
    },
    5 * 60 * 1000
  );

if (
  typeof cleanupInterval.unref ===
  "function"
) {
  cleanupInterval.unref();
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  handleMessage,
};