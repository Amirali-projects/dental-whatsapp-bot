/**
 * safety.js
 * -------------------------------------------------------
 * Safety and message classification for a Saudi dental
 * clinic WhatsApp bot.
 *
 * Supported:
 * - Arabic
 * - English
 * - Saudi/Gulf Arabic expressions
 * - Emergency dental situations
 * - Threatening messages
 * - Inappropriate/sexual language
 * - Spam/promotional messages
 *
 * Response language:
 * - Arabic by default
 * -------------------------------------------------------
 */

/**
 * Normalize incoming text once before classification.
 *
 * This improves matching consistency and avoids repeatedly
 * calling toLowerCase(), trim(), etc. for every pattern.
 */
function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    // Remove Arabic diacritics and tatweel
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    // Normalize Arabic punctuation
    .replace(/[؟،؛]/g, " ")
    // Normalize common punctuation
    .replace(/[!?.,;:()[\]{}'"`]/g, " ")
    // Collapse multiple spaces
    .replace(/\s+/g, " ");
}

/**
 * -------------------------------------------------------
 * INAPPROPRIATE / SEXUAL / ABUSIVE LANGUAGE
 * -------------------------------------------------------
 */
const inappropriatePatterns = [
  // Sexual / explicit
  /\bsex\b/,
  /\bsexual\b/,
  /\bnude\b/,
  /\bnudes\b/,
  /\bnudity\b/,
  /\bporn\b/,
  /\bpornography\b/,
  /\bxxx\b/,
  /\bsexy\b/,

  // English profanity
  /\bfuck\b/,
  /\bfucking\b/,
  /\bmotherfucker\b/,
  /\bbitch\b/,
  /\basshole\b/,
  /\bshit\b/,

  // Urdu / South Asian profanity
  /\bchutiya\b/,
  /\bchutia\b/,
  /\bgaand\b/,
  /\bharami\b/,
  /\bharamzada\b/,
  /\blund\b/,
  /\bmadarchod\b/,
  /\bbhenchod\b/,

  // Arabic inappropriate / insulting expressions
  /\bكس\b/,
  /\bكسم\b/,
  /\bشرموط\b/,
  /\bشرموطة\b/,
  /\bقحبة\b/,
  /\bقواد\b/,
  /\bخرا\b/,
  /\bكلب\b/,
  /\bحيوان\b/,
];

/**
 * -------------------------------------------------------
 * THREAT DETECTION
 * -------------------------------------------------------
 */
const threateningPatterns = [
  // English
  /\bi will kill\b/,
  /\bi'm going to kill\b/,
  /\bim going to kill\b/,
  /\bkill you\b/,
  /\bkill the doctor\b/,
  /\bkill your doctor\b/,
  /\bkill someone\b/,
  /\bi will hurt you\b/,
  /\bi'm going to hurt you\b/,
  /\bim going to hurt you\b/,
  /\bshoot you\b/,
  /\bbomb\b.*\bclinic\b/,

  // Arabic
  /\bبقتلك\b/,
  /\bبقتله\b/,
  /\bبقتل\b/,
  /\bراح اقتلك\b/,
  /\bراح أقتلك\b/,
  /\bسوف اقتلك\b/,
  /\bسوف أقتلك\b/,
  /\bبذبحك\b/,
  /\bاذبحك\b/,
  /\bأذبحك\b/,
  /\bبضربك\b/,
  /\bراح اضربك\b/,
  /\bراح أضربك\b/,
  /\bبأذيك\b/,
  /\bراح أؤذيك\b/,

  // Urdu
  /\bmaar dunga\b/,
  /\bmaar doonga\b/,
  /\bjaan se maar\b/,
];

/**
 * -------------------------------------------------------
 * SPAM / SCAM / PROMOTIONAL CONTENT
 * -------------------------------------------------------
 */
const spamPatterns = [
  // English
  /\bcrypto investment\b/,
  /\bbitcoin investment\b/,
  /\bcrypto giveaway\b/,
  /\bdouble your money\b/,
  /\bmake money fast\b/,
  /\bfree money\b/,
  /\bearn money online\b/,
  /\bwork from home\b.*\bmoney\b/,
  /\bclick this link\b/,
  /\bclick here\b.*\bfree\b/,
  /\bclaim your prize\b/,
  /\byou have won\b/,
  /\byou won\b/,
  /\b investment opportunity\b/,

  // Arabic
  /\bاستثمار مضمون\b/,
  /\bربح سريع\b/,
  /\bضاعف اموالك\b/,
  /\bضاعف أموالك\b/,
  /\bاربح المال\b/,
  /\bاربح فلوس\b/,
  /\bفلوس مجانية\b/,
  /\bاضغط على الرابط\b/,
  /\bاضغط هنا\b/,
  /\bمبروك ربحت\b/,
  /\bلقد ربحت\b/,
];

/**
 * -------------------------------------------------------
 * EMERGENCY / URGENT DENTAL SYMPTOMS
 * -------------------------------------------------------
 *
 * These are checked FIRST because an emergency should
 * receive priority even if the same message contains
 * other inappropriate or spam content.
 */
const emergencyPatterns = [
  // Breathing
  /\bdifficulty breathing\b/,
  /\bcan't breathe\b/,
  /\bcannot breathe\b/,
  /\bcan not breathe\b/,
  /\bhaving trouble breathing\b/,
  /\bصعوبة في التنفس\b/,
  /\bصعوبه في التنفس\b/,
  /\bما اقدر اتنفس\b/,
  /\bما أقدر أتنفس\b/,
  /\bمو قادر اتنفس\b/,
  /\bمو قادر أتنفس\b/,
  /\bما اقدر اتنفس\b/,

  // Swallowing
  /\bdifficulty swallowing\b/,
  /\bcan't swallow\b/,
  /\bcannot swallow\b/,
  /\btrouble swallowing\b/,
  /\bصعوبة في البلع\b/,
  /\bصعوبه في البلع\b/,
  /\bما اقدر ابلع\b/,
  /\bما أقدر أبلع\b/,
  /\bمو قادر ابلع\b/,
  /\bمو قادر أبلع\b/,

  // Severe swelling
  /\bsevere facial swelling\b/,
  /\bsevere face swelling\b/,
  /\bface is badly swollen\b/,
  /\bface is very swollen\b/,
  /\bswelling around my face\b/,
  /\bsevere swelling\b/,
  /\bmassive swelling\b/,
  /\bتورم شديد\b/,
  /\bانتفاخ شديد\b/,
  /\bوجهي متورم\b/,
  /\bوجهي منفخ\b/,
  /\bتورم كبير في الوجه\b/,
  /\bانتفاخ كبير في الوجه\b/,
  /\bتورم حول الوجه\b/,

  // Heavy / uncontrolled bleeding
  /\bheavy bleeding\b/,
  /\buncontrolled bleeding\b/,
  /\bbleeding won't stop\b/,
  /\bbleeding will not stop\b/,
  /\bsevere bleeding\b/,
  /\bnazif شديد\b/,
  /\bنزيف شديد\b/,
  /\bنزيف ما يوقف\b/,
  /\bنزيف ما يتوقف\b/,
  /\bنزيف مستمر\b/,
  /\bدم كثير\b/,
  /\bكثير من الدم\b/,

  // Loss of consciousness
  /\bunconscious\b/,
  /\bpassed out\b/,
  /\bfainted\b/,
  /\bbehosh\b/,
  /\bفقدت الوعي\b/,
  /\bاغمي علي\b/,
  /\bأغمي علي\b/,
  /\bمغمى علي\b/,

  // Urdu emergency phrases
  /\bsaans nahi aa rahi\b/,
  /\bsaans lene mein mushkil\b/,
  /\bniglane mein mushkil\b/,
  /\bbohat zyada swelling\b/,
  /\bbohat zyada khoon\b/,
];

/**
 * -------------------------------------------------------
 * CLASSIFY MESSAGE
 * -------------------------------------------------------
 *
 * Priority:
 *
 * 1. Empty
 * 2. Urgent
 * 3. Threat
 * 4. Inappropriate
 * 5. Spam
 * 6. Safe
 */
function classifyMessage(message = "") {
  const text = normalize(message);

  if (!text) {
    return "empty";
  }

  // Emergency messages always receive highest priority.
  if (emergencyPatterns.some((pattern) => pattern.test(text))) {
    return "urgent";
  }

  // Threatening messages.
  if (threateningPatterns.some((pattern) => pattern.test(text))) {
    return "threat";
  }

  // Inappropriate or abusive content.
  if (inappropriatePatterns.some((pattern) => pattern.test(text))) {
    return "inappropriate";
  }

  // Spam / promotional messages.
  if (spamPatterns.some((pattern) => pattern.test(text))) {
    return "spam";
  }

  return "safe";
}

/**
 * -------------------------------------------------------
 * SAFETY RESPONSES
 * -------------------------------------------------------
 *
 * All responses are written in professional,
 * Saudi-friendly Arabic.
 */
function getSafetyResponse(category) {
  switch (category) {
    case "urgent":
      return `⚠️ *حالة طارئة*

الأعراض التي ذكرتها قد تحتاج إلى عناية طبية عاجلة.

إذا كنت تعاني من:
• صعوبة في التنفس أو البلع
• تورم شديد في الوجه
• نزيف شديد أو مستمر
• فقدان الوعي

يرجى التوجه إلى أقرب قسم طوارئ أو طلب المساعدة الطبية الطارئة فوراً.

إذا كانت الحالة متعلقة بالأسنان وليست حالة طارئة تهدد الحياة، تواصل معنا وسيساعدك فريق العيادة في أقرب وقت ممكن.`;

    case "inappropriate":
      return `حياك الله 🌷

نحن هنا لمساعدتك في خدمات ومواضيع طب الأسنان الخاصة بالعيادة.

فضلاً حافظ على أن تكون المحادثة محترمة ومرتبطة بخدمات العيادة.

يمكنني مساعدتك في:
🦷 خدمات وعلاجات الأسنان
📅 حجز المواعيد
🕐 أوقات العمل
📍 موقع العيادة
👨‍⚕️ التواصل مع فريق العيادة

اكتب *القائمة* لعرض الخيارات المتاحة.`;

    case "threat":
      return `نتفهم أنك قد تكون منزعجاً، ونرغب في مساعدتك وحل المشكلة.

فضلاً حافظ على أسلوب محترم أثناء المحادثة.

إذا كانت لديك مشكلة تتعلق بموعد أو بخدمة في العيادة، يمكنني تحويلك إلى فريق الاستقبال لمساعدتك.

اكتب *موظف* للتواصل مع فريق العيادة.`;

    case "spam":
      return `حياك الله 🌷

يمكنني مساعدتك فقط في الاستفسارات المتعلقة بالعيادة وخدمات طب الأسنان.

يمكنك السؤال عن:
🦷 علاجات الأسنان
📅 المواعيد
🕐 أوقات العمل
📍 موقع العيادة

اكتب *القائمة* لعرض الخيارات المتاحة.`;

    case "empty":
      return `حياك الله 🌷
كيف نقدر نخدمك اليوم؟

اكتب *القائمة* لعرض الخيارات المتاحة.`;

    default:
      return null;
  }
}

/**
 * -------------------------------------------------------
 * EXPORTS
 * -------------------------------------------------------
 */
module.exports = {
  normalize,
  classifyMessage,
  getSafetyResponse,
};